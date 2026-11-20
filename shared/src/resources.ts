import { z } from 'zod';

/**
 * Definición declarativa de cada entidad: de acá salen tanto los formularios
 * del cliente como la validación (zod) del servidor.
 */

export type FieldType = 'text' | 'textarea' | 'date' | 'number' | 'select' | 'checkbox' | 'vet';

export interface Option {
  value: string;
  label: string;
}

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: Option[];
  default?: boolean;
  placeholder?: string;
  /** Ancho completo en el formulario. */
  wide?: boolean;
}

export interface ResourceDef {
  key: string;
  /** Segmento de URL de la API. */
  path: string;
  label: string;
  singular: string;
  fields: Field[];
  /** Columnas visibles en la tabla. */
  columns: string[];
  /** Campo de fecha para ordenar descendente. */
  sortBy?: string;
  emptyText?: string;
}

const opts = (...pairs: [string, string][]): Option[] => pairs.map(([value, label]) => ({ value, label }));

export const SPECIES = opts(
  ['perro', 'Perro'],
  ['gato', 'Gato'],
  ['conejo', 'Conejo'],
  ['ave', 'Ave'],
  ['roedor', 'Roedor'],
  ['reptil', 'Reptil'],
  ['otro', 'Otro'],
);

const CHANGE = opts(['normal', 'Normal'], ['aumento', 'Aumentó'], ['disminuyo', 'Disminuyó']);

export const SYMPTOMS = opts(
  ['vomitos', 'Vómitos'],
  ['diarrea', 'Diarrea'],
  ['tos', 'Tos'],
  ['cojera', 'Cojera'],
  ['decaimiento', 'Decaimiento'],
  ['picazon', 'Picazón'],
  ['conducta', 'Cambio de conducta'],
  ['apetito', 'Falta de apetito'],
  ['otro', 'Otro'],
);

// ---------- Entidades raíz ----------

export const petDef: ResourceDef = {
  key: 'pets',
  path: 'pets',
  label: 'Mascotas',
  singular: 'mascota',
  columns: ['name', 'species', 'breed'],
  fields: [
    { name: 'name', label: 'Nombre', type: 'text', required: true },
    { name: 'species', label: 'Especie', type: 'select', required: true, options: SPECIES },
    { name: 'breed', label: 'Raza', type: 'text', placeholder: 'Mestizo, Labrador…' },
    { name: 'sex', label: 'Sexo', type: 'select', options: opts(['macho', 'Macho'], ['hembra', 'Hembra']) },
    { name: 'birthDate', label: 'Fecha de nacimiento', type: 'date' },
    { name: 'birthDateIsEstimate', label: 'La fecha es aproximada', type: 'checkbox' },
    {
      name: 'reproductiveStatus',
      label: 'Estado reproductivo',
      type: 'select',
      options: opts(['castrado', 'Castrado/a'], ['entero', 'Entero/a']),
    },
    {
      name: 'size',
      label: 'Tamaño',
      type: 'select',
      options: opts(['pequeno', 'Pequeño'], ['mediano', 'Mediano'], ['grande', 'Grande'], ['gigante', 'Gigante']),
    },
    { name: 'weightKg', label: 'Peso (kg)', type: 'number' },
    { name: 'microchip', label: 'Microchip / Nº de identificación', type: 'text' },
    { name: 'primaryVetId', label: 'Veterinario de cabecera', type: 'vet' },
    { name: 'notes', label: 'Notas', type: 'textarea', wide: true },
  ],
};

export const vetDef: ResourceDef = {
  key: 'vets',
  path: 'vets',
  label: 'Veterinarios',
  singular: 'veterinario',
  columns: ['lastName', 'firstName', 'clinic', 'licenseNumber', 'phone', 'address', 'isEmergency'],
  emptyText: 'Todavía no cargaste veterinarios.',
  fields: [
    { name: 'firstName', label: 'Nombre', type: 'text', required: true },
    { name: 'lastName', label: 'Apellido', type: 'text', required: true },
    { name: 'clinic', label: 'Clínica / Veterinaria', type: 'text' },
    { name: 'licenseNumber', label: 'Matrícula', type: 'text' },
    { name: 'phone', label: 'Teléfono', type: 'text' },
    { name: 'email', label: 'Email', type: 'text' },
    { name: 'address', label: 'Dirección', type: 'text', wide: true },
    { name: 'isEmergency', label: 'Atiende urgencias / guardia', type: 'checkbox' },
    { name: 'notes', label: 'Notas (horarios, etc.)', type: 'textarea', wide: true },
  ],
};

// ---------- Sub-recursos de cada mascota (listas) ----------

