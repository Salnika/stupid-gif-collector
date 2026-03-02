import { DEFAULT_GIF_RARITY, type GifRarity } from '../../../lib/rarity'
import type { UnlockedGif } from '../data/unlockedGifsStore'
import type { CollectionGifEntry } from '../domain'

type CollectionFilterParams = {
  showFavoritesOnly: boolean
  collectionFilters: string[]
  rarityFilters: GifRarity[]
}

export const createCollectionEntries = (
  unlockedByNumber: Record<number, UnlockedGif>,
  favoriteByNumber: Record<number, true>,
  rarityByNumber: Record<number, GifRarity>,
): CollectionGifEntry[] =>
  Object.values(unlockedByNumber)
    .map((gif): CollectionGifEntry => ({
      number: gif.number,
      path: gif.path,
      name: gif.name,
      collection: gif.collection,
      rarity: rarityByNumber[gif.number] ?? gif.rarity ?? DEFAULT_GIF_RARITY,
      unlockedAt: gif.unlockedAt,
      count: gif.count,
      isFavorite: Boolean(favoriteByNumber[gif.number]),
    }))
    .sort((left, right) => left.number - right.number)

export const filterCollectionEntries = (
  entries: CollectionGifEntry[],
  { showFavoritesOnly, collectionFilters, rarityFilters }: CollectionFilterParams,
): CollectionGifEntry[] =>
  entries.filter((gif) => {
    if (showFavoritesOnly && !gif.isFavorite) {
      return false
    }

    if (collectionFilters.length > 0 && !collectionFilters.includes(gif.collection)) {
      return false
    }

    if (rarityFilters.length > 0 && !rarityFilters.includes(gif.rarity)) {
      return false
    }

    return true
  })
