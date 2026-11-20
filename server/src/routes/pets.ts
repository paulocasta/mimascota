import { petDef, petResources, petSingletons, schemaFor } from '@mimascota/shared';
import { and, asc, eq } from 'drizzle-orm';
import { Router, type Request } from 'express';
import multer from 'multer';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { UPLOADS_DIR, db } from '../db/client';
import { pets } from '../db/schema';
import { findPet, listResource, petFull, resourceTables, singletonTables, type PetRow } from '../data';
import { HttpError, notFound, parseBody, parseId } from '../http';
import { assertVetsOwned } from './vets';

/* eslint-disable @typescript-eslint/no-explicit-any */

const petSchema = schemaFor(petDef);

const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS_DIR,
    filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${IMAGE_TYPES[file.mimetype]}`),
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    IMAGE_TYPES[file.mimetype] ? cb(null, true) : cb(new HttpError(400, 'Formato de imagen no soportado (JPG, PNG, WEBP o GIF)')),
});

function removePhoto(file: string | null) {
  if (file) fs.rm(path.join(UPLOADS_DIR, path.basename(file)), { force: true }, () => {});
}

/** Mascota cargada y verificada como propia del usuario. */
function pet(req: Request): PetRow {
  const found = findPet(req.user.id, parseId(String(req.params.petId)));
  if (!found) throw notFound('Mascota no encontrada');
  return found;
}

export const petsRouter = Router();

petsRouter.get('/', (req, res) => {
  res.json(db.select().from(pets).where(eq(pets.ownerId, req.user.id)).orderBy(asc(pets.name)).all());
});

petsRouter.post('/', (req, res) => {
  const data = parseBody(petSchema, req.body);
  assertVetsOwned(req.user.id, petDef, data);
  const row = db
    .insert(pets)
    .values({ ...(data as Omit<typeof pets.$inferInsert, "ownerId">), ownerId: req.user.id })
    .returning()
    .get();
  res.status(201).json(row);
});

petsRouter.get('/:petId', (req, res) => {
  res.json(pet(req));
});

petsRouter.get('/:petId/full', (req, res) => {
  res.json(petFull(req.user.id, pet(req)));
});

petsRouter.put('/:petId', (req, res) => {
  const p = pet(req);
  const data = parseBody(petSchema, req.body);
  assertVetsOwned(req.user.id, petDef, data);
  res.json(db.update(pets).set(data).where(eq(pets.id, p.id)).returning().get());
});

petsRouter.delete('/:petId', (req, res) => {
  const p = pet(req);
  db.delete(pets).where(eq(pets.id, p.id)).run();
  removePhoto(p.photoPath);
  res.status(204).end();
});

// ---------- Foto ----------

petsRouter.post('/:petId/photo', (req, res, next) => {
  pet(req); // verificar propiedad antes de aceptar el archivo
  next();
}, upload.single('photo'), (req, res) => {
  const p = pet(req);
  if (!req.file) throw new HttpError(400, 'Falta la imagen');
  const row = db.update(pets).set({ photoPath: req.file.filename }).where(eq(pets.id, p.id)).returning().get();
  removePhoto(p.photoPath);
  res.json(row);
});

petsRouter.delete('/:petId/photo', (req, res) => {
  const p = pet(req);
  const row = db.update(pets).set({ photoPath: null }).where(eq(pets.id, p.id)).returning().get();
  removePhoto(p.photoPath);
  res.json(row);
});

// ---------- Sub-recursos 1:1 (alimentación, hábitos) ----------

for (const [key, def] of Object.entries(petSingletons)) {
  const table: any = singletonTables[key as keyof typeof singletonTables];
  const schema = schemaFor(def);

  petsRouter.get(`/:petId/${def.path}`, (req, res) => {
    const p = pet(req);
    res.json(db.select().from(table).where(eq(table.petId, p.id)).get() ?? null);
  });

  petsRouter.put(`/:petId/${def.path}`, (req, res) => {
    const p = pet(req);
    const data = parseBody(schema, req.body);
    const row = db
      .insert(table)
      .values({ ...data, petId: p.id })
      .onConflictDoUpdate({ target: table.petId, set: data })
      .returning()
      .get();
    res.json(row);
  });
}

// ---------- Sub-recursos en lista (vacunas, síntomas, etc.) ----------

for (const [key, def] of Object.entries(petResources)) {
  const k = key as keyof typeof resourceTables;
  const table: any = resourceTables[k];
  const schema = schemaFor(def);
  const base = `/:petId/${def.path}`;
  const own = (petId: number, id: string) => and(eq(table.id, parseId(id)), eq(table.petId, petId));

  petsRouter.get(base, (req, res) => {
    res.json(listResource(k, pet(req).id));
  });

  petsRouter.post(base, (req, res) => {
    const p = pet(req);
    const data = parseBody(schema, req.body);
    assertVetsOwned(req.user.id, def, data);
    res.status(201).json(db.insert(table).values({ ...data, petId: p.id }).returning().get());
  });

  petsRouter.put(`${base}/:id`, (req, res) => {
    const p = pet(req);
    const data = parseBody(schema, req.body);
    assertVetsOwned(req.user.id, def, data);
    const row = db.update(table).set(data).where(own(p.id, req.params.id)).returning().get();
    if (!row) throw notFound();
    res.json(row);
  });

  petsRouter.delete(`${base}/:id`, (req, res) => {
    const p = pet(req);
    const row = db.delete(table).where(own(p.id, req.params.id)).returning().get();
    if (!row) throw notFound();
    res.status(204).end();
  });
}
