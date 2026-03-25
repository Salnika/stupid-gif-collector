import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { encodeAssetPath } from '../../../lib/gifMeta'
import { clearBrowserTimeout } from '../../../shared/lib/browser'
import { actionButton, rarityBorder } from '../../../shared/styles/recipes.css'
import { RarityBadge } from '../../../shared/ui'
import type { GifCatalogEntry } from '../../catalog/domain'
import type { DailyPack } from '../domain'
import * as styles from './dailyPacks.css'

type DailyPackOpeningDialogProps = {
  dayLabel: string
  pack: DailyPack
  packArtwork: string
  entriesByNumber: Record<number, GifCatalogEntry>
  animateOnOpen: boolean
  remainingPacks: number
  onOpenPack: () => void
  onClose: () => void
  onGoToCollection: () => void
}

type AnimatedCardStyle = CSSProperties & {
  '--spread-x': string
  '--spread-y': string
  '--spread-rotate': string
}

type PackMaskStyle = CSSProperties & {
  '--pack-mask': string
}

const CARD_SPREADS: AnimatedCardStyle[] = [
  {
    '--spread-x': 'clamp(-250px, -23vw, -122px)',
    '--spread-y': '44px',
    '--spread-rotate': '-16deg',
  },
  {
    '--spread-x': 'clamp(-126px, -11vw, -58px)',
    '--spread-y': '16px',
    '--spread-rotate': '-8deg',
  },
  {
    '--spread-x': '0px',
    '--spread-y': '-8px',
    '--spread-rotate': '0deg',
  },
  {
    '--spread-x': 'clamp(126px, 11vw, 58px)',
    '--spread-y': '16px',
    '--spread-rotate': '8deg',
  },
  {
    '--spread-x': 'clamp(250px, 23vw, 122px)',
    '--spread-y': '44px',
    '--spread-rotate': '16deg',
  },
]

const REVEAL_DELAY_MS = 2750

const getPackMaskStyle = (artwork: string): PackMaskStyle => ({
  '--pack-mask': `url("${artwork}")`,
})

type PackRewardCardProps = {
  entry: GifCatalogEntry
  count: number
  isNew: boolean
}

type PackReward = {
  entry: GifCatalogEntry
  reveal: DailyPack['revealResults'][number]
}

function PackRewardCard({ entry, count, isNew }: PackRewardCardProps) {
  return (
    <>
      <img
        className={styles.dialogCardImage}
        src={encodeAssetPath(entry.path)}
        alt={`Reward GIF #${entry.number}`}
      />
      <div className={styles.dialogCardBody}>
        <div className={styles.dialogCardTopRow}>
          <p className={styles.dialogCardNumber}>#{entry.number}</p>
          {count >= 2 ? <span className={styles.dialogCardCount}>x{count}</span> : null}
        </div>
        <p className={styles.dialogCardName}>{entry.name}</p>
        <p className={styles.dialogCardCollection}>{entry.collection}</p>
        <div className={styles.dialogCardFooter}>
          <RarityBadge rarity={entry.rarity} />
          {isNew ? <span className={styles.dialogNewBadge}>New</span> : null}
        </div>
      </div>
    </>
  )
}

function PackArtworkSurface({ artwork }: { artwork: string }) {
  return (
    <>
      <img className={styles.dialogPackArt} src={artwork} alt="" aria-hidden="true" />
      <div className={styles.dialogPackTextureMetal} aria-hidden="true" />
      <div className={styles.dialogPackTextureHolo} aria-hidden="true" />
      <div className={styles.dialogPackTextureGloss} aria-hidden="true" />
    </>
  )
}

