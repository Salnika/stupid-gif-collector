import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { GifCatalogEntry } from "../../catalog/domain";
import {
  countRemainingDailyPacks,
  createDailyPackSession,
  getLocalDayKey,
  isDailyPackSessionValid,
} from "../application/dailyPackSession";
import {
  DAILY_PACK_COUNT,
  GIFS_PER_DAILY_PACK,
  type DailyPackRevealResult,
  type DailyPackSession,
} from "../domain";

type DailyPacksState = {
  hasHydrated: boolean;
  session: DailyPackSession | null;
  setHasHydrated: (value: boolean) => void;
  ensureTodaySession: (entries: GifCatalogEntry[], now?: Date) => DailyPackSession | null;
  openPack: (packId: number, revealResults: DailyPackRevealResult[]) => void;
  selectPack: (packId: number) => void;
  getRemainingPacks: () => number;
  resetForTests: () => void;
};

const STORAGE_KEY = "stupid-vite-collect-daily-packs";

const isPackId = (value: number): boolean =>
  Number.isInteger(value) && value >= 1 && value <= DAILY_PACK_COUNT;

export const useDailyPacksStore = create<DailyPacksState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      session: null,
      setHasHydrated: (value) => {
        set({ hasHydrated: value });
      },
      ensureTodaySession: (entries, now = new Date()) => {
        if (entries.length === 0) {
          return get().session;
        }

        const dayKey = getLocalDayKey(now);
        const currentSession = get().session;

        if (
          currentSession &&
          currentSession.dayKey === dayKey &&
          isDailyPackSessionValid(currentSession)
        ) {
          return currentSession;
        }

        const nextSession = createDailyPackSession(entries, {
          dayKey,
          generatedAt: now.getTime(),
        });

        set({ session: nextSession });
        return nextSession;
      },
      openPack: (packId, revealResults) => {
        if (!isPackId(packId) || revealResults.length !== GIFS_PER_DAILY_PACK) {
          return;
        }

        set((state) => {
          if (!state.session) {
            return state;
          }

          const nextPacks = state.session.packs.map((pack) => {
            if (pack.id !== packId || pack.status === "opened") {
              return pack;
            }

            const numbersMatch = revealResults.every(
              (reveal, index) => reveal.number === pack.gifNumbers[index],
            );

            if (!numbersMatch) {
              return pack;
            }

            return {
              ...pack,
              status: "opened" as const,
              openedAt: Date.now(),
              revealResults,
            };
          });

          return {
            session: {
              ...state.session,
              selectedPackId: packId,
              packs: nextPacks,
            },
          };
        });
      },
      selectPack: (packId) => {
        if (!isPackId(packId)) {
          return;
        }

        set((state) => {
          if (!state.session || state.session.selectedPackId === packId) {
            return state;
          }

          return {
            session: {
              ...state.session,
              selectedPackId: packId,
            },
          };
        });
      },
      getRemainingPacks: () => countRemainingDailyPacks(get().session),
      resetForTests: () => {
        set({
          hasHydrated: true,
          session: null,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        session: state.session,
      }),
      version: 1,
      migrate: (persistedState) => {
        const state = persistedState as {
          session?: unknown;
        };

        return {
          hasHydrated: false,
          session: isDailyPackSessionValid(state.session) ? state.session : null,
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
