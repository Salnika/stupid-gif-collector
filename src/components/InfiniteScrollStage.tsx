import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { InfiniteLoader } from './InfiniteLoader'
import { PortalGlyphColumns } from './PortalGlyphColumns'
import {
  useLenisInfiniteScroll,
  type InfiniteScrollUpdate,
} from '../hooks/useLenisInfiniteScroll'
import { useLoaderRotation } from '../hooks/useLoaderRotation'
import { useCoverAnchorPosition } from '../hooks/useCoverAnchorPosition'
import { encodeAssetPath, parseGifMeta, toBaseAssetPath } from '../lib/gifMeta'
import {
  DEFAULT_GIF_RARITY,
  isGifRarity,
  toGifRarityLabel,
  type GifRarity,
} from '../lib/rarity'
import { useUnlockedGifsStore } from '../store/unlockedGifsStore'

type ManifestEntry = {
  number: number
  path: string
  name: string
  collection: string
  rarity: GifRarity
}

type RewardResult = {
  entry: ManifestEntry
  count: number
  isNew: boolean
}

const BACKGROUND_SIZE = { width: 1920, height: 1229 }
const LOADER_ANCHOR = { x: 1125, y: 425 }
const DEFAULT_TOTAL_GIFS = 27901
const MAX_ATTEMPTS = 3
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

const toManifestEntryFromPath = (gifNumber: number, path: string): ManifestEntry => {
  const meta = parseGifMeta(path, gifNumber)
  return {
    number: meta.number,
    path,
    name: meta.name,
    collection: meta.collection,
    rarity: DEFAULT_GIF_RARITY,
  }
}

