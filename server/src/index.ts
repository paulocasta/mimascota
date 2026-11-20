import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { SERVER_ROOT, UPLOADS_DIR, initDb } from './db/client';
import { remindersFor } from './data';
import { errorHandler } from './http';
import { currentUser } from './middleware/currentUser';
import { petsRouter } from './routes/pets';
import { vetsRouter } from './routes/vets';

initDb();

const app = express();
app.use(express.json({ limit: '1mb' }));

app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d', immutable: true }));

const api = express.Router();
api.use(currentUser);
api.use('/pets', petsRouter);
api.use('/vets', vetsRouter);
api.get('/reminders', (req, res) => {
  res.json(remindersFor(req.user.id).filter((r) => r.status !== 'al_dia'));
});
api.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});
app.use('/api', api);

// En producción, servir el cliente compilado (npm run build).
const clientDist = path.resolve(SERVER_ROOT, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/(api|uploads)\/).*/, (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.use(errorHandler);

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => console.log(`MiMascota API escuchando en http://localhost:${port}`));
