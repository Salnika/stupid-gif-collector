import { useEffect, type RefObject } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'

export type InfiniteScrollUpdate = {
  turns: number
  direction: -1 | 0 | 1
  velocity: number
  deltaPixels: number
}

type UseLenisInfiniteScrollParams = {
  wrapperRef: RefObject<HTMLElement | null>
  contentRef: RefObject<HTMLElement | null>
  onUpdate: (update: InfiniteScrollUpdate) => void
  pixelsPerTurn?: number
}

const DEFAULT_PIXELS_PER_TURN = 240

const getWrappedDelta = (current: number, previous: number, limit: number): number => {
  if (!Number.isFinite(limit) || limit <= 0) {
    return current - previous
  }

  let delta = current - previous
  const halfLimit = limit / 2

  if (delta > halfLimit) {
    delta -= limit
  } else if (delta < -halfLimit) {
    delta += limit
  }

  return delta
}

export function useLenisInfiniteScroll({
  wrapperRef,
  contentRef,
  onUpdate,
  pixelsPerTurn = DEFAULT_PIXELS_PER_TURN,
}: UseLenisInfiniteScrollParams) {
  useEffect(() => {
    const wrapper = wrapperRef.current
    const content = contentRef.current

    if (!wrapper || !content) {
      return
    }

    const lenis = new Lenis({
      wrapper,
      content,
      eventsTarget: wrapper,
      infinite: true,
      smoothWheel: true,
      syncTouch: true,
      wheelMultiplier: 1.35,
      touchMultiplier: 1.2,
      overscroll: false,
      autoRaf: false,
      lerp: 0.12,
    })

    let turns = 0
    let previousScroll = lenis.scroll

    const handleScroll = (instance: Lenis) => {
      const delta = getWrappedDelta(instance.scroll, previousScroll, instance.limit)
      previousScroll = instance.scroll

      if (delta !== 0) {
        turns += delta / pixelsPerTurn
      }

      onUpdate({
        turns,
        direction: instance.direction,
        velocity: instance.velocity,
        deltaPixels: delta,
      })
    }

    lenis.on('scroll', handleScroll)

    const tick = (time: number) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.off('scroll', handleScroll)
      lenis.destroy()
    }
  }, [contentRef, onUpdate, pixelsPerTurn, wrapperRef])
}
