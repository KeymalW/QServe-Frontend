import type { QueueTicket } from '../types/queue'

/**
 * Pilih tiket called/serving terbaru untuk tiap nomor loket.
 * Tiket tanpa counterNumber (mis. masih waiting) diabaikan.
 */
export function pickLatestByCounter(tickets: QueueTicket[]): Record<number, QueueTicket> {
  const byCounter: Record<number, QueueTicket> = {}
  for (const ticket of tickets) {
    if (ticket.counterNumber == null) continue
    const prev = byCounter[ticket.counterNumber]
    if (!prev || (ticket.calledAt && (!prev.calledAt || ticket.calledAt > prev.calledAt))) {
      byCounter[ticket.counterNumber] = ticket
    }
  }
  return byCounter
}
