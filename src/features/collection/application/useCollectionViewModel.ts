import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
  type SetStateAction,
} from 'react'
import { loadManifest } from '../../catalog/data'
import type { GifCatalogEntry } from '../../catalog/domain'
import { useUnlockedGifsStore } from '../data/unlockedGifsStore'
import type { CollectionGifEntry, TransferStatus } from '../domain'
import { exportCollectionToStego, importCollectionFromStego } from '../services/collectionTransferService'
import { confirmDialog, clearBrowserTimeout, restartTimeout } from '../../../shared/lib/browser'
import { copyGifEmbedCode, copyGifShareUrl } from '../../../shared/services/shareService'
import { GIF_RARITIES, isGifRarity, type GifRarity } from '../../../lib/rarity'
import { createCollectionEntries, filterCollectionEntries } from './collectionSelectors'

const DEFAULT_TOTAL_GIFS = 27901

const hasSameItems = <T,>(left: T[], right: T[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const toErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  return fallback
}

export type CollectionViewModel = {
  importInputRef: RefObject<HTMLInputElement | null>
  sortedUnlockedGifs: CollectionGifEntry[]
  filteredUnlockedGifs: CollectionGifEntry[]
  availableCollections: string[]
  availableRarities: GifRarity[]
  collectionFilters: string[]
  rarityFilters: GifRarity[]
  showFavoritesOnly: boolean
  copiedEmbedFor: number | null
  copiedShareFor: number | null
  unlockedSummary: string
  isTransferPending: boolean
  transferStatus: TransferStatus | null
  selectedGif: CollectionGifEntry | null
  collectionDropdownValue: string
  rarityDropdownValue: string
  setShowFavoritesOnly: (value: boolean) => void
  setCollectionFilters: Dispatch<SetStateAction<string[]>>
  setRarityFilters: Dispatch<SetStateAction<GifRarity[]>>
  toggleCollectionFilter: (collection: string) => void
  toggleRarityFilter: (rarity: GifRarity) => void
  openSelectedGif: (gif: CollectionGifEntry) => void
  closeSelectedGif: () => void
  toggleFavorite: (gifNumber: number) => void
  handleCardKeyDown: (event: ReactKeyboardEvent<HTMLElement>, gif: CollectionGifEntry) => void
  handleCopyEmbed: (gif: CollectionGifEntry) => Promise<void>
  handleCopyShareLink: (gif: CollectionGifEntry) => Promise<void>
  handleExportCollection: () => Promise<void>
  triggerImportDialog: () => void
  handleImportStegoGif: (event: ChangeEvent<HTMLInputElement>) => Promise<void>
}

export const useCollectionViewModel = (): CollectionViewModel => {
  const unlockedByNumber = useUnlockedGifsStore((state) => state.unlockedByNumber)
  const favoriteByNumber = useUnlockedGifsStore((state) => state.favoriteByNumber)
  const toggleFavorite = useUnlockedGifsStore((state) => state.toggleFavorite)
  const replaceCollectionFromImport = useUnlockedGifsStore((state) => state.replaceCollectionFromImport)

  const importInputRef = useRef<HTMLInputElement | null>(null)
  const embedResetTimerRef = useRef<number | null>(null)
  const shareResetTimerRef = useRef<number | null>(null)

  const [catalogTotal, setCatalogTotal] = useState(DEFAULT_TOTAL_GIFS)
  const [rarityByNumber, setRarityByNumber] = useState<Record<number, GifRarity>>({})
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [collectionFilters, setCollectionFilters] = useState<string[]>([])
  const [rarityFilters, setRarityFilters] = useState<GifRarity[]>([])
  const [selectedGif, setSelectedGif] = useState<CollectionGifEntry | null>(null)
  const [copiedEmbedFor, setCopiedEmbedFor] = useState<number | null>(null)
  const [copiedShareFor, setCopiedShareFor] = useState<number | null>(null)
  const [isTransferPending, setIsTransferPending] = useState(false)
  const [transferStatus, setTransferStatus] = useState<TransferStatus | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadCatalogData = async () => {
      try {
        const manifest = await loadManifest()
        if (cancelled) {
          return
        }

        setCatalogTotal(manifest.total)
        const nextRarities: Record<number, GifRarity> = {}

        for (const [rawKey, entry] of Object.entries(manifest.byNumber)) {
          const number = Number.parseInt(rawKey, 10)
          if (!Number.isFinite(number) || number < 1 || !entry || !isGifRarity(entry.rarity)) {
            continue
          }

          nextRarities[number] = entry.rarity
        }

        setRarityByNumber(nextRarities)
      } catch {
        // Keep fallback total/rarity when manifest loading fails.
      }
    }

    void loadCatalogData()

    return () => {
      cancelled = true
    }
  }, [])

  const sortedUnlockedGifs = useMemo<CollectionGifEntry[]>(
    () => createCollectionEntries(unlockedByNumber, favoriteByNumber, rarityByNumber),
    [favoriteByNumber, rarityByNumber, unlockedByNumber],
  )

  const availableCollections = useMemo(() => {
    const uniqueCollections = new Set(sortedUnlockedGifs.map((gif) => gif.collection))
    return Array.from(uniqueCollections).sort((a, b) => a.localeCompare(b))
  }, [sortedUnlockedGifs])

  const availableRarities = useMemo(
    () => GIF_RARITIES.filter((rarity) => sortedUnlockedGifs.some((gif) => gif.rarity === rarity)),
    [sortedUnlockedGifs],
  )

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
    if (!selectedGif) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedGif(null)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [selectedGif])

  useEffect(
    () => () => {
      embedResetTimerRef.current = clearBrowserTimeout(embedResetTimerRef.current)
      shareResetTimerRef.current = clearBrowserTimeout(shareResetTimerRef.current)
    },
    [],
  )

  const filteredUnlockedGifs = useMemo(
    () =>
      filterCollectionEntries(sortedUnlockedGifs, {
        showFavoritesOnly,
        collectionFilters,
        rarityFilters,
      }),
    [collectionFilters, rarityFilters, showFavoritesOnly, sortedUnlockedGifs],
  )

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
      return rarityFilters[0]
    }

    return `${rarityFilters.length} selected`
  }, [rarityFilters])

  const openSelectedGif = (gif: CollectionGifEntry) => setSelectedGif(gif)
  const closeSelectedGif = () => setSelectedGif(null)

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

  const handleCardKeyDown = (event: ReactKeyboardEvent<HTMLElement>, gif: CollectionGifEntry) => {
    if (event.target !== event.currentTarget) {
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openSelectedGif(gif)
    }
  }

  const handleCopyEmbed = async (gif: GifCatalogEntry) => {
    const copied = await copyGifEmbedCode(gif.path, gif.name)
    if (!copied) {
      return
    }

    setCopiedEmbedFor(gif.number)
    embedResetTimerRef.current = restartTimeout(embedResetTimerRef.current, () => {
      setCopiedEmbedFor((current) => (current === gif.number ? null : current))
    }, 1200)
  }

  const handleCopyShareLink = async (gif: GifCatalogEntry) => {
    const copied = await copyGifShareUrl(gif.path)
    if (!copied) {
      return
    }

    setCopiedShareFor(gif.number)
    shareResetTimerRef.current = restartTimeout(shareResetTimerRef.current, () => {
      setCopiedShareFor((current) => (current === gif.number ? null : current))
    }, 1200)
  }

  const handleExportCollection = async () => {
    setIsTransferPending(true)
    setTransferStatus({
      tone: 'info',
      message: 'Preparing GIF backup...',
    })

    try {
      const result = await exportCollectionToStego({ unlockedByNumber, favoriteByNumber })
      setTransferStatus({
        tone: 'success',
        message: `Exported ${result.count} GIFs into ${result.fileName}.`,
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

  const triggerImportDialog = () => importInputRef.current?.click()

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
      const entries = await importCollectionFromStego(selectedFile)
      const shouldImport = confirmDialog(
        `Import ${entries.length} GIFs from "${selectedFile.name}"? This will replace your current local collection.`,
      )

      if (!shouldImport) {
        setTransferStatus({
          tone: 'info',
          message: 'Import cancelled.',
        })
        return
      }

      const result = replaceCollectionFromImport(entries)
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

  return {
    importInputRef,
    sortedUnlockedGifs,
    filteredUnlockedGifs,
    availableCollections,
    availableRarities,
    collectionFilters,
    rarityFilters,
    showFavoritesOnly,
    copiedEmbedFor,
    copiedShareFor,
    unlockedSummary: `${sortedUnlockedGifs.length}/${catalogTotal} unlocked`,
    isTransferPending,
    transferStatus,
    selectedGif,
    collectionDropdownValue,
    rarityDropdownValue,
    setShowFavoritesOnly,
    setCollectionFilters,
    setRarityFilters,
    toggleCollectionFilter,
    toggleRarityFilter,
    openSelectedGif,
    closeSelectedGif,
    toggleFavorite,
    handleCardKeyDown,
    handleCopyEmbed,
    handleCopyShareLink,
    handleExportCollection,
    triggerImportDialog,
    handleImportStegoGif,
  }
}
