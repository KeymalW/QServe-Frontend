export type VideoKind = 'youtube' | 'file'

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
])

const YOUTUBE_SHORT_HOSTS = new Set(['youtu.be', 'www.youtu.be'])

export function parseYouTubeId(rawUrl: string): string | null {
  const input = rawUrl.trim()
  if (!input) return null

  let url: URL
  try {
    url = new URL(input)
  } catch {
    return null
  }

  const host = url.hostname.toLowerCase()
  const isYouTubeHost = YOUTUBE_HOSTS.has(host) || YOUTUBE_SHORT_HOSTS.has(host)
  if (!isYouTubeHost) return null

  const pathParts = url.pathname.split('/').filter(Boolean)

  if (YOUTUBE_SHORT_HOSTS.has(host)) {
    return pathParts[0] ?? null
  }

  if (host.includes('youtube-nocookie.com')) {
    if (pathParts[0] === 'embed' && pathParts[1]) return pathParts[1]
    if (url.searchParams.get('v')) return url.searchParams.get('v')
    return null
  }

  const v = url.searchParams.get('v')
  if (v) return v

  if (pathParts[0] === 'shorts' && pathParts[1]) return pathParts[1]
  if (pathParts[0] === 'embed' && pathParts[1]) return pathParts[1]
  if (pathParts[0] === 'live' && pathParts[1]) return pathParts[1]

  return null
}

export function getVideoKind(rawUrl: string): VideoKind {
  return parseYouTubeId(rawUrl) ? 'youtube' : 'file'
}

export function isYouTubeUrl(rawUrl: string): boolean {
  return getVideoKind(rawUrl) === 'youtube'
}

export function buildYouTubeEmbedUrl(
  rawUrl: string,
  options: { muted?: boolean; loop?: boolean; origin?: string; controls?: boolean } = {},
): string | null {
  const id = parseYouTubeId(rawUrl)
  if (!id) return null

  const params = new URLSearchParams({
    autoplay: '1',
    mute: options.muted ? '1' : '0',
    controls: options.controls === false ? '0' : '1',
    playsinline: '1',
    rel: '0',
    modestbranding: '1',
    enablejsapi: '1',
  })

  if (options.loop) {
    params.set('loop', '1')
    params.set('playlist', id)
  }

  if (options.origin) {
    params.set('origin', options.origin)
  }

  return `https://www.youtube.com/embed/${encodeURIComponent(id)}?${params.toString()}`
}
