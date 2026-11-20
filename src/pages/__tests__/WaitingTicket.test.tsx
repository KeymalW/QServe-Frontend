import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { QueueTicket } from '../../types/queue'
import WaitingTicket from '../WaitingTicket'

const { getTicketByIdMock, getQueueListMock, fetchServices, vibrateMock } = vi.hoisted(() => ({
  getTicketByIdMock: vi.fn(),
  getQueueListMock: vi.fn(),
  fetchServices: vi.fn().mockResolvedValue(undefined),
  vibrateMock: vi.fn(),
}))

vi.mock('../../services/queue', () => ({
  getTicketById: getTicketByIdMock,
  getQueueList: getQueueListMock,
}))

vi.mock('../../store/servicesStore', () => ({
  useServicesStore: (selector: (state: { fetchServices: typeof fetchServices }) => unknown) =>
    selector({ fetchServices }),
}))

const waitingTicket: QueueTicket = {
  id: 'ticket-1',
  queueNumber: 'G-001',
  serviceType: 'pengaduan',
  status: 'waiting',
  counterNumber: null,
  createdAt: '2026-11-20T10:00:00.000Z',
  calledAt: null,
  completedAt: null,
}

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/tunggu/ticket-1']}>
      <Routes>
        <Route path="/tunggu/:id" element={<WaitingTicket />} />
      </Routes>
    </MemoryRouter>
  )

describe('WaitingTicket', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: vibrateMock,
    })
    getTicketByIdMock.mockResolvedValue(waitingTicket)
    getQueueListMock.mockImplementation(async (params?: { status?: string }) => {
      if (params?.status === 'waiting') {
        return [
          { ...waitingTicket, id: 'ticket-0', queueNumber: 'G-000' },
          waitingTicket,
        ]
      }
      return [
        {
          ...waitingTicket,
          id: 'done-1',
          status: 'completed',
          createdAt: '2026-11-20T09:00:00.000Z',
          calledAt: '2026-11-20T09:10:00.000Z',
        },
        {
          ...waitingTicket,
          id: 'done-2',
          status: 'completed',
          createdAt: '2026-11-20T09:20:00.000Z',
          calledAt: '2026-11-20T09:40:00.000Z',
        },
        waitingTicket,
      ]
    })
  })

  it('shows status, queue position, and estimated wait from backend data', async () => {
    renderPage()

    expect(await screen.findByTestId('estimated-wait')).toHaveTextContent('±15 menit')
    expect(screen.getByTestId('queue-position')).toHaveTextContent('Antrian ke-2 untuk layanan ini')
    expect(screen.getByText('berdasarkan 2 tiket sebelumnya')).toBeInTheDocument()
    expect(screen.getByText('Menunggu')).toBeInTheDocument()
    expect(screen.queryByText(/diperbarui tiap 5 detik/i)).not.toBeInTheDocument()
    expect(vibrateMock).not.toHaveBeenCalled()
  })

  it('has no navigation controls on the waiting page', async () => {
    renderPage()

    expect(await screen.findByText('G-001')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByText(/Ambil tiket baru/)).not.toBeInTheDocument()
  })

  it('shows the counter clearly when the ticket is called', async () => {
    getTicketByIdMock.mockResolvedValue({
      ...waitingTicket,
      status: 'called',
      counterNumber: 2,
      calledAt: '2026-11-20T10:05:00.000Z',
    })

    renderPage()

    expect(await screen.findByText('Loket 2')).toBeInTheDocument()
    expect(screen.getByText('Dipanggil')).toBeInTheDocument()
    expect(screen.queryByTestId('estimated-wait')).not.toBeInTheDocument()
    expect(vibrateMock).toHaveBeenCalledTimes(1)
    expect(vibrateMock).toHaveBeenCalledWith([200, 100, 200])
  })
})
