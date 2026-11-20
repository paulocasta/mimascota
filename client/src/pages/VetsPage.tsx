import { vetDef, type Row } from '@mimascota/shared';
import { useVets } from '../api';
import { ResourceSection } from '../components/ResourceSection';

export function VetsPage() {
  const vets = useVets();
  return (
    <div>
      <div className="page-head">
        <h1>Veterinarios</h1>
      </div>
      <p className="muted">
        Cargá los veterinarios de tus mascotas. Podés asignar uno de cabecera a cada mascota y marcar los que atienden
        urgencias para tenerlos a mano en la pestaña Consulta / Urgencia y en la ficha imprimible.
      </p>
      {vets.error && <p className="error">{vets.error.message}</p>}
      <ResourceSection def={vetDef} baseUrl="/vets" rows={(vets.data ?? []) as unknown as Row[]} title="Mis veterinarios" />
    </div>
  );
}
