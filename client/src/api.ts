import type { Pet, PetFull, Reminder, Vet } from '@mimascota/shared';
import { useQuery } from '@tanstack/react-query';

export class ApiError extends Error {}

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const init: RequestInit = { method };
  if (body instanceof FormData) {
    init.body = body;
  } else if (body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(body);
  }
  const res = await fetch(`/api${url}`, init);
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.error ?? `Error ${res.status}`);
  return data as T;
}

export const api = {
  get: <T,>(url: string) => request<T>('GET', url),
  post: <T,>(url: string, body?: unknown) => request<T>('POST', url, body),
  put: <T,>(url: string, body?: unknown) => request<T>('PUT', url, body),
  del: (url: string) => request<void>('DELETE', url),
};

export const photoUrl = (p: string | null | undefined) => (p ? `/uploads/${p}` : null);

export const usePets = () => useQuery({ queryKey: ['pets'], queryFn: () => api.get<Pet[]>('/pets') });
export const useVets = () => useQuery({ queryKey: ['vets'], queryFn: () => api.get<Vet[]>('/vets') });
export const useReminders = () => useQuery({ queryKey: ['reminders'], queryFn: () => api.get<Reminder[]>('/reminders') });
export const usePetFull = (id: number) =>
  useQuery({ queryKey: ['pet', id], queryFn: () => api.get<PetFull>(`/pets/${id}/full`), enabled: id > 0 });
