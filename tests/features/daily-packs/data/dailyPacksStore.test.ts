import { beforeEach, describe, expect, it } from 'vitest'
import type { GifCatalogEntry } from '../../../../src/features/catalog/domain'
import { useDailyPacksStore } from '../../../../src/features/daily-packs/data/dailyPacksStore'

const createCatalog = (size: number): GifCatalogEntry[] =>
  Array.from({ length: size }, (_, index) => ({
    number: index + 1,
    path: `/collections/test/#${index + 1}-gif-${index + 1}.gif`,
    name: `GIF ${index + 1}`,
    collection: 'test',
    rarity: 'common',
  }))

describe('dailyPacksStore', () => {
  beforeEach(async () => {
    localStorage.clear()
    useDailyPacksStore.getState().resetForTests()
    await useDailyPacksStore.persist.clearStorage()
  })

  it('reuses the same session during the same day and regenerates on the next day', () => {
    const catalog = createCatalog(60)
    const morning = new Date(2026, 2, 23, 8, 0, 0)

    const firstSession = useDailyPacksStore.getState().ensureTodaySession(catalog, morning)
    useDailyPacksStore.getState().selectPack(4)

    const sameDaySession = useDailyPacksStore
      .getState()
      .ensureTodaySession(catalog, new Date(2026, 2, 23, 20, 30, 0))

    expect(sameDaySession?.generatedAt).toBe(firstSession?.generatedAt)
    expect(useDailyPacksStore.getState().session?.selectedPackId).toBe(4)

    const nextDaySession = useDailyPacksStore
      .getState()
      .ensureTodaySession(catalog, new Date(2026, 2, 24, 0, 1, 0))

    expect(nextDaySession?.dayKey).toBe('2026-03-24')
    expect(nextDaySession?.generatedAt).not.toBe(firstSession?.generatedAt)
    expect(nextDaySession?.selectedPackId).toBe(1)
  })

  it('opens a pack only once and restores persisted state after rehydration', async () => {
    const catalog = createCatalog(60)
    const state = useDailyPacksStore.getState()
    const session = state.ensureTodaySession(catalog, new Date(2026, 2, 23, 9, 0, 0))

    expect(session).not.toBeNull()

    const firstPack = useDailyPacksStore.getState().session?.packs[0]
    expect(firstPack).toBeDefined()

    const revealResults =
      firstPack?.gifNumbers.map((number, index) => ({
        number,
        count: index + 1,
        isNew: index % 2 === 0,
      })) ?? []

    useDailyPacksStore.getState().openPack(1, revealResults)

    expect(useDailyPacksStore.getState().session?.packs[0]).toMatchObject({
      status: 'opened',
      revealResults,
    })
    expect(useDailyPacksStore.getState().getRemainingPacks()).toBe(9)

    const persistedSnapshot = localStorage.getItem('stupid-vite-collect-daily-packs')
    useDailyPacksStore.setState({ hasHydrated: false, session: null })
    if (persistedSnapshot) {
      localStorage.setItem('stupid-vite-collect-daily-packs', persistedSnapshot)
    }
    await useDailyPacksStore.persist.rehydrate()

    expect(useDailyPacksStore.getState().hasHydrated).toBe(true)
    expect(useDailyPacksStore.getState().session?.packs[0]).toMatchObject({
      status: 'opened',
      revealResults,
    })

    useDailyPacksStore.getState().openPack(
      1,
      revealResults.map((reveal) => ({
        ...reveal,
        count: reveal.count + 10,
      })),
    )

    expect(useDailyPacksStore.getState().session?.packs[0].revealResults).toEqual(revealResults)
  })
})
