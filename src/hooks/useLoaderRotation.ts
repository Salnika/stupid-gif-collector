import { useCallback, useEffect, useRef, type RefObject } from 'react'
import { gsap } from 'gsap'
import type { InfiniteScrollUpdate } from './useLenisInfiniteScroll'

type UseLoaderRotationResult = {
  handleLoaderUpdate: (update: InfiniteScrollUpdate) => void
}

type UseLoaderRotationOptions = {
  effectsRef?: RefObject<HTMLElement | null>
}

const IDLE_SPEED_DEG_PER_SEC = 8
const MAX_SCROLL_BOOST_DEG_PER_SEC = 680
const ACCELERATION_DEG_PER_SEC2 = 1100
const DECELERATION_DEG_PER_SEC2 = 700
const REVERSE_BRAKE_DEG_PER_SEC2 = 1400
const REVERSE_STOP_THRESHOLD = 4
const INACTIVE_TO_IDLE_DELAY_MS = 90

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

const approach = (value: number, target: number, delta: number): number => {
  if (value < target) {
    return Math.min(value + delta, target)
  }

  return Math.max(value - delta, target)
}

const getDirection = (deltaPixels: number, fallback: -1 | 0 | 1): -1 | 0 | 1 => {
  const fromDelta = Math.sign(deltaPixels)

  if (fromDelta !== 0) {
    return fromDelta as -1 | 1
  }

  return fallback
}

export function useLoaderRotation(
  loaderRef: RefObject<HTMLElement | null>,
  { effectsRef }: UseLoaderRotationOptions = {},
): UseLoaderRotationResult {
  const currentSpeedRef = useRef(IDLE_SPEED_DEG_PER_SEC)
  const targetSpeedRef = useRef(IDLE_SPEED_DEG_PER_SEC)
  const pendingDirectionRef = useRef<-1 | 1 | null>(null)
  const pendingBoostRef = useRef(0)
  const lastDirectionRef = useRef<-1 | 1>(1)
  const rotationRef = useRef(0)
  const lastInputTimeRef = useRef(0)
  const lastTickTimeRef = useRef<number | null>(null)
  const glowToRef = useRef<((value: number) => gsap.core.Tween) | null>(null)
  const glyphVisibilityToRef = useRef<((value: number) => gsap.core.Tween) | null>(null)
  const glyphShiftRef = useRef(0)

  useEffect(() => {
    const loader = loaderRef.current
    const effectsLayer = effectsRef?.current
    if (!loader) {
      return
    }

    glowToRef.current = gsap.quickTo(loader, '--portal-speed-glow', {
      duration: 0.2,
      ease: 'power2.out',
    })

    gsap.set(loader, {
      rotation: rotationRef.current,
      '--portal-speed-glow': 0,
    })

    if (effectsLayer) {
      glyphVisibilityToRef.current = gsap.quickTo(effectsLayer, '--glyph-visibility', {
        duration: 0.1,
        ease: 'power1.out',
      })

      gsap.set(effectsLayer, {
        '--glyph-visibility': 0,
        '--glyph-shift': 0,
      })
    }

    const tick = (time: number) => {
      if (lastTickTimeRef.current === null) {
        lastTickTimeRef.current = time
        return
      }

      const dt = Math.min(time - lastTickTimeRef.current, 0.05)
      lastTickTimeRef.current = time

      const nowMs = time * 1000
      if (
        pendingDirectionRef.current === null &&
        nowMs - lastInputTimeRef.current > INACTIVE_TO_IDLE_DELAY_MS
      ) {
        targetSpeedRef.current = lastDirectionRef.current * IDLE_SPEED_DEG_PER_SEC
      }

      let targetSpeed = targetSpeedRef.current
      let acceleration =
        Math.abs(targetSpeed) > Math.abs(currentSpeedRef.current)
          ? ACCELERATION_DEG_PER_SEC2
          : DECELERATION_DEG_PER_SEC2

      if (pendingDirectionRef.current !== null) {
        targetSpeed = 0
        acceleration = REVERSE_BRAKE_DEG_PER_SEC2

        if (Math.abs(currentSpeedRef.current) <= REVERSE_STOP_THRESHOLD) {
          const reversedDirection = pendingDirectionRef.current
          pendingDirectionRef.current = null
          lastDirectionRef.current = reversedDirection
          targetSpeedRef.current =
            reversedDirection * (IDLE_SPEED_DEG_PER_SEC + pendingBoostRef.current)
          targetSpeed = targetSpeedRef.current
          acceleration = ACCELERATION_DEG_PER_SEC2
        }
      }

      const nextSpeed = approach(currentSpeedRef.current, targetSpeed, acceleration * dt)
      currentSpeedRef.current = nextSpeed

      rotationRef.current += nextSpeed * dt
      gsap.set(loader, { rotation: rotationRef.current })

      const glowIntensity = clamp(
        (Math.abs(nextSpeed) - IDLE_SPEED_DEG_PER_SEC) / MAX_SCROLL_BOOST_DEG_PER_SEC,
        0,
        1,
      )
      glowToRef.current?.(glowIntensity)

      const speedForGlyphs = Math.abs(nextSpeed)
      const glyphVisibility = clamp((speedForGlyphs - 210) / 320, 0, 1)
      glyphVisibilityToRef.current?.(glyphVisibility)
      const glyphStepPerSecond = 1.4 + glyphVisibility * 30
      glyphShiftRef.current = (glyphShiftRef.current + glyphStepPerSecond * dt) % 50
      if (effectsLayer) {
        effectsLayer.style.setProperty('--glyph-shift', glyphShiftRef.current.toFixed(3))
      }
    }

    gsap.ticker.add(tick)

    return () => {
      gsap.ticker.remove(tick)
      glowToRef.current = null
      glyphVisibilityToRef.current = null
      lastTickTimeRef.current = null
    }
  }, [effectsRef, loaderRef])

  const handleLoaderUpdate = useCallback((update: InfiniteScrollUpdate) => {
    const direction = getDirection(update.deltaPixels, update.direction)

    if (direction !== 0) {
      lastInputTimeRef.current = gsap.ticker.time * 1000
    }

    const scrollPower = Math.max(Math.abs(update.deltaPixels), Math.abs(update.velocity) * 20)
    const speedBoost = clamp(scrollPower * 2.35, 0, MAX_SCROLL_BOOST_DEG_PER_SEC)

    if (direction === 0) {
      targetSpeedRef.current = lastDirectionRef.current * IDLE_SPEED_DEG_PER_SEC
      return
    }

    if (
      Math.sign(currentSpeedRef.current) !== direction &&
      Math.abs(currentSpeedRef.current) > IDLE_SPEED_DEG_PER_SEC + 2
    ) {
      pendingDirectionRef.current = direction as -1 | 1
      pendingBoostRef.current = speedBoost
      targetSpeedRef.current = 0
      return
    }

    pendingDirectionRef.current = null
    pendingBoostRef.current = 0
    lastDirectionRef.current = direction as -1 | 1
    targetSpeedRef.current = direction * (IDLE_SPEED_DEG_PER_SEC + speedBoost)
  }, [])

  return { handleLoaderUpdate }
}
