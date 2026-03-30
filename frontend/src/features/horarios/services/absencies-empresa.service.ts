import api from '@/core/api/api';
import type { AbsenciaEmpresa, CreateAbsenciaEmpresaDto } from '../types/absencies-empresa.types';

const base = (empresaId: number) => `/empreses/${empresaId}/absencies-empresa`;

export const getAbsenciesEmpresa = (empresaId: number): Promise<AbsenciaEmpresa[]> =>
    api.get<AbsenciaEmpresa[]>(base(empresaId)).then(r => r.data);

export const createAbsenciaEmpresa = (empresaId: number, dto: CreateAbsenciaEmpresaDto): Promise<AbsenciaEmpresa> =>
    api.post<AbsenciaEmpresa>(base(empresaId), dto).then(r => r.data);

export const updateAbsenciaEmpresa = (empresaId: number, id: number, dto: Partial<CreateAbsenciaEmpresaDto>): Promise<AbsenciaEmpresa> =>
    api.put<AbsenciaEmpresa>(`${base(empresaId)}/${id}`, dto).then(r => r.data);

export const deleteAbsenciaEmpresa = (empresaId: number, id: number): Promise<void> =>
    api.delete(`${base(empresaId)}/${id}`).then(r => r.data);
