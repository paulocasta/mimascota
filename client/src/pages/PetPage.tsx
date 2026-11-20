import {
  ageInMonths,
  formatAge,
  formatDate,
  optionLabel,
  petDef,
  petResources,
  petSingletons,
  todayISO,
  type PetFull,
  type Row,
} from '@mimascota/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api, usePetFull, useVets } from '../api';
import { ConfirmButton } from '../components/ConfirmButton';
import { Details } from '../components/format';
import { PetAvatar } from '../components/PetAvatar';
import { RemindersList } from '../components/Reminders';
import { ResourceSection } from '../components/ResourceSection';
import { SingletonSection } from '../components/SingletonSection';
import { UrgencyBox } from '../components/UrgencyBox';
import { VetCard } from '../components/VetCard';

const TABS = [
  { key: 'identificacion', label: 'Identificación' },
  { key: 'cartilla', label: 'Cartilla sanitaria' },
  { key: 'historial', label: 'Historial médico' },
  { key: 'alimentacion', label: 'Alimentación' },
  { key: 'tratamientos', label: 'Tratamientos' },
  { key: 'habitos', label: 'Hábitos y entorno' },
  { key: 'consulta', label: 'Consulta / Urgencia' },
] as const;

const field = (name: string) => petDef.fields.find((f) => f.name === name)!;

export function PetPage() {
  const petId = Number(useParams().id);
  const { data, error } = usePetFull(petId);
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') ?? 'identificacion';

  if (!data) return <p className={error ? 'error' : 'muted'}>{error ? error.message : 'Cargando…'}</p>;
  const { pet } = data;

  return (
    <div>
      <PetHeader data={data} />
      <nav className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            className={tab === t.key ? 'active' : undefined}
            onClick={() => setParams({ tab: t.key }, { replace: true })}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <div className="tab-body">
        <TabContent tab={tab} data={data} base={`/pets/${pet.id}`} />
      </div>
    </div>
  );
}

function PetHeader({ data }: { data: PetFull }) {
  const { pet, lifeStage } = data;
  const qc = useQueryClient();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  async function uploadPhoto(file: File) {
    const fd = new FormData();
    fd.append('photo', file);
    setPhotoError(null);
    try {
      await api.post(`/pets/${pet.id}/photo`, fd);
      await qc.invalidateQueries();
    } catch (e) {
      setPhotoError(e instanceof Error ? e.message : 'No se pudo subir la imagen');
    }
  }

  const facts = [
    optionLabel(field('species'), pet.species),
    pet.breed,
    pet.sex && optionLabel(field('sex'), pet.sex),
    pet.reproductiveStatus && optionLabel(field('reproductiveStatus'), pet.reproductiveStatus),
    pet.birthDate && `${pet.birthDateIsEstimate ? '≈ ' : ''}${formatAge(ageInMonths(pet.birthDate, todayISO()))}`,
    pet.weightKg && `${String(pet.weightKg).replace('.', ',')} kg`,
  ].filter(Boolean);

  return (
    <header className="pet-header">
      <div className="pet-photo">
        <PetAvatar pet={pet} size={128} />
        <input
          ref={fileRef}
          type="file"
          hidden
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])}
        />
        <div className="photo-actions">
          <button className="btn small" onClick={() => fileRef.current?.click()}>
            {pet.photoPath ? 'Cambiar foto' : 'Subir foto'}
          </button>
          {pet.photoPath && (
            <ConfirmButton
              label="Quitar"
              confirmLabel="¿Quitar?"
              onConfirm={async () => {
                await api.del(`/pets/${pet.id}/photo`);
                await qc.invalidateQueries();
              }}
            />
          )}
        </div>
        {photoError && <p className="error small">{photoError}</p>}
      </div>
      <div className="pet-info">
        <h1>{pet.name}</h1>
        <p className="facts">{facts.join(' · ')}</p>
        <p>
          <span className={`badge stage-${lifeStage.stage}`}>{lifeStage.label}</span>{' '}
          <span className="muted small">{lifeStage.rule}</span>
        </p>
        <div className="actions">
          <Link to={`/mascotas/${pet.id}/editar`} className="btn">
            Editar datos
          </Link>
          <Link to={`/mascotas/${pet.id}/ficha`} className="btn">
            🖨️ Ficha imprimible
          </Link>
          <ConfirmButton
            label="Eliminar mascota"
            confirmLabel={`Sí, eliminar a ${pet.name} y todos sus datos`}
            className="btn danger-ghost"
            onConfirm={async () => {
              await api.del(`/pets/${pet.id}`);
              await qc.invalidateQueries();
              navigate('/');
            }}
          />
        </div>
      </div>
    </header>
  );
}

