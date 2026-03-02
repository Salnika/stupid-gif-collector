import { actionButton } from '../../../shared/styles/recipes.css'
import { GifCard } from '../../../shared/ui'
import type { CollectionGifEntry } from '../domain'
import * as styles from './collection.css'

type CollectionModalProps = {
  selectedGif: CollectionGifEntry | null
  onClose: () => void
}

export function CollectionModal({ selectedGif, onClose }: CollectionModalProps) {
  if (!selectedGif) {
    return null
  }

  return (
    <div
      className={styles.modal}
      role="dialog"
      aria-modal="true"
      aria-label={`GIF #${selectedGif.number}`}
      onClick={onClose}
    >
      <GifCard
        className={styles.modalCard}
        entry={selectedGif}
        count={selectedGif.count}
        actions={
          <div className={styles.modalActions} onClick={(event) => event.stopPropagation()}>
            <button type="button" className={actionButton({ tone: 'secondary' })} onClick={onClose}>
              Close
            </button>
          </div>
        }
      />
    </div>
  )
}
