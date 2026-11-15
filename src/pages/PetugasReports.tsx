import { useCallback, useEffect, useMemo, useState, lazy, Suspense } from 'react'
import { toast } from 'sonner'
import { BarChart3Icon, RefreshCwIcon } from 'lucide-react'
import { getWeeklyQueueList } from '../services/queue'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { Spinner } from '../components/ui/spinner'
import { PageHeader } from '../components/admin/PageHeader'
import { useServicesStore } from '../store/servicesStore'
import { buildWeeklyCounterChartData } from '../lib/weeklyCounterChart'
import { getWeekRangeLabel } from '../lib/datetime'
import type { QueueTicket } from '../types/queue'

const ServiceSummaryChart = lazy(() =>
  import('../components/dashboard/ServiceSummaryChart').then((module) => ({
    default: module.ServiceSummaryChart,
  })),
)

function ChartSkeleton() {
  return <Skeleton className="h-[26rem] w-full rounded-xl" />
}

export default function PetugasReports() {
  const [tickets, setTickets] = useState<QueueTicket[]>([])
  const [loading, setLoading] = useState(true)
  // Berlangganan katalog agar grafik mengikuti Kelola Layanan.
  const services = useServicesStore((state) => state.services)
  const fetchServices = useServicesStore((state) => state.fetchServices)
  const catalogCodes = useMemo(() => services.map((service) => service.code), [services])

  useEffect(() => {
    void fetchServices()
  }, [fetchServices])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getWeeklyQueueList()
      setTickets(data)
    } catch {
      if (import.meta.env.DEV) console.error('Failed to fetch weekly report')
      toast.error('Gagal memuat laporan mingguan')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => void fetchData(), 0)
    return () => window.clearTimeout(timer)
  }, [fetchData])

  const chart = buildWeeklyCounterChartData(tickets, catalogCodes)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Perbandingan Loket Mingguan"
        description={`Minggu ini: ${getWeekRangeLabel()} (Senin–Jumat)`}
        actions={
          <Button variant="outline" size="sm" onClick={() => void fetchData()} disabled={loading}>
            {loading ? <Spinner data-icon="inline-start" /> : <RefreshCwIcon />}
            Refresh
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <Suspense fallback={<ChartSkeleton />}>
              <ServiceSummaryChart rows={chart.rows} codes={chart.codes} embedded />
            </Suspense>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <BarChart3Icon className="size-4" aria-hidden="true" />
        Distribusi tiket per layanan untuk hari kerja Senin sampai Jumat.
      </div>
    </div>
  )
}
