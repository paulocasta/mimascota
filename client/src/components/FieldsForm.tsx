import type { Field } from '@mimascota/shared';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useVets } from '../api';
import { vetName } from './format';

type Values = Record<string, unknown>;

function initialValues(fields: Field[], initial?: Values | null): Values {
  return Object.fromEntries(
    fields.map((f) => {
      const v = initial?.[f.name];
      if (f.type === 'checkbox') return [f.name, v ?? f.default ?? false];
      return [f.name, v ?? ''];
    }),
  );
}

interface Props {
  fields: Field[];
  initial?: Values | null;
  onSubmit: (values: Values) => Promise<unknown>;
  onCancel?: () => void;
  submitLabel?: string;
  children?: ReactNode;
}

export function FieldsForm({ fields, initial, onSubmit, onCancel, submitLabel = 'Guardar', children }: Props) {
  const [values, setValues] = useState<Values>(() => initialValues(fields, initial));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const hasVetField = fields.some((f) => f.type === 'vet');
  const vets = useVets().data ?? [];

  const set = (name: string, value: unknown) => setValues((prev) => ({ ...prev, [name]: value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="form-grid">
        {fields.map((f) => {
          const id = `f-${f.name}`;
          const value = values[f.name];
          if (f.type === 'checkbox') {
            return (
              <label key={f.name} className="check" htmlFor={id}>
                <input id={id} type="checkbox" checked={Boolean(value)} onChange={(e) => set(f.name, e.target.checked)} />
                {f.label}
              </label>
            );
          }
          let input: ReactNode;
          const common = { id, name: f.name, required: f.required, value: String(value ?? '') };
          if (f.type === 'textarea') {
            input = <textarea {...common} rows={3} placeholder={f.placeholder} onChange={(e) => set(f.name, e.target.value)} />;
          } else if (f.type === 'select' || f.type === 'vet') {
            const options =
              f.type === 'vet' ? vets.map((v) => ({ value: String(v.id), label: vetName(v) })) : (f.options ?? []);
            input = (
              <select {...common} onChange={(e) => set(f.name, e.target.value)}>
                <option value="">{f.required ? 'Elegí una opción' : '—'}</option>
                {options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            );
          } else {
            input = (
              <input
                {...common}
                type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                step={f.type === 'number' ? 'any' : undefined}
                min={f.type === 'number' ? 0 : undefined}
                placeholder={f.placeholder}
                onChange={(e) => set(f.name, e.target.value)}
              />
            );
          }
          return (
            <div key={f.name} className={`field${f.wide ? ' wide' : ''}`}>
              <label htmlFor={id}>
                {f.label}
                {f.required && <span className="req"> *</span>}
              </label>
              {input}
            </div>
          );
        })}
      </div>
      {hasVetField && vets.length === 0 && (
        <p className="hint">
          Para asignar un veterinario primero cargalo en <Link to="/veterinarios">Veterinarios</Link>.
        </p>
      )}
      {children}
      {error && <p className="error">{error}</p>}
      <div className="actions">
        <button type="submit" className="btn primary" disabled={saving}>
          {saving ? 'Guardando…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
