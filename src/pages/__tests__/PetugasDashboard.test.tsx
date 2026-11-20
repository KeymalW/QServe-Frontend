import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ServiceDefinition } from '../../types/admin'
import type { QueueStats, QueueTicket } from '../../types/queue'
import PetugasDashboard from '../PetugasDashboard'

const {
  getQueueListMock,
  getQueueStatsMock,
  playBeep,
  unlockAudio,
  services,
  waitingList,
  queueStore,
  fetchServices,
} = vi.hoisted(() => {
  const makeTicket = (
    id: string,
    queueNumber: string,
    serviceType: QueueTicket['serviceType'],
  ): QueueTicket => ({
    id,
    queueNumber,
    serviceType,
    status: 'waiting',
    counterNumber: null,
    createdAt: '2026-11-20T10:00:00.000Z',
    calledAt: null,
    completedAt: null,
  })

  const services: ServiceDefinition[] = [
    {
      id: 's1',
      name: 'Pengaduan',
      code: 'pengaduan',
      prefix: 'A',
      counterNumber: null,
      icon: null,
      serviceGroup: 'group_a',
      isActive: true,
      showInKiosk: true,
    },
    {
      id: 's2',
      name: 'PB/PD/Migrasi',
      code: 'pb_pd_migrasi',
      prefix: 'B',
      counterNumber: null,
      icon: null,
      serviceGroup: 'group_a',
      isActive: true,
      showInKiosk: true,
    },
    {
      id: 's3',
      name: 'P2TL',
      code: 'p2tl',
      prefix: 'C',
      counterNumber: null,
      icon: null,
      serviceGroup: 'group_b',
      isActive: true,
      showInKiosk: true,
    },
  ]

  const waitingList: QueueTicket[] = [
    makeTicket('t1', 'A-001', 'pengaduan'),
    makeTicket('t2', 'B-001', 'pb_pd_migrasi'),
    makeTicket('t3', 'C-001', 'p2tl'),
  ]

  const stats: QueueStats = {
    total: 3,
    waiting: 3,
    called: 0,
    serving: 0,
    completed: 0,
    skipped: 0,
  }

  return {
    getQueueListMock: vi.fn(),
    getQueueStatsMock: vi.fn().mockResolvedValue(stats),
    playBeep: vi.fn(),
    unlockAudio: vi.fn().mockResolvedValue(undefined),
    services,
    waitingList,
    stats,
    queueStore: {
      queueList: waitingList,
      setQueueList: vi.fn(),
      stats,
      setStats: vi.fn(),
      counterStatus: {} as Record<number, boolean>,
      setCounterStatus: vi.fn(),
    },
    fetchServices: vi.fn().mockResolvedValue(undefined),
  }
})

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() },
}))

vi.mock('../../store/authStore', () => ({
  useAuthStore: () => ({ user: { name: 'Petugas 1', counterNumber: 1 } }),
}))

vi.mock('../../store/queueStore', () => ({
  useQueueStore: () => queueStore,
}))

vi.mock('../../store/servicesStore', () => ({
  useServicesStore: Object.assign(() => ({ services, fetchServices }), {
    getState: () => ({ services }),
  }),
}))

vi.mock('../../hooks/useWebSocket', () => ({
  useWebSocket: vi.fn(),
}))

vi.mock('../../hooks/useQueueSound', () => ({
  useQueueSound: () => ({ playBeep, unlockAudio }),
}))

vi.mock('../../services/queue', () => ({
  getQueueList: getQueueListMock,
  getQueueStats: getQueueStatsMock,
  callQueue: vi.fn(),
  skipQueue: vi.fn(),
  completeQueue: vi.fn(),
  recallQueue: vi.fn(),
  clearQueueHistory: vi.fn().mockResolvedValue(undefined),
}))

describe('PetugasDashboard daftar tunggu per layanan', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getQueueListMock.mockImplementation(async (params?: { status?: string }) =>
      params?.status === 'waiting' ? waitingList : [],
    )
  })

  it('hanya menampilkan tiket layanan terpilih di Antrian Menunggu', async () => {
    render(<PetugasDashboard />)

    await waitFor(() => expect(screen.getAllByText('A-001')).toHaveLength(1))
    expect(screen.getByText('Antrian Menunggu — Pengaduan')).toBeInTheDocument()
    expect(screen.getAllByText('B-001')).toHaveLength(1)
    expect(screen.getAllByText('C-001')).toHaveLength(1)
    expect(screen.getByText('Layanan Lain Menunggu')).toBeInTheDocument()
  })

  it('mengganti isi daftar saat tab layanan diganti', async () => {
    render(<PetugasDashboard />)

    await waitFor(() => expect(screen.getAllByText('A-001')).toHaveLength(1))
    fireEvent.click(screen.getByRole('tab', { name: /P2TL/i }))

    await waitFor(() => expect(screen.getAllByText('C-001')).toHaveLength(1))
    expect(screen.getByText('Antrian Menunggu — P2TL')).toBeInTheDocument()
    expect(screen.getAllByText('A-001')).toHaveLength(1)
    expect(screen.getAllByText('B-001')).toHaveLength(1)
    expect(screen.getAllByText('C-001')).toHaveLength(1)
  })
})
