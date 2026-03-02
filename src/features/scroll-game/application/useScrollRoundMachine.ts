import { useReducer } from 'react'
import {
  createInitialScrollRoundState,
  scrollRoundReducer,
  type RewardResult,
} from './scrollRoundMachine'
import type { GifCatalogEntry } from '../../catalog/domain'

export const useScrollRoundMachine = () => {
  const [state, dispatch] = useReducer(scrollRoundReducer, undefined, createInitialScrollRoundState)

  return {
    state,
    startScroll: () => dispatch({ type: 'START_SCROLL' }),
    stopScroll: () => dispatch({ type: 'STOP_SCROLL' }),
    revealCandidate: (entry: GifCatalogEntry) => dispatch({ type: 'REVEAL_CANDIDATE', entry }),
    lockReward: (reward: RewardResult) => dispatch({ type: 'LOCK_REWARD', reward }),
    setCopiedShareFor: (gifNumber: number | null) =>
      dispatch({ type: 'SET_COPIED_SHARE', gifNumber }),
    resetRound: () => dispatch({ type: 'RESET_ROUND' }),
  }
}
