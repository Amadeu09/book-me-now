import { useQuery } from '@tanstack/react-query';
import { getEmpresa } from '../services/empresas.service';
import type { AuthUser } from '@/features/auth/services/auth.service';

/**
 * Hook para obtener la empresa con React Query
 */
export function useEmpresa(id: number | null | undefined) {
  return useQuery<AuthUser['empresa'], Error>({
    queryKey: ['empresa', id],
    queryFn: () => {
      if (!id) throw new Error('ID requerido');
      return getEmpresa(id);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });
}
