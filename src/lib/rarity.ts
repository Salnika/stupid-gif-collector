export const GIF_RARITIES = ["common", "uncommon", "rare", "epic", "legendary"] as const;

export type GifRarity = (typeof GIF_RARITIES)[number];

export const DEFAULT_GIF_RARITY: GifRarity = "common";

export const isGifRarity = (value: unknown): value is GifRarity =>
  typeof value === "string" && GIF_RARITIES.includes(value as GifRarity);

export const getNextGifRarity = (rarity: GifRarity): GifRarity | null => {
  const rarityIndex = GIF_RARITIES.indexOf(rarity);
  if (rarityIndex < 0 || rarityIndex >= GIF_RARITIES.length - 1) {
    return null;
  }

  return GIF_RARITIES[rarityIndex + 1];
};

export const getTradeableGifRarities = (): GifRarity[] =>
  GIF_RARITIES.filter((rarity) => getNextGifRarity(rarity) !== null);

const RARITY_LABELS: Record<GifRarity, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

export const toGifRarityLabel = (rarity: GifRarity): string => RARITY_LABELS[rarity];