export const petResources = {
  vaccinations: {
    key: 'vaccinations',
    path: 'vaccinations',
    label: 'Vacunas',
    singular: 'vacuna',
    sortBy: 'dateApplied',
    columns: ['name', 'dateApplied', 'nextDue', 'lot', 'vetId'],
    emptyText: 'Sin vacunas registradas.',
    fields: [
      { name: 'name', label: 'Vacuna', type: 'text', required: true, placeholder: 'Antirrábica, Séxtuple, Triple felina…' },
      { name: 'dateApplied', label: 'Fecha de aplicación', type: 'date', required: true },
      { name: 'nextDue', label: 'Fecha de refuerzo', type: 'date' },
      { name: 'lot', label: 'Lote', type: 'text' },
      { name: 'vetId', label: 'Aplicada por', type: 'vet' },
      { name: 'notes', label: 'Notas', type: 'textarea', wide: true },
    ],
  },
  dewormings: {
    key: 'dewormings',
    path: 'dewormings',
    label: 'Desparasitaciones',
    singular: 'desparasitación',
    sortBy: 'dateApplied',
    columns: ['type', 'product', 'dateApplied', 'nextDue'],
    emptyText: 'Sin desparasitaciones registradas.',
    fields: [
      {
        name: 'type',
        label: 'Tipo',
        type: 'select',
        required: true,
        options: opts(['interna', 'Interna'], ['externa', 'Externa']),
      },
      { name: 'product', label: 'Producto', type: 'text', required: true, placeholder: 'Pipeta, comprimido, collar…' },
      { name: 'dateApplied', label: 'Fecha de aplicación', type: 'date', required: true },
      { name: 'nextDue', label: 'Próxima dosis', type: 'date' },
      { name: 'notes', label: 'Notas', type: 'textarea', wide: true },
    ],
  },
  medicalRecords: {
    key: 'medicalRecords',
    path: 'medical-records',
    label: 'Enfermedades, cirugías y alergias',
    singular: 'antecedente',
    sortBy: 'date',
    columns: ['kind', 'title', 'date', 'notes'],
    emptyText: 'Sin antecedentes registrados.',
    fields: [
      {
        name: 'kind',
        label: 'Tipo',
        type: 'select',
        required: true,
        options: opts(['enfermedad', 'Enfermedad'], ['cirugia', 'Cirugía'], ['alergia', 'Alergia']),
      },
      { name: 'title', label: 'Descripción', type: 'text', required: true },
      { name: 'date', label: 'Fecha', type: 'date' },
      { name: 'notes', label: 'Detalle / tratamiento', type: 'textarea', wide: true },
    ],
  },
  labResults: {
    key: 'labResults',
    path: 'lab-results',
    label: 'Análisis y estudios',
    singular: 'análisis',
    sortBy: 'date',
    columns: ['date', 'testName', 'summary'],
    emptyText: 'Sin análisis registrados.',
    fields: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'testName', label: 'Estudio', type: 'text', required: true, placeholder: 'Hemograma, ecografía…' },
      { name: 'summary', label: 'Resultado', type: 'textarea', wide: true },
      { name: 'notes', label: 'Notas', type: 'textarea', wide: true },
    ],
  },
  appetiteLogs: {
    key: 'appetiteLogs',
    path: 'appetite-logs',
    label: 'Cambios en apetito y sed',
    singular: 'registro',
    sortBy: 'date',
    columns: ['date', 'appetite', 'thirst', 'notes'],
    emptyText: 'Sin cambios registrados.',
    fields: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'appetite', label: 'Apetito', type: 'select', options: CHANGE },
      { name: 'thirst', label: 'Sed', type: 'select', options: CHANGE },
      { name: 'notes', label: 'Notas', type: 'textarea', wide: true },
    ],
  },
  treatments: {
    key: 'treatments',
    path: 'treatments',
    label: 'Tratamientos',
    singular: 'tratamiento',
    sortBy: 'startDate',
    columns: ['active', 'kind', 'name', 'dose', 'schedule', 'startDate', 'endDate'],
    emptyText: 'Sin tratamientos registrados.',
    fields: [
      {
        name: 'kind',
        label: 'Tipo',
        type: 'select',
        required: true,
        options: opts(
          ['medicamento', 'Medicamento'],
          ['suplemento', 'Suplemento'],
          ['antiparasitario', 'Antiparasitario (pipeta/comprimido)'],
        ),
      },
      { name: 'name', label: 'Nombre', type: 'text', required: true },
      { name: 'dose', label: 'Dosis', type: 'text', placeholder: '1/2 comprimido, 5 ml…' },
      { name: 'schedule', label: 'Horario / frecuencia', type: 'text', placeholder: 'Cada 12 h (8 y 20 h)' },
      { name: 'startDate', label: 'Inicio', type: 'date' },
      { name: 'endDate', label: 'Fin', type: 'date' },
      { name: 'active', label: 'En curso', type: 'checkbox', default: true },
      { name: 'notes', label: 'Notas', type: 'textarea', wide: true },
    ],
  },
  symptoms: {
    key: 'symptoms',
    path: 'symptoms',
    label: 'Síntomas observados',
    singular: 'síntoma',
    sortBy: 'startedAt',
    columns: ['symptom', 'startedAt', 'duration', 'worsening', 'resolved', 'notes'],
    emptyText: 'Sin síntomas registrados.',
    fields: [
      { name: 'symptom', label: 'Síntoma', type: 'select', required: true, options: SYMPTOMS },
      { name: 'startedAt', label: 'Cuándo empezó', type: 'date', required: true },
      { name: 'duration', label: 'Duración / frecuencia', type: 'text', placeholder: '2 días, 3 veces por día…' },
      { name: 'worsening', label: 'Empeoró', type: 'checkbox' },
      { name: 'resolved', label: 'Resuelto', type: 'checkbox' },
      { name: 'notes', label: 'Descripción', type: 'textarea', wide: true },
    ],
  },
  checkups: {
    key: 'checkups',
    path: 'checkups',
    label: 'Controles veterinarios',
    singular: 'control',
    sortBy: 'date',
    columns: ['date', 'vetId', 'reason', 'notes'],
    emptyText: 'Sin controles registrados.',
    fields: [
      { name: 'date', label: 'Fecha', type: 'date', required: true },
      { name: 'vetId', label: 'Veterinario', type: 'vet' },
      { name: 'reason', label: 'Motivo', type: 'text', placeholder: 'Control anual, vacunación…' },
      { name: 'notes', label: 'Indicaciones', type: 'textarea', wide: true },
    ],
  },
} satisfies Record<string, ResourceDef>;

