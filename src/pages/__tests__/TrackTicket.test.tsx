import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import TrackTicket from '../TrackTicket'

const { fetchServices } = vi.hoisted(() => ({
  fetchServices: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('qrcode.react', () => ({
  QRCodeSVG: ({ value }: { value: string }) => (
    <svg data-testid="ticket-qr" data-value={value} />
  ),
}))

vi.mock('../../services/queue', () => ({
  getTicketById: vi.fn().mockResolvedValue({
    id: 'ticket-1',
    queueNumber: 'G-001',
    serviceType: 'pengaduan',
    status: 'waiting',
    counterNumber: null,
    createdAt: new Date('2026-11-20T10:00:00.000Z').toISOString(),
    calledAt: null,
    completedAt: null,
  }),
  getQueueList: vi.fn().mockResolvedValue([]),
}))

vi.mock('../../services/settings', () => ({
  getTicketTextSettings: vi.fn().mockResolvedValue({
    headerText: 'TIKET ANTRIAN',
    subHeaderText: '',
    footerMessage: 'Silakan tunggu nomor Anda dipanggil',
  }),
  getGeneralSettings: vi.fn().mockResolvedValue({
    institutionName: 'PT PLN (Persero)',
  }),
}))

vi.mock('../../store/servicesStore', () => ({
  useServicesStore: (selector: (state: { fetchServices: typeof fetchServices }) => unknown) =>
    selector({ fetchServices }),
}))

describe('TrackTicket QR', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('renders QR codes that point to the tracking URL', async () => {
    vi.stubEnv('VITE_PUBLIC_URL', '')

    render(
      <MemoryRouter initialEntries={['/track/ticket-1']}>
        <Routes>
          <Route path="/track/:id" element={<TrackTicket />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByText('Scan dengan HP untuk memantau status')).toBeInTheDocument()

    const codes = screen.getAllByTestId('ticket-qr')
    expect(codes).toHaveLength(2)
    expect(codes[0].getAttribute('data-value')).toBe(`${window.location.origin}/tunggu/ticket-1`)
    expect(codes[1].getAttribute('data-value')).toBe(`${window.location.origin}/tunggu/ticket-1`)
  })

  it('uses VITE_PUBLIC_URL when configured', async () => {
    vi.stubEnv('VITE_PUBLIC_URL', 'http://192.168.1.7:5173/')

    render(
      <MemoryRouter initialEntries={['/track/ticket-1']}>
        <Routes>
          <Route path="/track/:id" element={<TrackTicket />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByText('Scan dengan HP untuk memantau status')).toBeInTheDocument()

    const codes = screen.getAllByTestId('ticket-qr')
    expect(codes[0].getAttribute('data-value')).toBe('http://192.168.1.7:5173/tunggu/ticket-1')
  })

  it('keeps print and back buttons on the kiosk page', async () => {
    render(
      <MemoryRouter initialEntries={['/track/ticket-1']}>
        <Routes>
          <Route path="/track/:id" element={<TrackTicket />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByRole('button', { name: /Cetak Tiket/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Kembali/i })).toBeInTheDocument()
  })
})
