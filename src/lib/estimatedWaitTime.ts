import type { QueueTicket, ServiceType } from '../types/queue'
import { getQueueList } from '../services/queue'

export interface EstimatedWait {
  estimatedMinutes: number
  queuePosition: number
  totalAhead: number
  waitingCount: number
  sampleCount: number
}

interface EstimateWaitInput {
  ticket: Pick<QueueTicket, 'id' | 'serviceType' | 'status'> | null
  allTickets: QueueTicket[]
  waitingTickets: QueueTicket[]
}

const OTHER_SERVICE_WEIGHT = 0.7
const FALLBACK_MINUTES = 15

function durationMinutes(start: string, end: string): number {
  return Math.max(0, (new Date(end).getTime() - new Date(start).getTime()) / 60000)
}

export function estimateWait({
  ticket,
  allTickets,
  waitingTickets,
}: EstimateWaitInput): EstimatedWait {
  const serviceType = ticket?.serviceType
  const completed = serviceType
    ? allTickets.filter(
        (item) =>
          item.status === 'completed' &&
          item.serviceType === serviceType &&
          item.calledAt &&
          item.createdAt,
      )
    : []
  const sampleCount = completed.length
  const totalDuration = completed.reduce(
    (sum, item) => sum + durationMinutes(item.createdAt, item.calledAt!),
    0,
  )
  const avgServiceMinutes = sampleCount
    ? Math.max(1, Math.round(totalDuration / sampleCount))
    : FALLBACK_MINUTES

  const sameServiceWaiting = serviceType
    ? waitingTickets.filter((item) => item.status === 'waiting' && item.serviceType === serviceType)
    : []
  const otherServiceWaiting = serviceType
    ? waitingTickets.filter((item) => item.status === 'waiting' && item.serviceType !== serviceType)
    : []

  const currentIndex = ticket
    ? sameServiceWaiting.findIndex((item) => item.id === ticket.id)
    : -1
  const queuePosition = currentIndex >= 0 ? currentIndex + 1 : sameServiceWaiting.length + 1
  const totalAhead =
    Math.max(0, queuePosition - 1) + Math.round(otherServiceWaiting.length * OTHER_SERVICE_WEIGHT)
  const estimatedMinutes = Math.max(1, Math.round(totalAhead * avgServiceMinutes))

  return {
    estimatedMinutes,
    queuePosition,
    totalAhead,
    waitingCount: sameServiceWaiting.length,
    sampleCount,
  }
}

export async function getEstimatedWaitTime(serviceType: ServiceType): Promise<EstimatedWait> {
  const [allTickets, waitingTickets] = await Promise.all([
    getQueueList(),
    getQueueList({ status: 'waiting' }),
  ])

  return estimateWait({
    ticket: { id: 'preview', serviceType, status: 'waiting' },
    allTickets,
    waitingTickets,
  })
}
