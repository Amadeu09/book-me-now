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
