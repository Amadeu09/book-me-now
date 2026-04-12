import type { Disponibilitat, Empresa, ServeiPublic } from '@/types/empresa';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getEmpresaPublic(id: number): Promise<Empresa> {
  const res = await fetch(`${API_URL}/empreses/public/${id}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

export async function getServeisPublic(empresaId: number): Promise<ServeiPublic[]> {
  const res = await fetch(`${API_URL}/serveis/public/${empresaId}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

export async function getDisponibilitatPublic(treballadorId: number, serveiId: number): Promise<Disponibilitat> {
  const res = await fetch(
    `${API_URL}/treballadors/disponibilitat-publica/${treballadorId}?serveiId=${serveiId}`,
    { cache: 'no-store' },
  );

  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

export interface CreateReservaPublicDto {
  nom: string;
  cognoms: string;
  email: string;
  telefon: string;
  data: string;
  hora: string;
  observacions?: string;
  idServei: number;
  idTreballador: number;
}

export async function createReservaPublic(dto: CreateReservaPublicDto): Promise<void> {
  const res = await fetch(`${API_URL}/reserves/public`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
    cache: 'no-store',
  });

  if (res.status === 409) throw new Error('CONFLICT');
  if (!res.ok) throw new Error(`Error ${res.status}`);
}

export async function searchEmpreses(query: string, signal?: AbortSignal): Promise<Empresa[]> {
  const res = await fetch(
    `${API_URL}/empreses/cerca?q=${encodeURIComponent(query)}`,
    { cache: 'no-store', signal },
  );

  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }

  return res.json();
}
