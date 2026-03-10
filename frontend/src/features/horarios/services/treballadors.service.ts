import api from '@/core/api/api';
import { getEmpresaId } from '@/utils/session';
import type { CreateUsuariPayload, UsuariResponse, CreateTreballadorPayload, TreballadorResponse } from '../types/treballadors.types';

/**
 * Crea un usuario nuevo con rol TREBALLADOR
 * POST /api/usuaris
 */
export async function createUsuari(data: Omit<CreateUsuariPayload, 'empresaId' | 'rol'>): Promise<UsuariResponse> {
    const empresaId = await getEmpresaId();
    if (!empresaId) throw new Error('No se pudo obtener el empresaId de la sesión');

    const payload: CreateUsuariPayload = {
        ...data,
        rol: 'EMPLEAT',
        empresaId,
    };

    const res = await api.post('/usuaris', payload);
    return res.data;
}

/**
 * Crea un trabajador asociado a un usuario
 * POST /api/treballadors
 */
export async function createTreballador(data: CreateTreballadorPayload): Promise<TreballadorResponse> {
    const res = await api.post('/treballadors', data);
    return res.data;
}

/**
 * Obtiene los trabajadores paginados de la empresa actual
 * GET /api/treballadors/:empresaId/paginades
 */
export async function getTreballadorsPaginats(page: number = 1, rows: number = 4) {
    const empresaId = await getEmpresaId();
    if (!empresaId) throw new Error('No se pudo obtener el empresaId de la sesión');

    const res = await api.get(`/treballadors/${empresaId}/paginades`, {
        params: { page, rows }
    });
    return res.data;
}

/**
 * Actualiza un trabajador existente
 * PUT /api/treballadors/:id
 */
export async function updateTreballador(id: number, data: Partial<CreateTreballadorPayload>) {
    const res = await api.put(`/treballadors/${id}`, data);
    return res.data;
}

/**
 * Elimina un trabajador existente
 * DELETE /api/treballadors/:id
 */
export async function deleteTreballador(id: number) {
    const res = await api.delete(`/treballadors/${id}`);
    return res.data;
}
