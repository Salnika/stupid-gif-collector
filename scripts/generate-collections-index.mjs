import { readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const PROJECT_ROOT = process.cwd()
const PUBLIC_ROOT = path.join(PROJECT_ROOT, 'public')
const COLLECTIONS_ROOT = path.join(PUBLIC_ROOT, 'collections')
const INDEX_OUTPUT_FILE = path.join(PUBLIC_ROOT, 'collections-index.json')
const MANIFEST_OUTPUT_FILE = path.join(PUBLIC_ROOT, 'collections-manifest.json')
const PREFIX_PATTERN = /^(?:#)?(\d+)-(.*)$/i

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

  const indexedPaths = []
  const byNumber = {}
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
    byNumber[index] = {
      number: index,
      path: encodedPath,
      name: toDisplayText(rawName),
      collection: toDisplayText(collectionFolder),
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
