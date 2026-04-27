import api from '@/core/api/api';

export interface HorariEmpresa {
    id: number;
    empresaId: number;
    dow: number;
    iniciMin: number;
    fiMin: number;
}

export interface CreateHorariEmpresaDto {
    dow: number;
    iniciMin: number;
    fiMin: number;
}

export interface UpdateHorariEmpresaDto {
    iniciMin: number;
    fiMin: number;
}

const base = (empresaId: number) => `/empreses/${empresaId}/horari`;

export const getHorariEmpresa = (empresaId: number): Promise<HorariEmpresa[]> =>
    api.get<HorariEmpresa[]>(base(empresaId)).then(r => r.data);

export const createHorariTram = (empresaId: number, dto: CreateHorariEmpresaDto): Promise<HorariEmpresa> =>
    api.post<HorariEmpresa>(base(empresaId), dto).then(r => r.data);

export const updateHorariTram = (empresaId: number, id: number, dto: UpdateHorariEmpresaDto): Promise<HorariEmpresa> =>
    api.put<HorariEmpresa>(`${base(empresaId)}/${id}`, dto).then(r => r.data);

export const deleteHorariTram = (empresaId: number, id: number): Promise<void> =>
    api.delete(`${base(empresaId)}/${id}`).then(r => r.data);
