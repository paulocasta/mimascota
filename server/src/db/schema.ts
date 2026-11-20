import { sql } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const id = () => integer('id').primaryKey({ autoIncrement: true });
const createdAt = () => text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`);
const bool = (name: string, def = false) => integer(name, { mode: 'boolean' }).notNull().default(def);

export const users = sqliteTable('users', {
  id: id(),
  email: text('email').unique(),
  name: text('name').notNull(),
  createdAt: createdAt(),
});

export const vets = sqliteTable('vets', {
  id: id(),
  ownerId: integer('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  clinic: text('clinic'),
  licenseNumber: text('license_number'),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  isEmergency: bool('is_emergency'),
  notes: text('notes'),
  createdAt: createdAt(),
});

export const pets = sqliteTable('pets', {
  id: id(),
  ownerId: integer('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  species: text('species').notNull(),
  breed: text('breed'),
  sex: text('sex'),
  birthDate: text('birth_date'),
  birthDateIsEstimate: bool('birth_date_is_estimate'),
  reproductiveStatus: text('reproductive_status'),
  size: text('size'),
  weightKg: real('weight_kg'),
  microchip: text('microchip'),
  primaryVetId: integer('primary_vet_id').references(() => vets.id, { onDelete: 'set null' }),
  photoPath: text('photo_path'),
  notes: text('notes'),
  createdAt: createdAt(),
});

const petId = () =>
  integer('pet_id')
    .notNull()
    .references(() => pets.id, { onDelete: 'cascade' });
const vetId = () => integer('vet_id').references(() => vets.id, { onDelete: 'set null' });

export const vaccinations = sqliteTable('vaccinations', {
  id: id(),
  petId: petId(),
  name: text('name').notNull(),
  dateApplied: text('date_applied').notNull(),
  nextDue: text('next_due'),
  lot: text('lot'),
  vetId: vetId(),
  notes: text('notes'),
});

export const dewormings = sqliteTable('dewormings', {
  id: id(),
  petId: petId(),
  type: text('type').notNull(),
  product: text('product').notNull(),
  dateApplied: text('date_applied').notNull(),
  nextDue: text('next_due'),
  notes: text('notes'),
});

export const medicalRecords = sqliteTable('medical_records', {
  id: id(),
  petId: petId(),
  kind: text('kind').notNull(),
  title: text('title').notNull(),
  date: text('date'),
  notes: text('notes'),
});

export const labResults = sqliteTable('lab_results', {
  id: id(),
  petId: petId(),
  date: text('date').notNull(),
  testName: text('test_name').notNull(),
  summary: text('summary'),
  notes: text('notes'),
});

export const appetiteLogs = sqliteTable('appetite_logs', {
  id: id(),
  petId: petId(),
  date: text('date').notNull(),
  appetite: text('appetite'),
  thirst: text('thirst'),
  notes: text('notes'),
});

export const treatments = sqliteTable('treatments', {
  id: id(),
  petId: petId(),
  kind: text('kind').notNull(),
  name: text('name').notNull(),
  dose: text('dose'),
  schedule: text('schedule'),
  startDate: text('start_date'),
  endDate: text('end_date'),
  active: bool('active', true),
  notes: text('notes'),
});

export const symptoms = sqliteTable('symptoms', {
  id: id(),
  petId: petId(),
  symptom: text('symptom').notNull(),
  startedAt: text('started_at').notNull(),
  duration: text('duration'),
  worsening: bool('worsening'),
  resolved: bool('resolved'),
  notes: text('notes'),
});

export const checkups = sqliteTable('checkups', {
  id: id(),
  petId: petId(),
  date: text('date').notNull(),
  vetId: vetId(),
  reason: text('reason'),
  notes: text('notes'),
});

export const diet = sqliteTable('diet', {
  petId: integer('pet_id')
    .primaryKey()
    .references(() => pets.id, { onDelete: 'cascade' }),
  food: text('food'),
  dailyAmount: text('daily_amount'),
  treats: text('treats'),
  tableScraps: text('table_scraps'),
  waterNotes: text('water_notes'),
  notes: text('notes'),
});

export const habits = sqliteTable('habits', {
  petId: integer('pet_id')
    .primaryKey()
    .references(() => pets.id, { onDelete: 'cascade' }),
  livesWithAnimals: bool('lives_with_animals'),
  otherAnimals: text('other_animals'),
  travels: bool('travels'),
  daycare: bool('daycare'),
  stoolNotes: text('stool_notes'),
  urineNotes: text('urine_notes'),
  notes: text('notes'),
});