function TabContent({ tab, data, base }: { tab: string; data: PetFull; base: string }) {
  const vets = useVets().data ?? [];
  const r = data.resources;
  const section = (key: keyof typeof petResources, extra?: Partial<Parameters<typeof ResourceSection>[0]>) => (
    <ResourceSection def={petResources[key]} baseUrl={`${base}/${petResources[key].path}`} rows={r[key] ?? []} {...extra} />
  );

  switch (tab) {
    case 'cartilla':
      return (
        <>
          {section('vaccinations')}
          {section('dewormings')}
        </>
      );
    case 'historial':
      return (
        <>
          {section('medicalRecords', { rowClass: (row) => (row.kind === 'alergia' ? 'row-warn' : undefined) })}
          {section('labResults')}
        </>
      );
    case 'alimentacion':
      return (
        <>
          <SingletonSection def={petSingletons.diet} url={`${base}/diet`} value={data.singletons.diet} />
          {section('appetiteLogs')}
        </>
      );
    case 'tratamientos':
      return section('treatments', { rowClass: (row) => (row.active ? 'row-active' : 'row-muted') });
    case 'habitos':
      return <SingletonSection def={petSingletons.habits} url={`${base}/habits`} value={data.singletons.habits} />;
    case 'consulta':
      return <ConsultaTab data={data} section={section} />;
    default:
      return (
        <>
          <section className="card">
            <div className="card-head">
              <h3>Datos de identificación</h3>
              <Link to={`/mascotas/${data.pet.id}/editar`} className="btn small primary">
                Editar
              </Link>
            </div>
            <Details fields={petDef.fields} values={data.pet as unknown as Record<string, unknown>} vets={vets} />
          </section>
          <section className="card">
            <div className="card-head">
              <h3>Recordatorios</h3>
            </div>
            <RemindersList reminders={data.reminders} showPet={false} />
          </section>
        </>
      );
  }
}

function ConsultaTab({
  data,
  section,
}: {
  data: PetFull;
  section: (key: keyof typeof petResources, extra?: { rowClass?: (row: Row) => string | undefined }) => ReactNode;
}) {
  const vets = useVets().data ?? [];
  const emergencyVets = vets.filter((v) => v.isEmergency && v.id !== data.primaryVet?.id);
  const lastCheckup = data.resources.checkups?.[0]?.date as string | undefined;
  const control = data.reminders.find((x) => x.kind === 'control');

  return (
    <>
      <UrgencyBox />
      <section className="card">
        <div className="card-head">
          <h3>Veterinarios</h3>
          <Link to="/veterinarios" className="btn small">
            Gestionar
          </Link>
        </div>
        <div className="vet-list">
          {data.primaryVet ? (
            <VetCard vet={data.primaryVet} role="De cabecera" />
          ) : (
            <p className="muted">
              Sin veterinario de cabecera. <Link to={`/mascotas/${data.pet.id}/editar`}>Asignar uno</Link>.
            </p>
          )}
          {emergencyVets.map((v) => (
            <VetCard key={v.id} vet={v} role="Guardia" />
          ))}
        </div>
      </section>
      {section('symptoms', {
        rowClass: (row) => (row.resolved ? 'row-muted' : row.worsening ? 'row-danger' : 'row-warn'),
      })}
      <section className="card">
        <div className="card-head">
          <h3>Frecuencia de controles</h3>
        </div>
        <p>
          Etapa: <strong>{data.lifeStage.label}</strong> — {data.lifeStage.rule}
        </p>
        <p>
          Último control: <strong>{formatDate(lastCheckup)}</strong>
          {control?.dueDate && (
            <>
              {' '}
              · Próximo: <strong>{formatDate(control.dueDate)}</strong>
            </>
          )}
        </p>
        <ul className="muted small">
          <li>Cachorros/crías: cada 3 a 4 semanas hasta los 4 meses.</li>
          <li>Adultos: al menos 1 vez al año.</li>
          <li>Mayores: cada 6 meses (perros desde los 7-8 años según tamaño; gatos y otros desde los 10).</li>
        </ul>
      </section>
      {section('checkups')}
    </>
  );
}
