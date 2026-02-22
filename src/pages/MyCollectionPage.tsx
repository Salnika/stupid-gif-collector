import { useEffect, useMemo, useState } from 'react'
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
  const [rarityByNumber, setRarityByNumber] = useState<Record<number, GifRarity>>({})

  const sortedUnlockedGifs = useMemo(
    () => Object.values(unlockedByNumber).sort((a, b) => a.number - b.number),
    [unlockedByNumber],
  )

  const unlockedCount = sortedUnlockedGifs.length
  const unlockedSummary = `${unlockedCount}/${TOTAL_GIFS} unlocked`

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
                  <div className="my-collection__actions">
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
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
