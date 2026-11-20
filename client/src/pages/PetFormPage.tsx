import { petDef, type Pet } from '@mimascota/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, usePetFull } from '../api';
import { FieldsForm } from '../components/FieldsForm';

export function PetFormPage() {
  const { id } = useParams();
  const petId = id ? Number(id) : null;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const existing = usePetFull(petId ?? 0);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!photo) return setPreview(null);
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  if (petId && !existing.data) {
    return <p className="muted">{existing.error ? existing.error.message : 'Cargando…'}</p>;
  }

  async function save(values: Record<string, unknown>) {
    const pet = petId ? await api.put<Pet>(`/pets/${petId}`, values) : await api.post<Pet>('/pets', values);
    if (photo) {
      const fd = new FormData();
      fd.append('photo', photo);
      await api.post(`/pets/${pet.id}/photo`, fd);
    }
    await qc.invalidateQueries();
    navigate(`/mascotas/${pet.id}`);
  }

  return (
    <div className="narrow">
      <p>
        <Link to={petId ? `/mascotas/${petId}` : '/'}>← Volver</Link>
      </p>
      <h1>{petId ? `Editar ${existing.data?.pet.name}` : 'Nueva mascota'}</h1>
      <section className="card">
        <FieldsForm
          fields={petDef.fields}
          initial={existing.data?.pet as unknown as Record<string, unknown> | undefined}
          onSubmit={save}
          onCancel={() => navigate(-1)}
          submitLabel={petId ? 'Guardar cambios' : 'Crear mascota'}
        >
          <div className="field">
            <label htmlFor="f-photo">Foto de referencia {petId && <span className="muted">(reemplaza la actual)</span>}</label>
            <input
              id="f-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
            />
            {preview && <img src={preview} alt="Vista previa" className="avatar" width={96} height={96} />}
          </div>
        </FieldsForm>
      </section>
    </div>
  );
}
