import type { QueueTicket } from '../types/queue'

export type WeeklyServiceKey = string

export interface WeeklyServiceChartRow {
  day: string
  label: string
  total: number
  [serviceCode: string]: string | number
}

export interface WeeklyChartData {
  rows: WeeklyServiceChartRow[]
  /** Kode layanan dalam urutan tampil: katalog dulu, lalu kode temuan. */
  codes: string[]
}

export const WEEKDAY_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'] as const

function getChartTimestamp(ticket: Pick<QueueTicket, 'calledAt' | 'completedAt' | 'createdAt'>) {
  return ticket.calledAt ?? ticket.completedAt ?? ticket.createdAt
}

/**
 * Membangun data grafik mingguan dari tiket.
 *
 * @param tickets Daftar tiket (dikelompokkan per hari Senin–Jumat).
 * @param serviceCodes Kode layanan dari katalog Kelola Layanan — menjadi
 * kolom grafik. Kode tiket yang tidak ada di katalog tetap dimasukkan
 * (urutan kemunculan) agar tiket lama/tiket layanan terhapus tidak hilang.
 */
export function buildWeeklyCounterChartData(
  tickets: Pick<QueueTicket, 'serviceType' | 'calledAt' | 'completedAt' | 'createdAt'>[],
  serviceCodes: string[] = [],
): WeeklyChartData {
  const codes: string[] = []
  const seen = new Set<string>()
  const consider = (code: unknown) => {
    if (typeof code !== 'string') return
    const trimmed = code.trim()
    if (!trimmed || seen.has(trimmed)) return
    seen.add(trimmed)
    codes.push(trimmed)
  }
  serviceCodes.forEach(consider)
  tickets.forEach((ticket) => consider(ticket.serviceType))

  const rows = WEEKDAY_ORDER.map((label, dayIndex) => {
    const row: WeeklyServiceChartRow = { day: String(dayIndex), label, total: 0 }
    for (const code of codes) row[code] = 0
    return { row, dayIndex }
  })

  for (const ticket of tickets) {
    if (typeof ticket.serviceType !== 'string' || !ticket.serviceType.trim()) continue

    const ticketDate = new Date(getChartTimestamp(ticket))
    if (Number.isNaN(ticketDate.getTime())) continue

    const ticketDay = ticketDate.getDay()
    const ticketDayIndex = ticketDay === 0 ? -1 : ticketDay - 1
    if (ticketDayIndex < 0 || ticketDayIndex > 4) continue

    const entry = rows[ticketDayIndex]
    const serviceKey = ticket.serviceType.trim()
    entry.row[serviceKey] = (entry.row[serviceKey] as number ?? 0) + 1
    entry.row.total += 1
  }

  return { rows: rows.map((entry) => entry.row), codes }
}

export function isWeeklyCounterChartEmpty(rows: WeeklyServiceChartRow[]) {
  return rows.every((row) => row.total === 0)
}
