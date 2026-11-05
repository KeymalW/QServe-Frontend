import { describe, expect, it } from 'vitest'
import { buildYouTubeEmbedUrl, getVideoKind, parseYouTubeId } from '../videoSource'

describe('parseYouTubeId', () => {
  it('parses common YouTube URL formats', () => {
    expect(parseYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(parseYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(parseYouTubeId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(parseYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(parseYouTubeId('https://www.youtube.com/live/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('rejects non-YouTube URLs and invalid input', () => {
    expect(parseYouTubeId('https://contoh.com/video.mp4')).toBeNull()
    expect(parseYouTubeId('not a url')).toBeNull()
    expect(parseYouTubeId('')).toBeNull()
  })
})

describe('getVideoKind', () => {
  it('classifies YouTube links', () => {
    expect(getVideoKind('https://youtu.be/dQw4w9WgXcQ')).toBe('youtube')
    expect(getVideoKind('https://contoh.com/video.mp4')).toBe('file')
  })
})

describe('buildYouTubeEmbedUrl', () => {
  it('builds an embed URL with expected flags', () => {
    const url = buildYouTubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ', {
      muted: true,
      loop: true,
      controls: false,
      origin: 'https://qserve.test',
    })

    expect(url).toContain('https://www.youtube.com/embed/dQw4w9WgXcQ?')
    expect(url).toContain('autoplay=1')
    expect(url).toContain('mute=1')
    expect(url).toContain('loop=1')
    expect(url).toContain('playlist=dQw4w9WgXcQ')
    expect(url).toContain('controls=0')
    expect(url).toContain('origin=https%3A%2F%2Fqserve.test')
  })

  it('returns null for non-YouTube URLs', () => {
    expect(buildYouTubeEmbedUrl('https://contoh.com/video.mp4')).toBeNull()
  })
})
