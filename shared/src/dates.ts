/** Utilidades de fechas sobre strings ISO `YYYY-MM-DD` (sin zona horaria). */

const DAY_MS = 86_400_000;

function toUTC(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

export function todayISO(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Días desde `from` hasta `to` (negativo si `to` es anterior). */
export function diffDays(from: string, to: string): number {
  return Math.round((toUTC(to) - toUTC(from)) / DAY_MS);
}

export function addDays(iso: string, days: number): string {
  return new Date(toUTC(iso) + days * DAY_MS).toISOString().slice(0, 10);
}

/** Meses completos cumplidos entre `birth` y `today`. */
export function ageInMonths(birth: string, today: string): number {
  const [by, bm, bd] = birth.split('-').map(Number);
  const [ty, tm, td] = today.split('-').map(Number);
  return Math.max(0, (ty - by) * 12 + (tm - bm) - (td < bd ? 1 : 0));
}

export function formatAge(months: number): string {
  if (months < 1) return 'menos de 1 mes';
  if (months < 12) return `${months} ${months === 1 ? 'mes' : 'meses'}`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const y = `${years} ${years === 1 ? 'año' : 'años'}`;
  return rest ? `${y} y ${rest} ${rest === 1 ? 'mes' : 'meses'}` : y;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}
