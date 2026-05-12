import api from '@/core/api/api';
import type { AbsenciesCalendariResponse, CreateAbsenciaPayload } from '../types/vacaciones.types';

export const getAbsenciesCalendari = (any?: number): Promise<AbsenciesCalendariResponse> => {
    const params = any !== undefined ? `?any=${any}` : '';
    return api
        .get<AbsenciesCalendariResponse>(`/treballadors/my/absencies-calendari${params}`)
        .then(r => r.data);
};

export const createAbsencia = (payload: CreateAbsenciaPayload): Promise<unknown> =>
    api.post('/absencies', payload).then(r => r.data);
