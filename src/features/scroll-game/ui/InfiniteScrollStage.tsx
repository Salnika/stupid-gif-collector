import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { InfiniteLoader } from '../../../components/InfiniteLoader'
import { PortalGlyphColumns } from '../../../components/PortalGlyphColumns'
import { useCoverAnchorPosition } from '../../../hooks/useCoverAnchorPosition'
import { useLenisInfiniteScroll, type InfiniteScrollUpdate } from '../../../hooks/useLenisInfiniteScroll'
import { useLoaderRotation } from '../../../hooks/useLoaderRotation'
import { copyGifShareUrl } from '../../../shared/services/shareService'
import { clearBrowserTimeout, restartTimeout } from '../../../shared/lib/browser'
import { getEntryByNumber, loadManifest } from '../../catalog/data'
import { useUnlockedGifsStore } from '../../collection/data/unlockedGifsStore'
import {
  MAX_ATTEMPTS,
  type RewardResult,
} from '../application/scrollRoundMachine'
import { useScrollRoundMachine } from '../application/useScrollRoundMachine'
import { RewardPopup } from './RewardPopup'
import { ScrollCandidateCard } from './ScrollCandidateCard'
import { ScrollHud } from './ScrollHud'
import * as styles from './scrollGame.css'

const BACKGROUND_SIZE = { width: 1920, height: 1229 }
const LOADER_ANCHOR = { x: 1125, y: 425 }
const DEFAULT_TOTAL_GIFS = 27901
const PIXELS_PER_RANDOM_STEP = 160
const SCROLL_IDLE_TIMEOUT_MS = 180
const ACTIVE_DELTA_THRESHOLD = 0.1
const ACTIVE_VELOCITY_THRESHOLD = 0.03

const pickRandomIndex = (current: number, total: number): number => {
  if (total <= 1) {
    return 1
  }

  let next = current
  while (next === current) {
    next = Math.floor(Math.random() * total) + 1
  }

  return next
}

