import { readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const PROJECT_ROOT = process.cwd()
const PUBLIC_ROOT = path.join(PROJECT_ROOT, 'public')
const COLLECTIONS_ROOT = path.join(PUBLIC_ROOT, 'collections')
const INDEX_OUTPUT_FILE = path.join(PUBLIC_ROOT, 'collections-index.json')
const MANIFEST_OUTPUT_FILE = path.join(PUBLIC_ROOT, 'collections-manifest.json')
const PREFIX_PATTERN = /^(?:#)?(\d+)-(.*)$/i
const DEFAULT_RARITY = 'common'

const toCollectionRarity = (percentile) => {
  if (percentile >= 0.6) {
    return 'common'
  }

  if (percentile >= 0.35) {
    return 'uncommon'
  }

  if (percentile >= 0.18) {
    return 'rare'
  }

  if (percentile >= 0.08) {
    return 'epic'
  }

  return 'legendary'
}

const walkFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        return walkFiles(fullPath)
      }

      return entry.isFile() ? [fullPath] : []
    }),
  )

  return files.flat()
}

const encodePathSegment = (segment) => encodeURIComponent(segment)
const toDisplayText = (value) => value.replace(/[_-]+/g, ' ').trim()

const toPublicPath = (absolutePath) => {
  const relativePath = path.relative(PUBLIC_ROOT, absolutePath)
  const encoded = relativePath.split(path.sep).map(encodePathSegment).join('/')
  return `/${encoded}`
}

const buildIndex = async () => {
  const allFiles = await walkFiles(COLLECTIONS_ROOT)
  const gifFiles = allFiles.filter((filePath) => filePath.toLowerCase().endsWith('.gif'))

  const parsedEntries = []
  const indexedPaths = []
  for (const filePath of gifFiles) {
    const fileName = path.basename(filePath)
    const match = fileName.match(PREFIX_PATTERN)
    if (!match) {
      continue
    }

    const index = Number.parseInt(match[1], 10)
    if (!Number.isFinite(index) || index < 1) {
      throw new Error(`Invalid index in filename: ${fileName}`)
    }

    const encodedPath = toPublicPath(filePath)
    const rawName = (match[2] ?? fileName).replace(/\.[^.]+$/, '')
    const collectionFolder = path.basename(path.dirname(filePath))

    if (indexedPaths[index - 1] !== undefined) {
      throw new Error(`Duplicate index #${index}: ${indexedPaths[index - 1]} and ${filePath}`)
    }

    indexedPaths[index - 1] = encodedPath
    parsedEntries.push({
      number: index,
      path: encodedPath,
      name: toDisplayText(rawName),
      collection: toDisplayText(collectionFolder),
      collectionFolder,
    })
  }

  const collectionSizes = {}
  for (const entry of parsedEntries) {
    collectionSizes[entry.collectionFolder] = (collectionSizes[entry.collectionFolder] ?? 0) + 1
  }

  const sortedCollections = Object.entries(collectionSizes).sort((a, b) => {
    if (a[1] !== b[1]) {
      return a[1] - b[1]
    }

    return a[0].localeCompare(b[0])
  })

  const rarityByCollection = {}
  const collectionCount = sortedCollections.length
  for (let index = 0; index < collectionCount; index += 1) {
    const [collectionFolder] = sortedCollections[index]
    const percentile = collectionCount > 1 ? index / (collectionCount - 1) : 1
    rarityByCollection[collectionFolder] = toCollectionRarity(percentile)
  }

  const byNumber = {}
  for (const entry of parsedEntries) {
    byNumber[entry.number] = {
      number: entry.number,
      path: entry.path,
      name: entry.name,
      collection: entry.collection,
      rarity: rarityByCollection[entry.collectionFolder] ?? DEFAULT_RARITY,
    }
  }

  const missingIndexes = []
  for (let index = 1; index <= indexedPaths.length; index += 1) {
    if (!indexedPaths[index - 1]) {
      missingIndexes.push(index)
      if (missingIndexes.length >= 20) {
        break
      }
    }
  }

  if (missingIndexes.length > 0) {
    throw new Error(`Missing indexes detected (first 20): ${missingIndexes.join(', ')}`)
  }

  const indexPayload = {
    total: indexedPaths.length,
    paths: indexedPaths,
  }

  const manifestPayload = {
    total: indexedPaths.length,
    byNumber,
  }

  await writeFile(INDEX_OUTPUT_FILE, JSON.stringify(indexPayload))
  await writeFile(MANIFEST_OUTPUT_FILE, JSON.stringify(manifestPayload))
  console.log(`Generated ${INDEX_OUTPUT_FILE} with ${indexedPaths.length} GIF entries`)
  console.log(`Generated ${MANIFEST_OUTPUT_FILE} with ${indexedPaths.length} GIF entries`)
}

await buildIndex()
