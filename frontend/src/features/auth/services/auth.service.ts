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

export async function signup(
  empresaData: SignupInput['empresa'],
  userData: SignupInput['usuari']
): Promise<AuthResponse> {
  const payload: SignupInput = {
    empresa: empresaData,
    usuari: userData,
  };
  const res = await api.post('/auth/signup', payload);
  return res.data;
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const res = await api.post('/auth/forgot-password', { email });
  return res.data;
}
