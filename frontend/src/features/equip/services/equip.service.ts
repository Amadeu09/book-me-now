import api from '@/core/api/api';
import { getEmpresaId } from '@/utils/session';
import { getServeis } from '@/features/services/services/services.service';
import { getJornadesPaginadas } from '@/features/horarios/services/jornades.service';
import { updateTreballador, deleteTreballador } from '@/features/horarios/services/treballadors.service';
import type { JornadaPlantillaResponse } from '@/features/horarios/types/jornades.types';
import type { CanvisMembre, MembreEquip, OpcioSimple } from '../types/equip.types';

/** Màxim que accepta l'API per pàgina; un negoci petit hi cap sencer. */
const MAX_FILES = 100;

export async function getEquip(): Promise<MembreEquip[]> {
    const empresaId = await getEmpresaId();
    if (!empresaId) throw new Error('Sense empresa a la sessió');
    const res = await api.get(`/treballadors/${empresaId}/paginades`, { params: { page: 1, rows: MAX_FILES } });
    return res.data.data as MembreEquip[];
}

export async function getServeisEmpresa(): Promise<OpcioSimple[]> {
    const res = await getServeis(1, MAX_FILES);
    return res.data.map(s => ({ id: s.id, nom: s.nom }));
}

export async function getPlantillesEmpresa(): Promise<JornadaPlantillaResponse[]> {
    const res = await getJornadesPaginadas(1, MAX_FILES);
    return res.data as JornadaPlantillaResponse[];
}

export function desarMembre(id: number, canvis: CanvisMembre) {
    return updateTreballador(id, {
        plantillaId: canvis.plantillaId,
        dataIniciRotacio: canvis.dataIniciRotacio,
        serveisIds: canvis.serveisIds,
        diesVacancesAnuals: canvis.diesVacancesAnuals,
    } as Parameters<typeof updateTreballador>[1]);
}

export function donarDeBaixa(id: number) {
    return deleteTreballador(id);
}
