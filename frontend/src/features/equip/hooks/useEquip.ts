import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { desarMembre, donarDeBaixa, getEquip, getPlantillesEmpresa, getServeisEmpresa } from '../services/equip.service';
import type { CanvisMembre } from '../types/equip.types';

export const CLAU_EQUIP = ['equip'] as const;
export const CLAU_PLANTILLES = ['plantilles-empresa'] as const;
const CLAU_SERVEIS = ['serveis-empresa'] as const;

export function useEquip() {
    return useQuery({ queryKey: CLAU_EQUIP, queryFn: getEquip, staleTime: 30_000 });
}

export function useServeisEmpresa() {
    return useQuery({ queryKey: CLAU_SERVEIS, queryFn: getServeisEmpresa, staleTime: 60_000 });
}

export function usePlantillesEmpresa() {
    return useQuery({ queryKey: CLAU_PLANTILLES, queryFn: getPlantillesEmpresa, staleTime: 30_000 });
}

export function useDesarMembre() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, canvis }: { id: number; canvis: CanvisMembre }) => desarMembre(id, canvis),
        onSuccess: () => qc.invalidateQueries({ queryKey: CLAU_EQUIP }),
    });
}

export function useDonarDeBaixa() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => donarDeBaixa(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: CLAU_EQUIP }),
    });
}
