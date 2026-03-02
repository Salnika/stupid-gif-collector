import { encodeAssetPath } from '../../lib/gifMeta'
import { copyText } from '../lib/browser'

export const buildGifShareUrl = (assetPath: string): string =>
  new URL(encodeAssetPath(assetPath), window.location.origin).toString()

export const buildGifEmbedCode = (assetPath: string, name: string): string => {
  const gifUrl = buildGifShareUrl(assetPath)
  return `<img src="${gifUrl}" alt="${name}" />`
}

export const copyGifShareUrl = async (assetPath: string): Promise<boolean> =>
  copyText(buildGifShareUrl(assetPath))

export const copyGifEmbedCode = async (assetPath: string, name: string): Promise<boolean> =>
  copyText(buildGifEmbedCode(assetPath, name))
