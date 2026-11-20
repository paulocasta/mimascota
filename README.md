# MiMascota

Aplicación web para guardar la información de tus mascotas (perros, gatos y otras especies): identificación con foto, cartilla sanitaria, historial médico, alimentación, tratamientos, hábitos, veterinarios, síntomas y signos de urgencia. Incluye recordatorios de vacunas/desparasitaciones/controles y una ficha imprimible (o guardable como PDF) para llevar al veterinario.

## Requisitos

- Node.js 22+

## Uso

```bash
npm install
npm run dev      # API en http://localhost:3001 + app en http://localhost:5173
```

Abrí http://localhost:5173.

Producción (un solo proceso que sirve API + app):

```bash
npm run build
npm start        # http://localhost:3001
```

Los datos se guardan en `server/data/` (base SQLite `mimascota.db` + fotos en `uploads/`). Para hacer backup, copiá esa carpeta. Se puede cambiar con la variable `DATA_DIR`.

## Otros comandos

```bash
npm test         # tests de la lógica de recordatorios
npm run typecheck
npm run db:generate   # generar migración tras cambiar server/src/db/schema.ts
```

## Estructura

- `shared/` — definiciones de campos de cada sección (generan formularios y validación), reglas de frecuencia de controles, utilidades de fechas.
- `server/` — Express + Drizzle ORM + SQLite. Migraciones en `server/drizzle/`.
- `client/` — React + Vite + TanStack Query.

## Reglas de controles

- Cachorros/crías: cada 28 días hasta los 4 meses.
- Adultos: cada 365 días.
- Mayores: cada 180 días. Perros grandes/gigantes (o sin tamaño) desde los 7 años, pequeños/medianos desde los 8; gatos y otros desde los 10.

Configurable en `shared/src/rules.ts`.

## Multiusuario

Hoy la app es de un solo usuario sin login. Todas las tablas raíz tienen `owner_id` y todas las rutas filtran por `req.user.id`; para abrirla a más usuarios basta reemplazar `server/src/middleware/currentUser.ts` por un middleware de autenticación.
