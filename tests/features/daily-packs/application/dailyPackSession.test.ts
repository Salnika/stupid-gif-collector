import { describe, expect, it } from "vite-plus/test";
import type { GifCatalogEntry } from "../../../../src/features/catalog/domain";
import {
  createDailyPackSession,
  getNextPackGenerationTime,
  isDailyPackSessionValid,
  replenishDailyPackSession,
} from "../../../../src/features/daily-packs/application/dailyPackSession";
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

describe("dailyPackSession", () => {
  it("creates an initial session with one sealed pack", () => {
    const session = createDailyPackSession(createCatalog(60), {
      generatedAt: 123,
      random: () => 0.5,
    });

    expect(session.lastGeneratedAt).toBe(123);
    expect(session.nextPackId).toBe(2);
    expect(session.selectedPackId).toBe(1);
    expect(session.packs).toHaveLength(1);
    expect(session.packs[0]).toMatchObject({
      id: 1,
      variant: "standard",
      status: "sealed",
    });
    expect(session.packs[0].gifNumbers).toHaveLength(5);
    expect(new Set(session.packs[0].gifNumbers).size).toBe(5);
    expect(isDailyPackSessionValid(session)).toBe(true);
  });

  it("adds one pack every five minutes and caps unopened packs at ten", () => {
    const start = Date.UTC(2026, 2, 23, 8, 0, 0);
    const session = createDailyPackSession(createCatalog(60), {
      generatedAt: start,
      random: () => 0.5,
    });

    const replenished = replenishDailyPackSession(session, createCatalog(60), {
      now: start + PACK_GENERATION_INTERVAL_MS * 12,
      random: () => 0.5,
    });

    expect(replenished.packs).toHaveLength(10);
    expect(replenished.packs.every((pack) => pack.status === "sealed")).toBe(true);
    expect(replenished.nextPackId).toBe(11);
    expect(replenished.lastGeneratedAt).toBe(start + PACK_GENERATION_INTERVAL_MS * 12);
    expect(isDailyPackSessionValid(replenished)).toBe(true);
  });

  it("rolls a gold pack when the 1-in-20 chance succeeds", () => {
    const catalog = createCatalog(60);
    const entryByNumber = Object.fromEntries(catalog.map((entry) => [entry.number, entry]));
    const session = createDailyPackSession(catalog, {
      generatedAt: 123,
      random: () => 0,
    });

    expect(session.packs[0].variant).toBe("gold");
    expect(
      session.packs[0].gifNumbers.every((number) => {
        const rarity = entryByNumber[number]?.rarity;
        return rarity === "rare" || rarity === "epic" || rarity === "legendary";
      }),
    ).toBe(true);
  });

  it("computes the next generation time from the last refresh", () => {
    const session = createDailyPackSession(createCatalog(60), {
      generatedAt: 500,
      random: () => 0.5,
    });

    expect(getNextPackGenerationTime(session)).toBe(500 + PACK_GENERATION_INTERVAL_MS);
  });

  it("rejects invalid sessions with repeated pack ids", () => {
    const session = createDailyPackSession(createCatalog(60), {
      generatedAt: 123,
      random: () => 0.5,
    });

    session.packs.push({
      ...session.packs[0],
    });

    expect(isDailyPackSessionValid(session)).toBe(false);
  });
});
