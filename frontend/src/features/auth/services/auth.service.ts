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
    colorPrimari?: string;
  };
  usuari: {
    email: string;
    password: string;
  };
};

export type AuthUser = {
  id: string;
  email: string;
  rol: string;
  empresaId: number;
  empresa?: {
    id: number;
    nom: string;
    ubicacio: string;
    capacitat: number | null;
    fotoPerfil?: string;
    bannerUrl?: string;
    descripcio?: string;
    colorPrimari?: string;
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
