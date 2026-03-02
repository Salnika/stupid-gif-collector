import { createCollectionBackup, parseCollectionBackup, serializeCollectionBackup } from '../../../lib/collectionBackup'
import { hidePayloadInGif, extractPayloadFromGif } from '../../../lib/gifStego'
import { encodeAssetPath } from '../../../lib/gifMeta'
import { downloadBlob } from '../../../shared/lib/browser'
import type { UnlockedGif } from '../data/unlockedGifsStore'
import type { CollectionBackupEntry } from '../../../lib/collectionBackup'

type ExportCollectionParams = {
  unlockedByNumber: Record<number, UnlockedGif>
  favoriteByNumber: Record<number, true>
}

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

export const exportCollectionToStego = async ({
  unlockedByNumber,
  favoriteByNumber,
}: ExportCollectionParams): Promise<{ fileName: string; count: number }> => {
  const unlockedGifs = Object.values(unlockedByNumber).sort((left, right) => left.number - right.number)
  if (unlockedGifs.length === 0) {
    throw new Error('Nothing to export yet. Unlock at least one GIF first.')
  }

  const backup = createCollectionBackup({ unlockedByNumber, favoriteByNumber })
  const payloadBytes = new TextEncoder().encode(serializeCollectionBackup(backup))
  const shuffledIndexes = getShuffledIndexes(unlockedGifs.length)

  let selectedCoverGif: UnlockedGif | null = null
  let stegoGifBytes: Uint8Array | null = null

  for (const index of shuffledIndexes) {
    const candidate = unlockedGifs[index]

    try {
      const coverResponse = await fetch(encodeAssetPath(candidate.path), { cache: 'no-store' })
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
  downloadBlob(backupBlob, fileName)

  return {
    fileName,
    count: backup.entries.length,
  }
}

export const importCollectionFromStego = async (file: File): Promise<CollectionBackupEntry[]> => {
  const stegoGifBytes = new Uint8Array(await file.arrayBuffer())
  const payloadBytes = extractPayloadFromGif(stegoGifBytes)
  const serializedBackup = new TextDecoder().decode(payloadBytes)
  const backup = parseCollectionBackup(serializedBackup)
  return backup.entries
}
