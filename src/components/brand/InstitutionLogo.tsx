import { useState } from 'react'
import { Building2Icon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface InstitutionLogoProps {
  src?: string | null
  alt?: string
  className?: string
  placeholderClassName?: string
}

export function InstitutionLogo({
  src,
  alt = 'Logo instansi',
  className,
  placeholderClassName,
}: InstitutionLogoProps) {
  const url = src?.trim() ?? ''
  const [failedUrl, setFailedUrl] = useState<string | null>(null)

  if (url && failedUrl !== url) {
    return <img src={url} alt={alt} className={className} onError={() => setFailedUrl(url)} />
  }

  return (
    <span
      role="img"
      aria-label={alt}
      className={cn(
        'inline-flex items-center justify-center rounded-md bg-muted/60 text-muted-foreground ring-1 ring-border',
        placeholderClassName,
      )}
    >
      <Building2Icon className="size-1/2" aria-hidden="true" />
    </span>
  )
}
