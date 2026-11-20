import {
  URGENCY_SIGNS,
  formatDate,
  petDef,
  petResources,
  petSingletons,
  todayISO,
  type ResourceDef,
  type Row,
} from '@mimascota/shared';
import { Link, useParams } from 'react-router-dom';
import { usePetFull, useVets } from '../api';
import { Details, displayValue } from '../components/format';
import { PetAvatar } from '../components/PetAvatar';
import { RemindersList } from '../components/Reminders';
import { VetCard } from '../components/VetCard';

function PrintTable({ def, rows, title, columns }: { def: ResourceDef; rows: Row[]; title?: string; columns?: string[] }) {
  const vets = useVets().data ?? [];
  const cols = (columns ?? def.columns).map((c) => def.fields.find((f) => f.name === c)!);
  return (
    <section className="print-section">
      <h3>{title ?? def.label}</h3>
      {rows.length === 0 ? (
        <p className="muted">—</p>
      ) : (
        <table>
          <thead>
            <tr>
              {cols.map((c) => (
                <th key={c.name}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {cols.map((c) => (
                  <td key={c.name}>{displayValue(c, row[c.name], vets)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export function PrintPage() {
  const petId = Number(useParams().id);
  const { data, error } = usePetFull(petId);
  const vets = useVets().data ?? [];
  if (!data) return <p className={error ? 'error' : 'muted'}>{error ? error.message : 'Cargando…'}</p>;

  const { pet, resources: r, singletons: s } = data;
  const records = r.medicalRecords ?? [];
  const identFields = petDef.fields.filter((f) => f.name !== 'notes' && f.name !== 'primaryVetId');
  const emergencyVets = vets.filter((v) => v.isEmergency && v.id !== data.primaryVet?.id);

  return (
    <div className="print-page">
      <div className="no-print print-toolbar">
        <Link to={`/mascotas/${pet.id}`}>← Volver</Link>
        <button className="btn primary" onClick={() => window.print()}>
          🖨️ Imprimir / Guardar PDF
        </button>
      </div>

      <header className="print-header">
        <PetAvatar pet={pet} size={110} />
        <div>
          <h1>{pet.name}</h1>
          <p className="muted">
            Ficha sanitaria · {data.lifeStage.label} · generada el {formatDate(todayISO())}
          </p>
        </div>
      </header>

      <section className="print-section">
        <h3>Identificación</h3>
        <Details fields={identFields} values={pet as unknown as Record<string, unknown>} vets={vets} />
        {pet.notes && <p className="pre">{pet.notes}</p>}
      </section>

      {records.some((x) => x.kind === 'alergia') && (
        <section className="print-section alert-box">
          <h3>⚠️ Alergias conocidas</h3>
          <ul>
            {records
              .filter((x) => x.kind === 'alergia')
              .map((x) => (
                <li key={x.id}>
                  <strong>{String(x.title)}</strong>
                  {x.notes ? ` — ${x.notes}` : ''}
                </li>
              ))}
          </ul>
        </section>
      )}

      <section className="print-section">
        <h3>Veterinarios</h3>
        <div className="vet-list">
          {data.primaryVet && <VetCard vet={data.primaryVet} role="De cabecera" />}
          {emergencyVets.map((v) => (
            <VetCard key={v.id} vet={v} role="Guardia" />
          ))}
          {!data.primaryVet && !emergencyVets.length && <p className="muted">—</p>}
        </div>
      </section>

      <PrintTable
        def={petResources.symptoms}
        title="Síntomas activos"
        rows={(r.symptoms ?? []).filter((x) => !x.resolved)}
        columns={['symptom', 'startedAt', 'duration', 'worsening', 'notes']}
      />
      <PrintTable
        def={petResources.treatments}
        title="Tratamientos en curso"
        rows={(r.treatments ?? []).filter((x) => x.active)}
        columns={['kind', 'name', 'dose', 'schedule', 'startDate', 'endDate']}
      />
      <PrintTable def={petResources.vaccinations} rows={r.vaccinations ?? []} />
      <PrintTable def={petResources.dewormings} rows={r.dewormings ?? []} />
      <PrintTable
        def={petResources.medicalRecords}
        title="Enfermedades y cirugías"
        rows={records.filter((x) => x.kind !== 'alergia')}
      />
      <PrintTable def={petResources.labResults} rows={(r.labResults ?? []).slice(0, 10)} title="Últimos análisis" />

      <div className="print-two">
        <section className="print-section">
          <h3>{petSingletons.diet.label}</h3>
          {s.diet ? <Details fields={petSingletons.diet.fields} values={s.diet} /> : <p className="muted">—</p>}
        </section>
        <section className="print-section">
          <h3>{petSingletons.habits.label}</h3>
          {s.habits ? <Details fields={petSingletons.habits.fields} values={s.habits} /> : <p className="muted">—</p>}
        </section>
      </div>

      <PrintTable def={petResources.checkups} rows={(r.checkups ?? []).slice(0, 5)} title="Últimos controles" />

      <section className="print-section">
        <h3>Pendientes</h3>
        <RemindersList reminders={data.reminders.filter((x) => x.status !== 'al_dia')} showPet={false} />
      </section>

      <section className="print-section urgency">
        <h3>Signos de urgencia (atención inmediata)</h3>
        <p>{URGENCY_SIGNS.join(' · ')}</p>
      </section>
    </div>
  );
}
