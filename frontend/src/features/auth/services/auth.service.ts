import api from "@/core/api/api";

export type LoginInput = {
  email: string;
  password: string;
};

export type SignupInput = {
  empresa: {
    nom: string;
    ubicacio: string;
    capacitat?: number;
    descripcio?: string;
    tipo?: string;
    diasAntesReserva?: number;
  };
  usuari: {
    email: string;
    password: string;
    colorPrimari?: string | null;
  };
};

export type AuthUser = {
  id: string;
  email: string;
  rol: string;
  empresaId: number;
  fotoPerfil?: string | null;
  nom?: string | null;
  colorPrimari?: string | null;
  idioma?: string;
  empresa?: {
    id: number;
    nom: string;
    ubicacio: string;
    capacitat: number | null;
    fotoPerfil?: string;
    bannerUrl?: string;
    descripcio?: string;
    tipo?: string;
    diasAntesReserva?: number;
  };
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export async function login(input: LoginInput): Promise<AuthResponse> {
  const res = await api.post('/auth/login', input);
  return res.data;
}

export async function me() {
  const res = await api.get('/auth/me');
  return res.data;
}

export interface InvitacioPublica {
  email: string | null;
  nomEmpresa: string | null;
  caduca: string;
}

/** Comprova un enllaç d'invitació de registre (error si no és vàlid). */
export async function consultarInvitacio(token: string): Promise<InvitacioPublica> {
  const res = await api.get(`/auth/invitacio/${encodeURIComponent(token)}`);
  return res.data;
}

export async function signup(
  empresaData: SignupInput['empresa'],
  userData: SignupInput['usuari'],
  invitacio: string,
): Promise<AuthResponse> {
  const payload: SignupInput & { invitacio: string } = {
    empresa: empresaData,
    usuari: userData,
    invitacio,
  };
  const res = await api.post('/auth/signup', payload);
  return res.data;
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const res = await api.post('/auth/forgot-password', { email });
  return res.data;
}
