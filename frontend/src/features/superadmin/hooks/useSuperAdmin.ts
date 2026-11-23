import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '../services/superadmin.service';

export function useEmpresesAdmin(cerca: string, page: number) {
  return useQuery({ queryKey: ['sa-empreses', cerca, page], queryFn: () => api.getEmpreses(cerca, page), placeholderData: keepPreviousData });
}

export function useEstatEmpresa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activa }: { id: number; activa: boolean }) => api.setEstatEmpresa(id, activa),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sa-empreses'] });
      qc.invalidateQueries({ queryKey: ['sa-registre'] });
    },
  });
}

export function useInvitacionsAdmin(page: number) {
  return useQuery({ queryKey: ['sa-invitacions', page], queryFn: () => api.getInvitacions(page), placeholderData: keepPreviousData });
}

export function useCrearInvitacio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.crearInvitacio,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sa-invitacions'] });
      qc.invalidateQueries({ queryKey: ['sa-registre'] });
    },
  });
}

export function useRevocarInvitacio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.revocarInvitacio,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sa-invitacions'] });
      qc.invalidateQueries({ queryKey: ['sa-registre'] });
    },
  });
}

export function useRegistreAdmin(page: number) {
  return useQuery({ queryKey: ['sa-registre', page], queryFn: () => api.getRegistre(page), placeholderData: keepPreviousData });
}
