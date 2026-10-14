import { describe, it, expect } from 'vitest'
import {
  buildWeeklyCounterChartData,
  isWeeklyCounterChartEmpty,
} from '../weeklyCounterChart'
import type { QueueTicket } from '../../types/queue'

function makeTicket(
  overrides: Partial<Omit<QueueTicket, 'serviceType'>> & { createdAt: string; serviceType?: string },
): QueueTicket {
  return {
    id: '1',
    queueNumber: 'G-001',
    serviceType: 'pengaduan',
    status: 'completed',
    counterNumber: 1,
    calledAt: null,
    completedAt: null,
    ...overrides,
  } as QueueTicket
}

function mondayThisWeek(): Date {
  const today = new Date()
  const day = today.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(today)
  monday.setDate(today.getDate() + diff)
  return monday
}

describe('buildWeeklyCounterChartData', () => {
  it('returns 5 rows for Senin-Jumat with zero counts and no codes when empty', () => {
    const { rows, codes } = buildWeeklyCounterChartData([])

    expect(rows).toHaveLength(5)
    expect(codes).toEqual([])
    rows.forEach((row) => {
      expect(row.total).toBe(0)
    })
  })

  it('labels rows as Senin through Jumat', () => {
    const { rows } = buildWeeklyCounterChartData([])
    const labels = rows.map((r) => r.label)
    expect(labels).toEqual(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'])
  })

  it('uses catalog codes as columns in catalog order', () => {
    const { rows, codes } = buildWeeklyCounterChartData([], ['layanan_1', 'layanan_2'])

    expect(codes).toEqual(['layanan_1', 'layanan_2'])
    rows.forEach((row) => {
      expect(row['layanan_1']).toBe(0)
      expect(row['layanan_2']).toBe(0)
      expect(row.total).toBe(0)
    })
  })

  it('counts tickets on the correct weekday per catalog code', () => {
    const monday = mondayThisWeek()
    const tickets = [
      makeTicket({ createdAt: monday.toISOString(), serviceType: 'layanan_1' }),
      makeTicket({ id: '2', createdAt: monday.toISOString(), serviceType: 'layanan_1' }),
    ]

    const { rows, codes } = buildWeeklyCounterChartData(tickets, ['layanan_1', 'layanan_2'])
    expect(codes).toEqual(['layanan_1', 'layanan_2'])
    expect(rows[0]['layanan_1']).toBe(2)
    expect(rows[0]['layanan_2']).toBe(0)
    expect(rows[0].total).toBe(2)
  })

  it('includes ticket codes missing from the catalog instead of dropping them', () => {
    const monday = mondayThisWeek()
    const customTicket = {
      ...makeTicket({ id: '2', createdAt: monday.toISOString() }),
      serviceType: 'layanan_baru',
    } as unknown as QueueTicket

    const { rows, codes } = buildWeeklyCounterChartData(
      [makeTicket({ createdAt: monday.toISOString(), serviceType: 'layanan_1' }), customTicket],
      ['layanan_1'],
    )
    expect(codes).toEqual(['layanan_1', 'layanan_baru'])
    expect(rows[0]['layanan_1']).toBe(1)
    expect(rows[0]['layanan_baru']).toBe(1)
    expect(rows[0].total).toBe(2)
  })

  it('skips tickets on Saturday', () => {
    const monday = mondayThisWeek()
    const saturday = new Date(monday)
    saturday.setDate(monday.getDate() + 5)

    const tickets = [
      makeTicket({ createdAt: saturday.toISOString(), serviceType: 'layanan_1' }),
    ]

    const { rows } = buildWeeklyCounterChartData(tickets, ['layanan_1'])
    rows.forEach((row) => {
      expect(row.total).toBe(0)
    })
  })

  it('skips tickets on Sunday', () => {
    const monday = mondayThisWeek()
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    const tickets = [
      makeTicket({ createdAt: sunday.toISOString(), serviceType: 'layanan_1' }),
    ]

    const { rows } = buildWeeklyCounterChartData(tickets, ['layanan_1'])
    rows.forEach((row) => {
      expect(row.total).toBe(0)
    })
  })

  it('distributes tickets across multiple service types', () => {
    const monday = mondayThisWeek()
    const tickets = [
      makeTicket({ createdAt: monday.toISOString(), serviceType: 'layanan_1' }),
      makeTicket({ id: '2', createdAt: monday.toISOString(), serviceType: 'layanan_2' }),
      makeTicket({ id: '3', createdAt: monday.toISOString(), serviceType: 'layanan_3' }),
    ]

    const { rows, codes } = buildWeeklyCounterChartData(tickets, ['layanan_1', 'layanan_2', 'layanan_3'])
    expect(codes).toEqual(['layanan_1', 'layanan_2', 'layanan_3'])
    expect(rows[0]['layanan_1']).toBe(1)
    expect(rows[0]['layanan_2']).toBe(1)
    expect(rows[0]['layanan_3']).toBe(1)
    expect(rows[0].total).toBe(3)
  })

  it('prefers calledAt over createdAt for date', () => {
    const monday = mondayThisWeek()
    const tuesday = new Date(monday)
    tuesday.setDate(monday.getDate() + 1)

    const tickets = [
      makeTicket({
        createdAt: monday.toISOString(),
        calledAt: tuesday.toISOString(),
        serviceType: 'layanan_1',
      }),
    ]

    const { rows } = buildWeeklyCounterChartData(tickets, ['layanan_1'])
    expect(rows[0]['layanan_1']).toBe(0)
    expect(rows[1]['layanan_1']).toBe(1)
  })

  it('ignores tickets with empty serviceType', () => {
    const monday = mondayThisWeek()
    const emptyTicket = {
      ...makeTicket({ id: '2', createdAt: monday.toISOString() }),
      serviceType: '   ',
    } as unknown as QueueTicket

    const tickets = [
      makeTicket({ createdAt: monday.toISOString(), serviceType: 'layanan_1' }),
      emptyTicket,
    ]

    const { rows, codes } = buildWeeklyCounterChartData(tickets, ['layanan_1'])
    expect(codes).toEqual(['layanan_1'])
    expect(rows[0].total).toBe(1)
  })

  it('ignores tickets with invalid dates', () => {
    const tickets = [
      makeTicket({ createdAt: 'not-a-date', serviceType: 'layanan_1' }),
    ]

    const { rows } = buildWeeklyCounterChartData(tickets, ['layanan_1'])
    rows.forEach((row) => {
      expect(row.total).toBe(0)
    })
  })
})

describe('isWeeklyCounterChartEmpty', () => {
  it('returns true when all totals are zero', () => {
    const { rows } = buildWeeklyCounterChartData([])
    expect(isWeeklyCounterChartEmpty(rows)).toBe(true)
  })

  it('returns false when at least one row has data', () => {
    const monday = mondayThisWeek()
    const tickets = [
      makeTicket({ createdAt: monday.toISOString(), serviceType: 'layanan_1' }),
    ]
    const { rows } = buildWeeklyCounterChartData(tickets, ['layanan_1'])
    expect(isWeeklyCounterChartEmpty(rows)).toBe(false)
  })
})
