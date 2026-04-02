import { useState, useEffect, useMemo, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { getAbsenciesCalendari, createAbsencia } from '../services/vacaciones.service';
import type { AbsenciesCalendariResponse, TipusAbsenciaTreballador, TipusAbsenciaEmpresa } from '../types/vacaciones.types';

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
