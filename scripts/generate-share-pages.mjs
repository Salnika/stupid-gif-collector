import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const PROJECT_ROOT = process.cwd()
const DIST_ROOT = path.join(PROJECT_ROOT, 'dist')
const MANIFEST_PATH = path.join(DIST_ROOT, 'collections-manifest.json')
const SHARE_ROOT = path.join(DIST_ROOT, 'share')
const DEFAULT_SITE_ORIGIN = 'https://salnika.github.io'
const DEFAULT_SITE_BASE_PATH = '/stupid-gif-collector'
const ALLOWED_RARITIES = new Set(['common', 'uncommon', 'rare', 'epic', 'legendary'])
const WRITE_BATCH_SIZE = 160

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const normalizeOrigin = (value) => value.trim().replace(/\/+$/, '')

const normalizeBasePath = (value) => {
  if (!value) {
    return ''
  }

  const trimmed = value.trim()
  if (!trimmed || trimmed === '/') {
    return ''
  }

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return withLeadingSlash.replace(/\/+$/, '')
}

const toBasePath = (basePath, assetPath) => {
  const normalizedAssetPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`
  return basePath ? `${basePath}${normalizedAssetPath}` : normalizedAssetPath
}

const toAbsoluteUrl = (origin, basePath, assetPath) => `${origin}${toBasePath(basePath, assetPath)}`

const toRarityLabel = (rarity) => {
  if (typeof rarity !== 'string' || !ALLOWED_RARITIES.has(rarity)) {
    return 'Common'
  }

  return rarity.charAt(0).toUpperCase() + rarity.slice(1)
}

const resolveSiteConfig = () => {
  const repository = process.env.GITHUB_REPOSITORY?.trim() ?? ''
  const [owner, repoName] = repository.split('/')

  const siteOrigin =
    process.env.SHARE_SITE_ORIGIN && process.env.SHARE_SITE_ORIGIN.trim().length > 0
      ? normalizeOrigin(process.env.SHARE_SITE_ORIGIN)
      : owner && owner.length > 0
        ? `https://${owner}.github.io`
        : DEFAULT_SITE_ORIGIN

  const basePath =
    process.env.SHARE_SITE_BASE_PATH && process.env.SHARE_SITE_BASE_PATH.trim().length > 0
      ? normalizeBasePath(process.env.SHARE_SITE_BASE_PATH)
      : repoName && repoName.length > 0
        ? normalizeBasePath(`/${repoName}`)
        : normalizeBasePath(DEFAULT_SITE_BASE_PATH)

  return { siteOrigin, basePath }
}

const renderSharePage = ({ number, name, collection, rarityLabel, imageUrl, shareUrl, homeUrl }) => {
  const safeTitle = escapeHtml(`GIF #${number} - ${name}`)
  const safeCollection = escapeHtml(collection)
  const safeRarity = escapeHtml(rarityLabel)
  const safeImageUrl = escapeHtml(imageUrl)
  const safeShareUrl = escapeHtml(shareUrl)
  const safeHomeUrl = escapeHtml(homeUrl)
  const pageTitle = `${safeTitle} | Stupid GIF Collector`
  const description = escapeHtml(
    `GIF #${number} from "${collection}" collection. Rarity: ${rarityLabel}.`,
  )

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${pageTitle}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${safeShareUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Stupid GIF Collector" />
    <meta property="og:title" content="${pageTitle}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${safeShareUrl}" />
    <meta property="og:image" content="${safeImageUrl}" />
    <meta property="og:image:secure_url" content="${safeImageUrl}" />
    <meta property="og:image:type" content="image/gif" />
    <meta property="og:image:alt" content="GIF #${number}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${pageTitle}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${safeImageUrl}" />
    <style>
      :root {
        color-scheme: dark;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: radial-gradient(circle at 20% 0%, #213557, #0a0f1f 48%, #070912);
        color: #eef4ff;
      }
      main {
        width: min(88vw, 640px);
        border: 1px solid rgba(173, 197, 227, 0.28);
        border-radius: 22px;
        background: rgba(7, 10, 18, 0.84);
        padding: 18px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
      }
      img {
        display: block;
        width: 100%;
        border-radius: 14px;
        background: rgba(27, 32, 49, 0.65);
      }
      h1 {
        margin: 14px 0 4px;
        font-size: 1.2rem;
      }
      p {
        margin: 6px 0;
        color: #ced9ed;
      }
      a {
        color: #8dc7ff;
      }
    </style>
  </head>
  <body>
    <main>
      <img src="${safeImageUrl}" alt="GIF #${number}" />
      <h1>${safeTitle}</h1>
      <p>Collection: ${safeCollection}</p>
      <p>Rarity: ${safeRarity}</p>
      <p><a href="${safeHomeUrl}">Open Stupid GIF Collector</a></p>
    </main>
  </body>
</html>
`
}

const build = async () => {
  const manifestRaw = await readFile(MANIFEST_PATH, 'utf8')
  const manifest = JSON.parse(manifestRaw)
  const byNumber = manifest?.byNumber

  if (!byNumber || typeof byNumber !== 'object') {
    throw new Error('Invalid collections-manifest.json: missing "byNumber" object')
  }

  const { siteOrigin, basePath } = resolveSiteConfig()
  const homeUrl = toBasePath(basePath, '/')
  const entries = Object.entries(byNumber)
    .map(([rawNumber, rawValue]) => {
      const number = Number.parseInt(rawNumber, 10)
      if (!Number.isFinite(number) || number < 1 || !rawValue || typeof rawValue !== 'object') {
        return null
      }

      const value = rawValue
      const pathValue = typeof value.path === 'string' ? value.path : ''
      if (!pathValue) {
        return null
      }

      const name =
        typeof value.name === 'string' && value.name.trim().length > 0 ? value.name : `GIF #${number}`
      const collection =
        typeof value.collection === 'string' && value.collection.trim().length > 0
          ? value.collection
          : 'Unknown collection'
      const rarityLabel = toRarityLabel(value.rarity)
      const sharePath = `/share/${number}/`
      const imageUrl = toAbsoluteUrl(siteOrigin, basePath, pathValue)
      const shareUrl = toAbsoluteUrl(siteOrigin, basePath, sharePath)

      return {
        number,
        html: renderSharePage({
          number,
          name,
          collection,
          rarityLabel,
          imageUrl,
          shareUrl,
          homeUrl,
        }),
      }
    })
    .filter((entry) => entry !== null)
    .sort((a, b) => a.number - b.number)

  await mkdir(SHARE_ROOT, { recursive: true })

  for (let index = 0; index < entries.length; index += WRITE_BATCH_SIZE) {
    const batch = entries.slice(index, index + WRITE_BATCH_SIZE)
    await Promise.all(
      batch.map(async (entry) => {
        const targetDir = path.join(SHARE_ROOT, String(entry.number))
        await mkdir(targetDir, { recursive: true })
        await writeFile(path.join(targetDir, 'index.html'), entry.html)
      }),
    )
  }

  console.log(
    `Generated ${entries.length} static share pages in ${SHARE_ROOT} (origin: ${siteOrigin}, base: ${basePath || '/'})`,
  )
}

await build()
