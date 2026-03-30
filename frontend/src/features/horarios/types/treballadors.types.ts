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

/** Assignació de plantilla de jornada a un treballador (backend response) */
export interface PlantillaAssignacioResponse {
    plantilla?: {
        id: number;
        nom: string;
    };
    dataInici?: string;
    dataFi?: string;
}

/** Forma completa del treballador tal como la devuelve el backend paginado */
export interface TreballadorBackendItem {
    id: number;
    nom: string;
    idUsuari: number;
    Usuari?: {
        email: string;
        fotoPerfil?: string | null;
    };
    jornadesPlantillaAssignacions?: PlantillaAssignacioResponse[];
}

/** Respuesta paginada del backend para GET /treballadors/:empresaId/paginades */
export interface TreballadorPaginatedResponse {
    data: TreballadorBackendItem[];
    total: number;
    page: number;
    rows: number;
    totalPages: number;
}
