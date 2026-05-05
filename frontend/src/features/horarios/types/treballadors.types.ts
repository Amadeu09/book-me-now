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
}

export interface CreateTreballadorPayload {
    nom: string;
    idUsuari: number;
    diesVacancesAnuals?: number;
    plantillaId?: number;
    serveisIds?: number[];
}

export interface TreballadorResponse {
    id: number;
    nom: string;
    idUsuari: number;
}

/** Forma completa del treballador tal como la devuelve el backend paginado */
export interface TreballadorBackendItem {
    id: number;
    nom: string;
    idUsuari: number;
    diesVacancesAnuals?: number;
    Usuari?: {
        email: string;
        fotoPerfil?: string | null;
    };
    plantilla?: {
        id: number;
        nom: string;
    } | null;
    serveis?: { serveiId: number; servei: { id: number; nom: string } }[];
}

/** Resposta paginada del backend per a GET /treballadors/:empresaId/paginades */
export interface TreballadorPaginatedResponse {
    data: TreballadorBackendItem[];
    total: number;
    page: number;
    rows: number;
    totalPages: number;
}
