import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, CheckCircle2, Clock, Loader2 } from 'lucide-react'
import { useTicketTracking } from '../hooks/useTicketTracking'
import { statusColors, statusDotColors, statusLabels } from '../lib/ticketStatus'
import { getServiceLabel } from '../lib/serviceTypes'
import { useServicesStore } from '../store/servicesStore'

export default function WaitingTicket() {
  const { id } = useParams<{ id: string }>()
  const { ticket, loading, error, estimate } = useTicketTracking(id)
  const fetchServices = useServicesStore((state) => state.fetchServices)

  useEffect(() => {
    void fetchServices()
  }, [fetchServices])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 size-8 animate-spin text-pln-cyan" />
          <p className="text-sm text-muted-foreground">Mencari tiket...</p>
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-5">
        <div className="w-full max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 size-12 text-destructive" />
          <h1 className="mb-2 text-xl font-bold">Tiket Tidak Ditemukan</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            {error || 'Tiket dengan ID tersebut tidak ada'}
          </p>
          <Link
            to="/kiosk"
            className="inline-flex items-center gap-2 text-sm text-pln-cyan hover:underline"
          >
            <ArrowLeft className="size-4" />
            Ambil tiket baru
          </Link>
        </div>
      </div>
    )
  }

  const isWaiting = ticket.status === 'waiting'

  return (
    <div className="safe-bottom flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-md text-center">
        <div className="mb-8 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-pln-cyan opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-pln-cyan" />
          </span>
          Live · diperbarui tiap 5 detik
        </div>

        <div
          role="status"
          aria-live="polite"
          className={`mx-auto mb-8 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold ring-1 ${statusColors[ticket.status]}`}
        >
          <span className={`size-2 rounded-full ${statusDotColors[ticket.status]}`} />
          {statusLabels[ticket.status] || ticket.status}
        </div>

        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Nomor Antrian Kamu
        </div>
        <div className="my-3 text-6xl font-bold tabular-nums tracking-tight text-pln-cyan sm:text-7xl">
          {ticket.queueNumber}
        </div>
        <div className="mb-8 text-sm font-medium text-muted-foreground">
          {getServiceLabel(ticket.serviceType)}
        </div>

        {isWaiting && estimate && (
          <div className="rounded-3xl bg-card p-6 shadow-lg ring-1 ring-pln-cyan/20">
            <Clock className="mx-auto mb-3 size-6 text-pln-cyan" />
            <div className="text-sm text-muted-foreground">Perkiraan dipanggil</div>
            <div data-testid="estimated-wait" className="my-1 text-4xl font-bold tabular-nums text-foreground">
              ±{estimate.estimatedMinutes} menit
            </div>
            <div className="text-xs text-muted-foreground">
              {estimate.sampleCount > 0
                ? `berdasarkan ${estimate.sampleCount} tiket sebelumnya`
                : 'estimasi awal'}
            </div>
            <div data-testid="queue-position" className="mt-5 border-t border-border pt-4 text-sm">
              Antrian ke-<strong>{estimate.queuePosition}</strong> untuk layanan ini
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Estimasi, bukan jadwal pasti
            </div>
          </div>
        )}

        {isWaiting && !estimate && (
          <div className="rounded-3xl bg-pln-cyan/5 p-6 text-sm text-muted-foreground ring-1 ring-pln-cyan/15">
            Silakan tunggu nomor kamu dipanggil. Halaman ini diperbarui otomatis.
          </div>
        )}

        {ticket.status === 'called' && ticket.counterNumber && (
          <div className="rounded-3xl bg-green-50 p-7 text-green-900 ring-1 ring-green-200">
            <CheckCircle2 className="mx-auto mb-3 size-8 animate-pulse" />
            <div className="text-sm font-medium">Nomor kamu sedang dipanggil</div>
            <div className="my-2 text-5xl font-bold tabular-nums">Loket {ticket.counterNumber}</div>
            <div className="text-sm">Silakan menuju loket tersebut sekarang.</div>
          </div>
        )}

        {ticket.status === 'serving' && ticket.counterNumber && (
          <div className="rounded-3xl bg-blue-50 p-7 text-blue-900 ring-1 ring-blue-200">
            <CheckCircle2 className="mx-auto mb-3 size-8" />
            <div className="text-sm font-medium">Sedang dilayani</div>
            <div className="my-2 text-4xl font-bold tabular-nums">Loket {ticket.counterNumber}</div>
          </div>
        )}

        {ticket.status === 'completed' && (
          <div className="rounded-3xl bg-card p-7 text-sm text-muted-foreground ring-1 ring-border">
            Tiket ini sudah selesai diproses. Terima kasih.
          </div>
        )}

        {ticket.status === 'skipped' && (
          <div className="rounded-3xl bg-red-50 p-7 text-sm text-red-800 ring-1 ring-red-200">
            Tiket ini dilewati. Silakan kembali ke kiosk untuk mengambil tiket baru.
          </div>
        )}

        <p className="mt-8 text-[11px] text-muted-foreground">
          Jangan tutup halaman ini selama menunggu.
        </p>
      </div>
    </div>
  )
}
