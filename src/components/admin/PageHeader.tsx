import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 px-5 py-4 shadow-sm">
      <div
        className="pointer-events-none absolute -top-12 -right-10 size-40 rounded-full bg-white/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-16 right-16 size-32 rounded-full bg-white/5"
        aria-hidden="true"
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-blue-100">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 [&_[data-variant=default]]:bg-white [&_[data-variant=default]]:text-blue-700 [&_[data-variant=default]]:hover:bg-blue-50 [&_[data-variant=ghost]]:text-white [&_[data-variant=ghost]]:hover:bg-white/15 [&_[data-variant=ghost]]:hover:text-white">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
