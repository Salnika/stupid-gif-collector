import { actionButton } from '../../../shared/styles/recipes.css'
import { GifCard } from '../../../shared/ui'
import type { RewardResult } from '../application/scrollRoundMachine'
import * as styles from './scrollGame.css'

type RewardPopupProps = {
  rewardResult: RewardResult
  copiedShareFor: number | null
  onCopyShare: () => void
  onGoToCollection: () => void
  onResetRound: () => void
}

export function RewardPopup({
  rewardResult,
  copiedShareFor,
  onCopyShare,
  onGoToCollection,
  onResetRound,
}: RewardPopupProps) {
  return (
    <div className={styles.popup} role="dialog" aria-modal="true">
      {rewardResult.isNew ? <p className={styles.newFlagPopup}>New!</p> : null}
      <GifCard className={styles.popupCard} entry={rewardResult.entry} count={rewardResult.count} />
      <div className={styles.popupActions}>
        <button type="button" className={actionButton({ tone: 'secondary' })} onClick={onCopyShare}>
          {copiedShareFor === rewardResult.entry.number ? 'Copied!' : 'Share'}
        </button>
        <button
          type="button"
          className={actionButton({ tone: 'secondary' })}
          onClick={onGoToCollection}
        >
          My collection
        </button>
        <button type="button" className={actionButton({ tone: 'primary' })} onClick={onResetRound}>
          Keep finding!
        </button>
      </div>
    </div>
  )
}
