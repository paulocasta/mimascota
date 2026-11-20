import {
  UPCOMING_DAYS,
  addDays,
  diffDays,
  lifeStage,
  type PetForRules,
  type Reminder,
  type ReminderStatus,
} from '@mimascota/shared';

export interface ReminderInput {
  pets: (PetForRules & { id: number; name: string })[];
  vaccinations: { petId: number; name: string; dateApplied: string; nextDue: string | null }[];
  dewormings: { petId: number; type: string; product: string; dateApplied: string; nextDue: string | null }[];
  checkups: { petId: number; date: string }[];
}

const STATUS_ORDER: Record<ReminderStatus, number> = { vencido: 0, pendiente: 1, proximo: 2, al_dia: 3 };

export function statusFor(due: string | null, today: string): { status: ReminderStatus; daysLeft: number | null } {
  if (!due) return { status: 'pendiente', daysLeft: null };
  const daysLeft = diffDays(today, due);
  return { status: daysLeft < 0 ? 'vencido' : daysLeft <= UPCOMING_DAYS ? 'proximo' : 'al_dia', daysLeft };
}

/** Se queda con el registro más reciente por clave (el refuerzo más nuevo reemplaza al anterior). */
function latestBy<T extends { petId: number; dateApplied: string }>(rows: T[], key: (r: T) => string): T[] {
  const map = new Map<string, T>();
  for (const r of rows) {
    const k = `${r.petId}|${key(r)}`;
    const prev = map.get(k);
    if (!prev || r.dateApplied > prev.dateApplied) map.set(k, r);
  }
  return [...map.values()];
}

/**
 * Calcula recordatorios de vacunas, desparasitaciones y controles.
 * Devuelve todos (incluidos los "al día"); el llamador filtra según necesite.
 */
export function computeReminders(input: ReminderInput, today: string): Reminder[] {
  const petsById = new Map(input.pets.map((p) => [p.id, p]));
  const out: Reminder[] = [];

  for (const v of latestBy(input.vaccinations, (r) => r.name.trim().toLowerCase())) {
    const pet = petsById.get(v.petId);
    if (!pet || !v.nextDue) continue;
    out.push({ petId: pet.id, petName: pet.name, kind: 'vacuna', title: `Refuerzo: ${v.name}`, dueDate: v.nextDue, ...statusFor(v.nextDue, today) });
  }

  for (const d of latestBy(input.dewormings, (r) => r.type)) {
    const pet = petsById.get(d.petId);
    if (!pet || !d.nextDue) continue;
    out.push({
      petId: pet.id,
      petName: pet.name,
      kind: 'desparasitacion',
      title: `Desparasitación ${d.type}: ${d.product}`,
      dueDate: d.nextDue,
      ...statusFor(d.nextDue, today),
    });
  }

  const lastCheckup = new Map<number, string>();
  for (const c of input.checkups) {
    const prev = lastCheckup.get(c.petId);
    if (!prev || c.date > prev) lastCheckup.set(c.petId, c.date);
  }

  for (const pet of input.pets) {
    const stage = lifeStage(pet, today);
    const last = lastCheckup.get(pet.id);
    const due = last ? addDays(last, stage.intervalDays) : null;
    out.push({
      petId: pet.id,
      petName: pet.name,
      kind: 'control',
      title: last ? `Control veterinario (${stage.label.toLowerCase()})` : 'Sin controles registrados',
      dueDate: due,
      ...statusFor(due, today),
    });
  }

  return out.sort(
    (a, b) =>
      STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
      (a.daysLeft ?? -Infinity) - (b.daysLeft ?? -Infinity) ||
      a.petName.localeCompare(b.petName),
  );
}
