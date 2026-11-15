import { useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { LogOutIcon } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useSettingsStore } from '../../store/settingsStore'
import { useThemeStore } from '../../store/themeStore'
import { logout as logoutApi } from '../../services/auth'
import { cn } from '../../lib/utils'
import { InstitutionLogo } from '../brand/InstitutionLogo'
import { PageTransition } from '../layout/PageTransition'

const NAV_ITEMS = [
  { to: '/petugas', label: 'Dashboard', end: true },
  { to: '/petugas/laporan', label: 'Laporan', end: false },
] as const

export function PetugasLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { general, fetchGeneral } = useSettingsStore()
  const fetchTheme = useThemeStore((state) => state.fetchTheme)

  useEffect(() => {
    void fetchGeneral()
    void fetchTheme()
  }, [fetchGeneral, fetchTheme])

  const appName = general?.institutionName?.trim()

  const handleLogout = async () => {
    try {
      await logoutApi()
    } catch {
      toast.error('Gagal logout dari server')
    }
    logout()
    navigate('/login')
  }

  return (
    <div className="admin-theme min-h-screen bg-background">
      {/* Header tipis — logo instansi kiri, identitas petugas kanan */}
      <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-card/85 px-4 backdrop-blur sm:px-6 relative">
        <div
          className="theme-primary-bg pointer-events-none absolute inset-x-0 top-0 h-0.5"
          aria-hidden="true"
        />
        <div className="flex min-w-0 items-center gap-3">
          <InstitutionLogo
            src={general?.logoUrl}
            alt="Logo instansi"
            className="h-8 w-auto max-w-[8rem] object-contain"
            placeholderClassName="size-8"
          />
          {appName && (
            <span className="hidden truncate text-sm font-semibold text-foreground sm:block">
              {appName}
            </span>
          )}
        </div>

        <nav className="flex items-center gap-1" aria-label="Navigasi petugas">
          {NAV_ITEMS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-1.5 text-sm transition-colors',
                  isActive
                    ? 'bg-[var(--theme-primary-soft)] font-medium text-[var(--theme-primary-dark)] ring-1 ring-[var(--theme-accent-soft)]'
                    : 'text-muted-foreground hover:bg-accent/70 hover:text-foreground'
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden text-right leading-tight sm:block">
            <div className="text-xs font-medium text-foreground">{user?.name}</div>
            <div className="text-[11px] capitalize text-muted-foreground">
              Petugas{user?.counterNumber ? ` • Loket ${user.counterNumber}` : ''}
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Keluar"
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOutIcon className="size-4" />
          </button>
        </div>
      </header>

      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  )
}
