import type { GifCatalogEntry } from '../../catalog/domain'
import { GifCard } from '../../../shared/ui'
import * as styles from './share.css'

type SharedGifCardProps = {
  entry: GifCatalogEntry
}

export function SharedGifCard({ entry }: SharedGifCardProps) {
  return <GifCard entry={entry} className={styles.card} />
}
