import api from '@/core/api/api';
import { getEmpresaId } from '@/utils/session';
import { Platform } from 'react-native';
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

/**
 * Sube la foto de perfil de un usuario.
 * PATCH /api/usuaris/:id/foto
 */
export async function uploadFotoUsuari(id: number, fileUri: string): Promise<UsuariResponse> {
    const formData = new FormData();
    const filename = fileUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    if (Platform.OS === 'web') {
        // On web, the URI is a blob: URL — fetch it to get a real Blob
        const response = await fetch(fileUri);
        const blob = await response.blob();
        formData.append('foto', new File([blob], filename, { type }));
    } else {
        // On native, React Native's XHR handles { uri, name, type } directly
        formData.append('foto', { uri: fileUri, name: filename, type } as any);
    }

    // Do NOT set Content-Type manually — let Axios set multipart/form-data with the boundary
    const { data } = await api.patch(`/usuaris/${id}/foto`, formData);
    return data;
}
