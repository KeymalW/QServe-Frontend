import { useEffect, useState } from 'react'
import { getQueueList, getTicketById } from '../services/queue'
import { estimateWait } from '../lib/estimatedWaitTime'
import type { EstimatedWait } from '../lib/estimatedWaitTime'
import type { QueueTicket } from '../types/queue'

interface TicketTrackingState {
  ticket: QueueTicket | null
  loading: boolean
  error: string
  estimate: EstimatedWait | null
}

export function useTicketTracking(id?: string): TicketTrackingState {
  const [ticket, setTicket] = useState<QueueTicket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [estimate, setEstimate] = useState<EstimatedWait | null>(null)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    const fetchTicket = async () => {
      try {
        const current = await getTicketById(id)
        if (cancelled) return

        setTicket(current)
        setError('')

        if (current?.status === 'waiting') {
          try {
            const [allTickets, waitingTickets] = await Promise.all([
              getQueueList(),
              getQueueList({ status: 'waiting' }),
            ])
            if (cancelled) return
            setEstimate(estimateWait({ ticket: current, allTickets, waitingTickets }))
          } catch {
            if (!cancelled) setEstimate(null)
          }
        } else {
          setEstimate(null)
        }
      } catch {
        if (!cancelled) setError('Gagal memuat data tiket')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    const pollTimer = setInterval(fetchTicket, 5000)
    void fetchTicket()

    return () => {
      cancelled = true
      clearInterval(pollTimer)
    }
  }, [id])

  return { ticket, loading, error, estimate }
}
