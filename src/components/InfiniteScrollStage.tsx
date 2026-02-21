import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { InfiniteLoader } from './InfiniteLoader'
import { PortalGlyphColumns } from './PortalGlyphColumns'
import {
  useLenisInfiniteScroll,
  type InfiniteScrollUpdate,
} from '../hooks/useLenisInfiniteScroll'
import { useLoaderRotation } from '../hooks/useLoaderRotation'
import { useCoverAnchorPosition } from '../hooks/useCoverAnchorPosition'

const BACKGROUND_SIZE = { width: 1920, height: 1229 }
const LOADER_ANCHOR = { x: 1125, y: 425 }
const TOTAL_GIFS = 27901
const PIXELS_PER_RANDOM_STEP = 160
const SCROLL_IDLE_TIMEOUT_MS = 180
const ACTIVE_DELTA_THRESHOLD = 0.1
const ACTIVE_VELOCITY_THRESHOLD = 0.03

type SelectedGifMeta = {
  number: number
  name: string
  collection: string
}

const encodeAssetPath = (assetPath: string): string =>
  assetPath
    .split('/')
    .map((segment) => {
      try {
        return encodeURIComponent(decodeURIComponent(segment))
      } catch {
        return encodeURIComponent(segment)
      }
    })
    .join('/')

const safeDecodeURIComponent = (value: string): string => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

const parseSelectedGifMeta = (assetPath: string, fallbackNumber: number): SelectedGifMeta => {
  const cleanPath = assetPath.split('?')[0].split('#')[0]
  const segments = cleanPath
    .split('/')
    .filter((segment) => segment.length > 0)
    .map(safeDecodeURIComponent)

  const fileName = segments[segments.length - 1] ?? ''
  const collectionFolder = segments[segments.length - 2] ?? 'unknown'
  const fileBase = fileName.replace(/\.[^.]+$/, '')
  const match = fileBase.match(/^(?:#)?(\d+)-(.*)$/i)

  const number = match ? Number.parseInt(match[1], 10) : fallbackNumber
  const rawName = match ? match[2] : fileBase

  return {
    number: Number.isFinite(number) && number > 0 ? number : fallbackNumber,
    name: rawName.replace(/[_-]+/g, ' ').trim(),
    collection: collectionFolder.replace(/[_-]+/g, ' ').trim(),
  }
}

const pickRandomIndex = (current: number): number => {
  if (TOTAL_GIFS <= 1) {
    return 1
  }

  let next = current
  while (next === current) {
    next = Math.floor(Math.random() * TOTAL_GIFS) + 1
  }

  return next
}

export function InfiniteScrollStage() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const loaderRef = useRef<HTMLDivElement>(null)
  const effectsRef = useRef<HTMLDivElement>(null)
  const indexRef = useRef(1)
  const startedRef = useRef(false)
  const scrollDistanceRef = useRef(0)
  const stopTimerRef = useRef<number | null>(null)
  const gifPathsRef = useRef<string[]>([])
  const isScrollingRef = useRef(false)
  const [collectionIndex, setCollectionIndex] = useState(1)
  const [hasStartedScroll, setHasStartedScroll] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const [selectedGifPath, setSelectedGifPath] = useState<string | null>(null)

  const { handleLoaderUpdate } = useLoaderRotation(loaderRef, { effectsRef })

  useEffect(() => {
    let cancelled = false

    const loadGifIndex = async () => {
      try {
        const response = await fetch('/collections-index.json', { cache: 'no-store' })
        if (!response.ok) {
          return
        }

        const payload = (await response.json()) as { paths?: unknown }
        if (cancelled || !Array.isArray(payload.paths)) {
          return
        }

        const paths = payload.paths.filter((value): value is string => typeof value === 'string')
        gifPathsRef.current = paths

        if (!isScrollingRef.current && startedRef.current) {
          setSelectedGifPath(paths[indexRef.current - 1] ?? null)
        }
      } catch {
        // Keep running without preview if the index is unavailable.
      }
    }

    void loadGifIndex()

    return () => {
      cancelled = true
      if (stopTimerRef.current !== null) {
        window.clearTimeout(stopTimerRef.current)
      }
    }
  }, [])

  const onUpdate = useCallback(
    (update: InfiniteScrollUpdate) => {
      handleLoaderUpdate(update)

      const deltaAbs = Math.abs(update.deltaPixels)
      const velocityAbs = Math.abs(update.velocity)
      const isActiveScroll =
        deltaAbs > ACTIVE_DELTA_THRESHOLD || velocityAbs > ACTIVE_VELOCITY_THRESHOLD

      if (!isActiveScroll) {
        return
      }

      isScrollingRef.current = true
      setIsScrolling(true)
      if (stopTimerRef.current !== null) {
        window.clearTimeout(stopTimerRef.current)
      }
      stopTimerRef.current = window.setTimeout(() => {
        isScrollingRef.current = false
        setIsScrolling(false)
        setSelectedGifPath(gifPathsRef.current[indexRef.current - 1] ?? null)
      }, SCROLL_IDLE_TIMEOUT_MS)

      if (!startedRef.current) {
        startedRef.current = true
        setHasStartedScroll(true)

        const firstRandom = pickRandomIndex(indexRef.current)
        indexRef.current = firstRandom
        setCollectionIndex(firstRandom)
      }

      scrollDistanceRef.current += deltaAbs
      const randomSteps = Math.floor(scrollDistanceRef.current / PIXELS_PER_RANDOM_STEP)
      if (randomSteps <= 0) {
        return
      }

      scrollDistanceRef.current -= randomSteps * PIXELS_PER_RANDOM_STEP

      let nextIndex = indexRef.current
      for (let step = 0; step < randomSteps; step += 1) {
        nextIndex = pickRandomIndex(nextIndex)
      }

      if (nextIndex !== indexRef.current) {
        indexRef.current = nextIndex
        setCollectionIndex(nextIndex)
      }
    },
    [handleLoaderUpdate],
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

  const selectedGifMeta = useMemo<SelectedGifMeta | null>(() => {
    if (!selectedGifPath) {
      return null
    }

    return parseSelectedGifMeta(selectedGifPath, collectionIndex)
  }, [collectionIndex, selectedGifPath])

  return (
    <>
      <section className="scroll-stage" ref={wrapperRef}>
        <div className="scroll-stage__content" ref={contentRef} aria-hidden="true">
          <div className="scroll-stage__spacer" />
        </div>
      </section>

      <div className="scroll-stage__overlay" aria-hidden="true" ref={effectsRef}>
        <PortalGlyphColumns />
        {!isScrolling && hasStartedScroll && selectedGifPath && selectedGifMeta ? (
          <figure className="scroll-stage__selected-card">
            <img src={encodeAssetPath(selectedGifPath)} alt={`GIF #${selectedGifMeta.number}`} />
            <figcaption className="scroll-stage__card-meta">
              <p className="scroll-stage__card-number">#{selectedGifMeta.number}</p>
              <p className="scroll-stage__card-name">{selectedGifMeta.name}</p>
              <p className="scroll-stage__card-collection">
                Collection: {selectedGifMeta.collection}
              </p>
            </figcaption>
          </figure>
        ) : null}
        {hasStartedScroll && isScrolling ? (
          <p className="scroll-stage__counter">#{collectionIndex}</p>
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
        <p className="scroll-stage__hint">Scroll to rotate</p>
      </div>
    </>
  )
}
