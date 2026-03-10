export interface CreateUsuariPayload {
    email: string;
    nom: string;
    password?: string;
    rol: 'EMPLEAT';
    empresaId: number;
}

export interface UsuariResponse {
    id: number;
    email: string;
    nom: string;
    rol: string;
    empresaId: number;
    // other fields omitted
}

export interface JornadaTreballadorPayload {
    plantillaJornadaId: number;
    dataInici: string; // ISO String
    dataFi: string; // ISO String
}

export interface CreateTreballadorPayload {
    nom: string;
    idUsuari: number;
    jornadaTreballador?: JornadaTreballadorPayload;
    serveisIds?: number[];
}

export interface TreballadorResponse {
    id: number;
    nom: string;
    idUsuari: number;
    // other fields omitted
}
