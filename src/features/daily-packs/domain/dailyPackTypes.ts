export const DAILY_PACK_COUNT = 10
export const GIFS_PER_DAILY_PACK = 5
export const DAILY_GIFS_TOTAL = DAILY_PACK_COUNT * GIFS_PER_DAILY_PACK

export type DailyPackStatus = 'sealed' | 'opened'

export type DailyPackRevealResult = {
  number: number
  count: number
  isNew: boolean
}

export type DailyPack = {
  id: number
  gifNumbers: number[]
  status: DailyPackStatus
  openedAt: number | null
  revealResults: DailyPackRevealResult[]
}

export type DailyPackSession = {
  dayKey: string
  generatedAt: number
  selectedPackId: number
  packs: DailyPack[]
}
