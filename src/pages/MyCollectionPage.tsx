import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import {
  createCollectionBackup,
  parseCollectionBackup,
  serializeCollectionBackup,
} from '../lib/collectionBackup'
import { extractPayloadFromGif, hidePayloadInGif } from '../lib/gifStego'
import { encodeAssetPath, toBaseAssetPath } from '../lib/gifMeta'
import {
  DEFAULT_GIF_RARITY,
  GIF_RARITIES,
  isGifRarity,
  toGifRarityLabel,
  type GifRarity,
} from '../lib/rarity'
import { useUnlockedGifsStore, type UnlockedGif } from '../store/unlockedGifsStore'

const TOTAL_GIFS = 27901

const hasSameItems = <T,>(left: T[], right: T[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const getDownloadFileName = (gif: UnlockedGif): string =>
  `${gif.number}-${gif.name.replace(/\s+/g, '-').toLowerCase()}.gif`

const getShuffledIndexes = (length: number): number[] => {
  const indexes = Array.from({ length }, (_, index) => index)

  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const current = indexes[index]
    indexes[index] = indexes[swapIndex]
    indexes[swapIndex] = current
  }

  return indexes
}

type TransferStatus = {
  tone: 'info' | 'success' | 'error'
  message: string
}

const toErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  return fallback
}

