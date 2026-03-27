import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { loadCatalogEntries } from "../../catalog/data";
import type { GifCatalogEntry } from "../../catalog/domain";
import { useUnlockedGifsStore, type TradeUpResult } from "../../collection/data/unlockedGifsStore";
import type { CollectionGifEntry } from "../../collection/domain";
import { createCollectionEntries } from "../../collection/application/collectionSelectors";
import {
  getNextGifRarity,
  getTradeableGifRarities,
  toGifRarityLabel,
  type GifRarity,
} from "../../../lib/rarity";

const REQUIRED_TRADE_UP_COUNT = 5;
const TRADEABLE_RARITIES = getTradeableGifRarities();

const toErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
};

const getRarityCopyTotals = (entries: CollectionGifEntry[]): Record<GifRarity, number> => {
  const totals = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
  } satisfies Record<GifRarity, number>;

  for (const entry of entries) {
    totals[entry.rarity] += entry.count;
  }

  return totals;
};

type TradeUpStatus = {
  tone: "info" | "success" | "error";
  message: string;
};

type TradeUpRarityOption = {
  rarity: GifRarity;
  label: string;
  totalCount: number;
  targetRarity: GifRarity | null;
  isDisabled: boolean;
  disableReason: string | null;
};

export type TradeUpViewModel = {
  isCatalogLoading: boolean;
  catalogError: string | null;
  rarityOptions: TradeUpRarityOption[];
  selectedSourceRarity: GifRarity;
  targetRarity: GifRarity | null;
  selectedSourceLabel: string;
  selectedTotalCount: number;
  selectedGifNumbers: number[];
  selectedCountsByNumber: Record<number, number>;
  selectedSlots: Array<CollectionGifEntry | null>;
  filteredUnlockedGifs: CollectionGifEntry[];
  canConfirmExchange: boolean;
  status: TradeUpStatus | null;
  lastTradeResult: TradeUpResult | null;
  changeSourceRarity: (rarity: GifRarity) => void;
  addSelectedGif: (gif: CollectionGifEntry) => void;
  removeSelectedGifAt: (index: number) => void;
  confirmTradeUp: () => void;
};

