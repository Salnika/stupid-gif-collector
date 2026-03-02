import type { GifRarity } from '../../../lib/rarity'

export type GifCatalogEntry = {
  number: number
  path: string
  name: string
  collection: string
  rarity: GifRarity
}

export type GifManifest = {
  total: number
  byNumber: Record<number, GifCatalogEntry>
}

export type GifIndex = {
  total: number
  paths: string[]
}
