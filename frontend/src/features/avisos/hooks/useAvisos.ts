import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAvisos, marcarLlegit, marcarTotsLlegits } from '../services/avisos.service';

const CLAU = ['avisos'] as const;

/** Avisos de l'usuari; es refresquen cada minut i en tornar a la pestanya. */
export function useAvisos() {
  return useQuery({
    queryKey: CLAU,
    queryFn: getAvisos,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    staleTime: 20_000,
  });
}

export function useMarcarAvisos() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id?: number) => (id ? marcarLlegit(id) : marcarTotsLlegits()),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLAU }),
  });
}
