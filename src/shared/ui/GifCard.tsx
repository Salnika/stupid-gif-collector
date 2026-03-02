import type { KeyboardEventHandler, ReactNode } from 'react'
import type { GifCatalogEntry } from '../../features/catalog/domain'
import { encodeAssetPath } from '../../lib/gifMeta'
import { rarityBorder } from '../styles/recipes.css'
import { RarityBadge } from './RarityBadge'
import * as styles from './GifCard.css'

type FavoriteLabels = {
  add: string
  remove: string
}

type GifCardProps = {
  entry: GifCatalogEntry
  count?: number
  imageAlt?: string
  interactive?: boolean
  isFavorite?: boolean
  favoriteLabels?: FavoriteLabels
  onToggleFavorite?: () => void
  onSelect?: () => void
  onSelectKeyDown?: KeyboardEventHandler<HTMLElement>
  actions?: ReactNode
  className?: string
}

const withClassName = (...classes: Array<string | false | null | undefined>): string =>
  classes.filter((value): value is string => Boolean(value)).join(' ')

export function GifCard({
  entry,
  count,
  imageAlt,
  interactive = false,
  isFavorite,
  favoriteLabels,
  onToggleFavorite,
  onSelect,
  onSelectKeyDown,
  actions,
  className,
}: GifCardProps) {
  return (
    <article
      className={withClassName(
        styles.card({ interactive }),
        rarityBorder[entry.rarity],
        className,
      )}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? `Open GIF #${entry.number}` : undefined}
      onClick={onSelect}
      onKeyDown={onSelectKeyDown}
    >
      {count && count >= 2 ? <span className={styles.countBadge}>x{count}</span> : null}

      {typeof isFavorite === 'boolean' && onToggleFavorite && favoriteLabels ? (
        <button
          type="button"
          className={withClassName(styles.favoriteButton, isFavorite && styles.favoriteButtonActive)}
          aria-label={isFavorite ? favoriteLabels.remove : favoriteLabels.add}
          aria-pressed={isFavorite}
          onClick={(event) => {
            event.stopPropagation()
            onToggleFavorite()
          }}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      ) : null}

      <img className={styles.image} src={encodeAssetPath(entry.path)} alt={imageAlt ?? `GIF #${entry.number}`} />
      <div className={styles.meta}>
        <p className={styles.number}>#{entry.number}</p>
        <p className={styles.name}>{entry.name}</p>
        <p className={styles.collection}>Collection: {entry.collection}</p>
        <p className={styles.rarity}>
          Rarity: <RarityBadge rarity={entry.rarity} />
        </p>
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </article>
  )
}
