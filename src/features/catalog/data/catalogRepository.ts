import { parseGifMeta, toBaseAssetPath } from '../../../lib/gifMeta'
import { DEFAULT_GIF_RARITY, isGifRarity } from '../../../lib/rarity'
import type { GifCatalogEntry, GifIndex, GifManifest } from '../domain/catalogTypes'

type ManifestPayload = {
  total?: unknown
  byNumber?: unknown
}

type IndexPayload = {
  total?: unknown
  paths?: unknown
}

const MANIFEST_URL = '/collections-manifest.json'
const INDEX_URL = '/collections-index.json'

let manifestCache: GifManifest | null = null
let indexCache: GifIndex | null = null

const toPositiveInt = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback

const normalizeManifestEntry = (fallbackNumber: number, rawValue: unknown): GifCatalogEntry | null => {
  if (!rawValue || typeof rawValue !== 'object') {
    return null
  }

  const value = rawValue as {
    number?: unknown
    path?: unknown
    name?: unknown
    collection?: unknown
    rarity?: unknown
  }

  if (typeof value.path !== 'string' || value.path.length === 0) {
    return null
  }

  const entryNumber = toPositiveInt(value.number, fallbackNumber)
  const parsedMeta = parseGifMeta(value.path, entryNumber)

  return {
    number: entryNumber,
    path: value.path,
    name:
      typeof value.name === 'string' && value.name.trim().length > 0
        ? value.name.trim()
        : parsedMeta.name,
    collection:
      typeof value.collection === 'string' && value.collection.trim().length > 0
        ? value.collection.trim()
        : parsedMeta.collection,
    rarity: isGifRarity(value.rarity) ? value.rarity : DEFAULT_GIF_RARITY,
  }
}

const createManifestFromIndex = (index: GifIndex): GifManifest => {
  const byNumber: Record<number, GifCatalogEntry> = {}

  for (let offset = 0; offset < index.paths.length; offset += 1) {
    const number = offset + 1
    const path = index.paths[offset]
    if (!path) {
      continue
    }

    const parsedMeta = parseGifMeta(path, number)
    byNumber[number] = {
      number,
      path,
      name: parsedMeta.name,
      collection: parsedMeta.collection,
      rarity: DEFAULT_GIF_RARITY,
    }
  }

  return {
    total: Math.max(index.total, Object.keys(byNumber).length),
    byNumber,
  }
}

const fetchJson = async (assetPath: string): Promise<unknown> => {
  const response = await fetch(toBaseAssetPath(assetPath), { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Unable to load ${assetPath}`)
  }

  return response.json()
}

export const loadIndex = async (): Promise<GifIndex> => {
  if (indexCache) {
    return indexCache
  }

  const payload = (await fetchJson(INDEX_URL)) as IndexPayload
  const paths = Array.isArray(payload.paths)
    ? payload.paths.filter((item): item is string => typeof item === 'string' && item.length > 0)
    : []

  indexCache = {
    total: toPositiveInt(payload.total, paths.length),
    paths,
  }

  return indexCache
}

export const loadManifest = async (): Promise<GifManifest> => {
  if (manifestCache) {
    return manifestCache
  }

  try {
    const payload = (await fetchJson(MANIFEST_URL)) as ManifestPayload
    const byNumber: Record<number, GifCatalogEntry> = {}

    if (payload.byNumber && typeof payload.byNumber === 'object') {
      for (const [rawKey, rawValue] of Object.entries(payload.byNumber)) {
        const keyNumber = Number.parseInt(rawKey, 10)
        if (!Number.isFinite(keyNumber) || keyNumber < 1) {
          continue
        }

        const normalized = normalizeManifestEntry(keyNumber, rawValue)
        if (!normalized) {
          continue
        }

        byNumber[normalized.number] = normalized
      }
    }

    const normalizedTotal = toPositiveInt(payload.total, Object.keys(byNumber).length)
    manifestCache = {
      total: Math.max(normalizedTotal, Object.keys(byNumber).length),
      byNumber,
    }

    if (Object.keys(manifestCache.byNumber).length > 0) {
      return manifestCache
    }
  } catch {
    // Fallback to index JSON below.
  }

  const fallbackIndex = await loadIndex()
  manifestCache = createManifestFromIndex(fallbackIndex)
  return manifestCache
}

export const getEntryByNumber = async (number: number): Promise<GifCatalogEntry | null> => {
  if (!Number.isInteger(number) || number < 1) {
    return null
  }

  const manifest = await loadManifest()
  const fromManifest = manifest.byNumber[number]
  if (fromManifest) {
    return fromManifest
  }

  const index = await loadIndex()
  const path = index.paths[number - 1]
  if (typeof path !== 'string' || path.length === 0) {
    return null
  }

  const parsedMeta = parseGifMeta(path, number)
  return {
    number,
    path,
    name: parsedMeta.name,
    collection: parsedMeta.collection,
    rarity: DEFAULT_GIF_RARITY,
  }
}

export const resetCatalogRepositoryCache = () => {
  manifestCache = null
  indexCache = null
}
