export interface MonthStat {
    total: number;
}

export interface DetallServei {
    id: number;
    nom: string;
    reserves: number;
    ingressos: number;
}

export interface DetallTreballador {
    id: number;
    nom: string;
    reserves: number;
    ingressos: number;
    noShows: number;
}

export interface EstadisticasDetallResponse {
    mes: string;
    serveisDestacats: DetallServei[];
    treballadorsDestacats: DetallTreballador[];
}

export interface EstadisticasResumResponse {
    reservesMes: Record<string, MonthStat>;
    noShowsMes: Record<string, MonthStat>;
    ingresosMes: {
        mesActual: number;
        mesPassat: number;
    };
    valoracioMitjana: number | null;
}

export interface ValoracioItem {
    id: number;
    puntuacio: number;
    comentari: string;
    nomClient: string | null;
    dataValoracio: string;
    servei: { nom: string } | null;
}

export interface ValoracionsEmpresaResponse {
    data: ValoracioItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    mitjanaTotal: number | null;
}
