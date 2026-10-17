import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { InstitutionLogo } from '../InstitutionLogo'

function getLogo(name = 'Logo instansi') {
  return screen.getByRole('img', { name })
}

describe('InstitutionLogo', () => {
  it('menampilkan gambar saat src terisi', () => {
    render(<InstitutionLogo src="/logo.png" alt="Logo instansi" />)
    const img = getLogo()
    expect(img.tagName).toBe('IMG')
    expect(img).toHaveAttribute('src', '/logo.png')
  })

  it('menampilkan placeholder saat src kosong', () => {
    render(<InstitutionLogo src="" alt="Logo instansi" />)
    expect(getLogo().tagName).toBe('SPAN')
    expect(screen.queryByRole('presentation')).not.toBeInTheDocument()
  })

  it('menampilkan placeholder saat src tidak diberikan', () => {
    render(<InstitutionLogo />)
    expect(getLogo().tagName).toBe('SPAN')
  })

  it('menampilkan placeholder saat src hanya spasi', () => {
    render(<InstitutionLogo src="   " alt="Logo instansi" />)
    expect(getLogo().tagName).toBe('SPAN')
  })

  it('beralih ke placeholder saat gambar gagal dimuat', () => {
    render(<InstitutionLogo src="/rusak.png" alt="Logo instansi" />)
    fireEvent.error(getLogo())
    expect(getLogo().tagName).toBe('SPAN')
  })
})
