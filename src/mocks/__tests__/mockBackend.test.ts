import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { ServiceType } from '../../types/queue'

type MockBackend = typeof import('../mockBackend')

async function loadMock(): Promise<MockBackend> {
  return import('../mockBackend')
}

describe('mockBackend — identitas tenant baru', () => {
  let mock: MockBackend

  beforeEach(async () => {
    sessionStorage.clear()
    localStorage.clear()
    vi.resetModules()
    mock = await loadMock()
  })

  it('mengosongkan logo dan mengisi nama perusahaan saat registrasi', () => {
    mock.mockUpdateGeneralSettings({ institutionName: 'PT Lama', logoUrl: '/assets/logo-lama.png' })

    mock.mockRegister({
      companyName: 'PT Baru',
      name: 'Admin Baru',
      username: 'adminbaru',
      password: 'secret123',
      password_confirmation: 'secret123',
    })

    expect(mock.mockGetGeneralSettings()).toEqual({
      institutionName: 'PT Baru',
      logoUrl: '',
    })
  })

  it('mengosongkan teks kiosk dan daftar video tenant sebelumnya', () => {
    mock.mockUpdateKioskText({ welcomeText: 'Halo Lama', footerText: 'Footer Lama' })
    mock.mockAddVideoLink('https://contoh.com/video.mp4', 'Video Lama')

    mock.mockRegister({
      companyName: 'PT Bersih',
      name: 'Admin Bersih',
      username: 'adminbersih',
      password: 'secret123',
      password_confirmation: 'secret123',
    })

    expect(mock.mockGetKioskText()).toEqual({
      welcomeText: '',
      subtitleText: '',
      hintText: '',
      footerText: '',
    })
    expect(mock.mockGetVideoLinks()).toEqual([])
  })
})

describe('mockBackend — nomor tiket mengikuti Kelola Layanan', () => {
  let mock: MockBackend

  beforeEach(async () => {
    sessionStorage.clear()
    localStorage.clear()
    vi.resetModules()
    mock = await loadMock()
  })

  it('memakai prefix layanan bawaan katalog', () => {
    const ticket = mock.mockTakeTicket('pengaduan')
    expect(ticket.queueNumber).toBe('G-005')
  })

  it('memakai prefix layanan yang baru dibuat (bukan hardcode)', () => {
    mock.mockCreateService({
      name: 'Layanan Konsultasi',
      code: 'konsultasi',
      prefix: 'K',
      counterNumber: 4,
      icon: null,
      serviceGroup: 'group_a',
      isActive: true,
      showInKiosk: true,
    })

    const ticket = mock.mockTakeTicket('konsultasi' as unknown as ServiceType)
    expect(ticket.queueNumber).toBe('K-001')
  })

  it('mengikuti perubahan prefix di katalog untuk tiket berikutnya', () => {
    const service = mock.mockCreateService({
      name: 'Layanan X',
      code: 'layanan_x',
      prefix: 'X',
      counterNumber: 5,
      icon: null,
      serviceGroup: 'group_a',
      isActive: true,
      showInKiosk: true,
    })

    expect(mock.mockTakeTicket('layanan_x' as unknown as ServiceType).queueNumber).toBe('X-001')

    mock.mockUpdateService(service.id, { prefix: 'Z' })
    expect(mock.mockTakeTicket('layanan_x' as unknown as ServiceType).queueNumber).toBe('Z-002')
  })

  it('memulai urutan dari 001 setelah registrasi tenant baru', () => {
    mock.mockRegister({
      companyName: 'PT Segar',
      name: 'Admin Segar',
      username: 'adminsegar',
      password: 'secret123',
      password_confirmation: 'secret123',
    })

    const ticket = mock.mockTakeTicket('pengaduan')
    expect(ticket.queueNumber).toBe('G-001')
  })
})
