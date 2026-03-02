import { describe, expect, it } from 'vitest'
import {
  createInitialScrollRoundState,
  MAX_ATTEMPTS,
  scrollRoundReducer,
} from '../../../../src/features/scroll-game/application/scrollRoundMachine'

const entry = {
  number: 5,
  path: '/collections/test/#5-five.gif',
  name: 'Five',
  collection: 'test',
  rarity: 'rare' as const,
}

describe('scrollRoundMachine', () => {
  it('starts scrolling and advances attempts between reveals', () => {
    let state = createInitialScrollRoundState()

    state = scrollRoundReducer(state, { type: 'START_SCROLL' })
    expect(state.hasStartedRound).toBe(true)
    expect(state.attempt).toBe(1)

    state = scrollRoundReducer(state, { type: 'STOP_SCROLL' })
    state = scrollRoundReducer(state, { type: 'REVEAL_CANDIDATE', entry })
    state = scrollRoundReducer(state, { type: 'START_SCROLL' })

    expect(state.attempt).toBe(2)
    expect(state.currentCandidate).toBeNull()
  })

  it('locks reward and resets round', () => {
    let state = createInitialScrollRoundState()

    state = scrollRoundReducer(state, {
      type: 'LOCK_REWARD',
      reward: {
        entry,
        count: 1,
        isNew: true,
      },
    })

    expect(state.showRewardPopup).toBe(true)
    expect(state.rewardResult?.entry.number).toBe(5)

    state = scrollRoundReducer(state, { type: 'RESET_ROUND' })

    expect(state).toEqual(createInitialScrollRoundState())
    expect(MAX_ATTEMPTS).toBe(3)
  })
})
