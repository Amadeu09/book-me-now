export interface ApiServei {
    id: number;
    nom: string;
    duradaMin: number;
    preu: number;
    empresaId: number;
    actiu: boolean;
}

export interface ApiTreballador {
    id: number;
    idUsuari: number;
    nom: string;
    empresaId: number;
    actiu: boolean;
}

export interface ApiClient {
    id: number;
    nom: string;
    email: string | null;
    telefon: string | null;
    empresaId: number;
}

export interface ApiReserva {
    id: number;
    dataHora: string;
    estat: 'PENDENT' | 'CONFIRMADA' | 'CANCELLADA' | 'FINALITZADA' | 'NO_SHOW';
    empresaId: number;
    treballadorId: number | null;
    clientId: number | null;
    clientNom: string | null;
    clientEmail: string | null;
    observacions: string | null;
    serveiId: number;
    servei?: ApiServei;
    treballador?: ApiTreballador;
    client?: ApiClient;
}

export interface ApiTreballador {
    id: number;
    idUsuari: number;
    nom: string;
    empresaId: number;
    actiu: boolean;
}
