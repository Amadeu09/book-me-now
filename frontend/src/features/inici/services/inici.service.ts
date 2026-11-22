import api from '@/core/api/api';
import type { TipusAbsencia } from '@/features/home/services/absencies-pendents.service';

export type EstatReserva = 'PENDENT' | 'CONFIRMADA' | 'CANCELLADA' | 'FINALITZADA' | 'NO_SHOW';

export interface CitaInici {
    id: number;
    dataHora: string;
    estat: EstatReserva;
    clientNom: string | null;
    client?: { id: number; nom: string } | null;
    servei?: { id: number; nom: string; duradaMin: number } | null;
    treballador?: { id: number; nom: string } | null;
}

export interface AbsenciaPropia {
    id: number;
    inici: string;
    fi: string;
    tipus: TipusAbsencia;
    estat: 'PENDENT' | 'APROVADA' | 'REBUTJADA';
}

/** Totes les reserves de l'empresa en un rang (només administradors). GET /reserves/setmana */
export async function getCitesEmpresa(inici: string, fi: string): Promise<CitaInici[]> {
    const { data } = await api.get('/reserves/setmana', { params: { inici, fi } });
    return Array.isArray(data) ? data : [];
}

/** Reserves d'un treballador en un rang. GET /reserves/treballador/:id */
export async function getCitesTreballador(treballadorId: number, inici: string, fi: string): Promise<CitaInici[]> {
    const { data } = await api.get(`/reserves/treballador/${treballadorId}`, { params: { inici, fi } });
    return Array.isArray(data) ? data : [];
}

/** Absències de l'usuari connectat. GET /treballadors/my/absencies-calendari */
export async function getMevesAbsencies(): Promise<AbsenciaPropia[]> {
    const { data } = await api.get('/treballadors/my/absencies-calendari');
    return Array.isArray(data?.treballador) ? data.treballador : [];
}
