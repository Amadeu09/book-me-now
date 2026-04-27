import api from '@/core/api/api';
import { Platform } from 'react-native';

export interface ProfileServei {
    id: number;
    nom: string;
    duradaMin: number;
    preu: number;
    actiu: boolean;
    fotoUrl?: string | null;
}

export interface ProfileReserva {
    id: number;
    dataHora: string;
    estat: 'PENDENT' | 'CONFIRMADA' | 'CANCELLADA' | 'FINALITZADA' | 'NO_SHOW';
    clientNom: string | null;
    servei?: { id: number; nom: string; duradaMin: number };
    client?: { id: number; nom: string; email: string | null };
}

/**
 * Services assigned to a specific treballador
 * GET /serveis/treballador/:id  — available to ADMIN_GENERAL & EMPLEAT
 */
export async function getServeisPerTreballador(treballadorId: number): Promise<ProfileServei[]> {
    const res = await api.get(`/serveis/treballador/${treballadorId}`);
    return Array.isArray(res.data) ? res.data : [];
}

/**
 * All bookings for a treballador (client-side filter for "today")
 * GET /reserves/treballador/:id  — available to ADMIN_GENERAL & EMPLEAT
 */
export async function getReservesTreballador(treballadorId: number): Promise<ProfileReserva[]> {
    const res = await api.get(`/reserves/treballador/${treballadorId}`);
    return Array.isArray(res.data) ? res.data : [];
}

/**
 * Self-service password change — verifies current password on the server
 * POST /auth/change-password
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', { currentPassword, newPassword });
}

/**
 * Self-service color update for the current user
 * PATCH /auth/me/color
 */
export async function updateMyColor(colorPrimari: string | null): Promise<void> {
    await api.patch('/auth/me/color', { colorPrimari });
}

/**
 * Self-service language update for the current user
 * PATCH /auth/me/idioma
 */
export async function updateMyIdioma(idioma: 'ca' | 'es'): Promise<void> {
    await api.patch('/auth/me/idioma', { idioma });
}

/**
 * Self-service profile photo upload for the current user
 * PATCH /auth/me/foto
 */
export async function uploadMyFoto(fileUri: string): Promise<string | undefined> {
    const formData = new FormData();
    const filename = fileUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    if (Platform.OS === 'web') {
        const response = await fetch(fileUri);
        const blob = await response.blob();
        formData.append('foto', new File([blob], filename, { type }));
    } else {
        formData.append('foto', { uri: fileUri, name: filename, type } as any);
    }

    const res = await api.patch('/auth/me/foto', formData);
    return res.data?.fotoPerfil as string | undefined;
}
