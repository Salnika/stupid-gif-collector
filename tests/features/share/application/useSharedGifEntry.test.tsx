import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSharedGifEntry } from '../../../../src/features/share/application/useSharedGifEntry'

const { getEntryByNumberMock } = vi.hoisted(() => ({
  getEntryByNumberMock: vi.fn(),
}))

vi.mock('../../../../src/features/catalog/data', () => ({
  getEntryByNumber: getEntryByNumberMock,
}))

describe('useSharedGifEntry', () => {
  beforeEach(() => {
    getEntryByNumberMock.mockReset()
  })

  it('returns not-found state for invalid params', async () => {
    const { result } = renderHook(() => useSharedGifEntry('bad'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.entry).toBeNull()
    expect(getEntryByNumberMock).not.toHaveBeenCalled()
  })

  it('loads entry for valid gif number', async () => {
    getEntryByNumberMock.mockResolvedValue({
      number: 9,
      path: '/collections/test/#9-nine.gif',
      name: 'Nine',
      collection: 'test',
      rarity: 'epic',
    })

    const { result } = renderHook(() => useSharedGifEntry('9'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.entry?.number).toBe(9)
    expect(getEntryByNumberMock).toHaveBeenCalledWith(9)
  })
})
