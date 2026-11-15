import { describe, it, expect } from 'vitest'
import { isCounterIdle, getOverflowSuggestions } from '../serviceOverflow'
import type { QueueTicket } from '../../types/queue'

function ticket(
  partial: Partial<QueueTicket> & Pick<QueueTicket, 'id' | 'serviceType'>,
): QueueTicket {
  return {
    queueNumber: 'A-001',
    status: 'waiting',
    counterNumber: null,
    createdAt: '2026-01-01T08:00:00Z',
    calledAt: null,
    completedAt: null,
    ...partial,
  }
}

describe('isCounterIdle', () => {
  it('returns true when no service has an active ticket', () => {
    expect(isCounterIdle({ a: null, b: null })).toBe(true)
  })

  it('returns true for an empty map', () => {
    expect(isCounterIdle({})).toBe(true)
  })

  it('returns false when at least one service has an active ticket', () => {
    expect(isCounterIdle({ a: null, b: ticket({ id: 't1', serviceType: 'p2tl' }) })).toBe(false)
  })
})

describe('getOverflowSuggestions', () => {
  const list = [
    ticket({ id: '1', serviceType: 'pengaduan' }),
    ticket({ id: '2', serviceType: 'p2tl' }),
    ticket({ id: '3', serviceType: 'pb_pd_migrasi' }),
    ticket({ id: '4', serviceType: 'p2tl' }),
  ]

  it('excludes tickets of the selected service', () => {
    expect(getOverflowSuggestions(list, 'p2tl').map((t) => t.id)).toEqual(['1', '3'])
  })

  it('returns all tickets when no service is selected', () => {
    expect(getOverflowSuggestions(list, null)).toHaveLength(4)
  })

  it('preserves the source order', () => {
    expect(getOverflowSuggestions(list, 'pengaduan').map((t) => t.id)).toEqual(['2', '3', '4'])
  })
})
