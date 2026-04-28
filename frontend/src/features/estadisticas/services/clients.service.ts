import api from '@/core/api/api';
import { getEmpresaId } from '@/utils/session';
import type { ClientItem, ClientsPaginatedResponse } from '../types/clients.types';

const LIMIT = 5;

export async function getClientsPaginats(
    page: number = 1,
    orderBy: 'nom' | 'concurrencia' = 'nom',
): Promise<ClientsPaginatedResponse> {
    const empresaId = await getEmpresaId();
    if (!empresaId) throw new Error('No s\'ha pogut obtenir l\'empresaId de la sessió');

    const res = await api.get(`/clients/empresa/${empresaId}/paginat`, {
        params: { page, limit: LIMIT, orderBy },
    });
    return res.data;
}

export async function createClient(data: {
    nom: string;
    email?: string;
    telefon?: string;
}): Promise<ClientItem> {
    const res = await api.post('/clients', data);
    return res.data;
}

export async function updateClient(id: number, data: {
    nom?: string;
    email?: string;
    telefon?: string;
}): Promise<ClientItem> {
    const res = await api.patch(`/clients/${id}`, data);
    return res.data;
}

export async function deleteClient(id: number): Promise<void> {
    await api.delete(`/clients/${id}`);
}
