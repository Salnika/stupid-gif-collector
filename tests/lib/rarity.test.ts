import { describe, expect, it } from "vite-plus/test";
import { getNextGifRarity, getTradeableGifRarities } from "../../src/lib/rarity";

describe("rarity helpers", () => {
  it("returns the next rarity in the progression", () => {
    expect(getNextGifRarity("common")).toBe("uncommon");
    expect(getNextGifRarity("epic")).toBe("legendary");
  });

  it("returns null when there is no higher rarity", () => {
    expect(getNextGifRarity("legendary")).toBeNull();
  });

  it("lists only source rarities that can be traded up", () => {
    expect(getTradeableGifRarities()).toEqual(["common", "uncommon", "rare", "epic"]);
  });
});
