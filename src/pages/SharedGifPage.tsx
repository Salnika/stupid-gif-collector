import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { encodeAssetPath, parseGifMeta, toBaseAssetPath } from '../lib/gifMeta'
import {
  DEFAULT_GIF_RARITY,
  isGifRarity,
  toGifRarityLabel,
  type GifRarity,
} from '../lib/rarity'

type SharedGifEntry = {
  number: number
  name: string
  collection: string
  path: string
  rarity: GifRarity
}

const parseNumberParam = (value: string | undefined): number | null => {
  if (!value) {
    return null
  }

  const number = Number.parseInt(value, 10)
  if (!Number.isFinite(number) || number < 1) {
    return null
  }

  return number
}

const createEntry = (
  number: number,
  path: string,
  raw?: { name?: unknown; collection?: unknown; rarity?: unknown },
): SharedGifEntry => {
  const parsedMeta = parseGifMeta(path, number)

  return {
    number,
    path,
    name:
      typeof raw?.name === 'string' && raw.name.trim().length > 0 ? raw.name : parsedMeta.name,
    collection:
      typeof raw?.collection === 'string' && raw.collection.trim().length > 0
        ? raw.collection
        : parsedMeta.collection,
    rarity: isGifRarity(raw?.rarity) ? raw.rarity : DEFAULT_GIF_RARITY,
  }
}

export function SharedGifPage() {
  const { gifNumber } = useParams()
  const requestedNumber = useMemo(() => parseNumberParam(gifNumber), [gifNumber])
  const [isLoading, setIsLoading] = useState(true)
  const [entry, setEntry] = useState<SharedGifEntry | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadSharedGif = async () => {
      if (requestedNumber === null) {
        setEntry(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      try {
        const manifestResponse = await fetch(toBaseAssetPath('/collections-manifest.json'), {
          cache: 'no-store',
        })

        if (manifestResponse.ok) {
          const payload = (await manifestResponse.json()) as {
            byNumber?: unknown
          }

          if (payload.byNumber && typeof payload.byNumber === 'object') {
            const byNumber = payload.byNumber as Record<string, unknown>
            const rawValue = byNumber[String(requestedNumber)]

            if (rawValue && typeof rawValue === 'object') {
              const rawEntry = rawValue as {
                path?: unknown
                name?: unknown
                collection?: unknown
                rarity?: unknown
              }

              if (typeof rawEntry.path === 'string' && rawEntry.path.length > 0) {
                if (!cancelled) {
                  setEntry(
                    createEntry(requestedNumber, rawEntry.path, {
                      name: rawEntry.name,
                      collection: rawEntry.collection,
                      rarity: rawEntry.rarity,
                    }),
                  )
                  setIsLoading(false)
                }
                return
              }
            }
          }
        }

        const indexResponse = await fetch(toBaseAssetPath('/collections-index.json'), {
          cache: 'no-store',
        })

        if (indexResponse.ok) {
          const payload = (await indexResponse.json()) as {
            paths?: unknown
          }

          if (Array.isArray(payload.paths)) {
            const path = payload.paths[requestedNumber - 1]
            if (typeof path === 'string' && path.length > 0) {
              if (!cancelled) {
                setEntry(createEntry(requestedNumber, path))
                setIsLoading(false)
              }
              return
            }
          }
        }
      } catch {
        // Keep fallback state below.
      }

      if (!cancelled) {
        setEntry(null)
        setIsLoading(false)
      }
    }

    void loadSharedGif()

    return () => {
      cancelled = true
    }
  }, [requestedNumber])

  return (
    <main className="app app--share">
      <section className="shared-gif">
        {isLoading ? <p className="shared-gif__state">Loading GIF…</p> : null}

        {!isLoading && entry ? (
          <figure className={`shared-gif__card shared-gif__card--rarity-${entry.rarity}`}>
            <img src={encodeAssetPath(entry.path)} alt={`GIF #${entry.number}`} />
            <figcaption className="shared-gif__meta">
              <p className="shared-gif__number">#{entry.number}</p>
              <p className="shared-gif__name">{entry.name}</p>
              <p className="shared-gif__collection">Collection: {entry.collection}</p>
              <p className="shared-gif__rarity">
                Rarity:{' '}
                <span className={`shared-gif__rarity-value shared-gif__rarity-value--${entry.rarity}`}>
                  {toGifRarityLabel(entry.rarity)}
                </span>
              </p>
            </figcaption>
          </figure>
        ) : null}

        {!isLoading && !entry ? (
          <div className="shared-gif__state-block">
            <p className="shared-gif__state">No GIF found for this link.</p>
            <Link className="shared-gif__link" to="/">
              Go Home
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  )
}
