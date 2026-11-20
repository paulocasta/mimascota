import type { Vet } from '@mimascota/shared';
import { vetName } from './format';

export function VetCard({ vet, role }: { vet: Vet; role?: string }) {
  return (
    <div className="vet-card">
      {role && <div className="vet-role">{role}</div>}
      <strong>{vetName(vet)}</strong>
      {vet.licenseNumber && <span className="muted"> · Mat. {vet.licenseNumber}</span>}
      {vet.clinic && <div>{vet.clinic}</div>}
      {vet.address && <div>📍 {vet.address}</div>}
      {vet.phone && (
        <div>
          📞 <a href={`tel:${vet.phone.replace(/[^\d+]/g, '')}`}>{vet.phone}</a>
        </div>
      )}
      {vet.email && (
        <div>
          ✉️ <a href={`mailto:${vet.email}`}>{vet.email}</a>
        </div>
      )}
      {vet.isEmergency && <div className="badge badge-vencido">Urgencias / guardia</div>}
      {vet.notes && <div className="muted small pre">{vet.notes}</div>}
    </div>
  );
}