export const useTradeUpViewModel = (): TradeUpViewModel => {
  const unlockedByNumber = useUnlockedGifsStore((state) => state.unlockedByNumber);
  const favoriteByNumber = useUnlockedGifsStore((state) => state.favoriteByNumber);
  const tradeUpGifs = useUnlockedGifsStore((state) => state.tradeUpGifs);

  const initialSourceRaritySetRef = useRef(false);
  const [catalogEntries, setCatalogEntries] = useState<GifCatalogEntry[]>([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [selectedSourceRarity, setSelectedSourceRarity] = useState<GifRarity>(
    TRADEABLE_RARITIES[0] ?? "common",
  );
  const [selectedGifNumbers, setSelectedGifNumbers] = useState<number[]>([]);
  const [status, setStatus] = useState<TradeUpStatus | null>(null);
  const [lastTradeResult, setLastTradeResult] = useState<TradeUpResult | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadCatalog = async () => {
      setIsCatalogLoading(true);

      try {
        const nextEntries = await loadCatalogEntries();
        if (cancelled) {
          return;
        }

        startTransition(() => {
          setCatalogEntries(nextEntries);
          setCatalogError(null);
          setIsCatalogLoading(false);
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setCatalogError(toErrorMessage(error, "Unable to load the catalog for trade-ups."));
        setIsCatalogLoading(false);
      }
    };

    void loadCatalog();

    return () => {
      cancelled = true;
    };
  }, []);

  const sortedUnlockedGifs = useMemo(
    () => createCollectionEntries(unlockedByNumber, favoriteByNumber),
    [favoriteByNumber, unlockedByNumber],
  );

  const entryByNumber = useMemo(
    () =>
      Object.fromEntries(
        sortedUnlockedGifs.map(
          (entry) => [entry.number, entry] satisfies [number, CollectionGifEntry],
        ),
      ),
    [sortedUnlockedGifs],
  );

  const rarityCopyTotals = useMemo(
    () => getRarityCopyTotals(sortedUnlockedGifs),
    [sortedUnlockedGifs],
  );

  const catalogPoolByRarity = useMemo(() => {
    const pools: Record<GifRarity, GifCatalogEntry[]> = {
      common: [],
      uncommon: [],
      rare: [],
      epic: [],
      legendary: [],
    };

    for (const entry of catalogEntries) {
      pools[entry.rarity].push(entry);
    }

    return pools;
  }, [catalogEntries]);

  const rarityOptions = useMemo<TradeUpRarityOption[]>(
    () =>
      TRADEABLE_RARITIES.map((rarity) => {
        const targetRarity = getNextGifRarity(rarity);
        const totalCount = rarityCopyTotals[rarity];
        const targetPool = targetRarity ? catalogPoolByRarity[targetRarity] : [];
        let disableReason: string | null = null;

        if (totalCount < REQUIRED_TRADE_UP_COUNT) {
          disableReason = `Need at least ${REQUIRED_TRADE_UP_COUNT} copies to trade up ${toGifRarityLabel(
            rarity,
          ).toLowerCase()} GIFs.`;
        } else if (targetPool.length === 0) {
          disableReason = `No ${targetRarity ? toGifRarityLabel(targetRarity).toLowerCase() : "higher rarity"} GIFs are available in the catalog.`;
        }

        return {
          rarity,
          label: `${toGifRarityLabel(rarity)} (${totalCount})`,
          totalCount,
          targetRarity,
          isDisabled: disableReason !== null,
          disableReason,
        };
      }),
    [catalogPoolByRarity, rarityCopyTotals],
  );

  useEffect(() => {
    if (initialSourceRaritySetRef.current || rarityOptions.length === 0) {
      return;
    }

    const firstEnabledRarity =
      rarityOptions.find((option) => !option.isDisabled)?.rarity ?? rarityOptions[0].rarity;
    setSelectedSourceRarity(firstEnabledRarity);
    initialSourceRaritySetRef.current = true;
  }, [rarityOptions]);

  const selectedCountsByNumber = useMemo(
    () =>
      selectedGifNumbers.reduce<Record<number, number>>((counts, gifNumber) => {
        counts[gifNumber] = (counts[gifNumber] ?? 0) + 1;
        return counts;
      }, {}),
    [selectedGifNumbers],
  );

  const selectedSlots = useMemo(
    () =>
      Array.from({ length: REQUIRED_TRADE_UP_COUNT }, (_, index) => {
        const gifNumber = selectedGifNumbers[index];
        return typeof gifNumber === "number" ? (entryByNumber[gifNumber] ?? null) : null;
      }),
    [entryByNumber, selectedGifNumbers],
  );

  const filteredUnlockedGifs = useMemo(
    () => sortedUnlockedGifs.filter((gif) => gif.rarity === selectedSourceRarity),
    [selectedSourceRarity, sortedUnlockedGifs],
  );

  const selectedRarityOption = useMemo(
    () => rarityOptions.find((option) => option.rarity === selectedSourceRarity) ?? null,
    [rarityOptions, selectedSourceRarity],
  );

  const targetRarity = selectedRarityOption?.targetRarity ?? getNextGifRarity(selectedSourceRarity);
  const targetPool = targetRarity ? catalogPoolByRarity[targetRarity] : [];
  const selectedSourceLabel = toGifRarityLabel(selectedSourceRarity);
  const selectedTotalCount =
    selectedRarityOption?.totalCount ?? rarityCopyTotals[selectedSourceRarity];

  const canConfirmExchange =
    selectedGifNumbers.length === REQUIRED_TRADE_UP_COUNT &&
    Boolean(targetRarity) &&
    targetPool.length > 0 &&
    !isCatalogLoading;

  const changeSourceRarity = (rarity: GifRarity) => {
    if (!TRADEABLE_RARITIES.includes(rarity)) {
      return;
    }

    setSelectedSourceRarity(rarity);
    setSelectedGifNumbers([]);
    setStatus(null);
    setLastTradeResult(null);
  };

  const addSelectedGif = (gif: CollectionGifEntry) => {
    if (
      gif.rarity !== selectedSourceRarity ||
      selectedGifNumbers.length >= REQUIRED_TRADE_UP_COUNT
    ) {
      return;
    }

    const selectedCount = selectedCountsByNumber[gif.number] ?? 0;
    if (selectedCount >= gif.count) {
      return;
    }

    setSelectedGifNumbers((current) =>
      current.length >= REQUIRED_TRADE_UP_COUNT ? current : [...current, gif.number],
    );
    setStatus(null);
  };

  const removeSelectedGifAt = (index: number) => {
    setSelectedGifNumbers((current) => current.filter((_, currentIndex) => currentIndex !== index));
    setStatus(null);
  };

  const confirmTradeUp = () => {
    if (selectedGifNumbers.length !== REQUIRED_TRADE_UP_COUNT) {
      setStatus({
        tone: "error",
        message: `Select ${REQUIRED_TRADE_UP_COUNT} GIF copies before confirming the trade-up.`,
      });
      return;
    }

    if (!targetRarity || targetPool.length === 0) {
      setStatus({
        tone: "error",
        message:
          "This rarity cannot be traded up right now because the target pool is unavailable.",
      });
      return;
    }

    const rewardEntry = targetPool[Math.floor(Math.random() * targetPool.length)];
    if (!rewardEntry) {
      setStatus({
        tone: "error",
        message: "Unable to resolve a reward from the target rarity.",
      });
      return;
    }

    try {
      const result = tradeUpGifs({
        consumedGifNumbers: selectedGifNumbers,
        rewardGif: rewardEntry,
      });

      setSelectedGifNumbers([]);
      setLastTradeResult(result);
      setStatus({
        tone: "success",
        message: `Trade complete: #${result.reward.number} ${result.reward.name} joined your ${toGifRarityLabel(
          result.targetRarity,
        ).toLowerCase()} collection.`,
      });
    } catch (error) {
      setStatus({
        tone: "error",
        message: toErrorMessage(error, "Trade-up failed."),
      });
    }
  };

  return {
    isCatalogLoading,
    catalogError,
    rarityOptions,
    selectedSourceRarity,
    targetRarity,
    selectedSourceLabel,
    selectedTotalCount,
    selectedGifNumbers,
    selectedCountsByNumber,
    selectedSlots,
    filteredUnlockedGifs,
    canConfirmExchange,
    status,
    lastTradeResult,
    changeSourceRarity,
    addSelectedGif,
    removeSelectedGifAt,
    confirmTradeUp,
  };
};
