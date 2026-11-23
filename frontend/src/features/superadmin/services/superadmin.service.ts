import { create as crearClient } from 'axios';
import { API_URL } from '@/core/api/api';
import { getSuperToken, setSuperToken } from './superadmin.sessio';

/** Client HTTP propi del superadmin: només envia el token de superadmin. */
const sapi = crearClient({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' }, timeout: 15000 });

let enSortir: (() => void) | null = null;
/** El panell es registra aquí per tornar al login si la sessió caduca. */
export function onSessioCaducada(fn: (() => void) | null) {
  enSortir = fn;
}

sapi.interceptors.request.use(async (config) => {
  const token = await getSuperToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

sapi.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error?.response?.status === 401 && !String(error.config?.url ?? '').includes('/superadmin/auth/login')) {
      await setSuperToken(null);
      enSortir?.();
    }
    return Promise.reject(error);
  },
);

export interface Pagina<T> { data: T[]; total: number; page: number; totalPages: number }

export interface EmpresaAdmin {
  id: number;
  nom: string;
  tipo: string;
  ubicacio: string;
  activa: boolean;
  createdAt: string;
  admins: string[];
  usuaris: number;
  treballadors: number;
  reserves30d: number;
}

export type EstatInvitacio = 'PENDENT' | 'USADA' | 'CADUCADA' | 'REVOCADA';
export interface InvitacioAdmin {
  id: number;
  email: string | null;
  nomEmpresa: string | null;
  caduca: string;
  usadaAt: string | null;
  revocada: boolean;
  empresaId: number | null;
  empresaNom: string | null;
  createdAt: string;
  estat: EstatInvitacio;
}

export interface AccioRegistre {
  id: number;
  accio: string;
  detall: Record<string, unknown> | null;
  createdAt: string;
  superAdmin: { email: string };
}

export async function loginSuper(email: string, password: string) {
  const res = await sapi.post<{ token: string; email: string }>('/superadmin/auth/login', { email, password });
  await setSuperToken(res.data.token);
  return res.data;
}

export async function logoutSuper() {
  await sapi.post('/superadmin/auth/logout').catch(() => undefined);
  await setSuperToken(null);
}

export const jo = () => sapi.get<{ email: string }>('/superadmin/auth/jo').then((r) => r.data);

export const recuperarSuper = (email: string) => sapi.post('/superadmin/auth/recuperar', { email });

export const establirContrasenyaSuper = (token: string, password: string) =>
  sapi.post('/superadmin/auth/contrasenya', { token, password });

export const getEmpreses = (cerca: string, page: number) =>
  sapi.get<Pagina<EmpresaAdmin>>('/superadmin/empreses', { params: { cerca: cerca || undefined, page, rows: 20 } }).then((r) => r.data);

export const setEstatEmpresa = (id: number, activa: boolean) =>
  sapi.patch(`/superadmin/empreses/${id}/estat`, { activa }).then((r) => r.data);

export const getInvitacions = (page: number) =>
  sapi.get<Pagina<InvitacioAdmin>>('/superadmin/invitacions', { params: { page, rows: 20 } }).then((r) => r.data);

export const crearInvitacio = (dto: { email?: string; nomEmpresa?: string; dies?: number; enviarEmail?: boolean }) =>
  sapi.post<{ invitacio: InvitacioAdmin; enllac: string; emailEnviat: boolean }>('/superadmin/invitacions', dto).then((r) => r.data);

export const revocarInvitacio = (id: number) => sapi.post(`/superadmin/invitacions/${id}/revocar`).then((r) => r.data);

export const getRegistre = (page: number) =>
  sapi.get<Pagina<AccioRegistre>>('/superadmin/registre', { params: { page, rows: 30 } }).then((r) => r.data);
