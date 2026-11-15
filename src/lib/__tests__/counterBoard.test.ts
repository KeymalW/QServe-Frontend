import { describe, it, expect } from 'vitest'
import { pickLatestByCounter } from '../counterBoard'
import type { QueueTicket } from '../../types/queue'

function ticket(partial: Partial<QueueTicket> & Pick<QueueTicket, 'id'>): QueueTicket {
  return {
    queueNumber: 'A-001',
    serviceType: 'pengaduan',
    status: 'called',
    counterNumber: 1,
    createdAt: '2026-01-01T08:00:00Z',
    calledAt: '2026-01-01T08:00:00Z',
    completedAt: null,
    ...partial,
  }
}

describe('pickLatestByCounter', () => {
  it('picks the most recent ticket per counter', () => {
    const result = pickLatestByCounter([
      ticket({ id: 'a', counterNumber: 1, calledAt: '2026-01-01T08:00:00Z' }),
      ticket({ id: 'b', counterNumber: 1, calledAt: '2026-01-01T09:00:00Z' }),
      ticket({ id: 'c', counterNumber: 2, calledAt: '2026-01-01T08:30:00Z' }),
    ])
    expect(result[1].id).toBe('b')
    expect(result[2].id).toBe('c')
  })

  it('ignores tickets without a counter', () => {
    expect(pickLatestByCounter([ticket({ id: 'a', counterNumber: null })])).toEqual({})
  })

  it('keeps the previous ticket when a later one has no calledAt', () => {
    const result = pickLatestByCounter([
      ticket({ id: 'a', counterNumber: 1, calledAt: '2026-01-01T09:00:00Z' }),
      ticket({ id: 'b', counterNumber: 1, calledAt: null }),
    ])
    expect(result[1].id).toBe('a')
  })

  it('maps a cross-service call to the calling counter', () => {
    const result = pickLatestByCounter([
      ticket({ id: 'a', counterNumber: 1, serviceType: 'p2tl' }),
    ])
    expect(result[1].serviceType).toBe('p2tl')
  })
})
