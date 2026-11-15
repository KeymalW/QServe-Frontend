import type { QueueTicket } from '../types/queue'

/**
 * Loket dianggap idle bila tidak ada satu pun tiket aktif (called/serving)
 * yang sedang dipegang loket ini, di seluruh layanan.
 */
export function isCounterIdle(activeByService: Record<string, QueueTicket | null>): boolean {
  return !Object.values(activeByService).some(Boolean)
}

/**
 * Tiket menunggu dari layanan lain (selain layanan yang sedang dipilih).
 * Urutan mengikuti daftar sumber — pemanggil biasanya sudah mengurutkannya.
 */
export function getOverflowSuggestions(
  waitingList: QueueTicket[],
  selectedCode: string | null,
): QueueTicket[] {
  return waitingList.filter((ticket) => ticket.serviceType !== selectedCode)
}
