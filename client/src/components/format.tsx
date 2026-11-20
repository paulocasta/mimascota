import {
  UPCOMING_DAYS,
  diffDays,
  formatDate,
  optionLabel,
  todayISO,
  type Field,
  type ReminderStatus,
  type Vet,
} from '@mimascota/shared';
import type { ReactNode } from 'react';

export const vetName = (v: Pick<Vet, 'firstName' | 'lastName'>) => `${v.firstName} ${v.lastName}`;

export const STATUS_LABEL: Record<ReminderStatus, string> = {
  vencido: 'Vencido',
  pendiente: 'Pendiente',
  proximo: 'Próximo',
  al_dia: 'Al día',
};

export function StatusBadge({ status, children }: { status: ReminderStatus; children?: ReactNode }) {
  return <span className={`badge badge-${status}`}>{children ?? STATUS_LABEL[status]}</span>;
}

/** Fecha de vencimiento con indicador de estado. */
export function DueDate({ iso }: { iso: string }) {
  const days = diffDays(todayISO(), iso);
  const status: ReminderStatus = days < 0 ? 'vencido' : days <= UPCOMING_DAYS ? 'proximo' : 'al_dia';
  return (
    <span className="due">
      {formatDate(iso)} {status !== 'al_dia' && <StatusBadge status={status} />}
    </span>
  );
}

export function displayValue(field: Field, value: unknown, vets: Vet[] = []): ReactNode {
  if (value === null || value === undefined || value === '') return <span className="muted">—</span>;
  switch (field.type) {
    case 'checkbox':
      return value ? 'Sí' : 'No';
    case 'date':
      return field.name === 'nextDue' ? <DueDate iso={String(value)} /> : formatDate(String(value));
    case 'select':
      return optionLabel(field, value);
    case 'vet': {
      const v = vets.find((x) => x.id === value);
      return v ? vetName(v) : <span className="muted">—</span>;
    }
    case 'number':
      return String(value).replace('.', ',');
    case 'textarea':
      return <span className="pre">{String(value)}</span>;
    default:
      return String(value);
  }
}

export function Details({
  fields,
  values,
  vets,
}: {
  fields: Field[];
  values: Record<string, unknown> | null | undefined;
  vets?: Vet[];
}) {
  return (
    <dl className="details">
      {fields.map((f) => (
        <div key={f.name} className={f.wide ? 'wide' : undefined}>
          <dt>{f.label}</dt>
          <dd>{displayValue(f, values?.[f.name], vets)}</dd>
        </div>
      ))}
    </dl>
  );
}
