export type GifMeta = {
  number: number
  name: string
  collection: string
}

const safeDecodeURIComponent = (value: string): string => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export const encodeAssetPath = (assetPath: string): string =>
  assetPath
    .split('/')
    .map((segment) => {
      try {
        return encodeURIComponent(decodeURIComponent(segment))
      } catch {
        return encodeURIComponent(segment)
      }
    })
    .join('/')

export const parseGifMeta = (assetPath: string, fallbackNumber: number): GifMeta => {
  const cleanPath = assetPath.split('?')[0].split('#')[0]
  const segments = cleanPath
    .split('/')
    .filter((segment) => segment.length > 0)
    .map(safeDecodeURIComponent)

  const fileName = segments[segments.length - 1] ?? ''
  const collectionFolder = segments[segments.length - 2] ?? 'unknown'
  const fileBase = fileName.replace(/\.[^.]+$/, '')
  const match = fileBase.match(/^(?:#)?(\d+)-(.*)$/i)
  const number = match ? Number.parseInt(match[1], 10) : fallbackNumber
  const rawName = match ? match[2] : fileBase

  return {
    number: Number.isFinite(number) && number > 0 ? number : fallbackNumber,
    name: rawName.replace(/[_-]+/g, ' ').trim(),
    collection: collectionFolder.replace(/[_-]+/g, ' ').trim(),
  }
}
