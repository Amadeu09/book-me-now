import api from "@/core/api/api";
import { Servei, ServeiPage } from "@/types/servei.types";

export async function getServeis(page = 1): Promise<ServeiPage> {
  const res = await api.get('/serveis', { params: { page } });
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