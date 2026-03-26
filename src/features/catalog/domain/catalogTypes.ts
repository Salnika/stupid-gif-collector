import type { GifRarity } from "../../../lib/rarity";

export type GifCatalogEntry = {
  number: number;
  path: string;
  name: string;
  collection: string;
  rarity: GifRarity;
};

export type CatalogRuntime = {
  total: number;
  paths: string[];
  rarityByCollectionFolder: Record<string, GifRarity>;
};

export type CatalogStats = {
  total: number;
};
