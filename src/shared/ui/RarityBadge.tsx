import { toGifRarityLabel, type GifRarity } from '../../lib/rarity'
import { rarityText } from '../styles/recipes.css'

type RarityBadgeProps = {
  rarity: GifRarity
}

export function RarityBadge({ rarity }: RarityBadgeProps) {
  return <span className={rarityText[rarity]}>{toGifRarityLabel(rarity)}</span>
}