export type PetResourceKey = keyof typeof petResources;

// ---------- Sub-recursos 1:1 ----------

export const petSingletons = {
  diet: {
    key: 'diet',
    path: 'diet',
    label: 'Alimentación y agua',
    singular: 'alimentación',
    columns: [],
    fields: [
      { name: 'food', label: 'Alimento', type: 'text', placeholder: 'Marca y variedad' },
      { name: 'dailyAmount', label: 'Cantidad diaria', type: 'text', placeholder: '300 g en 2 tomas' },
      { name: 'treats', label: 'Premios / snacks', type: 'text' },
      { name: 'tableScraps', label: 'Restos de comida casera', type: 'text' },
      { name: 'waterNotes', label: 'Agua (consumo, fuente)', type: 'text', wide: true },
      { name: 'notes', label: 'Notas', type: 'textarea', wide: true },
    ],
  },
  habits: {
    key: 'habits',
    path: 'habits',
    label: 'Hábitos y entorno',
    singular: 'hábitos',
    columns: [],
    fields: [
      { name: 'livesWithAnimals', label: 'Convive con otros animales', type: 'checkbox' },
      { name: 'otherAnimals', label: '¿Con cuáles?', type: 'text' },
      { name: 'travels', label: 'Viaja', type: 'checkbox' },
      { name: 'daycare', label: 'Asiste a guardería / paseador', type: 'checkbox' },
      { name: 'stoolNotes', label: 'Deposiciones (frecuencia, consistencia)', type: 'textarea', wide: true },
      { name: 'urineNotes', label: 'Micciones (frecuencia, color)', type: 'textarea', wide: true },
      { name: 'notes', label: 'Otras notas', type: 'textarea', wide: true },
    ],
  },
} satisfies Record<string, ResourceDef>;

export type PetSingletonKey = keyof typeof petSingletons;

// ---------- Validación ----------

const emptyToNull = (v: unknown) => (v === '' || v === undefined ? null : v);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function fieldSchema(f: Field): z.ZodTypeAny {
  const req = { required_error: `${f.label}: obligatorio`, invalid_type_error: `${f.label}: obligatorio` };
  switch (f.type) {
    case 'checkbox':
      return z.boolean().default(f.default ?? false);
    case 'number': {
      const n = z.coerce.number({ invalid_type_error: `${f.label}: número inválido` }).nonnegative();
      return z.preprocess(emptyToNull, f.required ? n : n.nullable());
    }
    case 'vet':
      return z.preprocess(emptyToNull, z.coerce.number().int().positive().nullable());
    case 'date': {
      const d = z.string(req).regex(DATE_RE, `${f.label}: fecha inválida`);
      return z.preprocess(emptyToNull, f.required ? d : d.nullable());
    }
    case 'select': {
      const values = (f.options ?? []).map((o) => o.value) as [string, ...string[]];
      const e = z.enum(values, { errorMap: () => ({ message: `${f.label}: opción inválida` }) });
      return z.preprocess(emptyToNull, f.required ? e : e.nullable());
    }
    default: {
      const s = z.string(req).max(f.type === 'textarea' ? 5000 : 300);
      const trim = (v: unknown) => (typeof v === 'string' ? (v.trim() === '' ? null : v.trim()) : emptyToNull(v));
      return z.preprocess(trim, f.required ? s : s.nullable());
    }
  }
}

export function schemaFor(def: ResourceDef) {
  return z.object(Object.fromEntries(def.fields.map((f) => [f.name, fieldSchema(f)])));
}

export function optionLabel(field: Field, value: unknown): string {
  return field.options?.find((o) => o.value === value)?.label ?? String(value ?? '');
}
