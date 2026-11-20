import type { ResourceDef, Row } from '@mimascota/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api, useVets } from '../api';
import { ConfirmButton } from './ConfirmButton';
import { FieldsForm } from './FieldsForm';
import { displayValue } from './format';

interface Props {
  def: ResourceDef;
  /** URL base de la API, p.ej. `/pets/3/vaccinations` o `/vets`. */
  baseUrl: string;
  rows: Row[];
  /** Clase CSS opcional por fila (p.ej. resaltar síntomas activos). */
  rowClass?: (row: Row) => string | undefined;
  title?: string;
}

/** Lista con alta / edición / borrado para cualquier sub-recurso. */
export function ResourceSection({ def, baseUrl, rows, rowClass, title }: Props) {
  const qc = useQueryClient();
  const vets = useVets().data ?? [];
  const [editing, setEditing] = useState<Row | 'new' | null>(null);
  const columns = def.columns.map((c) => def.fields.find((f) => f.name === c)!).filter(Boolean);

  const refresh = () => qc.invalidateQueries();

  async function save(values: Record<string, unknown>) {
    if (editing === 'new') await api.post(baseUrl, values);
    else if (editing) await api.put(`${baseUrl}/${editing.id}`, values);
    await refresh();
    setEditing(null);
  }

  async function remove(row: Row) {
    await api.del(`${baseUrl}/${row.id}`);
    await refresh();
  }

  return (
    <section className="card">
      <div className="card-head">
        <h3>{title ?? def.label}</h3>
        {!editing && (
          <button className="btn small primary" onClick={() => setEditing('new')}>
            + Agregar {def.singular}
          </button>
        )}
      </div>

      {editing && (
        <div className="inline-form">
          <h4>
            {editing === 'new' ? 'Agregar' : 'Editar'} {def.singular}
          </h4>
          <FieldsForm
            key={editing === 'new' ? 'new' : editing.id}
            fields={def.fields}
            initial={editing === 'new' ? null : editing}
            onSubmit={save}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {rows.length === 0 ? (
        <p className="muted empty">{def.emptyText ?? 'Sin registros.'}</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.name}>{c.label}</th>
                ))}
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className={rowClass?.(row)}>
                  {columns.map((c) => (
                    <td key={c.name} data-label={c.label}>
                      {displayValue(c, row[c.name], vets)}
                    </td>
                  ))}
                  <td className="row-actions">
                    <button className="btn small" onClick={() => setEditing(row)}>
                      Editar
                    </button>
                    <ConfirmButton onConfirm={() => remove(row)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
