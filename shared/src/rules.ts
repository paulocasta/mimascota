import { ageInMonths } from './dates';

/**
 * Frecuencia de controles veterinarios según etapa de vida:
 * - cachorros/crías: cada 3 a 4 semanas hasta los 4 meses
 * - adultos: al menos 1 vez al año
 * - mayores: cada 6 meses (perros desde los 7-8 años según tamaño)
 */
export const CHECKUP_RULES = {
  babyUntilMonths: 4,
  babyIntervalDays: 28,
  adultIntervalDays: 365,
  seniorIntervalDays: 180,
  /** Edad senior en años. Perros grandes/gigantes (o tamaño desconocido) envejecen antes. */
  seniorAgeYears: {
    perroGrande: 7,
    perroPequenoMediano: 8,
    otros: 10,
  },
} as const;

/** Días de anticipación para marcar un recordatorio como "próximo". */
export const UPCOMING_DAYS = 30;

export type LifeStage = 'cachorro' | 'adulto' | 'senior';

export interface PetForRules {
  species: string;
  size?: string | null;
  birthDate?: string | null;
}

export function seniorAgeYears(pet: PetForRules): number {
  const { seniorAgeYears: s } = CHECKUP_RULES;
  if (pet.species !== 'perro') return s.otros;
  return pet.size === 'pequeno' || pet.size === 'mediano' ? s.perroPequenoMediano : s.perroGrande;
}

export interface LifeStageInfo {
  stage: LifeStage;
  label: string;
  intervalDays: number;
  ageMonths: number | null;
  rule: string;
}

export function lifeStage(pet: PetForRules, today: string): LifeStageInfo {
  const r = CHECKUP_RULES;
  if (!pet.birthDate) {
    return {
      stage: 'adulto',
      label: 'Adulto (sin fecha de nacimiento)',
      intervalDays: r.adultIntervalDays,
      ageMonths: null,
      rule: 'Control al menos 1 vez al año. Cargá la fecha de nacimiento para un cálculo preciso.',
    };
  }
  const months = ageInMonths(pet.birthDate, today);
  if (months < r.babyUntilMonths) {
    return {
      stage: 'cachorro',
      label: pet.species === 'perro' ? 'Cachorro' : pet.species === 'gato' ? 'Gatito' : 'Cría',
      intervalDays: r.babyIntervalDays,
      ageMonths: months,
      rule: 'Control cada 3 a 4 semanas hasta los 4 meses.',
    };
  }
  const seniorYears = seniorAgeYears(pet);
  if (months >= seniorYears * 12) {
    return {
      stage: 'senior',
      label: 'Mayor',
      intervalDays: r.seniorIntervalDays,
      ageMonths: months,
      rule: `Control cada 6 meses (mayor desde los ${seniorYears} años).`,
    };
  }
  return {
    stage: 'adulto',
    label: 'Adulto',
    intervalDays: r.adultIntervalDays,
    ageMonths: months,
    rule: 'Control al menos 1 vez al año.',
  };
}

/** Signos que requieren atención veterinaria inmediata. */
export const URGENCY_SIGNS = [
  'Dificultad para respirar',
  'Abdomen hinchado o rígido',
  'Convulsiones',
  'Sangrado abundante',
  'Dolor intenso',
  'Colapso o desmayo',
] as const;
