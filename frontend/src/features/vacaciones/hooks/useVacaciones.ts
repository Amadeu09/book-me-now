import { useState, useEffect, useMemo, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { getAbsenciesCalendari, createAbsencia, getAbsenciesCalendariTreballador, deleteAbsencia, updateAbsencia } from '../services/vacaciones.service';
import type { AbsenciesCalendariResponse, TipusAbsenciaTreballador, TipusAbsenciaEmpresa, UpdateAbsenciaPayload } from '../types/vacaciones.types';

function expandToMap<T extends string>(items: Array<{ inici: string; fi: string; tipus: T }>): Map<string, T> {
    const map = new Map<string, T>();
    for (const item of items) {
        const start = new Date(item.inici);
        const end = new Date(item.fi);
        const cur = new Date(start);
        while (cur <= end) {
            map.set(cur.toISOString().split('T')[0], item.tipus);
            cur.setDate(cur.getDate() + 1);
        }
    }
    return map;
}

export function useVacaciones(year: number) {
    const [data, setData] = useState<AbsenciesCalendariResponse>({ treballador: [], empresa: [], diesVacancesAnuals: 0, missatgeDies: null });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        setIsLoading(true);
        setError(null);
        getAbsenciesCalendari(year)
            .then(setData)
            .catch(e => setError(e?.message ?? 'Error carregant absències'))
            .finally(() => setIsLoading(false));
    }, [year, refreshKey]);

    const refetch = useCallback(() => setRefreshKey(k => k + 1), []);

    const holidayDates = useMemo(() => expandToMap<TipusAbsenciaEmpresa>(data.empresa), [data.empresa]);
    // Only approved absències colour the calendar days
    const absenciaDates = useMemo(
        () => expandToMap<TipusAbsenciaTreballador>(data.treballador.filter(a => a.estat === 'APROVADA')),
        [data.treballador],
    );

    return { data, isLoading, error, holidayDates, absenciaDates, refetch };
}

export function useCreateAbsencia() {
    return useMutation({ mutationFn: createAbsencia });
}

export function useDeleteAbsencia() {
    return useMutation({ mutationFn: (id: number) => deleteAbsencia(id) });
}

export function useUpdateAbsencia() {
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: UpdateAbsenciaPayload }) =>
            updateAbsencia(id, payload),
    });
}

export function useWorkerCalendar(treballadorId: number | null, year: number) {
    const [data, setData] = useState<AbsenciesCalendariResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (!treballadorId) { setData(null); return; }
        setIsLoading(true);
        getAbsenciesCalendariTreballador(treballadorId, year)
            .then(setData)
            .catch(() => setData(null))
            .finally(() => setIsLoading(false));
    }, [treballadorId, year, refreshKey]);

    const refetch = useCallback(() => setRefreshKey(k => k + 1), []);

    const absenciaDates = useMemo(
        () => data
            ? expandToMap<TipusAbsenciaTreballador>(data.treballador.filter(a => a.estat === 'APROVADA'))
            : null,
        [data],
    );

    return { absenciaDates, data, isLoading, refetch };
}
