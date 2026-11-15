import { describe, it, expect } from 'vitest'
import { buildAnnouncementSequence } from '../queueAnnouncement'
import { setDynamicServices } from '../serviceTypes'

function speakTexts(sequence: ReturnType<typeof buildAnnouncementSequence>): string[] {
  return sequence.flatMap((step) => (step.kind === 'speak' ? [step.text] : []))
}

describe('buildAnnouncementSequence', () => {
  it('announces the counter number as the destination', () => {
    setDynamicServices([])
    const sequence = buildAnnouncementSequence({
      queueNumber: 'T-001',
      counterNumber: 1,
      serviceType: 'p2tl',
    })
    expect(speakTexts(sequence)).toEqual(['Nomor antrian', 'T-001', 'silakan menuju loket', '1'])
  })

  it('starts with a bell step', () => {
    const sequence = buildAnnouncementSequence({
      queueNumber: 'A-001',
      counterNumber: 2,
      serviceType: 'pengaduan',
    })
    expect(sequence[0]).toEqual({ kind: 'bell', delay: 0 })
  })

  it('falls back to the service label when the counter is unknown', () => {
    setDynamicServices([])
    const sequence = buildAnnouncementSequence({
      queueNumber: 'A-001',
      counterNumber: null,
      serviceType: 'p2tl',
    })
    const texts = speakTexts(sequence)
    expect(texts[texts.length - 1]).toBe('P2TL')
  })
})