export function MyCollectionPage() {
  const unlockedByNumber = useUnlockedGifsStore((state) => state.unlockedByNumber)
  const favoriteByNumber = useUnlockedGifsStore((state) => state.favoriteByNumber)
  const toggleFavorite = useUnlockedGifsStore((state) => state.toggleFavorite)
  const replaceCollectionFromImport = useUnlockedGifsStore(
    (state) => state.replaceCollectionFromImport,
  )
  const importInputRef = useRef<HTMLInputElement | null>(null)
  const [copiedEmbedFor, setCopiedEmbedFor] = useState<number | null>(null)
  const [copiedShareFor, setCopiedShareFor] = useState<number | null>(null)
  const [isTransferPending, setIsTransferPending] = useState(false)
  const [transferStatus, setTransferStatus] = useState<TransferStatus | null>(null)
  const [selectedGif, setSelectedGif] = useState<UnlockedGif | null>(null)
  const [rarityByNumber, setRarityByNumber] = useState<Record<number, GifRarity>>({})
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [collectionFilters, setCollectionFilters] = useState<string[]>([])
  const [rarityFilters, setRarityFilters] = useState<GifRarity[]>([])

  const sortedUnlockedGifs = useMemo(
    () =>
      Object.values(unlockedByNumber)
        .map((gif) => ({
          ...gif,
          rarity: rarityByNumber[gif.number] ?? gif.rarity ?? DEFAULT_GIF_RARITY,
        }))
        .sort((a, b) => a.number - b.number),
    [rarityByNumber, unlockedByNumber],
  )

  const availableCollections = useMemo(() => {
    const uniqueCollections = new Set(sortedUnlockedGifs.map((gif) => gif.collection))
    return Array.from(uniqueCollections).sort((a, b) => a.localeCompare(b))
  }, [sortedUnlockedGifs])

  const availableRarities = useMemo(
    () => GIF_RARITIES.filter((rarity) => sortedUnlockedGifs.some((gif) => gif.rarity === rarity)),
    [sortedUnlockedGifs],
  )

  const filteredUnlockedGifs = useMemo(
    () =>
      sortedUnlockedGifs.filter((gif) => {
        if (showFavoritesOnly && !favoriteByNumber[gif.number]) {
          return false
        }

        if (collectionFilters.length > 0 && !collectionFilters.includes(gif.collection)) {
          return false
        }

        if (rarityFilters.length > 0 && !rarityFilters.includes(gif.rarity)) {
          return false
        }

        return true
      }),
    [collectionFilters, favoriteByNumber, rarityFilters, showFavoritesOnly, sortedUnlockedGifs],
  )

  const unlockedCount = sortedUnlockedGifs.length
  const unlockedSummary = `${unlockedCount}/${TOTAL_GIFS} unlocked`
  const selectedGifRarity = selectedGif
    ? rarityByNumber[selectedGif.number] ?? selectedGif.rarity ?? DEFAULT_GIF_RARITY
    : DEFAULT_GIF_RARITY
  const collectionDropdownValue = useMemo(() => {
    if (collectionFilters.length === 0) {
      return 'All'
    }

    if (collectionFilters.length === 1) {
      return collectionFilters[0]
    }

    return `${collectionFilters.length} selected`
  }, [collectionFilters])
  const rarityDropdownValue = useMemo(() => {
    if (rarityFilters.length === 0) {
      return 'All'
    }

    if (rarityFilters.length === 1) {
      return toGifRarityLabel(rarityFilters[0])
    }

    return `${rarityFilters.length} selected`
  }, [rarityFilters])

  useEffect(() => {
    setCollectionFilters((current) => {
      const next = current.filter((value) => availableCollections.includes(value))
      return hasSameItems(current, next) ? current : next
    })
  }, [availableCollections])

  useEffect(() => {
    setRarityFilters((current) => {
      const next = current.filter((value) => availableRarities.includes(value))
      return hasSameItems(current, next) ? current : next
    })
  }, [availableRarities])

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
    const sharePath = encodeAssetPath(gif.path)
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

  const handleExportStegoGif = async () => {
    if (sortedUnlockedGifs.length === 0) {
      setTransferStatus({
        tone: 'error',
        message: 'Nothing to export yet. Unlock at least one GIF first.',
      })
      return
    }

    setIsTransferPending(true)
    setTransferStatus({
      tone: 'info',
      message: 'Preparing GIF backup...',
    })

    try {
      const backup = createCollectionBackup({
        unlockedByNumber,
        favoriteByNumber,
      })
      const serializedBackup = serializeCollectionBackup(backup)
      const payloadBytes = new TextEncoder().encode(serializedBackup)
      const shuffledIndexes = getShuffledIndexes(sortedUnlockedGifs.length)
      let selectedCoverGif: UnlockedGif | null = null
      let stegoGifBytes: Uint8Array | null = null

      for (const index of shuffledIndexes) {
        const candidate = sortedUnlockedGifs[index]
        try {
          const coverResponse = await fetch(encodeAssetPath(candidate.path), {
            cache: 'no-store',
          })
          if (!coverResponse.ok) {
            continue
          }

          const coverGifBytes = new Uint8Array(await coverResponse.arrayBuffer())
          stegoGifBytes = hidePayloadInGif(coverGifBytes, payloadBytes)
          selectedCoverGif = candidate
          break
        } catch {
          // Try next candidate.
        }
      }

      if (!selectedCoverGif || !stegoGifBytes) {
        throw new Error('Unable to load a GIF cover from your collection.')
      }

      const stegoBuffer = new ArrayBuffer(stegoGifBytes.byteLength)
      new Uint8Array(stegoBuffer).set(stegoGifBytes)
      const backupBlob = new Blob([stegoBuffer], { type: 'image/gif' })
      const exportDate = new Date(backup.exportedAt).toISOString().slice(0, 10)
      const fileName = `stupid-vite-collect-backup-${exportDate}-${selectedCoverGif.number}.gif`
      const objectUrl = URL.createObjectURL(backupBlob)
      const downloadLink = document.createElement('a')
      downloadLink.href = objectUrl
      downloadLink.download = fileName
      document.body.append(downloadLink)
      downloadLink.click()
      downloadLink.remove()
      URL.revokeObjectURL(objectUrl)

      setTransferStatus({
        tone: 'success',
        message: `Exported ${backup.entries.length} GIFs into ${fileName} (cover #${selectedCoverGif.number}).`,
      })
    } catch (error) {
      setTransferStatus({
        tone: 'error',
        message: toErrorMessage(error, 'Export failed.'),
      })
    } finally {
      setIsTransferPending(false)
    }
  }

  const handleImportStegoGif = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null
    event.target.value = ''

    if (!selectedFile) {
      return
    }

    setIsTransferPending(true)
    setTransferStatus({
      tone: 'info',
      message: `Reading ${selectedFile.name}...`,
    })

    try {
      const stegoGifBytes = new Uint8Array(await selectedFile.arrayBuffer())
      const payloadBytes = extractPayloadFromGif(stegoGifBytes)
      const serializedBackup = new TextDecoder().decode(payloadBytes)
      const backup = parseCollectionBackup(serializedBackup)
      const shouldImport = window.confirm(
        `Import ${backup.entries.length} GIFs from "${selectedFile.name}"? This will replace your current local collection.`,
      )

      if (!shouldImport) {
        setTransferStatus({
          tone: 'info',
          message: 'Import cancelled.',
        })
        return
      }

      const result = replaceCollectionFromImport(backup.entries)
      setSelectedGif(null)
      setShowFavoritesOnly(false)
      setCollectionFilters([])
      setRarityFilters([])
      setTransferStatus({
        tone: 'success',
        message: `Import complete: ${result.imported} GIFs restored.`,
      })
    } catch (error) {
      setTransferStatus({
        tone: 'error',
        message: toErrorMessage(error, 'Import failed.'),
      })
    } finally {
      setIsTransferPending(false)
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

  const toggleCollectionFilter = (collection: string) => {
    setCollectionFilters((current) =>
      current.includes(collection)
        ? current.filter((item) => item !== collection)
        : [...current, collection],
    )
  }

  const toggleRarityFilter = (rarity: GifRarity) => {
    setRarityFilters((current) =>
      current.includes(rarity) ? current.filter((item) => item !== rarity) : [...current, rarity],
    )
  }

  return (
    <main className="app app--collection">
      <section className="my-collection">
        <header className="my-collection__header">
          <h1>My collection</h1>
          <p>{unlockedSummary}</p>
          <div className="my-collection__transfer">
            <button
              type="button"
              className="my-collection__transfer-btn"
              disabled={isTransferPending || sortedUnlockedGifs.length === 0}
              onClick={() => void handleExportStegoGif()}
            >
              Export .gif
            </button>
            <button
              type="button"
              className="my-collection__transfer-btn my-collection__transfer-btn--secondary"
              disabled={isTransferPending}
              onClick={() => importInputRef.current?.click()}
            >
              Import .gif
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept=".gif,image/gif"
              onChange={(event) => void handleImportStegoGif(event)}
              hidden
            />
          </div>
          {transferStatus ? (
            <p
              className={`my-collection__transfer-status my-collection__transfer-status--${transferStatus.tone}`}
            >
              {transferStatus.message}
            </p>
          ) : null}
        </header>

        {sortedUnlockedGifs.length > 0 ? (
          <section className="my-collection__filters" aria-label="Collection filters">
            <label className="my-collection__filter-toggle">
              <input
                type="checkbox"
                checked={showFavoritesOnly}
                onChange={(event) => setShowFavoritesOnly(event.target.checked)}
              />
              <span>Favorites</span>
            </label>

            <label className="my-collection__filter-field">
              <span>Collection</span>
              <details className="my-collection__multiselect">
                <summary className="my-collection__multiselect-trigger">{collectionDropdownValue}</summary>
                <div className="my-collection__multiselect-menu">
                  <button
                    type="button"
                    className="my-collection__multiselect-clear"
                    disabled={collectionFilters.length === 0}
                    onClick={() => setCollectionFilters([])}
                  >
                    All
                  </button>
                  {availableCollections.map((collection) => (
                    <label key={collection} className="my-collection__multiselect-option">
                      <input
                        type="checkbox"
                        checked={collectionFilters.includes(collection)}
                        onChange={() => toggleCollectionFilter(collection)}
                      />
                      <span>{collection}</span>
                    </label>
                  ))}
                </div>
              </details>
            </label>

            <label className="my-collection__filter-field">
              <span>Rarity</span>
              <details className="my-collection__multiselect">
                <summary className="my-collection__multiselect-trigger">{rarityDropdownValue}</summary>
                <div className="my-collection__multiselect-menu">
                  <button
                    type="button"
                    className="my-collection__multiselect-clear"
                    disabled={rarityFilters.length === 0}
                    onClick={() => setRarityFilters([])}
                  >
                    All
                  </button>
                  {availableRarities.map((rarity) => (
                    <label
                      key={rarity}
                      className={`my-collection__multiselect-option my-collection__multiselect-option--rarity-${rarity}`}
                    >
                      <input
                        type="checkbox"
                        checked={rarityFilters.includes(rarity)}
                        onChange={() => toggleRarityFilter(rarity)}
                      />
                      <span>{toGifRarityLabel(rarity)}</span>
                    </label>
                  ))}
                </div>
              </details>
            </label>
          </section>
        ) : null}

        {sortedUnlockedGifs.length === 0 ? (
          <p className="my-collection__empty">
            No unlocked GIFs yet. Scroll on the Home page to add some.
          </p>
        ) : filteredUnlockedGifs.length === 0 ? (
          <p className="my-collection__empty">No GIF matches the selected filters.</p>
        ) : (
          <div className="my-collection__grid">
            {filteredUnlockedGifs.map((gif) => {
              const isFavorite = Boolean(favoriteByNumber[gif.number])
              const rarity = gif.rarity

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
                  <button
                    type="button"
                    className={`my-collection__favorite-btn${
                      isFavorite ? ' my-collection__favorite-btn--active' : ''
                    }`}
                    aria-label={
                      isFavorite
                        ? `Remove GIF #${gif.number} from favorites`
                        : `Add GIF #${gif.number} to favorites`
                    }
                    aria-pressed={isFavorite}
                    onClick={(event) => {
                      event.stopPropagation()
                      toggleFavorite(gif.number)
                    }}
                  >
                    {isFavorite ? '★' : '☆'}
                  </button>

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
