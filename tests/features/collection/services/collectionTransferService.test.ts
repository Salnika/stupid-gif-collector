import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  exportCollectionToStego,
  importCollectionFromStego,
} from '../../../../src/features/collection/services/collectionTransferService'
import { createCollectionBackup, serializeCollectionBackup } from '../../../../src/lib/collectionBackup'
import { hidePayloadInGif } from '../../../../src/lib/gifStego'

const { downloadBlobMock } = vi.hoisted(() => ({
  downloadBlobMock: vi.fn(),
}))

vi.mock('../../../../src/shared/lib/browser', async () => {
  const actual = await vi.importActual('../../../../src/shared/lib/browser')
  return {
    ...actual,
    downloadBlob: downloadBlobMock,
  }
})

const minimalGifBytes = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x00])

const createArrayBufferResponse = (bytes: Uint8Array): Response =>
  ({
    ok: true,
    arrayBuffer: async () => bytes.buffer,
  }) as Response

describe('collectionTransferService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    downloadBlobMock.mockReset()
  })

  it('rejects export when no unlocked gif exists', async () => {
    await expect(
      exportCollectionToStego({ unlockedByNumber: {}, favoriteByNumber: {} }),
    ).rejects.toThrow('Nothing to export yet')
  })

  it('exports collection into stego gif and triggers download', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(createArrayBufferResponse(minimalGifBytes))

    const result = await exportCollectionToStego({
      unlockedByNumber: {
        7: {
          number: 7,
          name: 'Lucky',
          collection: 'test',
          rarity: 'epic',
          path: '/collections/test/#7-lucky.gif',
          unlockedAt: Date.now(),
          count: 2,
        },
      },
      favoriteByNumber: { 7: true },
    })

    expect(result.count).toBe(1)
    expect(result.fileName).toContain('stupid-vite-collect-backup-')
    expect(downloadBlobMock).toHaveBeenCalledTimes(1)
  })

  it('imports a valid stego backup file', async () => {
    const backup = createCollectionBackup({
      unlockedByNumber: {
        1: {
          number: 1,
          name: 'First',
          collection: 'alpha',
          rarity: 'rare',
          path: '/collections/a/#1-first.gif',
          unlockedAt: 123,
          count: 2,
        },
      },
      favoriteByNumber: { 1: true },
    })

    const payload = new TextEncoder().encode(serializeCollectionBackup(backup))
    const stego = hidePayloadInGif(minimalGifBytes, payload)
    const file = new File([stego], 'backup.gif', { type: 'image/gif' })

    const entries = await importCollectionFromStego(file)

    expect(entries).toHaveLength(1)
    expect(entries[0]).toMatchObject({
      number: 1,
      favorite: true,
      count: 2,
    })
  })
})
