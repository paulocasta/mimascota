import type { LifeStageInfo } from './rules';

export type Row = Record<string, unknown> & { id: number };

export interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string | null;
  sex: string | null;
  birthDate: string | null;
  birthDateIsEstimate: boolean;
  reproductiveStatus: string | null;
  size: string | null;
  weightKg: number | null;
  microchip: string | null;
  primaryVetId: number | null;
  photoPath: string | null;
  notes: string | null;
}

export interface Vet {
  id: number;
  firstName: string;
  lastName: string;
  clinic: string | null;
  licenseNumber: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  isEmergency: boolean;
  notes: string | null;
}

export type ReminderKind = 'vacuna' | 'desparasitacion' | 'control';
export type ReminderStatus = 'vencido' | 'pendiente' | 'proximo' | 'al_dia';

export interface Reminder {
  petId: number;
  petName: string;
  kind: ReminderKind;
  title: string;
  dueDate: string | null;
  status: ReminderStatus;
  /** Días restantes (negativo = vencido). Null si no hay fecha. */
  daysLeft: number | null;
}

export interface PetFull {
  pet: Pet;
  primaryVet: Vet | null;
  lifeStage: LifeStageInfo;
  resources: Record<string, Row[]>;
  singletons: Record<string, Record<string, unknown> | null>;
  reminders: Reminder[];
}
