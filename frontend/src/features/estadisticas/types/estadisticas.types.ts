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
}
