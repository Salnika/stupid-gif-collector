import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import type { GifCatalogEntry } from "../../../../src/features/catalog/domain";
import { useDailyPacksStore } from "../../../../src/features/daily-packs/data/dailyPacksStore";
import { PACK_GENERATION_INTERVAL_MS } from "../../../../src/features/daily-packs/domain";

const createCatalog = (size: number): GifCatalogEntry[] =>
  Array.from({ length: size }, (_, index) => ({
    number: index + 1,
    path: `/collections/test/#${index + 1}-gif-${index + 1}.gif`,
    name: `GIF ${index + 1}`,
    collection: "test",
    rarity:
      index < 10
        ? (["rare", "epic", "legendary"][index % 3] as GifCatalogEntry["rarity"])
        : "common",
  }));

describe("dailyPacksStore", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    localStorage.clear();
    useDailyPacksStore.getState().resetForTests();
    await Promise.resolve(useDailyPacksStore.persist.clearStorage());
  });

  it("replenishes the local queue every five minutes and caps unopened packs at ten", () => {
    const catalog = createCatalog(60);
    const start = new Date(2026, 2, 23, 8, 0, 0);

    const firstSession = useDailyPacksStore.getState().ensureTodaySession(catalog, start);
    const fourMinutesLater = useDailyPacksStore
      .getState()
      .ensureTodaySession(catalog, new Date(start.getTime() + PACK_GENERATION_INTERVAL_MS - 1));
    const fiveMinutesLater = useDailyPacksStore
      .getState()
      .ensureTodaySession(catalog, new Date(start.getTime() + PACK_GENERATION_INTERVAL_MS));
    const oneHourLater = useDailyPacksStore
      .getState()
      .ensureTodaySession(catalog, new Date(start.getTime() + PACK_GENERATION_INTERVAL_MS * 12));

    expect(firstSession?.packs).toHaveLength(1);
    expect(fourMinutesLater?.packs).toHaveLength(1);
    expect(fiveMinutesLater?.packs).toHaveLength(2);
    expect(oneHourLater?.packs.filter((pack) => pack.status === "sealed")).toHaveLength(10);
    expect(oneHourLater?.nextPackId).toBe(11);
  });

  it("does not bank extra packs while the queue is already full", () => {
    const catalog = createCatalog(60);
    const start = new Date(2026, 2, 23, 8, 0, 0);

    useDailyPacksStore.getState().ensureTodaySession(catalog, start);
    useDailyPacksStore
      .getState()
      .ensureTodaySession(catalog, new Date(start.getTime() + PACK_GENERATION_INTERVAL_MS * 12));

    const fullQueueSession = useDailyPacksStore.getState().session;
    expect(fullQueueSession?.packs.filter((pack) => pack.status === "sealed")).toHaveLength(10);

    const firstPack = fullQueueSession?.packs.find((pack) => pack.id === 1);
    expect(firstPack).toBeDefined();

    const revealResults =
      firstPack?.gifNumbers.map((number, index) => ({
        number,
        count: index + 1,
        isNew: index % 2 === 0,
      })) ?? [];

    useDailyPacksStore.getState().openPack(1, revealResults);

    const oneMinuteLater = useDailyPacksStore
      .getState()
      .ensureTodaySession(
        catalog,
        new Date(start.getTime() + PACK_GENERATION_INTERVAL_MS * 12 + 60_000),
      );
    const fiveMinutesLater = useDailyPacksStore
      .getState()
      .ensureTodaySession(catalog, new Date(start.getTime() + PACK_GENERATION_INTERVAL_MS * 13));

    expect(oneMinuteLater?.packs.filter((pack) => pack.status === "sealed")).toHaveLength(9);
    expect(fiveMinutesLater?.packs.filter((pack) => pack.status === "sealed")).toHaveLength(10);
  });

  it("opens a pack only once and restores persisted state after rehydration", async () => {
    const catalog = createCatalog(60);
    const state = useDailyPacksStore.getState();
    const session = state.ensureTodaySession(catalog, new Date(2026, 2, 23, 9, 0, 0));

    expect(session).not.toBeNull();

    const firstPack = useDailyPacksStore.getState().session?.packs[0];
    expect(firstPack).toBeDefined();

    const revealResults =
      firstPack?.gifNumbers.map((number, index) => ({
        number,
        count: index + 1,
        isNew: index % 2 === 0,
      })) ?? [];

    useDailyPacksStore.getState().openPack(firstPack?.id ?? 1, revealResults);

    expect(useDailyPacksStore.getState().session?.packs[0]).toMatchObject({
      status: "opened",
      revealResults,
    });
    expect(useDailyPacksStore.getState().getRemainingPacks()).toBe(0);

    const persistedSnapshot = localStorage.getItem("stupid-vite-collect-daily-packs");
    useDailyPacksStore.setState({ hasHydrated: false, session: null });
    if (persistedSnapshot) {
      localStorage.setItem("stupid-vite-collect-daily-packs", persistedSnapshot);
    }
    await useDailyPacksStore.persist.rehydrate();

    expect(useDailyPacksStore.getState().hasHydrated).toBe(true);
    expect(useDailyPacksStore.getState().session?.packs[0]).toMatchObject({
      status: "opened",
      revealResults,
    });

    useDailyPacksStore.getState().openPack(
      firstPack?.id ?? 1,
      revealResults.map((reveal) => ({
        ...reveal,
        count: reveal.count + 10,
      })),
    );

    expect(useDailyPacksStore.getState().session?.packs[0].revealResults).toEqual(revealResults);
  });
});
