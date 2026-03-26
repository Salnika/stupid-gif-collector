import { parseGifMeta, toBaseAssetPath } from "../../../lib/gifMeta";
import { DEFAULT_GIF_RARITY, isGifRarity, type GifRarity } from "../../../lib/rarity";
import type { CatalogRuntime, CatalogStats, GifCatalogEntry } from "../domain/catalogTypes";

type CatalogRuntimePayload = {
  total?: unknown;
  paths?: unknown;
  rarityByCollectionFolder?: unknown;
};

type CatalogStatsPayload = {
  total?: unknown;
};

const CATALOG_RUNTIME_URL = "/catalog-runtime.json";
const CATALOG_STATS_URL = "/catalog-stats.json";

let catalogRuntimeCache: CatalogRuntime | null = null;
let catalogStatsCache: CatalogStats | null = null;
let catalogEntriesCache: GifCatalogEntry[] | null = null;

const toPositiveInt = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;

const normalizePaths = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];

const normalizeRarityByCollectionFolder = (value: unknown): Record<string, GifRarity> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const rarityByCollectionFolder: Record<string, GifRarity> = {};
  for (const [collectionFolder, rarity] of Object.entries(value)) {
    if (!collectionFolder || !isGifRarity(rarity)) {
      continue;
    }

    rarityByCollectionFolder[collectionFolder] = rarity;
  }

  return rarityByCollectionFolder;
};

const toCatalogEntry = (
  path: string,
  fallbackNumber: number,
  rarityByCollectionFolder: Record<string, GifRarity>,
): GifCatalogEntry => {
  const parsedMeta = parseGifMeta(path, fallbackNumber);

  return {
    number: parsedMeta.number,
    path,
    name: parsedMeta.name,
    collection: parsedMeta.collection,
    rarity: rarityByCollectionFolder[parsedMeta.collectionFolder] ?? DEFAULT_GIF_RARITY,
  };
};

const fetchJson = async (assetPath: string): Promise<unknown> => {
  const response = await fetch(toBaseAssetPath(assetPath), { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Unable to load ${assetPath}`);
  }

  return response.json();
};

export const loadCatalogRuntime = async (): Promise<CatalogRuntime> => {
  if (catalogRuntimeCache) {
    return catalogRuntimeCache;
  }

  const payload = (await fetchJson(CATALOG_RUNTIME_URL)) as CatalogRuntimePayload;
  const paths = normalizePaths(payload.paths);

  catalogRuntimeCache = {
    total: toPositiveInt(payload.total, paths.length),
    paths,
    rarityByCollectionFolder: normalizeRarityByCollectionFolder(payload.rarityByCollectionFolder),
  };

  return catalogRuntimeCache;
};

export const loadCatalogStats = async (): Promise<CatalogStats> => {
  if (catalogStatsCache) {
    return catalogStatsCache;
  }

  if (catalogRuntimeCache) {
    catalogStatsCache = {
      total: catalogRuntimeCache.total,
    };
    return catalogStatsCache;
  }

  try {
    const payload = (await fetchJson(CATALOG_STATS_URL)) as CatalogStatsPayload;
    catalogStatsCache = {
      total: toPositiveInt(payload.total, 0),
    };
    return catalogStatsCache;
  } catch {
    const runtime = await loadCatalogRuntime();
    catalogStatsCache = {
      total: runtime.total,
    };
    return catalogStatsCache;
  }
};

export const loadCatalogEntries = async (): Promise<GifCatalogEntry[]> => {
  if (catalogEntriesCache) {
    return catalogEntriesCache;
  }

  const runtime = await loadCatalogRuntime();
  catalogEntriesCache = runtime.paths.map((path, offset) =>
    toCatalogEntry(path, offset + 1, runtime.rarityByCollectionFolder),
  );

  return catalogEntriesCache;
};

export const getEntryByNumber = async (number: number): Promise<GifCatalogEntry | null> => {
  if (!Number.isInteger(number) || number < 1) {
    return null;
  }

  const runtime = await loadCatalogRuntime();
  const path = runtime.paths[number - 1];
  if (typeof path !== "string" || path.length === 0) {
    return null;
  }

  return toCatalogEntry(path, number, runtime.rarityByCollectionFolder);
};

export const resetCatalogRepositoryCache = () => {
  catalogRuntimeCache = null;
  catalogStatsCache = null;
  catalogEntriesCache = null;
};
