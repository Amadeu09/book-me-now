import api from "@/core/api/api";
import { Servei, ServeiPage } from "@/types/servei.types";
import { Platform } from 'react-native';

export async function getServeis(page = 1, rows = 6): Promise<ServeiPage> {
  const res = await api.get('/serveis', { params: { page, rows } });
  return res.data;
}

export async function createServei(input: {
  nom: string;
  duradaMin: number;
  preu: number;
  actiu?: boolean;
}): Promise<Servei> {
  const res = await api.post('/serveis', input);
  return res.data;
}

export async function updateServei(id: number, input: {
  nom?: string;
  duradaMin?: number;
  preu?: number;
  actiu?: boolean;
}): Promise<Servei> {
  const res = await api.patch(`/serveis/${id}`, input);
  return res.data;
}

export async function deleteServei(id: number): Promise<Servei> {
  const res = await api.delete(`/serveis/${id}`);
  return res.data;
}

export async function uploadFotoServei(id: number, fileUri: string): Promise<Servei> {
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

  const { data } = await api.patch(`/serveis/${id}/foto`, formData);
  return data;
}