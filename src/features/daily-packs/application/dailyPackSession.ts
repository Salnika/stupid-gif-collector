import type { GifCatalogEntry } from "../../catalog/domain";
import {
  DAILY_PACK_COUNT,
  GIFS_PER_DAILY_PACK,
  GOLD_PACK_CHANCE,
  PACK_GENERATION_INTERVAL_MS,
  type DailyPack,
  type DailyPackSession,
  type DailyPackVariant,
} from "../domain";

type CreateDailyPackSessionOptions = {
  generatedAt?: number;
  random?: () => number;
};

type ReplenishDailyPackSessionOptions = {
  now?: number;
  random?: () => number;
};

type PackCatalogPools = {
  uniqueEntries: GifCatalogEntry[];
  premiumEntries: GifCatalogEntry[];
};

const MAX_OPENED_PACK_HISTORY = DAILY_PACK_COUNT;

const isIntegerAtLeast = (value: unknown, minimum: number): value is number =>
  Number.isInteger(value) && Number(value) >= minimum;

const dedupeCatalogEntries = (entries: GifCatalogEntry[]): GifCatalogEntry[] => {
  const uniqueEntries = new Map<number, GifCatalogEntry>();

  for (const entry of entries) {
    if (!entry || !Number.isInteger(entry.number) || entry.number < 1) {
      continue;
    }

    if (!uniqueEntries.has(entry.number)) {
      uniqueEntries.set(entry.number, entry);
    }
  }

  return Array.from(uniqueEntries.values());
};

const shuffleEntries = (entries: GifCatalogEntry[], random: () => number): GifCatalogEntry[] => {
  const shuffled = entries.slice();

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = shuffled[index];
    shuffled[index] = shuffled[swapIndex];
    shuffled[swapIndex] = current;
  }

  return shuffled;
};

const isPremiumEntry = (entry: GifCatalogEntry): boolean =>
  entry.rarity === "rare" || entry.rarity === "epic" || entry.rarity === "legendary";

const createCatalogPools = (entries: GifCatalogEntry[]): PackCatalogPools => {
  const uniqueEntries = dedupeCatalogEntries(entries);

  if (uniqueEntries.length < GIFS_PER_DAILY_PACK) {
    throw new Error(`Pack drops require at least ${GIFS_PER_DAILY_PACK} GIFs in the catalog.`);
  }

  return {
    uniqueEntries,
    premiumEntries: uniqueEntries.filter(isPremiumEntry),
  };
};

const createPack = (id: number, gifNumbers: number[], variant: DailyPackVariant): DailyPack => ({
  id,
  variant,
  gifNumbers,
  status: "sealed",
  openedAt: null,
  revealResults: [],
});

const createPackFromCatalogPools = (
  id: number,
  pools: PackCatalogPools,
  random: () => number,
): DailyPack => {
  const canRollGold = pools.premiumEntries.length >= GIFS_PER_DAILY_PACK;
  const variant: DailyPackVariant =
    canRollGold && random() < GOLD_PACK_CHANCE ? "gold" : "standard";
  const sourceEntries = variant === "gold" ? pools.premiumEntries : pools.uniqueEntries;
  const gifNumbers = shuffleEntries(sourceEntries, random)
    .slice(0, GIFS_PER_DAILY_PACK)
    .map((entry) => entry.number);

  return createPack(id, gifNumbers, variant);
};

const keepRecentOpenedPacks = (packs: DailyPack[]): DailyPack[] => {
  const openedPackIds = new Set(
    packs
      .filter((pack) => pack.status === "opened")
      .slice(-MAX_OPENED_PACK_HISTORY)
      .map((pack) => pack.id),
  );

  return packs.filter((pack) => pack.status === "sealed" || openedPackIds.has(pack.id));
};

const resolveSelectedPackId = (packs: DailyPack[], selectedPackId: number): number => {
  const selectedSealedPack = packs.find(
    (pack) => pack.id === selectedPackId && pack.status === "sealed",
  );
  if (selectedSealedPack) {
    return selectedSealedPack.id;
  }

  const firstSealedPack = packs.find((pack) => pack.status === "sealed");
  if (firstSealedPack) {
    return firstSealedPack.id;
  }

  const latestPack = packs[packs.length - 1];
  return latestPack?.id ?? selectedPackId;
};

const countSealedPacks = (packs: DailyPack[]): number =>
  packs.filter((pack) => pack.status === "sealed").length;

const getElapsedGenerationCount = (lastGeneratedAt: number, now: number): number => {
  if (!Number.isFinite(lastGeneratedAt) || !Number.isFinite(now) || now <= lastGeneratedAt) {
    return 0;
  }

  return Math.max(0, Math.floor((now - lastGeneratedAt) / PACK_GENERATION_INTERVAL_MS));
};

