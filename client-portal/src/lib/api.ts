import type { Disponibilitat, Empresa, EmpresaListResponse, ServeiPublic, ReservaGestio, AgendaPublica, ReservaValoracioInfo } from '@/types/empresa';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getEmpresaPublic(id: number): Promise<Empresa> {
  const res = await fetch(`${API_URL}/empreses/public/${id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

export async function getServeisPublic(empresaId: number): Promise<ServeiPublic[]> {
  const res = await fetch(`${API_URL}/serveis/public/${empresaId}`, {
    cache: 'no-store',
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

export async function getEmpresasPublic(
  tipo: string | null,
  page: number,
  limit: number,
): Promise<EmpresaListResponse> {
  const params = new URLSearchParams();
  if (tipo) params.set('tipo', tipo);
  params.set('page', String(page));
  params.set('limit', String(limit));

  const res = await fetch(`${API_URL}/empreses/directori?${params}`, {
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

export async function getReservaByToken(token: string): Promise<ReservaGestio> {
  const res = await fetch(`${API_URL}/reserves/gestio/${token}`, { cache: 'no-store' });
  if (res.status === 404) throw new Error('NOT_FOUND');
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

export async function cancellarReservaByToken(token: string): Promise<void> {
  const res = await fetch(`${API_URL}/reserves/gestio/${token}/cancellar`, {
    method: 'PATCH',
    cache: 'no-store',
  });
  if (res.status === 404) throw new Error('NOT_FOUND');
  if (res.status === 400) throw new Error('BAD_REQUEST');
  if (!res.ok) throw new Error(`Error ${res.status}`);
}

export async function modificarReservaByToken(token: string, data: string, hora: string): Promise<void> {
  const res = await fetch(`${API_URL}/reserves/gestio/${token}/modificar`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data, hora }),
    cache: 'no-store',
  });
  if (res.status === 404) throw new Error('NOT_FOUND');
  if (res.status === 409) throw new Error('CONFLICT');
  if (res.status === 400) throw new Error('BAD_REQUEST');
  if (!res.ok) throw new Error(`Error ${res.status}`);
}

export async function getAgendaPublic(empresaId: number): Promise<AgendaPublica> {
  const res = await fetch(`${API_URL}/empreses/${empresaId}/horari/public`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

export async function getReservaValoracioInfo(token: string): Promise<ReservaValoracioInfo> {
  const res = await fetch(`${API_URL}/valoracions/reserva/${token}`, { cache: 'no-store' });
  if (res.status === 404) throw new Error('NOT_FOUND');
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

export interface CreateValoracioByTokenDto {
  puntuacioEmpresa: number;
  comentariEmpresa: string;
  puntuacioTreballador?: number;
  comentariTreballador?: string;
}

export async function createValoracioByToken(token: string, dto: CreateValoracioByTokenDto): Promise<void> {
  const res = await fetch(`${API_URL}/valoracions/reserva/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
    cache: 'no-store',
  });
  if (res.status === 404) throw new Error('NOT_FOUND');
  if (res.status === 409) throw new Error('JA_VALORADA');
  if (res.status === 400) throw new Error('BAD_REQUEST');
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
