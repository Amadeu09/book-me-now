export interface Empresa {
  id: number;
  nom: string;
  ubicacio: string;
  fotoPerfil: string | null;
  bannerUrl: string | null;
  descripcio: string | null;
  tipo: string | null;
}

export interface EmpresaListResponse {
  data: Empresa[];
  total: number;
  page: number;
  totalPages: number;
}

export interface TreballadorPublic {
  id: number;
  nom: string;
  Usuari: { fotoPerfil: string | null };
}

export type Disponibilitat = Record<string, string[]>;

export interface ReservaGestio {
  id: number;
  dataHora: string;
  estat: string;
  clientNom: string | null;
  clientEmail: string | null;
  observacions: string | null;
  servei: { id: number; nom: string; duradaMin: number; preu: string };
  treballador: { id: number; nom: string; Usuari: { fotoPerfil: string | null } } | null;
  empresa: { id: number; nom: string; fotoPerfil: string | null; ubicacio: string | null };
}

export interface HorariTram {
  id: number;
  dow: number;      // 0=Dilluns … 6=Diumenge
  iniciMin: number;
  fiMin: number;
}

export interface AbsenciaEmpresaPublic {
  id: number;
  titol: string;
  inici: string;
  fi: string;
  tipus: 'FESTA_LOCAL' | 'FESTA_ESTATAL' | 'PONT' | 'ALTRE';
}

export interface AgendaPublica {
  horaris: HorariTram[];
  absencies: AbsenciaEmpresaPublic[];
}

export interface ReservaValoracioInfo {
  empresa: { id: number; nom: string; fotoPerfil: string | null };
  treballador: { id: number; nom: string; fotoPerfil: string | null } | null;
  servei: { nom: string };
  dataHora: string;
  jaValorada: boolean;
}

export interface ServeiPublic {
  id: number;
  nom: string;
  descripcio: string | null;
  duradaMin: number;
  preu: number;
  fotoUrl: string | null;
  treballadors: { treballador: TreballadorPublic }[];
}
