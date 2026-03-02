import type { GifCatalogEntry } from '../../catalog/domain'

export type CollectionGifEntry = GifCatalogEntry & {
  count: number
  unlockedAt: number
  isFavorite: boolean
}

export type TransferStatus = {
  tone: 'info' | 'success' | 'error'
  message: string
}
