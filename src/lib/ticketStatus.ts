import type { QueueStatus } from '../types/queue'

export const statusLabels: Record<QueueStatus, string> = {
  waiting: 'Menunggu',
  called: 'Dipanggil',
  serving: 'Dilayani',
  completed: 'Selesai',
  skipped: 'Dilewati',
}

export const statusColors: Record<QueueStatus, string> = {
  waiting: 'text-blue-600 bg-blue-50 ring-blue-200',
  called: 'text-amber-600 bg-amber-50 ring-amber-200',
  serving: 'text-green-600 bg-green-50 ring-green-200',
  completed: 'text-gray-600 bg-gray-50 ring-gray-200',
  skipped: 'text-red-600 bg-red-50 ring-red-200',
}

export const statusDotColors: Record<QueueStatus, string> = {
  waiting: 'bg-blue-600 animate-pulse',
  called: 'bg-amber-500 animate-pulse',
  serving: 'bg-green-600',
  completed: 'bg-gray-600',
  skipped: 'bg-red-600',
}
