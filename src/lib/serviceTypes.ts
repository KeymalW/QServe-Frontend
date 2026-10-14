import type { QueueStatus, ServiceType } from '../types/queue'

export const SERVICE_TYPE_ORDER: ServiceType[] = [
  'pengaduan',
  'pb_pd_migrasi',
  'p2tl',
]

/**
 * Snapshot layanan dinamis dari Kelola Layanan (diisi oleh servicesStore).
 * Lookup label/grup memeriksa snapshot ini dulu, lalu fallback ke peta legacy
 * agar tiket-tiket lama tetap terbaca.
 */
interface DynamicServiceMeta {
  name: string
  serviceGroup: 'group_a' | 'group_b'
}

let dynamicServicesByCode: Record<string, DynamicServiceMeta> = {}

export function setDynamicServices(
  list: ReadonlyArray<{ code: string; name: string; serviceGroup: 'group_a' | 'group_b' }>,
): void {
  dynamicServicesByCode = {}
  for (const svc of list) {
    dynamicServicesByCode[svc.code] = { name: svc.name, serviceGroup: svc.serviceGroup }
  }
}

export type ServiceGroup = 'group_a' | 'group_b'

const SERVICE_GROUP_MAP: Record<ServiceType, ServiceGroup> = {
  pengaduan: 'group_a',
  pb_pd_migrasi: 'group_a',
  p2tl: 'group_b',
}

export const SERVICE_GROUP_LABELS: Record<ServiceGroup, string> = {
  group_a: 'Pengaduan & PB/PD/Migrasi',
  group_b: 'P2TL',
}

const LEGACY_SERVICE_COLORS: Record<string, string> = {
  pengaduan: '#2563EB',
  pb_pd_migrasi: '#F59E0B',
  p2tl: '#16A34A',
}

/** Palet fallback deterministik untuk kode layanan di luar 3 bawaan. */
const FALLBACK_COLOR_PALETTE = [
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
  '#F97316',
  '#84CC16',
  '#06B6D4',
  '#EF4444',
  '#6366F1',
] as const

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

/**
 * Warna grafik per kode layanan. Kode bawaan memakai warna tetap agar
 * konsisten; kode baru mendapat warna deterministik dari palet fallback.
 */
export function getServiceColor(serviceType: string): string {
  const normalized = normalizeServiceKey(serviceType)
  return (
    LEGACY_SERVICE_COLORS[normalized] ??
    FALLBACK_COLOR_PALETTE[hashString(normalized) % FALLBACK_COLOR_PALETTE.length]
  )
}

export function getServiceGroup(serviceType: string): ServiceGroup {
  return dynamicServicesByCode[serviceType]?.serviceGroup ?? SERVICE_GROUP_MAP[serviceType as ServiceType] ?? 'group_a'
}

const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  pengaduan: 'Pengaduan',
  pb_pd_migrasi: 'PB/PD/Migrasi',
  p2tl: 'P2TL',
}

function normalizeServiceKey(value: string) {
  return value.trim().toLowerCase()
}

function titleCase(value: string) {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

export function getServiceLabel(serviceType: string) {
  const normalized = normalizeServiceKey(serviceType)

  if (dynamicServicesByCode[normalized]?.name) {
    return dynamicServicesByCode[normalized].name
  }

  if (normalized in SERVICE_TYPE_LABELS) {
    return SERVICE_TYPE_LABELS[normalized as ServiceType]
  }

  return titleCase(serviceType)
}

export function getServiceSortScore(serviceType: string) {
  const normalized = normalizeServiceKey(serviceType)
  const knownIndex = SERVICE_TYPE_ORDER.indexOf(normalized as ServiceType)

  if (knownIndex >= 0) {
    return { group: 0, order: knownIndex, label: getServiceLabel(normalized) }
  }

  return { group: 1, order: 0, label: getServiceLabel(serviceType) }
}

/** Bentuk minimal layanan katalog untuk derivasi kartu loket. */
export interface CounterServiceLike {
  code: string
  name: string
  counterNumber: number | null
  isActive: boolean
}

export interface CounterCard {
  num: number
  code: string | null
  name: string
}

/**
 * Kartu loket dari katalog Kelola Layanan: satu kartu per nomor loket yang
 * memiliki layanan aktif, urut nomor loket. Bila katalog kosong, fallback ke
 * 3 loket generik agar tampilan tidak kosong.
 */
export function buildCounterCards(services: CounterServiceLike[]): CounterCard[] {
  const byCounter = new Map<number, CounterCard>()
  for (const service of services) {
    if (service.counterNumber == null || !service.isActive) continue
    if (!byCounter.has(service.counterNumber)) {
      byCounter.set(service.counterNumber, {
        num: service.counterNumber,
        code: service.code,
        name: service.name,
      })
    }
  }
  if (byCounter.size === 0) {
    return [1, 2, 3].map((num) => ({ num, code: null, name: `Loket ${num}` }))
  }
  return [...byCounter.values()].sort((a, b) => a.num - b.num)
}

export const SERVICE_STATUS_LABELS: Record<QueueStatus, string> = {  waiting: 'Menunggu',
  called: 'Dipanggil',
  serving: 'Dilayani',
  completed: 'Selesai',
  skipped: 'Dilewati',
}

export const STATUS_BADGE_COLOR: Record<QueueStatus, string> = {
  waiting: 'bg-yellow-100 text-yellow-800',
  called: 'bg-blue-100 text-blue-800',
  serving: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  skipped: 'bg-gray-100 text-gray-600',
}


