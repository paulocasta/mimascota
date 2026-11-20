import type { ResourceDef } from '@mimascota/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../api';
import { FieldsForm } from './FieldsForm';
import { Details } from './format';

/** Ficha 1:1 (alimentación, hábitos): vista de detalle + edición. */
export function SingletonSection({
  def,
  url,
  value,
}: {
  def: ResourceDef;
  url: string;
  value: Record<string, unknown> | null;
}) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);

  return (
    <section className="card">
      <div className="card-head">
        <h3>{def.label}</h3>
        {!editing && (
          <button className="btn small primary" onClick={() => setEditing(true)}>
            {value ? 'Editar' : 'Completar'}
          </button>
        )}
      </div>
      {editing ? (
        <FieldsForm
          fields={def.fields}
          initial={value}
          onCancel={() => setEditing(false)}
          onSubmit={async (values) => {
            await api.put(url, values);
            await qc.invalidateQueries();
            setEditing(false);
          }}
        />
      ) : value ? (
        <Details fields={def.fields} values={value} />
      ) : (
        <p className="muted empty">Todavía no completaste esta sección.</p>
      )}
    </section>
  );
}
