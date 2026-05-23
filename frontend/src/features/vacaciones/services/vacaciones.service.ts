import api from '@/core/api/api';
import { getEmpresaId } from '@/utils/session';
import type { AbsenciesCalendariResponse, CreateAbsenciaPayload, TreballadorBasicVacances, UpdateAbsenciaPayload, VacancesResum } from '../types/vacaciones.types';

export const getAbsenciesCalendari = (any?: number): Promise<AbsenciesCalendariResponse> => {
    const params = any !== undefined ? `?any=${any}` : '';
    return api
        .get<AbsenciesCalendariResponse>(`/treballadors/my/absencies-calendari${params}`)
        .then(r => r.data);
};

export const createAbsencia = (payload: CreateAbsenciaPayload): Promise<unknown> =>
    api.post('/absencies', payload).then(r => r.data);

export const getTreballadorsLlista = async (): Promise<TreballadorBasicVacances[]> => {
    const empresaId = await getEmpresaId();
    if (!empresaId) return [];
    const res = await api.get(`/treballadors/${empresaId}/paginades`, { params: { page: 1, rows: 100 } });
    return (res.data.data ?? []).map((t: any) => ({
        id: t.id,
        nom: t.nom,
        fotoPerfil: t.Usuari?.fotoPerfil ?? null,
    }));
};

export const getTreballadorVacancesResum = (treballadorId: number): Promise<VacancesResum> =>
    api.get(`/absencies/treballador/${treballadorId}/vacances-resum`).then(r => r.data);

export const deleteAbsencia = (id: number): Promise<unknown> =>
    api.delete(`/absencies/${id}`).then(r => r.data);

export const updateAbsencia = (id: number, payload: UpdateAbsenciaPayload): Promise<unknown> =>
    api.put(`/absencies/${id}`, payload).then(r => r.data);

export const getAbsenciesCalendariTreballador = (treballadorId: number, any?: number): Promise<AbsenciesCalendariResponse> => {
    const params = any !== undefined ? `?any=${any}` : '';
    return api
        .get<AbsenciesCalendariResponse>(`/absencies/treballador/${treballadorId}/absencies-calendari${params}`)
        .then(r => r.data);
};