export const createDailyPackSession = (
  entries: GifCatalogEntry[],
  { generatedAt = Date.now(), random = Math.random }: CreateDailyPackSessionOptions = {},
): DailyPackSession => {
  const pools = createCatalogPools(entries);
  const firstPack = createPackFromCatalogPools(1, pools, random);

  return {
    lastGeneratedAt: generatedAt,
    nextPackId: 2,
    selectedPackId: firstPack.id,
    packs: [firstPack],
  };
};

export const replenishDailyPackSession = (
  session: DailyPackSession,
  entries: GifCatalogEntry[],
  { now = Date.now(), random = Math.random }: ReplenishDailyPackSessionOptions = {},
): DailyPackSession => {
  const elapsedGenerationCount = getElapsedGenerationCount(session.lastGeneratedAt, now);
  if (elapsedGenerationCount === 0) {
    return session;
  }

  const pools = createCatalogPools(entries);
  const existingPacks = keepRecentOpenedPacks(session.packs);
  const availableSlots = Math.max(0, DAILY_PACK_COUNT - countSealedPacks(existingPacks));
  const packsToGenerate = Math.min(elapsedGenerationCount, availableSlots);
  const nextPacks = existingPacks.slice();

  for (let index = 0; index < packsToGenerate; index += 1) {
    nextPacks.push(createPackFromCatalogPools(session.nextPackId + index, pools, random));
  }

  const trimmedPacks = keepRecentOpenedPacks(nextPacks);

  return {
    lastGeneratedAt: session.lastGeneratedAt + elapsedGenerationCount * PACK_GENERATION_INTERVAL_MS,
    nextPackId: session.nextPackId + packsToGenerate,
    selectedPackId: resolveSelectedPackId(trimmedPacks, session.selectedPackId),
    packs: trimmedPacks,
  };
};

export const getNextPackGenerationTime = (session: DailyPackSession | null): number | null => {
  if (!session) {
    return null;
  }

  return session.lastGeneratedAt + PACK_GENERATION_INTERVAL_MS;
};

export const isDailyPackSessionValid = (session: unknown): session is DailyPackSession => {
  if (!session || typeof session !== "object") {
    return false;
  }

  const candidate = session as DailyPackSession;

  if (
    !Number.isFinite(candidate.lastGeneratedAt) ||
    !isIntegerAtLeast(candidate.nextPackId, 1) ||
    !isIntegerAtLeast(candidate.selectedPackId, 1) ||
    !Array.isArray(candidate.packs) ||
    candidate.packs.length === 0
  ) {
    return false;
  }

  const seenIds = new Set<number>();
  let maxPackId = 0;

  for (const pack of candidate.packs) {
    if (
      !pack ||
      typeof pack !== "object" ||
      !isIntegerAtLeast(pack.id, 1) ||
      seenIds.has(pack.id) ||
      (pack.variant !== "standard" && pack.variant !== "gold") ||
      !Array.isArray(pack.gifNumbers) ||
      pack.gifNumbers.length !== GIFS_PER_DAILY_PACK ||
      (pack.status !== "sealed" && pack.status !== "opened")
    ) {
      return false;
    }

    seenIds.add(pack.id);
    maxPackId = Math.max(maxPackId, pack.id);

    const packNumbers = new Set<number>();
    for (const number of pack.gifNumbers) {
      if (!isIntegerAtLeast(number, 1) || packNumbers.has(number)) {
        return false;
      }

      packNumbers.add(number);
    }

    if (pack.status === "sealed") {
      if (pack.openedAt !== null || pack.revealResults.length > 0) {
        return false;
      }
      continue;
    }

    if (!Number.isFinite(pack.openedAt) || !Array.isArray(pack.revealResults)) {
      return false;
    }

    if (pack.revealResults.length !== GIFS_PER_DAILY_PACK) {
      return false;
    }

    for (let revealIndex = 0; revealIndex < pack.revealResults.length; revealIndex += 1) {
      const reveal = pack.revealResults[revealIndex];
      if (
        !reveal ||
        typeof reveal !== "object" ||
        reveal.number !== pack.gifNumbers[revealIndex] ||
        !isIntegerAtLeast(reveal.count, 1) ||
        typeof reveal.isNew !== "boolean"
      ) {
        return false;
      }
    }
  }

  return candidate.nextPackId > maxPackId && seenIds.has(candidate.selectedPackId);
};

export const countRemainingDailyPacks = (session: DailyPackSession | null): number => {
  if (!session) {
    return 0;
  }

  return countSealedPacks(session.packs);
};
