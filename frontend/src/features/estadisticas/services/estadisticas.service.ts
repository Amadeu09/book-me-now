import api from '@/core/api/api';
import type { EstadisticasDetallResponse, EstadisticasResumResponse } from '../types/estadisticas.types';

export async function getEstadisticasResum(params: {
    mesVisites: number;
    mesNoShow: number;
}): Promise<EstadisticasResumResponse> {
    const res = await api.get('/estadisticas/resum', { params });
    return res.data;
}

export async function getEstadisticasDetall(params: {
    year: number;
    mes: number;
}): Promise<EstadisticasDetallResponse> {
    const res = await api.get('/estadisticas/detall', { params });
    return res.data;
}
