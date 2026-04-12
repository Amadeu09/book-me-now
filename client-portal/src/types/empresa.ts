export interface Empresa {
  id: number;
  nom: string;
  ubicacio: string;
  fotoPerfil: string | null;
  bannerUrl: string | null;
  descripcio: string | null;
  colorPrimari: string | null;
}

export interface TreballadorPublic {
  id: number;
  nom: string;
  Usuari: { fotoPerfil: string | null };
}

export type Disponibilitat = Record<string, string[]>;

export interface ServeiPublic {
  id: number;
  nom: string;
  descripcio: string | null;
  duradaMin: number;
  preu: number;
  fotoUrl: string | null;
  treballadors: { treballador: TreballadorPublic }[];
}
