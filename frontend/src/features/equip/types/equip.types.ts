import type { TreballadorBackendItem } from '@/features/horarios/types/treballadors.types';

/** Persona de l'equip tal com la retorna GET /treballadors/:empresaId/paginades */
export interface MembreEquip extends TreballadorBackendItem {
    actiu: boolean;
    diesVacancesAnuals: number;
    diesVacancesUsats: number;
    dataIniciRotacio?: string | null;
    plantillaId?: number | null;
    updatedAt?: string;
}

export type FiltreEstat = 'tots' | 'actius' | 'inactius';

export interface CanvisMembre {
    plantillaId: number | null;
    dataIniciRotacio?: string;
    serveisIds: number[];
    diesVacancesAnuals: number;
}

export interface OpcioSimple {
    id: number;
    nom: string;
}
