import { schemaFor, vetDef, type ResourceDef } from '@mimascota/shared';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { Router } from 'express';
import { db } from '../db/client';
import { vets } from '../db/schema';
import { HttpError, notFound, parseBody, parseId } from '../http';

const vetSchema = schemaFor(vetDef);

/** Verifica que los campos tipo "vet" apunten a veterinarios del usuario. */
export function assertVetsOwned(ownerId: number, def: ResourceDef, values: Record<string, unknown>) {
  const ids = def.fields
    .filter((f) => f.type === 'vet')
    .map((f) => values[f.name])
    .filter((v): v is number => typeof v === 'number');
  if (!ids.length) return;
  const found = db
    .select({ id: vets.id })
    .from(vets)
    .where(and(eq(vets.ownerId, ownerId), inArray(vets.id, ids)))
    .all();
  if (found.length !== new Set(ids).size) throw new HttpError(400, 'Veterinario inválido');
}

export const vetsRouter = Router();

vetsRouter.get('/', (req, res) => {
  res.json(db.select().from(vets).where(eq(vets.ownerId, req.user.id)).orderBy(asc(vets.lastName)).all());
});

vetsRouter.post('/', (req, res) => {
  const data = parseBody(vetSchema, req.body);
  const row = db
    .insert(vets)
    .values({ ...(data as Omit<typeof vets.$inferInsert, "ownerId">), ownerId: req.user.id })
    .returning()
    .get();
  res.status(201).json(row);
});

vetsRouter.put('/:id', (req, res) => {
  const data = parseBody(vetSchema, req.body);
  const row = db
    .update(vets)
    .set(data)
    .where(and(eq(vets.id, parseId(req.params.id)), eq(vets.ownerId, req.user.id)))
    .returning()
    .get();
  if (!row) throw notFound('Veterinario no encontrado');
  res.json(row);
});

vetsRouter.delete('/:id', (req, res) => {
  const row = db
    .delete(vets)
    .where(and(eq(vets.id, parseId(req.params.id)), eq(vets.ownerId, req.user.id)))
    .returning()
    .get();
  if (!row) throw notFound('Veterinario no encontrado');
  res.status(204).end();
});
