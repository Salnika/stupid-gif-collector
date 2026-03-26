import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import {
  getEntryByNumber,
  loadCatalogEntries,
  loadCatalogRuntime,
  loadCatalogStats,
  resetCatalogRepositoryCache,
} from "../../../../src/features/catalog/data";

const createResponse = (payload: unknown, ok = true): Response =>
  ({
    ok,
    json: async () => payload,
  }) as Response;

describe("catalogRepository", () => {
  beforeEach(() => {
    resetCatalogRepositoryCache();
    vi.restoreAllMocks();
  });

  it("loads the runtime catalog and normalizes the rarity map", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      createResponse({
        total: 10,
        paths: ["/collections/rare_animals/%233-meow.gif"],
        rarityByCollectionFolder: {
          rare_animals: "epic",
          ignored: "nope",
        },
      }),
    );

    const runtime = await loadCatalogRuntime();

    expect(runtime.total).toBe(10);
    expect(runtime.paths).toEqual(["/collections/rare_animals/%233-meow.gif"]);
    expect(runtime.rarityByCollectionFolder).toEqual({
      rare_animals: "epic",
    });
  });

  it("reconstructs entries from the runtime catalog", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      createResponse({
        total: 2,
        paths: [
          "/collections/common_animals/%231-alpha.gif",
          "/collections/rare_animals/%232-beta.gif",
        ],
        rarityByCollectionFolder: {
          common_animals: "common",
          rare_animals: "legendary",
        },
      }),
    );

    const entries = await loadCatalogEntries();
    const entry = await getEntryByNumber(2);

    expect(entries).toHaveLength(2);
    expect(entry).toMatchObject({
      number: 2,
      path: "/collections/rare_animals/%232-beta.gif",
      name: "beta",
      collection: "rare animals",
      rarity: "legendary",
    });
  });

  it("falls back to the runtime total when stats are unavailable", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    fetchMock.mockResolvedValueOnce(createResponse({}, false)).mockResolvedValueOnce(
      createResponse({
        total: 2,
        paths: ["/collections/test/%231-alpha.gif", "/collections/test/%232-beta.gif"],
        rarityByCollectionFolder: {
          test: "common",
        },
      }),
    );

    const stats = await loadCatalogStats();

    expect(stats.total).toBe(2);
  });

  it("returns null for invalid number", async () => {
    const entry = await getEntryByNumber(-1);
    expect(entry).toBeNull();
  });
});
