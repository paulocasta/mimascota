import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as schema from './schema';
import { users } from './schema';

const here = path.dirname(fileURLToPath(import.meta.url));
export const SERVER_ROOT = path.resolve(here, '../..');
export const DATA_DIR = process.env.DATA_DIR ?? path.join(SERVER_ROOT, 'data');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const sqlite = new Database(path.join(DATA_DIR, 'mimascota.db'));
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

export function initDb() {
  migrate(db, { migrationsFolder: path.join(SERVER_ROOT, 'drizzle') });
  // Usuario por defecto mientras no haya login (ver middleware/currentUser.ts).
  db.insert(users).values({ id: 1, name: 'Yo' }).onConflictDoNothing().run();
}
