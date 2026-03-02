import { DEFAULT_GIF_RARITY, isGifRarity, type GifRarity } from './rarity'

const BACKUP_HEADER = 'SVC-BACKUP|1'
const RECORD_EXPORT_TIMESTAMP = 'TS'
const RECORD_GIF = 'G'

const safeEncode = (value: string): string => encodeURIComponent(value)

const safeDecode = (value: string): string => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

const toPositiveInt = (value: unknown, fallback: number): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback
  }

  const integer = Math.floor(value)
  return integer > 0 ? integer : fallback
}

const toNonEmptyString = (value: unknown, fallback: string): string => {
  if (typeof value !== 'string') {
    return fallback
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : fallback
}

export type CollectionBackupEntry = {
  number: number
  name: string
  collection: string
  rarity: GifRarity
  path: string
  unlockedAt: number
  count: number
  favorite: boolean
}

export type CollectionBackup = {
  version: 1
  exportedAt: number
  entries: CollectionBackupEntry[]
}

export type CollectionBackupSourceGif = {
  number: number
  name: string
  collection: string
  rarity: GifRarity
  path: string
  unlockedAt: number
  count: number
}

type CollectionBackupSourceState = {
  unlockedByNumber: Record<number, CollectionBackupSourceGif>
  favoriteByNumber: Record<number, true>
}

const normalizeBackupEntry = (
  entry: Partial<CollectionBackupEntry> & Pick<CollectionBackupEntry, 'number'>,
): CollectionBackupEntry => {
  const number = toPositiveInt(entry.number, 1)
  const count = toPositiveInt(entry.count, 1)
  const unlockedAt = toPositiveInt(entry.unlockedAt, Date.now())

  return {
    number,
    name: toNonEmptyString(entry.name, `GIF ${number}`),
    collection: toNonEmptyString(entry.collection, 'unknown'),
    rarity: isGifRarity(entry.rarity) ? entry.rarity : DEFAULT_GIF_RARITY,
    path: typeof entry.path === 'string' ? entry.path : '',
    unlockedAt,
    count,
    favorite: Boolean(entry.favorite),
  }
}

export const createCollectionBackup = ({
  unlockedByNumber,
  favoriteByNumber,
}: CollectionBackupSourceState): CollectionBackup => {
  const entries = Object.values(unlockedByNumber)
    .map((gif) =>
      normalizeBackupEntry({
        ...gif,
        favorite: Boolean(favoriteByNumber[gif.number]),
      }),
    )
    .sort((left, right) => left.number - right.number)

  return {
    version: 1,
    exportedAt: Date.now(),
    entries,
  }
}

export const serializeCollectionBackup = (backup: CollectionBackup): string => {
  const lines = [BACKUP_HEADER, `${RECORD_EXPORT_TIMESTAMP}|${toPositiveInt(backup.exportedAt, Date.now())}`]

  for (const rawEntry of backup.entries) {
    const entry = normalizeBackupEntry(rawEntry)
    lines.push(
      [
        RECORD_GIF,
        entry.number,
        entry.rarity,
        entry.count,
        entry.unlockedAt,
        entry.favorite ? '1' : '0',
        safeEncode(entry.name),
        safeEncode(entry.collection),
        safeEncode(entry.path),
      ].join('|'),
    )
  }

  return `${lines.join('\n')}\n`
}

export const parseCollectionBackup = (rawBackup: string): CollectionBackup => {
  const text = rawBackup.trim()
  if (!text) {
    throw new Error('Backup file is empty.')
  }

  const lines = text.split(/\r?\n/)
  if (lines[0] !== BACKUP_HEADER) {
    throw new Error('Unsupported backup format.')
  }

  let exportedAt = Date.now()
  const byNumber = new Map<number, CollectionBackupEntry>()

  for (const rawLine of lines.slice(1)) {
    if (!rawLine) {
      continue
    }

    const parts = rawLine.split('|')
    const recordType = parts[0]

    if (recordType === RECORD_EXPORT_TIMESTAMP) {
      if (parts.length >= 2) {
        const timestamp = Number.parseInt(parts[1], 10)
        exportedAt = toPositiveInt(timestamp, exportedAt)
      }
      continue
    }

    if (recordType !== RECORD_GIF) {
      continue
    }

    if (parts.length !== 9) {
      throw new Error('Corrupted backup line detected.')
    }

    const number = Number.parseInt(parts[1], 10)
    if (!Number.isFinite(number) || number < 1) {
      continue
    }

    const entry = normalizeBackupEntry({
      number,
      rarity: isGifRarity(parts[2]) ? parts[2] : DEFAULT_GIF_RARITY,
      count: Number.parseInt(parts[3], 10),
      unlockedAt: Number.parseInt(parts[4], 10),
      favorite: parts[5] === '1' || parts[5].toLowerCase() === 'true',
      name: safeDecode(parts[6]),
      collection: safeDecode(parts[7]),
      path: safeDecode(parts[8]),
    })

    byNumber.set(entry.number, entry)
  }

  return {
    version: 1,
    exportedAt,
    entries: Array.from(byNumber.values()).sort((left, right) => left.number - right.number),
  }
}
