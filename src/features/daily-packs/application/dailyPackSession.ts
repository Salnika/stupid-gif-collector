import type { GifCatalogEntry } from "../../catalog/domain";
import {
  DAILY_GIFS_TOTAL,
  DAILY_GOLD_PACK_ID,
  DAILY_PACK_COUNT,
  GIFS_PER_DAILY_PACK,
  isGoldDailyPackId,
  type DailyPack,
  type DailyPackSession,
} from "../domain";

type CreateDailyPackSessionOptions = {
  dayKey?: string;
  generatedAt?: number;
  random?: () => number;
};

const isIntegerInRange = (value: unknown, min: number, max: number): value is number =>
  Number.isInteger(value) && Number(value) >= min && Number(value) <= max;

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

const isGoldPackEntry = (entry: GifCatalogEntry): boolean =>
  entry.rarity === "rare" || entry.rarity === "epic" || entry.rarity === "legendary";

const createPack = (id: number, gifNumbers: number[]): DailyPack => ({
  id,
  gifNumbers,
  status: "sealed",
  openedAt: null,
  revealResults: [],
});

export const getLocalDayKey = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const createDailyPackSession = (
  entries: GifCatalogEntry[],
  {
    dayKey = getLocalDayKey(),
    generatedAt = Date.now(),
    random = Math.random,
  }: CreateDailyPackSessionOptions = {},
): DailyPackSession => {
  const uniqueEntries = dedupeCatalogEntries(entries);

  if (uniqueEntries.length < DAILY_GIFS_TOTAL) {
    throw new Error(`Daily packs require at least ${DAILY_GIFS_TOTAL} GIFs in the catalog.`);
  }

  const goldEntries = shuffleEntries(uniqueEntries.filter(isGoldPackEntry), random).slice(
    0,
    GIFS_PER_DAILY_PACK,
  );

  if (goldEntries.length < GIFS_PER_DAILY_PACK) {
    throw new Error(
      `Gold daily packs require at least ${GIFS_PER_DAILY_PACK} rare, epic, or legendary GIFs in the catalog.`,
    );
  }

  const goldEntryNumbers = new Set(goldEntries.map((entry) => entry.number));
  const standardEntries = shuffleEntries(
    uniqueEntries.filter((entry) => !goldEntryNumbers.has(entry.number)),
    random,
  ).slice(0, DAILY_GIFS_TOTAL - GIFS_PER_DAILY_PACK);

  if (standardEntries.length < DAILY_GIFS_TOTAL - GIFS_PER_DAILY_PACK) {
    throw new Error(
      `Daily packs require at least ${DAILY_GIFS_TOTAL - GIFS_PER_DAILY_PACK} remaining GIFs after reserving the gold pack.`,
    );
  }

  const packs: DailyPack[] = [];

  for (let packIndex = 0; packIndex < DAILY_PACK_COUNT; packIndex += 1) {
    const packId = packIndex + 1;
    if (isGoldDailyPackId(packId)) {
      packs.push(
        createPack(
          DAILY_GOLD_PACK_ID,
          goldEntries.map((entry) => entry.number),
        ),
      );
      continue;
    }

    const start = packIndex * GIFS_PER_DAILY_PACK;
    const gifNumbers = standardEntries
      .slice(start, start + GIFS_PER_DAILY_PACK)
      .map((entry) => entry.number);

    packs.push(createPack(packId, gifNumbers));
  }

  return {
    dayKey,
    generatedAt,
    selectedPackId: 1,
    packs,
  };
};

export const isDailyPackSessionValid = (session: unknown): session is DailyPackSession => {
  if (!session || typeof session !== "object") {
    return false;
  }

  const candidate = session as DailyPackSession;

  if (
    typeof candidate.dayKey !== "string" ||
    !Number.isFinite(candidate.generatedAt) ||
    !isIntegerInRange(candidate.selectedPackId, 1, DAILY_PACK_COUNT) ||
    !Array.isArray(candidate.packs) ||
    candidate.packs.length !== DAILY_PACK_COUNT
  ) {
    return false;
  }

  const seenNumbers = new Set<number>();

  for (let index = 0; index < candidate.packs.length; index += 1) {
    const pack = candidate.packs[index];
    const expectedPackId = index + 1;

    if (
      !pack ||
      typeof pack !== "object" ||
      pack.id !== expectedPackId ||
      !Array.isArray(pack.gifNumbers) ||
      pack.gifNumbers.length !== GIFS_PER_DAILY_PACK ||
      (pack.status !== "sealed" && pack.status !== "opened")
    ) {
      return false;
    }

    const packNumbers = new Set<number>();
    for (const number of pack.gifNumbers) {
      if (
        !Number.isInteger(number) ||
        number < 1 ||
        packNumbers.has(number) ||
        seenNumbers.has(number)
      ) {
        return false;
      }

      packNumbers.add(number);
      seenNumbers.add(number);
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
        !Number.isInteger(reveal.count) ||
        reveal.count < 1 ||
        typeof reveal.isNew !== "boolean"
      ) {
        return false;
      }
    }
  }

  return seenNumbers.size === DAILY_GIFS_TOTAL;
};

export const countRemainingDailyPacks = (session: DailyPackSession | null): number => {
  if (!session) {
    return 0;
  }

  return session.packs.filter((pack) => pack.status === "sealed").length;
};
