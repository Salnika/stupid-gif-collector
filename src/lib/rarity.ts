export const GIF_RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'] as const

export type GifRarity = (typeof GIF_RARITIES)[number]

export const DEFAULT_GIF_RARITY: GifRarity = 'common'

export const isGifRarity = (value: unknown): value is GifRarity =>
  typeof value === 'string' && GIF_RARITIES.includes(value as GifRarity)

const RARITY_LABELS: Record<GifRarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
}

export const toGifRarityLabel = (rarity: GifRarity): string => RARITY_LABELS[rarity]
