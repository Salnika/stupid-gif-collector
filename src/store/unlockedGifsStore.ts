import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { DEFAULT_GIF_RARITY, isGifRarity, type GifRarity } from '../lib/rarity'

const normalizeGifPath = (value: string): string =>
  value.replace(/\/%23(\d+-)/gi, '/$1').replace(/\/#(\d+-)/g, '/$1')

export type UnlockedGif = {
  number: number
  name: string
  collection: string
  rarity: GifRarity
  path: string
  unlockedAt: number
  count: number
}

type RegisterCaughtGifInput = {
  number: number
  name: string
  collection: string
  rarity: GifRarity
  path: string
}

export type RegisterCaughtGifResult = {
  gif: UnlockedGif
  count: number
  isNew: boolean
}

type UnlockedGifsState = {
  unlockedByNumber: Record<number, UnlockedGif>
  registerCaughtGif: (gif: RegisterCaughtGifInput) => RegisterCaughtGifResult
}

export const useUnlockedGifsStore = create<UnlockedGifsState>()(
  persist(
    (set) => ({
      unlockedByNumber: {},
      registerCaughtGif: (gif) => {
        let result: RegisterCaughtGifResult | null = null

        set((state) => {
          const current = state.unlockedByNumber[gif.number]
          const nextCount = (current?.count ?? 0) + 1
          const nextGif: UnlockedGif = {
            number: gif.number,
            name: gif.name,
            collection: gif.collection,
            rarity: gif.rarity,
            path: normalizeGifPath(gif.path),
            unlockedAt: current?.unlockedAt ?? Date.now(),
            count: nextCount,
          }

          result = {
            gif: nextGif,
            count: nextCount,
            isNew: !current,
          }

          return {
            unlockedByNumber: {
              ...state.unlockedByNumber,
              [gif.number]: nextGif,
            },
          }
        })

        return (
          result ?? {
            gif: {
              number: gif.number,
              name: gif.name,
              collection: gif.collection,
              rarity: gif.rarity,
              path: normalizeGifPath(gif.path),
              unlockedAt: Date.now(),
              count: 1,
            },
            count: 1,
            isNew: true,
          }
        )
      },
    }),
    {
      name: 'stupid-vite-collect-unlocked-gifs',
      storage: createJSONStorage(() => localStorage),
      version: 3,
      migrate: (persistedState) => {
        const state = persistedState as {
          unlockedByNumber?: Record<string, Partial<UnlockedGif>>
        }

        const unlockedByNumber: Record<number, UnlockedGif> = {}
        const source = state.unlockedByNumber ?? {}

        for (const [key, value] of Object.entries(source)) {
          if (!value || typeof value !== 'object') {
            continue
          }

          const numberFromValue =
            typeof value.number === 'number' ? value.number : Number.parseInt(key, 10)
          if (!Number.isFinite(numberFromValue) || numberFromValue < 1) {
            continue
          }

          unlockedByNumber[numberFromValue] = {
            number: numberFromValue,
            name: typeof value.name === 'string' ? value.name : `GIF ${numberFromValue}`,
            collection: typeof value.collection === 'string' ? value.collection : 'unknown',
            rarity: isGifRarity(value.rarity) ? value.rarity : DEFAULT_GIF_RARITY,
            path: typeof value.path === 'string' ? normalizeGifPath(value.path) : '',
            unlockedAt: typeof value.unlockedAt === 'number' ? value.unlockedAt : Date.now(),
            count: typeof value.count === 'number' && value.count > 0 ? value.count : 1,
          }
        }

        return { unlockedByNumber }
      },
    },
  ),
)
