import { describe, expect, it } from "vite-plus/test";
import {
  createCollectionEntries,
  filterCollectionEntries,
} from "../../../../src/features/collection/application/collectionSelectors";
import type { UnlockedGif } from "../../../../src/features/collection/data/unlockedGifsStore";

describe("collectionSelectors", () => {
  const unlockedByNumber: Record<number, UnlockedGif> = {
    2: {
      number: 2,
      path: "/b.gif",
      name: "B",
      collection: "beta",
      rarity: "common",
      unlockedAt: 2,
      count: 1,
    },
    1: {
      number: 1,
      path: "/a.gif",
      name: "A",
      collection: "alpha",
      rarity: "common",
      unlockedAt: 1,
      count: 3,
    },
  };

  it("builds sorted entries with favorite state and persisted rarity", () => {
    const entries = createCollectionEntries(unlockedByNumber, { 1: true });

    expect(entries.map((entry) => entry.number)).toEqual([1, 2]);
    expect(entries[0]).toMatchObject({
      rarity: "common",
      isFavorite: true,
      count: 3,
    });
  });

  it("filters by favorites, collection and rarity", () => {
    const entries = createCollectionEntries(
      {
        ...unlockedByNumber,
        1: {
          ...unlockedByNumber[1],
          rarity: "rare",
        },
      },
      { 1: true },
    );

    const filtered = filterCollectionEntries(entries, {
      showFavoritesOnly: true,
      collectionFilters: ["alpha"],
      rarityFilters: ["rare"],
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].number).toBe(1);
  });
});
