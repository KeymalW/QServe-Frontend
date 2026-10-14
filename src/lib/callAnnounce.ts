/** Batas usia panggilan yang masih layak diumumkan (2 menit). */
export const FRESH_CALL_MAX_AGE_MS = 120_000

/**
 * Kunci identitas panggilan untuk guard anti-ulang.
 * Berubah bila tiketnya beda ATAU waktu panggilnya berubah (recall).
 */
export function callAnnounceKey(
  ticket: { id: string; calledAt?: string | null } | null | undefined,
): string | null {
  if (!ticket) return null
  return `${ticket.id}:${ticket.calledAt ?? ''}`
}

/**
 * Panggilan dianggap fresh bila `calledAt`-nya valid dan usianya
 * 0..maxAgeMs. Panggilan basi (mis. sisa dari sebelum halaman dibuka)
 * tidak boleh memicu bunyi.
 */
export function isFreshCall(
  calledAt: string | null | undefined,
  nowMs: number,
  maxAgeMs: number = FRESH_CALL_MAX_AGE_MS,
): boolean {
  if (!calledAt) return false
  const timestamp = new Date(calledAt).getTime()
  if (Number.isNaN(timestamp)) return false
  const age = nowMs - timestamp
  return age >= 0 && age <= maxAgeMs
}
