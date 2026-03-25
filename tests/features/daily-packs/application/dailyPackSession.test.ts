import { describe, expect, it } from "vite-plus/test";
import type { GifCatalogEntry } from "../../../../src/features/catalog/domain";
import { DAILY_GOLD_PACK_ID } from "../../../../src/features/daily-packs/domain";
import {
  createDailyPackSession,
  getLocalDayKey,
  isDailyPackSessionValid,
} from "../../../../src/features/daily-packs/application/dailyPackSession";

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

describe("dailyPackSession", () => {
  it("creates 10 packs of 5 unique GIFs for the current day", () => {
    const session = createDailyPackSession(createCatalog(60), {
      dayKey: "2026-03-23",
      generatedAt: 123,
      random: () => 0.314,
    });

    expect(session.dayKey).toBe("2026-03-23");
    expect(session.selectedPackId).toBe(1);
    expect(session.packs).toHaveLength(10);
    expect(session.packs.every((pack) => pack.gifNumbers.length === 5)).toBe(true);
    expect(session.packs.flatMap((pack) => pack.gifNumbers)).toHaveLength(50);
    expect(new Set(session.packs.flatMap((pack) => pack.gifNumbers)).size).toBe(50);
    expect(isDailyPackSessionValid(session)).toBe(true);
  });

  it("reserves pack 10 as a premium-only gold pack", () => {
    const catalog = createCatalog(60);
    const entryByNumber = Object.fromEntries(catalog.map((entry) => [entry.number, entry]));
    const session = createDailyPackSession(catalog, {
      dayKey: "2026-03-23",
      generatedAt: 123,
      random: () => 0.314,
    });

    const goldPack = session.packs[DAILY_GOLD_PACK_ID - 1];

    expect(goldPack.id).toBe(DAILY_GOLD_PACK_ID);
    expect(
      goldPack.gifNumbers.every((number) => {
        const rarity = entryByNumber[number]?.rarity;
        return rarity === "rare" || rarity === "epic" || rarity === "legendary";
      }),
    ).toBe(true);
  });

  it("returns the browser-local day key", () => {
    expect(getLocalDayKey(new Date(2026, 2, 23, 23, 59, 0))).toBe("2026-03-23");
  });

  it("rejects invalid sessions with repeated GIF numbers", () => {
    const session = createDailyPackSession(createCatalog(60), {
      dayKey: "2026-03-23",
      generatedAt: 123,
      random: () => 0.25,
    });

    session.packs[1].gifNumbers[0] = session.packs[0].gifNumbers[0];

    expect(isDailyPackSessionValid(session)).toBe(false);
  });
});
