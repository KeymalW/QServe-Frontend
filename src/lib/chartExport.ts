import type { WeeklyServiceChartRow } from './weeklyCounterChart'
import { getServiceLabel } from './serviceTypes'

const PDF_MARGIN = 12
const PDF_LINE_HEIGHT = 5

export async function downloadTablePdf(
  filename: string,
  title: string,
  headers: string[],
  rows: Array<Array<string | number>>,
  columnWidths?: number[],
) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const usableWidth = pageWidth - PDF_MARGIN * 2
  const widths = columnWidths ?? headers.map(() => usableWidth / headers.length)
  const offsetX = (index: number) =>
    PDF_MARGIN + widths.slice(0, index).reduce((total, width) => total + width, 0)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  const titleLines = doc.splitTextToSize(title, usableWidth)
  doc.text(titleLines, PDF_MARGIN, 14)

  let y = 14 + titleLines.length * 6 + 2

  const drawHeader = () => {
    doc.setFillColor(241, 245, 249)
    doc.rect(PDF_MARGIN, y, usableWidth, 8, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(15, 23, 42)
    headers.forEach((header, index) => {
      doc.text(doc.splitTextToSize(header, widths[index] - 3)[0], offsetX(index) + 1.5, y + 5.5)
    })
    y += 8
  }

  drawHeader()

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(30, 41, 59)
  doc.setFontSize(8)

  rows.forEach((row) => {
    const cellLines = row.map((value, index) =>
      doc.splitTextToSize(String(value), widths[index] - 3),
    )
    const rowHeight = Math.max(...cellLines.map((lines) => lines.length)) * PDF_LINE_HEIGHT + 2

    if (y + rowHeight > pageHeight - PDF_MARGIN) {
      doc.addPage()
      y = PDF_MARGIN
      drawHeader()
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(30, 41, 59)
      doc.setFontSize(8)
    }

    cellLines.forEach((lines, index) => {
      doc.text(lines, offsetX(index) + 1.5, y + 4)
    })
    y += rowHeight
  })

  doc.save(filename)
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

export async function downloadWeeklyChartPdf(rows: WeeklyServiceChartRow[], codes: string[]) {
  const headers = ['Hari', ...codes.map((code) => getServiceLabel(code)), 'Total']
  await downloadTablePdf(
    `diagram-layanan-mingguan-${todaySuffix()}.pdf`,
    `Distribusi Layanan Mingguan - ${todaySuffix()}`,
    headers,
    rows.map((row) => [row.label, ...codes.map((code) => (row[code] as number) ?? 0), row.total]),
    [
      42,
      ...codes.map(() => (186 - 42 - 22) / Math.max(codes.length, 1)),
      22,
    ],
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
