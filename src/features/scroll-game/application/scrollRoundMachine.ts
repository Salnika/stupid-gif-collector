import type { GifCatalogEntry } from '../../catalog/domain'

export const MAX_ATTEMPTS = 3

export type RewardResult = {
  entry: GifCatalogEntry
  count: number
  isNew: boolean
}

export type ScrollRoundState = {
  hasStartedRound: boolean
  isScrolling: boolean
  attempt: number
  currentCandidate: GifCatalogEntry | null
  showRewardPopup: boolean
  rewardResult: RewardResult | null
  copiedShareFor: number | null
}

type ScrollRoundAction =
  | { type: 'START_SCROLL' }
  | { type: 'STOP_SCROLL' }
  | { type: 'REVEAL_CANDIDATE'; entry: GifCatalogEntry }
  | { type: 'LOCK_REWARD'; reward: RewardResult }
  | { type: 'SET_COPIED_SHARE'; gifNumber: number | null }
  | { type: 'RESET_ROUND' }

export const createInitialScrollRoundState = (): ScrollRoundState => ({
  hasStartedRound: false,
  isScrolling: false,
  attempt: 1,
  currentCandidate: null,
  showRewardPopup: false,
  rewardResult: null,
  copiedShareFor: null,
})

export const scrollRoundReducer = (
  state: ScrollRoundState,
  action: ScrollRoundAction,
): ScrollRoundState => {
  switch (action.type) {
    case 'START_SCROLL': {
      if (state.showRewardPopup) {
        return state
      }

      if (!state.hasStartedRound) {
        return {
          ...state,
          hasStartedRound: true,
          isScrolling: true,
        }
      }

      if (state.currentCandidate && state.attempt < MAX_ATTEMPTS) {
        return {
          ...state,
          isScrolling: true,
          attempt: state.attempt + 1,
          currentCandidate: null,
        }
      }

      return {
        ...state,
        isScrolling: true,
      }
    }

    case 'STOP_SCROLL': {
      return {
        ...state,
        isScrolling: false,
      }
    }

    case 'REVEAL_CANDIDATE': {
      return {
        ...state,
        currentCandidate: action.entry,
      }
    }

    case 'LOCK_REWARD': {
      return {
        ...state,
        showRewardPopup: true,
        rewardResult: action.reward,
      }
    }

    case 'SET_COPIED_SHARE': {
      return {
        ...state,
        copiedShareFor: action.gifNumber,
      }
    }

    case 'RESET_ROUND':
      return createInitialScrollRoundState()

    default:
      return state
  }
}
