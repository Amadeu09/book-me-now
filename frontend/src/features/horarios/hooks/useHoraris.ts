import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getEmpresaId } from '@/utils/session';
import { getHorariEmpresa, substituirDiaHorari, type HorariEmpresa } from '../services/horari-empresa.service';
import {
    getAbsenciesEmpresa, createAbsenciaEmpresa, updateAbsenciaEmpresa, deleteAbsenciaEmpresa,
} from '../services/absencies-empresa.service';
import type { CreateAbsenciaEmpresaDto } from '../types/absencies-empresa.types';

const CLAU_HORARI = ['horari-empresa'] as const;
const CLAU_TANCAMENTS = ['tancaments-empresa'] as const;

async function empresaIdObligatori(): Promise<number> {
    const id = await getEmpresaId();
    if (!id) throw new Error('Sense empresa a la sessió');
    return id;
}

/* ── Horari d'obertura ─────────────────────── */

export function useHorariSetmanal() {
    return useQuery({
        queryKey: CLAU_HORARI,
        queryFn: async () => getHorariEmpresa(await empresaIdObligatori()),
        staleTime: 60_000,
    });
}

export function useDesarDia() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ dow, trams }: { dow: number; trams: { iniciMin: number; fiMin: number }[] }) =>
            substituirDiaHorari(await empresaIdObligatori(), dow, trams),
        onSuccess: (nous, { dow }) => {
            // Actualitzem la memòria cau sense tornar a demanar-ho (evita perdre el focus mentre s'edita)
            qc.setQueryData<HorariEmpresa[]>(CLAU_HORARI, prev =>
                [...(prev ?? []).filter(t => t.dow !== dow), ...nous]
                    .sort((a, b) => a.dow - b.dow || a.iniciMin - b.iniciMin));
        },
    });
}

/* ── Festius i tancaments ──────────────────── */

export function useTancaments() {
    return useQuery({
        queryKey: CLAU_TANCAMENTS,
        queryFn: async () => {
            const tots = await getAbsenciesEmpresa(await empresaIdObligatori());
            return [...tots].sort((a, b) => new Date(a.inici).getTime() - new Date(b.inici).getTime());
        },
        staleTime: 30_000,
    });
}

export function useDesarTancament() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, dto }: { id?: number; dto: CreateAbsenciaEmpresaDto }) => {
            const empresaId = await empresaIdObligatori();
            return id ? updateAbsenciaEmpresa(empresaId, id, dto) : createAbsenciaEmpresa(empresaId, dto);
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: CLAU_TANCAMENTS }),
    });
}

export function useEliminarTancament() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => deleteAbsenciaEmpresa(await empresaIdObligatori(), id),
        onSuccess: () => qc.invalidateQueries({ queryKey: CLAU_TANCAMENTS }),
    });
}

/** Tancaments que encara no han acabat. */
export function esFutur(fi: string): boolean {
    const avui = new Date();
    avui.setHours(0, 0, 0, 0);
    return new Date(fi) >= avui;
}
