import api from '@/lib/api';

export type CreateEmpresaInput = {
  nom: string;
  ubicacio: string;
  capacitat?: number | null;
};

export async function createEmpresa(input: CreateEmpresaInput) {
  const res = await api.post('/empreses', input);
  return res.data;
}
