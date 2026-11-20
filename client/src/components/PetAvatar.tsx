import type { Pet } from '@mimascota/shared';
import { photoUrl } from '../api';

const EMOJI: Record<string, string> = {
  perro: '🐶',
  gato: '🐱',
  conejo: '🐰',
  ave: '🐦',
  roedor: '🐹',
  reptil: '🦎',
};

export function PetAvatar({ pet, size = 96 }: { pet: Pick<Pet, 'name' | 'species' | 'photoPath'>; size?: number }) {
  const src = photoUrl(pet.photoPath);
  return src ? (
    <img className="avatar" src={src} alt={pet.name} width={size} height={size} style={{ width: size, height: size }} />
  ) : (
    <div className="avatar placeholder" style={{ width: size, height: size, fontSize: size * 0.5 }} aria-hidden>
      {EMOJI[pet.species] ?? '🐾'}
    </div>
  );
}
