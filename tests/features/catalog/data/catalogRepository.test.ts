import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getEntryByNumber,
  loadManifest,
  resetCatalogRepositoryCache,
} from '../../../../src/features/catalog/data'

const createResponse = (payload: unknown, ok = true): Response =>
  ({
    ok,
    json: async () => payload,
  }) as Response

describe('catalogRepository', () => {
  beforeEach(() => {
    resetCatalogRepositoryCache()
    vi.restoreAllMocks()
  })

  it('loads manifest and normalizes entries', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      createResponse({
        total: 10,
        byNumber: {
          3: {
            path: '/collections/cat/#3-meow.gif',
            rarity: 'epic',
          },
        },
      }),
    )

    const manifest = await loadManifest()

    expect(manifest.total).toBe(10)
    expect(manifest.byNumber[3]).toMatchObject({
      number: 3,
      path: '/collections/cat/#3-meow.gif',
      rarity: 'epic',
    })
  })

  it('falls back to index when manifest is unavailable', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    fetchMock
      .mockResolvedValueOnce(createResponse({}, false))
      .mockResolvedValueOnce(
        createResponse({
          total: 2,
          paths: ['/collections/test/#1-alpha.gif', '/collections/test/#2-beta.gif'],
        }),
      )

    const entry = await getEntryByNumber(2)

    expect(entry).toMatchObject({
      number: 2,
      path: '/collections/test/#2-beta.gif',
      rarity: 'common',
    })
  })

  it('returns null for invalid number', async () => {
    const entry = await getEntryByNumber(-1)
    expect(entry).toBeNull()
  })
})
