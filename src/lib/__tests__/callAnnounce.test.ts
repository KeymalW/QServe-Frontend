import { describe, it, expect } from 'vitest'
import { callAnnounceKey, isFreshCall, FRESH_CALL_MAX_AGE_MS } from '../callAnnounce'

describe('callAnnounceKey', () => {
  it('returns null for missing ticket', () => {
    expect(callAnnounceKey(null)).toBeNull()
    expect(callAnnounceKey(undefined)).toBeNull()
  })

  it('combines id and calledAt', () => {
    expect(callAnnounceKey({ id: 't1', calledAt: '2026-01-01T10:00:00Z' })).toBe(
      't1:2026-01-01T10:00:00Z',
    )
  })

  it('uses empty calledAt part when missing', () => {
    expect(callAnnounceKey({ id: 't1', calledAt: null })).toBe('t1:')
    expect(callAnnounceKey({ id: 't1' })).toBe('t1:')
  })
})

describe('isFreshCall', () => {
  it('accepts a call made 30 seconds ago', () => {
    const now = Date.now()
    const calledAt = new Date(now - 30_000).toISOString()
    expect(isFreshCall(calledAt, now)).toBe(true)
  })

  it('rejects a stale call older than the max age', () => {
    const now = Date.now()
    const calledAt = new Date(now - FRESH_CALL_MAX_AGE_MS - 1000).toISOString()
    expect(isFreshCall(calledAt, now)).toBe(false)
  })

  it('rejects future timestamps', () => {
    const now = Date.now()
    const calledAt = new Date(now + 60_000).toISOString()
    expect(isFreshCall(calledAt, now)).toBe(false)
  })

  it('rejects missing or invalid timestamps', () => {
    const now = Date.now()
    expect(isFreshCall(null, now)).toBe(false)
    expect(isFreshCall(undefined, now)).toBe(false)
    expect(isFreshCall('not-a-date', now)).toBe(false)
  })

  it('respects a custom max age', () => {
    const now = Date.now()
    const calledAt = new Date(now - 5000).toISOString()
    expect(isFreshCall(calledAt, now, 1000)).toBe(false)
    expect(isFreshCall(calledAt, now, 10_000)).toBe(true)
  })
})
