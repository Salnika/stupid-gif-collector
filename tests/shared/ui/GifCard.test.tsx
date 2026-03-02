import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { GifCard } from '../../../src/shared/ui/GifCard'

describe('GifCard', () => {
  const entry = {
    number: 12,
    path: '/collections/test/#12-card.gif',
    name: 'Card',
    collection: 'test',
    rarity: 'legendary' as const,
  }

  it('renders metadata and rarity', () => {
    render(<GifCard entry={entry} count={2} />)

    expect(screen.getByText('#12')).toBeInTheDocument()
    expect(screen.getByText('Card')).toBeInTheDocument()
    expect(screen.getByText('Collection: test')).toBeInTheDocument()
    expect(screen.getByText('Legendary')).toBeInTheDocument()
    expect(screen.getByText('x2')).toBeInTheDocument()
  })

  it('triggers favorite callback', () => {
    const onToggleFavorite = vi.fn()

    render(
      <GifCard
        entry={entry}
        isFavorite={false}
        favoriteLabels={{ add: 'add', remove: 'remove' }}
        onToggleFavorite={onToggleFavorite}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'add' }))

    expect(onToggleFavorite).toHaveBeenCalledTimes(1)
  })
})
