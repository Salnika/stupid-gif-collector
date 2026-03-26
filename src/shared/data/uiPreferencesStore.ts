import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type UiPreferencesState = {
  isLiquidGlassDisabled: boolean;
  toggleLiquidGlassDisabled: () => void;
};

const STORAGE_KEY = "stupid-vite-collect-ui-preferences";

export const useUiPreferencesStore = create<UiPreferencesState>()(
  persist(
    (set) => ({
      isLiquidGlassDisabled: false,
      toggleLiquidGlassDisabled: () => {
        set((state) => ({
          isLiquidGlassDisabled: !state.isLiquidGlassDisabled,
        }));
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isLiquidGlassDisabled: state.isLiquidGlassDisabled,
      }),
    },
  ),
);
