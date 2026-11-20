import { lifeStage, petResources, petSingletons, todayISO, type PetFull, type Row } from '@mimascota/shared';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { db } from './db/client';
import * as t from './db/schema';
import { computeReminders } from './services/reminders';

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Tabla Drizzle de cada sub-recurso (clave = key en shared/resources.ts). */
export const resourceTables = {
  vaccinations: t.vaccinations,
  dewormings: t.dewormings,
  medicalRecords: t.medicalRecords,
  labResults: t.labResults,
  appetiteLogs: t.appetiteLogs,
  treatments: t.treatments,
  symptoms: t.symptoms,
  checkups: t.checkups,
} satisfies Record<keyof typeof petResources, unknown>;

export const singletonTables = {
  diet: t.diet,
  habits: t.habits,
} satisfies Record<keyof typeof petSingletons, unknown>;

export type PetRow = typeof t.pets.$inferSelect;

export function findPet(ownerId: number, petId: number): PetRow | undefined {
  return db
    .select()
    .from(t.pets)
    .where(and(eq(t.pets.id, petId), eq(t.pets.ownerId, ownerId)))
    .get();
}

export function listResource(key: keyof typeof resourceTables, petId: number): Row[] {
  const table: any = resourceTables[key];
  const sortBy = (petResources[key] as { sortBy?: string }).sortBy;
  return db
    .select()
    .from(table)
    .where(eq(table.petId, petId))
    .orderBy(...(sortBy ? [desc(table[sortBy])] : []), desc(table.id))
    .all() as Row[];
}

export function remindersFor(ownerId: number, petIds?: number[]) {
  const pets = db
    .select()
    .from(t.pets)
    .where(and(eq(t.pets.ownerId, ownerId), petIds ? inArray(t.pets.id, petIds) : undefined))
    .all();
  const ids = pets.map((p) => p.id);
  if (!ids.length) return [];
  const byPets = (table: any) => db.select().from(table).where(inArray(table.petId, ids)).all() as any[];
  return computeReminders(
    {
      pets,
      vaccinations: byPets(t.vaccinations),
      dewormings: byPets(t.dewormings),
      checkups: byPets(t.checkups),
    },
    todayISO(),
  );
}

export function petFull(ownerId: number, pet: PetRow): PetFull {
  const resources = Object.fromEntries(
    Object.keys(resourceTables).map((k) => [k, listResource(k as keyof typeof resourceTables, pet.id)]),
  );
  const singletons = Object.fromEntries(
    Object.entries(singletonTables).map(([k, table]: [string, any]) => [
      k,
      db.select().from(table).where(eq(table.petId, pet.id)).get() ?? null,
    ]),
  );
  const primaryVet = pet.primaryVetId
    ? (db.select().from(t.vets).where(eq(t.vets.id, pet.primaryVetId)).get() ?? null)
    : null;
  return {
    pet,
    primaryVet,
    lifeStage: lifeStage(pet, todayISO()),
    resources,
    singletons,
    reminders: remindersFor(ownerId, [pet.id]),
  };
}
