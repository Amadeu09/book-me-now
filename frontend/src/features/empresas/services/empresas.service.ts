import api from '@/core/api/api';
import type { AuthUser } from '@/features/auth/services/auth.service';
import { Platform } from 'react-native';

/**
 * Obtiene los datos de una empresa por su ID.
 * GET /empreses/:id
 */
export async function getEmpresa(id: number): Promise<AuthUser['empresa']> {
  const { data } = await api.get(`/empreses/${id}`);
  return data;
}

/**
 * Actualiza los datos de una empresa por su ID.
 * PATCH /empreses/:id
 */
export async function updateEmpresa(id: number, payload: Partial<{ nom: string; ubicacio: string; capacitat: number | null; descripcio: string; tipo: string }>): Promise<AuthUser['empresa']> {
  const { data } = await api.patch(`/empreses/${id}`, payload);
  return data;
}

/**
 * Sube una nueva foto de perfil de la empresa.
 * PATCH /empreses/:id/foto
 */
export async function uploadFotoEmpresa(id: number, fileUri: string): Promise<AuthUser['empresa']> {
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

  const { data } = await api.patch(`/empreses/${id}/foto`, formData);
  return data;
}

/**
 * Sube el banner de la empresa.
 * PATCH /empreses/:id/banner
 */
export async function uploadBannerEmpresa(id: number, fileUri: string): Promise<AuthUser['empresa']> {
  const formData = new FormData();
  const filename = fileUri.split('/').pop() || 'banner.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  if (Platform.OS === 'web') {
    const response = await fetch(fileUri);
    const blob = await response.blob();
    formData.append('banner', new File([blob], filename, { type }));
  } else {
    formData.append('banner', { uri: fileUri, name: filename, type } as any);
  }

  const { data } = await api.patch(`/empreses/${id}/banner`, formData);
  return data;
}