const normalizeManifestEntry = (
  fallbackNumber: number,
  rawValue: unknown,
): ManifestEntry | null => {
  if (!rawValue || typeof rawValue !== 'object') {
    return null
  }

  const value = rawValue as {
    number?: unknown
    path?: unknown
    name?: unknown
    collection?: unknown
    rarity?: unknown
  }

  if (typeof value.path !== 'string' || value.path.length === 0) {
    return null
  }

  const entryNumber =
    typeof value.number === 'number' && Number.isFinite(value.number) && value.number > 0
      ? value.number
      : fallbackNumber

  const parsedMeta = parseGifMeta(value.path, entryNumber)
  const entryName =
    typeof value.name === 'string' && value.name.trim().length > 0 ? value.name : parsedMeta.name
  const entryCollection =
    typeof value.collection === 'string' && value.collection.trim().length > 0
      ? value.collection
      : parsedMeta.collection
  const entryRarity = isGifRarity(value.rarity) ? value.rarity : DEFAULT_GIF_RARITY

  return {
    number: entryNumber,
    path: value.path,
    name: entryName,
    collection: entryCollection,
    rarity: entryRarity,
  }
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
  const pathsRef = useRef<string[]>([])
  const manifestByNumberRef = useRef<Record<number, ManifestEntry>>({})
  const totalGifsRef = useRef(DEFAULT_TOTAL_GIFS)
  const isScrollingRef = useRef(false)
  const hasStartedRoundRef = useRef(false)
  const attemptRef = useRef(1)
  const candidateRef = useRef<ManifestEntry | null>(null)
  const popupOpenRef = useRef(false)

  const [collectionIndex, setCollectionIndex] = useState(1)
  const [hasStartedRound, setHasStartedRound] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const [attempt, setAttempt] = useState(1)
  const [currentCandidate, setCurrentCandidate] = useState<ManifestEntry | null>(null)
  const [showRewardPopup, setShowRewardPopup] = useState(false)
  const [rewardResult, setRewardResult] = useState<RewardResult | null>(null)

  const registerCaughtGif = useUnlockedGifsStore((state) => state.registerCaughtGif)
  const unlockedByNumber = useUnlockedGifsStore((state) => state.unlockedByNumber)

  const { handleLoaderUpdate } = useLoaderRotation(loaderRef, { effectsRef })

  const setAttemptValue = useCallback((nextAttempt: number) => {
    attemptRef.current = nextAttempt
    setAttempt(nextAttempt)
  }, [])

  const setCandidateValue = useCallback((entry: ManifestEntry | null) => {
    candidateRef.current = entry
    setCurrentCandidate(entry)
  }, [])

  const getEntryByNumber = useCallback((gifNumber: number): ManifestEntry | null => {
    const fromManifest = manifestByNumberRef.current[gifNumber]
    if (fromManifest) {
      return fromManifest
    }

    const fromPath = pathsRef.current[gifNumber - 1]
    if (typeof fromPath === 'string' && fromPath.length > 0) {
      return toManifestEntryFromPath(gifNumber, fromPath)
    }

    return null
  }, [])

  const validateEntry = useCallback(
    (entry: ManifestEntry) => {
      const result = registerCaughtGif({
        number: entry.number,
        name: entry.name,
        collection: entry.collection,
        path: entry.path,
      })

      popupOpenRef.current = true
      setShowRewardPopup(true)
      setRewardResult({
        entry,
        count: result.count,
        isNew: result.isNew,
      })
    },
    [registerCaughtGif],
  )

  const revealCurrentEntry = useCallback(() => {
    const entry = getEntryByNumber(indexRef.current)
    if (!entry) {
      return
    }

    setCandidateValue(entry)
    if (attemptRef.current >= MAX_ATTEMPTS) {
      validateEntry(entry)
    }
  }, [getEntryByNumber, setCandidateValue, validateEntry])

  const resetRound = useCallback(() => {
    if (stopTimerRef.current !== null) {
      window.clearTimeout(stopTimerRef.current)
      stopTimerRef.current = null
    }

    popupOpenRef.current = false
    isScrollingRef.current = false
    hasStartedRoundRef.current = false
    scrollDistanceRef.current = 0
    setAttemptValue(1)
    setCandidateValue(null)
    setHasStartedRound(false)
    setIsScrolling(false)
    setShowRewardPopup(false)
    setRewardResult(null)
  }, [setAttemptValue, setCandidateValue])

  useEffect(() => {
    let cancelled = false

    const loadManifest = async () => {
      try {
        const manifestResponse = await fetch(toBaseAssetPath('/collections-manifest.json'), {
          cache: 'no-store',
        })
        if (manifestResponse.ok) {
          const payload = (await manifestResponse.json()) as {
            total?: unknown
            byNumber?: unknown
            paths?: unknown
          }

          if (!cancelled) {
            if (typeof payload.total === 'number' && payload.total > 0) {
              totalGifsRef.current = payload.total
            }

            if (Array.isArray(payload.paths)) {
              pathsRef.current = payload.paths.filter(
                (item): item is string => typeof item === 'string' && item.length > 0,
              )
            }

            if (payload.byNumber && typeof payload.byNumber === 'object') {
              const manifestEntries: Record<number, ManifestEntry> = {}
              for (const [rawKey, rawValue] of Object.entries(payload.byNumber)) {
                const keyNumber = Number.parseInt(rawKey, 10)
                if (!Number.isFinite(keyNumber) || keyNumber < 1) {
                  continue
                }

                const normalized = normalizeManifestEntry(keyNumber, rawValue)
                if (!normalized) {
                  continue
                }

                manifestEntries[normalized.number] = normalized
              }

              if (Object.keys(manifestEntries).length > 0) {
                manifestByNumberRef.current = manifestEntries
                totalGifsRef.current = Math.max(
                  totalGifsRef.current,
                  Object.keys(manifestEntries).length,
                )
              }
            }
          }
        }

        if (
          !cancelled &&
          pathsRef.current.length === 0 &&
          Object.keys(manifestByNumberRef.current).length === 0
        ) {
          const indexResponse = await fetch(toBaseAssetPath('/collections-index.json'), {
            cache: 'no-store',
          })
          if (indexResponse.ok) {
            const indexPayload = (await indexResponse.json()) as {
              total?: unknown
              paths?: unknown
            }

            if (typeof indexPayload.total === 'number' && indexPayload.total > 0) {
              totalGifsRef.current = indexPayload.total
            }

            if (Array.isArray(indexPayload.paths)) {
              pathsRef.current = indexPayload.paths.filter(
                (item): item is string => typeof item === 'string' && item.length > 0,
              )
            }
          }
        }
      } catch {
        // Keep running without data if fetch fails.
      }
    }

    void loadManifest()

    return () => {
      cancelled = true
      if (stopTimerRef.current !== null) {
        window.clearTimeout(stopTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || event.repeat) {
        return
      }

      if (popupOpenRef.current || isScrollingRef.current || attemptRef.current >= MAX_ATTEMPTS) {
        return
      }

      const candidate = candidateRef.current
      if (!candidate) {
        return
      }

      event.preventDefault()
      validateEntry(candidate)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [validateEntry])

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

      const startingNewScrollSession = !isScrollingRef.current
      if (startingNewScrollSession) {
        if (!hasStartedRoundRef.current) {
          hasStartedRoundRef.current = true
          setHasStartedRound(true)
        } else if (candidateRef.current && attemptRef.current < MAX_ATTEMPTS) {
          setCandidateValue(null)
          setAttemptValue(attemptRef.current + 1)
        }
      }

      isScrollingRef.current = true
      setIsScrolling(true)

      if (stopTimerRef.current !== null) {
        window.clearTimeout(stopTimerRef.current)
      }

      stopTimerRef.current = window.setTimeout(() => {
        if (popupOpenRef.current) {
          return
        }

        isScrollingRef.current = false
        setIsScrolling(false)
        revealCurrentEntry()
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
    [handleLoaderUpdate, revealCurrentEntry, setAttemptValue, setCandidateValue],
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

  const currentCandidateCount = currentCandidate
    ? unlockedByNumber[currentCandidate.number]?.count ?? 0
    : 0
  const isCurrentCandidateNew = currentCandidate
    ? !unlockedByNumber[currentCandidate.number]
    : false

  const attemptLabel = hasStartedRound ? `Attempt ${attempt}/${MAX_ATTEMPTS}` : 'Attempt 1/3'

  const hintText = useMemo(() => {
    if (showRewardPopup) {
      return 'Choose your next move.'
    }

    if (!hasStartedRound) {
      return 'Scroll to start attempt 1 of 3.'
    }

    if (isScrolling) {
      return `Rolling attempt ${attempt}/${MAX_ATTEMPTS}...`
    }

    if (currentCandidate) {
      if (attempt < MAX_ATTEMPTS) {
        return `Click Keep or press Enter, then scroll to keep searching.`
      }

      return 'Final attempt locked in.'
    }

    return 'Scroll to reveal a GIF.'
  }, [attempt, currentCandidate, hasStartedRound, isScrolling, showRewardPopup])

  return (
    <>
      <section className="scroll-stage" ref={wrapperRef}>
        <div className="scroll-stage__content" ref={contentRef} aria-hidden="true">
          <div className="scroll-stage__spacer" />
        </div>
      </section>

      <div className="scroll-stage__overlay" ref={effectsRef}>
        <PortalGlyphColumns />
        <p className="scroll-stage__attempt">{attemptLabel}</p>

        {!showRewardPopup && !isScrolling && currentCandidate ? (
          <figure
            className={`scroll-stage__selected-card scroll-stage__selected-card--rarity-${currentCandidate.rarity}`}
          >
            {isCurrentCandidateNew ? (
              <p className="scroll-stage__new-flag scroll-stage__new-flag--hero">New!</p>
            ) : null}
            {currentCandidateCount >= 2 ? (
              <span className="scroll-stage__count-badge">x{currentCandidateCount}</span>
            ) : null}
            <img
              src={encodeAssetPath(currentCandidate.path)}
              alt={`GIF #${currentCandidate.number}`}
            />
            <figcaption className="scroll-stage__card-meta">
              <p className="scroll-stage__card-number">#{currentCandidate.number}</p>
              <p className="scroll-stage__card-name">{currentCandidate.name}</p>
              <p className="scroll-stage__card-collection">
                Collection: {currentCandidate.collection}
              </p>
              <p className="scroll-stage__card-rarity">
                Rarity:{' '}
                <span
                  className={`scroll-stage__card-rarity-value scroll-stage__card-rarity-value--${currentCandidate.rarity}`}
                >
                  {toGifRarityLabel(currentCandidate.rarity)}
                </span>
              </p>
            </figcaption>
          </figure>
        ) : null}

        {!showRewardPopup && !isScrolling && currentCandidate && attempt < MAX_ATTEMPTS ? (
          <div className="scroll-stage__candidate-actions">
            <button
              type="button"
              className="scroll-stage__popup-btn scroll-stage__popup-btn--primary"
              onClick={() => validateEntry(currentCandidate)}
            >
              Keep
            </button>
            <p className="scroll-stage__candidate-help">Scroll to keep searching</p>
          </div>
        ) : null}

        {hasStartedRound && isScrolling ? (
          <p className="scroll-stage__counter">#{collectionIndex}</p>
        ) : null}

        {showRewardPopup && rewardResult ? (
          <div className="scroll-stage__popup" role="dialog" aria-modal="true">
            {rewardResult.isNew ? (
              <p className="scroll-stage__new-flag scroll-stage__new-flag--popup">New!</p>
            ) : null}
            <figure
              className={`scroll-stage__selected-card scroll-stage__selected-card--popup scroll-stage__selected-card--rarity-${rewardResult.entry.rarity}`}
            >
              {rewardResult.count >= 2 ? (
                <span className="scroll-stage__count-badge">x{rewardResult.count}</span>
              ) : null}
              <img
                src={encodeAssetPath(rewardResult.entry.path)}
                alt={`GIF #${rewardResult.entry.number}`}
              />
              <figcaption className="scroll-stage__card-meta">
                <p className="scroll-stage__card-number">#{rewardResult.entry.number}</p>
                <p className="scroll-stage__card-name">{rewardResult.entry.name}</p>
                <p className="scroll-stage__card-collection">
                  Collection: {rewardResult.entry.collection}
                </p>
                <p className="scroll-stage__card-rarity">
                  Rarity:{' '}
                  <span
                    className={`scroll-stage__card-rarity-value scroll-stage__card-rarity-value--${rewardResult.entry.rarity}`}
                  >
                    {toGifRarityLabel(rewardResult.entry.rarity)}
                  </span>
                </p>
              </figcaption>
            </figure>
            <div className="scroll-stage__popup-actions">
              <button
                type="button"
                className="scroll-stage__popup-btn"
                onClick={() => navigate('/my-collection')}
              >
                My collection
              </button>
              <button
                type="button"
                className="scroll-stage__popup-btn scroll-stage__popup-btn--primary"
                onClick={resetRound}
              >
                Keep finding!
              </button>
            </div>
          </div>
        ) : null}

        <div
          className="scroll-stage__loader-anchor"
          style={{
            left: `${loaderPosition.x}px`,
            top: `${loaderPosition.y}px`,
          }}
        >
          <InfiniteLoader ref={loaderRef} />
        </div>
        <p className="scroll-stage__hint">{hintText}</p>
      </div>
    </>
  )
}
