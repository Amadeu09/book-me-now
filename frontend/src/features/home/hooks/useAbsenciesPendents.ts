import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAbsenciesPendents, updateEstatAbsencia } from '../services/absencies-pendents.service';

export function useAbsenciesPendents(page: number) {
    return useQuery({
        queryKey: ['absencies-pendents', page],
        queryFn: () => getAbsenciesPendents(page),
        staleTime: 30_000,
    });
}

export function useUpdateEstatAbsencia() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, estat }: { id: number; estat: 'APROVADA' | 'REBUTJADA' }) =>
            updateEstatAbsencia(id, estat),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['absencies-pendents'] });
        },
    });
}
