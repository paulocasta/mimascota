import { URGENCY_SIGNS } from '@mimascota/shared';

export function UrgencyBox() {
  return (
    <section className="urgency" role="note">
      <h3>⚠️ Signos de urgencia — atención veterinaria inmediata</h3>
      <ul>
        {URGENCY_SIGNS.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      <p>Ante cualquiera de estos signos no esperes: llamá o acudí a una guardia veterinaria.</p>
    </section>
  );
}
