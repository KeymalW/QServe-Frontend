import { describe, it, expect } from 'vitest'
import {
  SERVICE_TYPE_ORDER,
  buildCounterCards,
  getServiceColor,
  getServiceLabel,
  getServiceSortScore,
  setDynamicServices,
  SERVICE_STATUS_LABELS,
} from '../serviceTypes'

describe('SERVICE_TYPE_ORDER', () => {
  it('contains 3 service types', () => {
    expect(SERVICE_TYPE_ORDER).toHaveLength(3)
  })

  it('has pengaduan, pb_pd_migrasi, p2tl', () => {
    expect(SERVICE_TYPE_ORDER).toEqual(['pengaduan', 'pb_pd_migrasi', 'p2tl'])
  })
})

describe('getServiceLabel', () => {
  it('returns correct labels for known types', () => {
    setDynamicServices([])
    expect(getServiceLabel('pengaduan')).toBe('Pengaduan')
    expect(getServiceLabel('pb_pd_migrasi')).toBe('PB/PD/Migrasi')
    expect(getServiceLabel('p2tl')).toBe('P2TL')
  })

  it('title-cases unknown types', () => {
    setDynamicServices([])
    expect(getServiceLabel('custom_type')).toBe('Custom_type')
  })

  it('prefers catalog names from Kelola Layanan over legacy labels', () => {
    setDynamicServices([
      { code: 'pengaduan', name: 'Layanan 1', serviceGroup: 'group_a' },
      { code: 'pb_pd_migrasi', name: 'Layanan 2', serviceGroup: 'group_a' },
    ])
    try {
      expect(getServiceLabel('pengaduan')).toBe('Layanan 1')
      expect(getServiceLabel('pb_pd_migrasi')).toBe('Layanan 2')
      // Kode yang tidak ada di katalog tetap fallback legacy.
      expect(getServiceLabel('p2tl')).toBe('P2TL')
    } finally {
      setDynamicServices([])
    }
  })
})

describe('getServiceSortScore', () => {
  it('returns group 0 for known types with correct order', () => {
    const score = getServiceSortScore('pengaduan')
    expect(score.group).toBe(0)
    expect(score.order).toBe(0)
  })

  it('returns group 1 for unknown types', () => {
    const score = getServiceSortScore('unknown')
    expect(score.group).toBe(1)
  })
})

describe('getServiceColor', () => {
  it('returns stable legacy colors for built-in codes', () => {
    expect(getServiceColor('pengaduan')).toBe('#2563EB')
    expect(getServiceColor('pb_pd_migrasi')).toBe('#F59E0B')
    expect(getServiceColor('p2tl')).toBe('#16A34A')
  })

  it('returns deterministic hex colors for custom codes', () => {
    const first = getServiceColor('layanan_baru')
    expect(first).toMatch(/^#[0-9A-F]{6}$/i)
    expect(getServiceColor('layanan_baru')).toBe(first)
  })
})

describe('buildCounterCards', () => {
  it('derives one card per counter from the catalog, sorted', () => {
    const cards = buildCounterCards([
      { code: 'b', name: 'Layanan B', counterNumber: 2, isActive: true },
      { code: 'a', name: 'Layanan A', counterNumber: 1, isActive: true },
    ])
    expect(cards).toEqual([
      { num: 1, code: 'a', name: 'Layanan A' },
      { num: 2, code: 'b', name: 'Layanan B' },
    ])
  })

  it('skips inactive services and services without a counter', () => {
    const cards = buildCounterCards([
      { code: 'x', name: 'Nonaktif', counterNumber: 1, isActive: false },
      { code: 'y', name: 'Tanpa Loket', counterNumber: null, isActive: true },
      { code: 'z', name: 'Layanan Z', counterNumber: 3, isActive: true },
    ])
    expect(cards).toEqual([{ num: 3, code: 'z', name: 'Layanan Z' }])
  })

  it('falls back to 3 generic counters when the catalog is empty', () => {
    expect(buildCounterCards([])).toEqual([
      { num: 1, code: null, name: 'Loket 1' },
      { num: 2, code: null, name: 'Loket 2' },
      { num: 3, code: null, name: 'Loket 3' },
    ])
  })
})
describe('SERVICE_STATUS_LABELS', () => {
  it('has labels for all statuses', () => {
    expect(SERVICE_STATUS_LABELS.waiting).toBe('Menunggu')
    expect(SERVICE_STATUS_LABELS.called).toBe('Dipanggil')
    expect(SERVICE_STATUS_LABELS.serving).toBe('Dilayani')
    expect(SERVICE_STATUS_LABELS.completed).toBe('Selesai')
    expect(SERVICE_STATUS_LABELS.skipped).toBe('Dilewati')
  })
})


