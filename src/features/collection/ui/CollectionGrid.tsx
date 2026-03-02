import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { encodeAssetPath } from '../../../lib/gifMeta'
import { actionButton } from '../../../shared/styles/recipes.css'
import { GifCard } from '../../../shared/ui'
import type { CollectionGifEntry } from '../domain'
import * as styles from './collection.css'

type CollectionGridProps = {
  gifs: CollectionGifEntry[]
  copiedEmbedFor: number | null
  copiedShareFor: number | null
  onSelectGif: (gif: CollectionGifEntry) => void
  onCardKeyDown: (event: ReactKeyboardEvent<HTMLElement>, gif: CollectionGifEntry) => void
  onToggleFavorite: (gifNumber: number) => void
  onCopyEmbed: (gif: CollectionGifEntry) => Promise<void>
  onCopyShare: (gif: CollectionGifEntry) => Promise<void>
}

const getDownloadFileName = (gif: CollectionGifEntry): string =>
  `${gif.number}-${gif.name.replace(/\s+/g, '-').toLowerCase()}.gif`

export function CollectionGrid({
  gifs,
  copiedEmbedFor,
  copiedShareFor,
  onSelectGif,
  onCardKeyDown,
  onToggleFavorite,
  onCopyEmbed,
  onCopyShare,
}: CollectionGridProps) {
  return (
    <div className={styles.grid}>
      {gifs.map((gif) => (
        <GifCard
          key={gif.number}
          entry={gif}
          count={gif.count}
          interactive
          isFavorite={gif.isFavorite}
          favoriteLabels={{
            add: `Add GIF #${gif.number} to favorites`,
            remove: `Remove GIF #${gif.number} from favorites`,
          }}
          onToggleFavorite={() => onToggleFavorite(gif.number)}
          onSelect={() => onSelectGif(gif)}
          onSelectKeyDown={(event) => onCardKeyDown(event, gif)}
          actions={
            <div
              className={styles.cardActions}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <a
                className={actionButton({ tone: 'primary' })}
                href={encodeAssetPath(gif.path)}
                download={getDownloadFileName(gif)}
              >
                Download
              </a>
              <button
                type="button"
                className={actionButton({ tone: 'secondary' })}
                onClick={() => void onCopyEmbed(gif)}
              >
                {copiedEmbedFor === gif.number ? 'Copied!' : 'Copy embed'}
              </button>
              <button
                type="button"
                className={`${actionButton({ tone: 'secondary' })} ${styles.shareButton}`}
                onClick={() => void onCopyShare(gif)}
              >
                {copiedShareFor === gif.number ? 'Copied!' : 'Share'}
              </button>
            </div>
          }
        />
      ))}
    </div>
  )
}
