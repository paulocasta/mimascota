import { ageInMonths, formatAge, optionLabel, petDef, todayISO } from '@mimascota/shared';
import { Link } from 'react-router-dom';
import { usePets, useReminders } from '../api';
import { PetAvatar } from '../components/PetAvatar';
import { RemindersList } from '../components/Reminders';

const speciesField = petDef.fields.find((f) => f.name === 'species')!;

export function HomePage() {
  const pets = usePets();
  const reminders = useReminders();
  const today = todayISO();

  return (
    <div className="home">
      <section>
        <div className="page-head">
          <h1>Mis mascotas</h1>
          <Link to="/mascotas/nueva" className="btn primary">
            + Agregar mascota
          </Link>
        </div>
        {pets.isLoading && <p className="muted">Cargando…</p>}
        {pets.error && <p className="error">{pets.error.message}</p>}
        {pets.data?.length === 0 && (
          <div className="card empty-state">
            <p>Todavía no cargaste ninguna mascota.</p>
            <Link to="/mascotas/nueva" className="btn primary">
              Agregar la primera
            </Link>
          </div>
        )}
        <div className="pet-grid">
          {pets.data?.map((p) => (
            <Link key={p.id} to={`/mascotas/${p.id}`} className="pet-card">
              <PetAvatar pet={p} size={88} />
              <div>
                <h2>{p.name}</h2>
                <div className="muted">
                  {optionLabel(speciesField, p.species)}
                  {p.breed && ` · ${p.breed}`}
                </div>
                {p.birthDate && (
                  <div className="muted small">
                    {p.birthDateIsEstimate && '≈ '}
                    {formatAge(ageInMonths(p.birthDate, today))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <aside className="card">
        <div className="card-head">
          <h3>Recordatorios</h3>
        </div>
        {reminders.data ? (
          <RemindersList reminders={reminders.data} />
        ) : (
          <p className="muted">{reminders.error ? reminders.error.message : 'Cargando…'}</p>
        )}
        <p className="muted small">
          Vacunas y desparasitaciones vencidas o que vencen en los próximos 30 días, y controles según la edad de cada
          mascota.
        </p>
      </aside>
    </div>
  );
}
