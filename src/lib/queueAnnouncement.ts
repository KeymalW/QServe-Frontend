import type { QueueTicket } from '../types/queue'
import { getServiceLabel } from './serviceTypes'

export type AnnouncementStep =
  | { kind: 'bell'; delay: number }
  | { kind: 'speak'; text: string; delay: number }

/**
 * Rangkaian pengumuman suara untuk satu panggilan antrian.
 * Tujuan panggilan adalah NOMOR LOKET, bukan nama layanan — penting agar
 * panggilan lintas layanan mengarahkan pelanggan ke loket yang benar.
 * Bila nomor loket tidak tersedia, fallback ke nama layanan.
 */
export function buildAnnouncementSequence(
  ticket: Pick<QueueTicket, 'queueNumber' | 'counterNumber' | 'serviceType'>,
): AnnouncementStep[] {
  const destination =
    ticket.counterNumber != null ? String(ticket.counterNumber) : getServiceLabel(ticket.serviceType)

  return [
    { kind: 'bell', delay: 0 },
    { kind: 'speak', text: 'Nomor antrian', delay: 650 },
    { kind: 'speak', text: ticket.queueNumber, delay: 500 },
    { kind: 'speak', text: 'silakan menuju loket', delay: 500 },
    { kind: 'speak', text: destination, delay: 500 },
  ]
}
