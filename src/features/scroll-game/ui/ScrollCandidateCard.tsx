import { actionButton } from '../../../shared/styles/recipes.css'
import { GifCard } from '../../../shared/ui'
import type { GifCatalogEntry } from '../../catalog/domain'
import * as styles from './scrollGame.css'

type ScrollCandidateCardProps = {
  entry: GifCatalogEntry
  count: number
  isNew: boolean
  canKeep: boolean
  onKeep: () => void
}

export function ScrollCandidateCard({ entry, count, isNew, canKeep, onKeep }: ScrollCandidateCardProps) {
  return (
    <>
      <div className={styles.selectedCard}>
        <GifCard entry={entry} count={count} />
        {isNew ? <p className={styles.newFlagHero}>New!</p> : null}
      </div>

      {canKeep ? (
        <div className={styles.candidateActions}>
          <button
            type="button"
            className={actionButton({ tone: 'primary' })}
            onClick={onKeep}
          >
            Keep
          </button>
          <p className={styles.candidateHelp}>Scroll to keep searching</p>
        </div>
      ) : null}
    </>
  )
}
