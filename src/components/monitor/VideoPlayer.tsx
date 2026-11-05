import { useState, useRef, useEffect, useCallback } from 'react'
import { Film } from 'lucide-react'
import { buildYouTubeEmbedUrl, parseYouTubeId } from '../../lib/videoSource'

interface VideoPlayerProps {
  src?: string
  className?: string
  loop?: boolean
  onEnded?: () => void
  onError?: () => void
  muted?: boolean
  volume?: number
}

const YOUTUBE_ORIGIN = 'https://www.youtube.com'

export function VideoPlayer({
  src,
  className = '',
  loop = true,
  onEnded,
  onError,
  muted = true,
  volume = 0.2,
}: VideoPlayerProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const youtubeId = src ? parseYouTubeId(src) : null
  const isYouTube = Boolean(youtubeId)
  const hasError = Boolean(src && failedSrc === src)

  const postYouTubeCommand = useCallback((func: string, args: unknown[] = []) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args }),
      YOUTUBE_ORIGIN,
    )
  }, [])

  const syncYouTubeAudio = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe?.contentWindow) return
    iframe.contentWindow.postMessage(JSON.stringify({ event: 'listening' }), YOUTUBE_ORIGIN)
    if (muted) {
      postYouTubeCommand('mute')
      return
    }
    postYouTubeCommand('unMute')
    postYouTubeCommand('setVolume', [Math.round(Math.max(0, Math.min(1, volume)) * 100)])
  }, [muted, volume, postYouTubeCommand])

  useEffect(() => {
    if (!isYouTube) return
    syncYouTubeAudio()
  }, [isYouTube, syncYouTubeAudio])

  useEffect(() => {
    if (!isYouTube) return

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== YOUTUBE_ORIGIN) return
      let payload: unknown = event.data
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload)
        } catch {
          return
        }
      }
      if (!payload || typeof payload !== 'object') return

      const message = payload as { event?: string; info?: number }
      if (message.event === 'onStateChange' && message.info === 0) {
        onEnded?.()
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [isYouTube, onEnded])

  useEffect(() => {
    if (isYouTube) return
    const video = videoRef.current
    if (!video) return

    if (muted) {
      video.muted = true
    } else {
      video.muted = false
      video.volume = volume
      if (video.paused) {
        video.play().catch(() => {})
      }
    }
  }, [muted, volume, isYouTube])

  if (!src || hasError) {
    return (
      <div
        style={{ background: 'var(--tv-card-solid)' }}
        className={`flex items-center justify-center rounded-2xl ring-1 ring-white/10 backdrop-blur ${className}`}
      >
        <div className="flex flex-col items-center gap-4" style={{ color: 'var(--theme-accent)' }}>
          <Film className="size-20 opacity-60" />
          <span className="text-xl font-medium">Video Promosi</span>
          <span className="text-sm text-white/30">
            {hasError ? 'Video tidak dapat dimuat' : 'Belum ada video'}
          </span>
        </div>
      </div>
    )
  }

  if (isYouTube) {
    const embedUrl = buildYouTubeEmbedUrl(src, {
      muted,
      loop,
      controls: false,
      origin: typeof window !== 'undefined' ? window.location.origin : undefined,
    })

    return (
      <div
        className={`overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-[0_0_30px_rgba(0,0,0,0.25)] ${className}`}
      >
        <iframe
          ref={iframeRef}
          src={embedUrl ?? undefined}
          title="Video promosi YouTube"
          className="h-full w-full"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          onLoad={syncYouTubeAudio}
        />
      </div>
    )
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-[0_0_30px_rgba(0,0,0,0.25)] ${className}`}
    >
      <video
        ref={videoRef}
        key={src}
        className="h-full w-full object-cover"
        src={src}
        autoPlay
        muted={muted}
        loop={loop}
        playsInline
        onError={() => {
          setFailedSrc(src)
          onError?.()
        }}
        onEnded={onEnded}
      />
    </div>
  )
}
