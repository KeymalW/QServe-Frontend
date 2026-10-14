import type { WeeklyServiceChartRow } from './weeklyCounterChart'
import { getServiceLabel } from './serviceTypes'

function escapeCsv(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }

  return value
}

export function downloadTableCsv(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number>>,
) {
  const lines = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => row.map((value) => escapeCsv(String(value))).join(',')),
  ]

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  anchor.click()

  URL.revokeObjectURL(url)
}

export async function downloadTableExcel(
  filename: string,
  sheetName: string,
  rows: Array<Record<string, string | number>>,
) {
  const XLSX = await import('xlsx')
  const workbook = XLSX.utils.book_new()
  const sheet = XLSX.utils.json_to_sheet(rows)

  XLSX.utils.book_append_sheet(workbook, sheet, sheetName)
  XLSX.writeFile(workbook, filename)
}

function todaySuffix() {
  return new Date().toISOString().slice(0, 10)
}

export function downloadWeeklyChartCsv(rows: WeeklyServiceChartRow[], codes: string[]) {
  downloadTableCsv(
    `diagram-layanan-mingguan-${todaySuffix()}.csv`,
    ['Hari', ...codes.map((code) => getServiceLabel(code)), 'Total'],
    rows.map((row) => [row.label, ...codes.map((code) => (row[code] as number) ?? 0), row.total]),
  )
}

export async function downloadWeeklyChartExcel(rows: WeeklyServiceChartRow[], codes: string[]) {
  await downloadTableExcel(
    `diagram-layanan-mingguan-${todaySuffix()}.xlsx`,
    'Mingguan',
    rows.map((row) => ({
      Hari: row.label,
      ...Object.fromEntries(codes.map((code) => [getServiceLabel(code), (row[code] as number) ?? 0])),
      Total: row.total,
    })),
  )
}