export function InfiniteScrollStage() {
  const navigate = useNavigate()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const loaderRef = useRef<HTMLDivElement>(null)
  const effectsRef = useRef<HTMLDivElement>(null)

  const indexRef = useRef(1)
  const scrollDistanceRef = useRef(0)
  const stopTimerRef = useRef<number | null>(null)
  const copyShareTimerRef = useRef<number | null>(null)
  const totalGifsRef = useRef(DEFAULT_TOTAL_GIFS)
  const isScrollingRef = useRef(false)
  const popupOpenRef = useRef(false)
  const machineStateRef = useRef<ReturnType<typeof useScrollRoundMachine>['state'] | null>(null)

  const [collectionIndex, setCollectionIndex] = useState(1)

  const { state, startScroll, stopScroll, revealCandidate, lockReward, setCopiedShareFor, resetRound } =
    useScrollRoundMachine()

  useEffect(() => {
    machineStateRef.current = state
    popupOpenRef.current = state.showRewardPopup
  }, [state])

  const registerCaughtGif = useUnlockedGifsStore((store) => store.registerCaughtGif)
  const unlockedByNumber = useUnlockedGifsStore((store) => store.unlockedByNumber)

  const { handleLoaderUpdate } = useLoaderRotation(loaderRef, { effectsRef })

  useEffect(() => {
    let cancelled = false

    const loadCatalog = async () => {
      try {
        const manifest = await loadManifest()
        if (!cancelled) {
          totalGifsRef.current = manifest.total > 0 ? manifest.total : DEFAULT_TOTAL_GIFS
        }
      } catch {
        if (!cancelled) {
          totalGifsRef.current = DEFAULT_TOTAL_GIFS
        }
      }
    }

    void loadCatalog()

    return () => {
      cancelled = true
      stopTimerRef.current = clearBrowserTimeout(stopTimerRef.current)
      copyShareTimerRef.current = clearBrowserTimeout(copyShareTimerRef.current)
    }
  }, [])

  const validateEntry = useCallback(
    (rewardEntry: RewardResult['entry']) => {
      const result = registerCaughtGif({
        number: rewardEntry.number,
        name: rewardEntry.name,
        collection: rewardEntry.collection,
        rarity: rewardEntry.rarity,
        path: rewardEntry.path,
      })

      lockReward({
        entry: rewardEntry,
        count: result.count,
        isNew: result.isNew,
      })
    },
    [lockReward, registerCaughtGif],
  )

  const revealCurrentEntry = useCallback(async () => {
    const entry = await getEntryByNumber(indexRef.current)
    if (!entry || popupOpenRef.current) {
      return
    }

    revealCandidate(entry)

    if ((machineStateRef.current?.attempt ?? 1) >= MAX_ATTEMPTS) {
      validateEntry(entry)
    }
  }, [revealCandidate, validateEntry])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || event.repeat) {
        return
      }

      if (popupOpenRef.current || isScrollingRef.current || state.attempt >= MAX_ATTEMPTS) {
        return
      }

      if (!state.currentCandidate) {
        return
      }

      event.preventDefault()
      validateEntry(state.currentCandidate)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [state.attempt, state.currentCandidate, validateEntry])

  const onUpdate = useCallback(
    (update: InfiniteScrollUpdate) => {
      if (popupOpenRef.current) {
        return
      }

      handleLoaderUpdate(update)

      const deltaAbs = Math.abs(update.deltaPixels)
      const velocityAbs = Math.abs(update.velocity)
      const isActiveScroll =
        deltaAbs > ACTIVE_DELTA_THRESHOLD || velocityAbs > ACTIVE_VELOCITY_THRESHOLD

      if (!isActiveScroll) {
        return
      }

      if (!isScrollingRef.current) {
        startScroll()
      }

      isScrollingRef.current = true

      stopTimerRef.current = restartTimeout(stopTimerRef.current, () => {
        if (popupOpenRef.current) {
          return
        }

        isScrollingRef.current = false
        stopScroll()
        void revealCurrentEntry()
      }, SCROLL_IDLE_TIMEOUT_MS)

      scrollDistanceRef.current += deltaAbs
      const randomSteps = Math.floor(scrollDistanceRef.current / PIXELS_PER_RANDOM_STEP)
      if (randomSteps <= 0) {
        return
      }

      scrollDistanceRef.current -= randomSteps * PIXELS_PER_RANDOM_STEP

      let nextIndex = indexRef.current
      for (let step = 0; step < randomSteps; step += 1) {
        nextIndex = pickRandomIndex(nextIndex, totalGifsRef.current)
      }

      if (nextIndex !== indexRef.current) {
        indexRef.current = nextIndex
        setCollectionIndex(nextIndex)
      }
    },
    [handleLoaderUpdate, revealCurrentEntry, startScroll, stopScroll],
  )

  useLenisInfiniteScroll({
    wrapperRef,
    contentRef,
    onUpdate,
    pixelsPerTurn: 220,
  })

  const loaderPosition = useCoverAnchorPosition({
    containerRef: wrapperRef,
    imageSize: BACKGROUND_SIZE,
    anchor: LOADER_ANCHOR,
  })

  const currentCandidateCount = state.currentCandidate
    ? unlockedByNumber[state.currentCandidate.number]?.count ?? 0
    : 0
  const isCurrentCandidateNew = state.currentCandidate
    ? !unlockedByNumber[state.currentCandidate.number]
    : false

  const attemptLabel = state.hasStartedRound
    ? `Attempt ${state.attempt}/${MAX_ATTEMPTS}`
    : `Attempt 1/${MAX_ATTEMPTS}`

  const hintText = useMemo(() => {
    if (state.showRewardPopup) {
      return 'Choose your next move.'
    }

    if (!state.hasStartedRound) {
      return 'Scroll to start attempt 1 of 3.'
    }

    if (state.isScrolling) {
      return `Rolling attempt ${state.attempt}/${MAX_ATTEMPTS}...`
    }

    if (state.currentCandidate) {
      if (state.attempt < MAX_ATTEMPTS) {
        return 'Click Keep or press Enter, then scroll to keep searching.'
      }

      return 'Final attempt locked in.'
    }

    return 'Scroll to reveal a GIF.'
  }, [state.attempt, state.currentCandidate, state.hasStartedRound, state.isScrolling, state.showRewardPopup])

  const handleCopyPopupShare = async () => {
    const rewardEntry = state.rewardResult?.entry
    if (!rewardEntry) {
      return
    }

    const copied = await copyGifShareUrl(rewardEntry.path)
    if (!copied) {
      return
    }

    setCopiedShareFor(rewardEntry.number)
    copyShareTimerRef.current = restartTimeout(copyShareTimerRef.current, () => {
      setCopiedShareFor(null)
    }, 1200)
  }

  const handleResetRound = () => {
    stopTimerRef.current = clearBrowserTimeout(stopTimerRef.current)
    copyShareTimerRef.current = clearBrowserTimeout(copyShareTimerRef.current)
    isScrollingRef.current = false
    scrollDistanceRef.current = 0
    resetRound()
  }

  return (
    <>
      <section className={styles.scrollStage} ref={wrapperRef}>
        <div className={styles.content} ref={contentRef} aria-hidden="true">
          <div className={styles.spacer} />
        </div>
      </section>

      <div className={styles.overlay} ref={effectsRef}>
        <PortalGlyphColumns />

        {!state.showRewardPopup && !state.isScrolling && state.currentCandidate ? (
          <ScrollCandidateCard
            entry={state.currentCandidate}
            count={currentCandidateCount}
            isNew={isCurrentCandidateNew}
            canKeep={state.attempt < MAX_ATTEMPTS}
            onKeep={() => validateEntry(state.currentCandidate as RewardResult['entry'])}
          />
        ) : null}

        {state.showRewardPopup && state.rewardResult ? (
          <RewardPopup
            rewardResult={state.rewardResult}
            copiedShareFor={state.copiedShareFor}
            onCopyShare={() => void handleCopyPopupShare()}
            onGoToCollection={() => navigate('/my-collection')}
            onResetRound={handleResetRound}
          />
        ) : null}

        <div
          className={styles.loaderAnchor}
          style={{
            left: `${loaderPosition.x}px`,
            top: `${loaderPosition.y}px`,
          }}
        >
          <InfiniteLoader ref={loaderRef} />
        </div>

        <ScrollHud
          attemptLabel={attemptLabel}
          hintText={hintText}
          showCounter={state.hasStartedRound && state.isScrolling}
          collectionIndex={collectionIndex}
        />
      </div>
    </>
  )
}
