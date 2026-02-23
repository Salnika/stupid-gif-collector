import { useEffect, useMemo, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { encodeAssetPath, toBaseAssetPath } from '../lib/gifMeta'
import {
  DEFAULT_GIF_RARITY,
  isGifRarity,
  toGifRarityLabel,
  type GifRarity,
} from '../lib/rarity'
import { useUnlockedGifsStore, type UnlockedGif } from '../store/unlockedGifsStore'

const TOTAL_GIFS = 27901

const getDownloadFileName = (gif: UnlockedGif): string =>
  `${gif.number}-${gif.name.replace(/\s+/g, '-').toLowerCase()}.gif`

export function MyCollectionPage() {
  const unlockedByNumber = useUnlockedGifsStore((state) => state.unlockedByNumber)
  const [copiedEmbedFor, setCopiedEmbedFor] = useState<number | null>(null)
  const [copiedShareFor, setCopiedShareFor] = useState<number | null>(null)
  const [selectedGif, setSelectedGif] = useState<UnlockedGif | null>(null)
  const [rarityByNumber, setRarityByNumber] = useState<Record<number, GifRarity>>({})

  const sortedUnlockedGifs = useMemo(
    () => Object.values(unlockedByNumber).sort((a, b) => a.number - b.number),
    [unlockedByNumber],
  )

  const unlockedCount = sortedUnlockedGifs.length
  const unlockedSummary = `${unlockedCount}/${TOTAL_GIFS} unlocked`
  const selectedGifRarity = selectedGif
    ? rarityByNumber[selectedGif.number] ?? selectedGif.rarity ?? DEFAULT_GIF_RARITY
    : DEFAULT_GIF_RARITY

  useEffect(() => {
    let cancelled = false

    const loadRarities = async () => {
      try {
        const response = await fetch(toBaseAssetPath('/collections-manifest.json'), {
          cache: 'no-store',
        })

        if (!response.ok) {
          return
        }

        const payload = (await response.json()) as {
          byNumber?: unknown
        }

        if (!payload.byNumber || typeof payload.byNumber !== 'object' || cancelled) {
          return
        }

        const next: Record<number, GifRarity> = {}
        for (const [rawKey, rawValue] of Object.entries(payload.byNumber)) {
          const number = Number.parseInt(rawKey, 10)
          if (!Number.isFinite(number) || number < 1 || !rawValue || typeof rawValue !== 'object') {
            continue
          }

          const value = rawValue as { rarity?: unknown }
          if (isGifRarity(value.rarity)) {
            next[number] = value.rarity
          }
        }

        if (!cancelled) {
          setRarityByNumber(next)
        }
      } catch {
        // Keep fallback rarity from local state if manifest fetch fails.
      }
    }

    void loadRarities()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!selectedGif) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedGif(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedGif])

  const handleCopyEmbed = async (gif: UnlockedGif) => {
    const gifUrl = `${window.location.origin}${encodeAssetPath(gif.path)}`
    const embedCode = `<img src="${gifUrl}" alt="${gif.name}" />`

    try {
      await navigator.clipboard.writeText(embedCode)
      setCopiedEmbedFor(gif.number)
      window.setTimeout(() => {
        setCopiedEmbedFor((current) => (current === gif.number ? null : current))
      }, 1200)
    } catch {
      // If clipboard fails, keep the UI stable without throwing.
    }
  }

  const handleCopyShareLink = async (gif: UnlockedGif) => {
    const sharePath = toBaseAssetPath(`/share/${gif.number}`)
    const shareUrl = new URL(sharePath, window.location.origin).toString()

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopiedShareFor(gif.number)
      window.setTimeout(() => {
        setCopiedShareFor((current) => (current === gif.number ? null : current))
      }, 1200)
    } catch {
      // If clipboard fails, keep the UI stable without throwing.
    }
  }

  const handleCardKeyDown = (event: ReactKeyboardEvent<HTMLElement>, gif: UnlockedGif) => {
    if (event.target !== event.currentTarget) {
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setSelectedGif(gif)
    }
  }

  return (
    <main className="app app--collection">
      <section className="my-collection">
        <header className="my-collection__header">
          <h1>My collection</h1>
          <p>{unlockedSummary}</p>
        </header>

        {sortedUnlockedGifs.length === 0 ? (
          <p className="my-collection__empty">
            No unlocked GIFs yet. Scroll on the Home page to add some.
          </p>
        ) : (
          <div className="my-collection__grid">
            {sortedUnlockedGifs.map((gif) => {
              const rarity = rarityByNumber[gif.number] ?? gif.rarity ?? DEFAULT_GIF_RARITY

              return (
                <article
                  className={`my-collection__card my-collection__card--rarity-${rarity}`}
                  key={gif.number}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open GIF #${gif.number}`}
                  onClick={() => setSelectedGif(gif)}
                  onKeyDown={(event) => handleCardKeyDown(event, gif)}
                >
                  {gif.count >= 2 ? (
                    <span className="my-collection__count-badge">x{gif.count}</span>
                  ) : null}
                  <img src={encodeAssetPath(gif.path)} alt={`GIF #${gif.number}`} />
                  <div className="my-collection__meta">
                    <p className="my-collection__number">#{gif.number}</p>
                    <p className="my-collection__name">{gif.name}</p>
                    <p className="my-collection__folder">Collection: {gif.collection}</p>
                    <p className="my-collection__rarity">
                      Rarity:{' '}
                      <span className={`my-collection__rarity-value my-collection__rarity-value--${rarity}`}>
                        {toGifRarityLabel(rarity)}
                      </span>
                    </p>
                  </div>
                  <div
                    className="my-collection__actions"
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <a
                      className="my-collection__action-btn"
                      href={encodeAssetPath(gif.path)}
                      download={getDownloadFileName(gif)}
                    >
                      Download
                    </a>
                    <button
                      type="button"
                      className="my-collection__action-btn my-collection__action-btn--secondary"
                      onClick={() => void handleCopyEmbed(gif)}
                    >
                      {copiedEmbedFor === gif.number ? 'Copied!' : 'Copy embed'}
                    </button>
                    <button
                      type="button"
                      className="my-collection__action-btn my-collection__action-btn--secondary my-collection__action-btn--share"
                      onClick={() => void handleCopyShareLink(gif)}
                    >
                      {copiedShareFor === gif.number ? 'Copied!' : 'Share'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {selectedGif ? (
          <div
            className="my-collection__modal"
            role="dialog"
            aria-modal="true"
            aria-label={`GIF #${selectedGif.number}`}
            onClick={() => setSelectedGif(null)}
          >
            <article
              className={`my-collection__modal-card my-collection__card my-collection__card--rarity-${selectedGifRarity}`}
              onClick={(event) => event.stopPropagation()}
            >
              {selectedGif.count >= 2 ? (
                <span className="my-collection__count-badge">x{selectedGif.count}</span>
              ) : null}
              <img src={encodeAssetPath(selectedGif.path)} alt={`GIF #${selectedGif.number}`} />
              <div className="my-collection__meta">
                <p className="my-collection__number">#{selectedGif.number}</p>
                <p className="my-collection__name">{selectedGif.name}</p>
                <p className="my-collection__folder">Collection: {selectedGif.collection}</p>
                <p className="my-collection__rarity">
                  Rarity:{' '}
                  <span
                    className={`my-collection__rarity-value my-collection__rarity-value--${selectedGifRarity}`}
                  >
                    {toGifRarityLabel(selectedGifRarity)}
                  </span>
                </p>
              </div>
              <div className="my-collection__modal-actions">
                <button
                  type="button"
                  className="my-collection__action-btn my-collection__action-btn--secondary"
                  onClick={() => setSelectedGif(null)}
                >
                  Close
                </button>
              </div>
            </article>
          </div>
        ) : null}
      </section>
    </main>
  )
}
