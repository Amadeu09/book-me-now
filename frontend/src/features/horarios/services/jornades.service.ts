import api from '@/core/api/api';
import { getEmpresaId } from '@/utils/session';
import type { CreateJornadaPayload } from '../types/jornades.types';

/* ──────────────────────────────────────────
   Jornades Service
   Mismo patrón que services.service.ts
   empresaId se obtiene automáticamente de la sesión
   ────────────────────────────────────────── */

/**
 * Crea una nueva plantilla de jornada.
 * POST /api/empreses/:empresaId/jornades
 */
export async function createJornada(
    data: Omit<CreateJornadaPayload, 'empresaId'>,
) {
    const empresaId = await getEmpresaId();
    if (!empresaId) throw new Error('No se pudo obtener el empresaId de la sesión');

    const payload: CreateJornadaPayload = { ...data, empresaId };
    const res = await api.post(`/empreses/${empresaId}/jornades`, payload);
    return res.data;
}

/**
 * Lista las plantillas de jornada de la empresa actual.
 * GET /api/empreses/:empresaId/jornades
 */
export async function getJornades() {
    const empresaId = await getEmpresaId();
    if (!empresaId) throw new Error('No se pudo obtener el empresaId de la sesión');

    const res = await api.get(`/empreses/${empresaId}/jornades`);
    return res.data;
}

/**
 * Obtiene una plantilla de jornada por ID.
 * GET /api/empreses/:empresaId/jornades/:id
 */
export async function getJornadaById(id: number) {
    const empresaId = await getEmpresaId();
    if (!empresaId) throw new Error('No se pudo obtener el empresaId de la sesión');

    const res = await api.get(`/empreses/${empresaId}/jornades/${id}`);
    return res.data;
}

/**
 * Lista las plantillas de jornada de la empresa actual, con paginación.
 * GET /api/empreses/:empresaId/jornades/paginadas
 */
export async function getJornadesPaginadas(page: number = 1, rows: number = 2) {
    const empresaId = await getEmpresaId();
    if (!empresaId) throw new Error('No se pudo obtener el empresaId de la sesión');

    const res = await api.get(`/empreses/${empresaId}/jornades/paginadas`, {
        params: { page, rows }
    });
    return res.data;
}

/**
 * Actualiza una plantilla de jornada existente.
 * PUT /api/empreses/:empresaId/jornades/:id
 */
export async function updateJornada(
    id: number,
    data: Partial<Omit<CreateJornadaPayload, 'empresaId'>>
) {
    const empresaId = await getEmpresaId();
    if (!empresaId) throw new Error('No se pudo obtener el empresaId de la sesión');

    const res = await api.put(`/empreses/${empresaId}/jornades/${id}`, data);
    return res.data;
}

/**
 * Elimina una plantilla de jornada existente.
 * DELETE /api/empreses/:empresaId/jornades/:id
 */
export async function deleteJornada(id: number) {
    const empresaId = await getEmpresaId();
    if (!empresaId) throw new Error('No se pudo obtener el empresaId de la sesión');

    const res = await api.delete(`/empreses/${empresaId}/jornades/${id}`);
    return res.data;
}