export function DailyPackOpeningDialog({
  dayLabel,
  pack,
  packArtwork,
  entriesByNumber,
  animateOnOpen,
  remainingPacks,
  onOpenPack,
  onClose,
  onGoToCollection,
}: DailyPackOpeningDialogProps) {
  const revealTimerRef = useRef<number | null>(null)
  const [isRevealed, setIsRevealed] = useState(!animateOnOpen && pack.status === 'opened')
  const [selectedReward, setSelectedReward] = useState<PackReward | null>(null)

  useEffect(() => {
    setIsRevealed(!animateOnOpen && pack.status === 'opened')
    setSelectedReward(null)
    revealTimerRef.current = clearBrowserTimeout(revealTimerRef.current)

    if (!animateOnOpen) {
      return
    }

    revealTimerRef.current = window.setTimeout(() => {
      setIsRevealed(true)
    }, REVEAL_DELAY_MS)

    return () => {
      revealTimerRef.current = clearBrowserTimeout(revealTimerRef.current)
    }
  }, [animateOnOpen, pack.id, pack.status])

  useEffect(() => {
    if (!selectedReward) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedReward(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedReward])

  const rewards = pack.revealResults
    .map((reveal) => {
      const entry = entriesByNumber[reveal.number]
      if (!entry) {
        return null
      }

      return {
        entry,
        reveal,
      }
    })
    .filter((reward): reward is PackReward => Boolean(reward))

  const isReadyToOpen = pack.status === 'sealed' && !animateOnOpen
  const isReviewMode = pack.status === 'opened' && !animateOnOpen
  const canInspectRewards = pack.status === 'opened' && (isRevealed || isReviewMode)

  const openRewardPreview = (reward: PackReward) => {
    if (!canInspectRewards) {
      return
    }

    setSelectedReward(reward)
  }

  const handleRewardKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>, reward: PackReward) => {
    if (!canInspectRewards) {
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setSelectedReward(reward)
    }
  }

  const hintText =
    remainingPacks > 0
      ? `${remainingPacks} pack${remainingPacks > 1 ? 's' : ''} still sealed today.`
      : 'All daily packs are open. Come back after midnight for a fresh run.'

  const title = isReadyToOpen
    ? `Pack ${pack.id} ready to open`
    : animateOnOpen
      ? isRevealed
        ? `Pack ${pack.id} opened`
        : `Opening pack ${pack.id}`
      : `Pack ${pack.id} review`

  return (
    <div
      className={styles.dialogBackdrop}
      data-animate={animateOnOpen}
      data-revealed={isRevealed}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <section className={styles.dialogPanel}>
        <div className={styles.dialogHeader}>
          <div>
            <p className={styles.dialogEyebrow}>{dayLabel}</p>
            <h2 className={styles.dialogTitle}>{title}</h2>
            <p className={styles.dialogMeta}>
              {isReadyToOpen
                ? 'Click the pack to tear it open. Rewards are only granted once you open it from this screen.'
                : animateOnOpen
                ? isRevealed
                  ? 'Five GIFs are now in your collection. You can review this pack again any time today.'
                  : 'The wrapper tears open first, then the five rewards fan out and flip face-up.'
                : 'This pack is already open. Reviewing it does not grant rewards again.'}
            </p>
          </div>

          <button type="button" className={styles.closeButton} onClick={onClose}>
            Close
          </button>
        </div>

        {isReadyToOpen ? (
          <div className={styles.dialogArena}>
            <button
              type="button"
              className={styles.dialogPackTrigger}
              onClick={onOpenPack}
              aria-label={`Click pack ${pack.id} to open`}
            >
              <div className={styles.dialogPackStage} aria-hidden="true">
                <div className={styles.dialogPackBodyPiece}>
                  <div className={styles.dialogPackShell} style={getPackMaskStyle(packArtwork)}>
                    <PackArtworkSurface artwork={packArtwork} />
                  </div>
                </div>
                <div className={styles.dialogPackTopPiece}>
                  <div className={styles.dialogPackShell} style={getPackMaskStyle(packArtwork)}>
                    <PackArtworkSurface artwork={packArtwork} />
                  </div>
                </div>
              </div>

              <div className={styles.dialogPackPrompt}>
                <span className={styles.dialogPackPromptBadge}>Click to open</span>
                <p className={styles.dialogPackPromptText}>Tear the wrapper to reveal the five GIFs inside.</p>
              </div>
            </button>
          </div>
        ) : animateOnOpen ? (
          <div className={styles.dialogArena}>
            <div className={styles.dialogFlash} />

            <div className={styles.dialogPackStage} aria-hidden="true">
              <div className={styles.dialogPackBodyPiece}>
                <div className={styles.dialogPackShell} style={getPackMaskStyle(packArtwork)}>
                  <PackArtworkSurface artwork={packArtwork} />
                </div>
              </div>
              <div className={styles.dialogPackMouth} />
              <div className={styles.dialogPackTopPiece}>
                <div className={styles.dialogPackShell} style={getPackMaskStyle(packArtwork)}>
                  <PackArtworkSurface artwork={packArtwork} />
                </div>
              </div>
              <div className={styles.dialogCut} />
            </div>

            <ul className={styles.dialogCardsFan}>
              {rewards.map(({ entry, reveal }, index) => (
                <li
                  className={styles.dialogCardSlot}
                  style={CARD_SPREADS[index]}
                  key={entry.number}
                  data-interactive={canInspectRewards}
                >
                  <div
                    className={styles.dialogCardButton}
                    onClick={() => openRewardPreview({ entry, reveal })}
                    onKeyDown={(event) => handleRewardKeyDown(event, { entry, reveal })}
                    role={canInspectRewards ? 'button' : undefined}
                    tabIndex={canInspectRewards ? 0 : -1}
                    aria-disabled={!canInspectRewards}
                    data-disabled={!canInspectRewards}
                    aria-label={`Open reward GIF #${entry.number}`}
                  >
                    <div className={styles.dialogCardInner}>
                      <div className={styles.dialogCardBack} data-rarity={entry.rarity}>
                        <span className={styles.dialogCardBackLabel}>GIF Drop</span>
                      </div>
                      <div
                        className={`${styles.dialogCardFront} ${rarityBorder[entry.rarity]}`}
                        data-rarity={entry.rarity}
                      >
                        <PackRewardCard entry={entry} count={reveal.count} isNew={reveal.isNew} />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className={styles.dialogStaticGrid}>
            {rewards.map(({ entry, reveal }) => (
              <div
                className={styles.dialogStaticCardButton}
                onClick={() => openRewardPreview({ entry, reveal })}
                onKeyDown={(event) => handleRewardKeyDown(event, { entry, reveal })}
                role="button"
                tabIndex={0}
                aria-label={`Open reward GIF #${entry.number}`}
                key={entry.number}
              >
                <div
                  className={`${styles.dialogCardFront} ${styles.dialogStaticCard} ${rarityBorder[entry.rarity]}`}
                  data-rarity={entry.rarity}
                >
                  <PackRewardCard entry={entry} count={reveal.count} isNew={reveal.isNew} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isReadyToOpen ? (
          <div className={styles.dialogActions}>
            <p className={styles.dialogHint}>{hintText}</p>
            <div className={styles.dialogActionGroup}>
              <button
                type="button"
                className={actionButton({ tone: 'secondary' })}
                onClick={onGoToCollection}
                disabled={!isRevealed}
              >
                My collection
              </button>
              <button
                type="button"
                className={actionButton({ tone: 'primary' })}
                onClick={onClose}
                disabled={!isRevealed}
              >
                Back to packs
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {selectedReward ? (
        <div className={styles.dialogPreviewBackdrop} onClick={() => setSelectedReward(null)}>
          <div
            className={styles.dialogPreviewPanel}
            role="dialog"
            aria-modal="true"
            aria-label={`Reward GIF #${selectedReward.entry.number}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className={`${styles.dialogCardFront} ${styles.dialogPreviewCard} ${rarityBorder[selectedReward.entry.rarity]}`}
              data-rarity={selectedReward.entry.rarity}
            >
              <PackRewardCard
                entry={selectedReward.entry}
                count={selectedReward.reveal.count}
                isNew={selectedReward.reveal.isNew}
              />
            </div>

            <button
              type="button"
              className={actionButton({ tone: 'secondary' })}
              onClick={() => setSelectedReward(null)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
