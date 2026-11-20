import { formatDate, type Reminder } from '@mimascota/shared';
import { Link } from 'react-router-dom';
import { StatusBadge } from './format';

const ICON: Record<Reminder['kind'], string> = { vacuna: '💉', desparasitacion: '🪲', control: '🩺' };

function when(r: Reminder): string {
  if (r.daysLeft === null) return 'Registrá el primer control';
  if (r.daysLeft < 0) return `Venció hace ${-r.daysLeft} ${r.daysLeft === -1 ? 'día' : 'días'} (${formatDate(r.dueDate)})`;
  if (r.daysLeft === 0) return 'Vence hoy';
  return `En ${r.daysLeft} ${r.daysLeft === 1 ? 'día' : 'días'} (${formatDate(r.dueDate)})`;
}

export function RemindersList({ reminders, showPet = true }: { reminders: Reminder[]; showPet?: boolean }) {
  if (!reminders.length) return <p className="muted empty">Todo al día. 🎉</p>;
  return (
    <ul className="reminders">
      {reminders.map((r, i) => (
        <li key={i} className={`reminder reminder-${r.status}`}>
          <span className="reminder-icon" aria-hidden>
            {ICON[r.kind]}
          </span>
          <div>
            <div className="reminder-title">
              {showPet && (
                <Link to={`/mascotas/${r.petId}${r.kind === 'control' ? '?tab=consulta' : '?tab=cartilla'}`}>
                  {r.petName}
                </Link>
              )}
              {showPet && ' · '}
              {r.title}
            </div>
            <div className="muted small">{when(r)}</div>
          </div>
          <StatusBadge status={r.status} />
        </li>
      ))}
    </ul>
  );
}
