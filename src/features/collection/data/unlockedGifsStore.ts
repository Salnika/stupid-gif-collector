import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  DEFAULT_GIF_RARITY,
  getNextGifRarity,
  isGifRarity,
  type GifRarity,
} from "../../../lib/rarity";
import type { CollectionBackupEntry } from "../../../lib/collectionBackup";

const normalizeGifPath = (value: string): string =>
  value.replace(/\/%23(\d+-)/gi, "/$1").replace(/\/#(\d+-)/g, "/$1");

export type UnlockedGif = {
  number: number;
  name: string;
  collection: string;
  rarity: GifRarity;
  path: string;
  unlockedAt: number;
  count: number;
};

export type RegisterCaughtGifInput = {
  number: number;
  name: string;
  collection: string;
  rarity: GifRarity;
  path: string;
};

export type RegisterCaughtGifResult = {
  gif: UnlockedGif;
  count: number;
  isNew: boolean;
};

export type TradeUpInput = {
  consumedGifNumbers: number[];
  rewardGif: RegisterCaughtGifInput;
};

export type TradeUpResult = {
  reward: UnlockedGif;
  rewardCount: number;
  isNewReward: boolean;
  sourceRarity: GifRarity;
  targetRarity: GifRarity;
  consumedGifNumbers: number[];
};

type UnlockedGifsState = {
  unlockedByNumber: Record<number, UnlockedGif>;
  favoriteByNumber: Record<number, true>;
  registerCaughtGif: (gif: RegisterCaughtGifInput) => RegisterCaughtGifResult;
  tradeUpGifs: (input: TradeUpInput) => TradeUpResult;
  toggleFavorite: (gifNumber: number) => void;
  replaceCollectionFromImport: (entries: CollectionBackupEntry[]) => { imported: number };
};

export const useUnlockedGifsStore = create<UnlockedGifsState>()(
  persist(
    (set, get) => ({
      unlockedByNumber: {},
      favoriteByNumber: {},
      registerCaughtGif: (gif) => {
        let result: RegisterCaughtGifResult | null = null;

        set((state) => {
          const current = state.unlockedByNumber[gif.number];
          const nextCount = (current?.count ?? 0) + 1;
          const nextGif: UnlockedGif = {
            number: gif.number,
            name: gif.name,
            collection: gif.collection,
            rarity: gif.rarity,
            path: normalizeGifPath(gif.path),
            unlockedAt: current?.unlockedAt ?? Date.now(),
            count: nextCount,
          };

          result = {
            gif: nextGif,
            count: nextCount,
            isNew: !current,
          };

          return {
            unlockedByNumber: {
              ...state.unlockedByNumber,
              [gif.number]: nextGif,
            },
          };
        });

        return (
          result ?? {
            gif: {
              number: gif.number,
              name: gif.name,
              collection: gif.collection,
              rarity: gif.rarity,
              path: normalizeGifPath(gif.path),
              unlockedAt: Date.now(),
              count: 1,
            },
            count: 1,
            isNew: true,
          }
        );
      },
      tradeUpGifs: ({ consumedGifNumbers, rewardGif }) => {
        if (consumedGifNumbers.length !== 5) {
          throw new Error("Trade-ups require exactly 5 GIF copies.");
        }

        if (!Number.isInteger(rewardGif.number) || rewardGif.number < 1) {
          throw new Error("Trade-up reward is invalid.");
        }

        const state = get();
        const selectedGifs = consumedGifNumbers.map(
          (gifNumber) => state.unlockedByNumber[gifNumber],
        );
        if (selectedGifs.some((gif) => !gif)) {
          throw new Error("One of the selected GIFs is no longer in your collection.");
        }

        const sourceRarity = selectedGifs[0]?.rarity;
        if (!sourceRarity) {
          throw new Error("Unable to resolve the source rarity for this trade-up.");
        }

        if (sourceRarity === "legendary") {
          throw new Error("Legendary GIFs cannot be traded up.");
        }

        if (!selectedGifs.every((gif) => gif.rarity === sourceRarity)) {
          throw new Error("All traded GIFs must share the same rarity.");
        }

        const targetRarity = getNextGifRarity(sourceRarity);
        if (!targetRarity || rewardGif.rarity !== targetRarity) {
          throw new Error("Trade-up reward must be exactly one rarity higher.");
        }

        const requiredCountByNumber = consumedGifNumbers.reduce<Record<number, number>>(
          (counts, gifNumber) => {
            counts[gifNumber] = (counts[gifNumber] ?? 0) + 1;
            return counts;
          },
          {},
        );

        for (const [gifNumberText, requiredCount] of Object.entries(requiredCountByNumber)) {
          const gifNumber = Number.parseInt(gifNumberText, 10);
          const currentCount = state.unlockedByNumber[gifNumber]?.count ?? 0;

          if (currentCount < requiredCount) {
            throw new Error("You do not have enough copies to complete this trade-up.");
          }
        }

        const nextUnlockedByNumber = { ...state.unlockedByNumber };
        const nextFavoriteByNumber = { ...state.favoriteByNumber };

        for (const [gifNumberText, requiredCount] of Object.entries(requiredCountByNumber)) {
          const gifNumber = Number.parseInt(gifNumberText, 10);
          const currentGif = nextUnlockedByNumber[gifNumber];
          if (!currentGif) {
            throw new Error("One of the selected GIFs is no longer in your collection.");
          }

          const nextCount = currentGif.count - requiredCount;
          if (nextCount > 0) {
            nextUnlockedByNumber[gifNumber] = {
              ...currentGif,
              count: nextCount,
            };
            continue;
          }

          delete nextUnlockedByNumber[gifNumber];
          delete nextFavoriteByNumber[gifNumber];
        }

        const existingReward = nextUnlockedByNumber[rewardGif.number];
        const rewardCount = (existingReward?.count ?? 0) + 1;
        const reward: UnlockedGif = {
          number: rewardGif.number,
          name: rewardGif.name,
          collection: rewardGif.collection,
          rarity: rewardGif.rarity,
          path: normalizeGifPath(rewardGif.path),
          unlockedAt: existingReward?.unlockedAt ?? Date.now(),
          count: rewardCount,
        };

        nextUnlockedByNumber[reward.number] = reward;

        set({
          unlockedByNumber: nextUnlockedByNumber,
          favoriteByNumber: nextFavoriteByNumber,
        });

        return {
          reward,
          rewardCount,
          isNewReward: !existingReward,
          sourceRarity,
          targetRarity,
          consumedGifNumbers: consumedGifNumbers.slice(),
        };
      },
      toggleFavorite: (gifNumber) => {
        if (!Number.isInteger(gifNumber) || gifNumber < 1) {
          return;
        }

        set((state) => {
          const nextFavorites = { ...state.favoriteByNumber };

          if (nextFavorites[gifNumber]) {
            delete nextFavorites[gifNumber];
          } else {
            nextFavorites[gifNumber] = true;
          }

          return { favoriteByNumber: nextFavorites };
        });
      },
      replaceCollectionFromImport: (entries) => {
        let imported = 0;
        const importedAt = Date.now();

        set(() => {
          const nextUnlockedByNumber: Record<number, UnlockedGif> = {};
          const nextFavoriteByNumber: Record<number, true> = {};

          for (const entry of entries) {
            if (!entry || typeof entry !== "object") {
              continue;
            }

            const number = Number.isFinite(entry.number) ? Math.floor(entry.number) : NaN;
            if (!Number.isFinite(number) || number < 1) {
              continue;
            }

            const count =
              Number.isFinite(entry.count) && entry.count > 0 ? Math.floor(entry.count) : 1;
            const unlockedAt =
              Number.isFinite(entry.unlockedAt) && entry.unlockedAt > 0
                ? Math.floor(entry.unlockedAt)
                : importedAt;

            nextUnlockedByNumber[number] = {
              number,
              name:
                typeof entry.name === "string" && entry.name.trim().length > 0
                  ? entry.name.trim()
                  : `GIF ${number}`,
              collection:
                typeof entry.collection === "string" && entry.collection.trim().length > 0
                  ? entry.collection.trim()
                  : "unknown",
              rarity: isGifRarity(entry.rarity) ? entry.rarity : DEFAULT_GIF_RARITY,
              path: typeof entry.path === "string" ? normalizeGifPath(entry.path) : "",
              unlockedAt,
              count,
            };

            if (entry.favorite) {
              nextFavoriteByNumber[number] = true;
            }
          }

          imported = Object.keys(nextUnlockedByNumber).length;

          return {
            unlockedByNumber: nextUnlockedByNumber,
            favoriteByNumber: nextFavoriteByNumber,
          };
        });

        return { imported };
      },
    }),
    {
      name: "stupid-vite-collect-unlocked-gifs",
      storage: createJSONStorage(() => localStorage),
      version: 4,
      migrate: (persistedState) => {
        const state = persistedState as {
          unlockedByNumber?: Record<string, Partial<UnlockedGif>>;
          favoriteByNumber?: unknown;
        };

        const unlockedByNumber: Record<number, UnlockedGif> = {};
        const favoriteByNumber: Record<number, true> = {};
        const source = state.unlockedByNumber ?? {};

        for (const [key, value] of Object.entries(source)) {
          if (!value || typeof value !== "object") {
            continue;
          }

          const numberFromValue =
            typeof value.number === "number" ? value.number : Number.parseInt(key, 10);
          if (!Number.isFinite(numberFromValue) || numberFromValue < 1) {
            continue;
          }

          unlockedByNumber[numberFromValue] = {
            number: numberFromValue,
            name: typeof value.name === "string" ? value.name : `GIF ${numberFromValue}`,
            collection: typeof value.collection === "string" ? value.collection : "unknown",
            rarity: isGifRarity(value.rarity) ? value.rarity : DEFAULT_GIF_RARITY,
            path: typeof value.path === "string" ? normalizeGifPath(value.path) : "",
            unlockedAt: typeof value.unlockedAt === "number" ? value.unlockedAt : Date.now(),
            count: typeof value.count === "number" && value.count > 0 ? value.count : 1,
          };
        }

        const rawFavorites = state.favoriteByNumber;
        if (rawFavorites && typeof rawFavorites === "object" && !Array.isArray(rawFavorites)) {
          for (const [key, value] of Object.entries(rawFavorites)) {
            const numberFromKey = Number.parseInt(key, 10);
            if (!Number.isFinite(numberFromKey) || numberFromKey < 1 || !value) {
              continue;
            }
            favoriteByNumber[numberFromKey] = true;
          }
        } else if (Array.isArray(rawFavorites)) {
          for (const value of rawFavorites) {
            if (typeof value !== "number" || !Number.isFinite(value) || value < 1) {
              continue;
            }
            favoriteByNumber[value] = true;
          }
        }

        return { unlockedByNumber, favoriteByNumber };
      },
    },
  ),
);
