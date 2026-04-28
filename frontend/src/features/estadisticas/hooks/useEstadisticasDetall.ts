import { useState, useEffect, useCallback } from 'react';
import { getEstadisticasDetall } from '../services/estadisticas.service';
import type { EstadisticasDetallResponse } from '../types/estadisticas.types';

export function useEstadisticasDetall(year: number, mes: number) {
    const [data, setData] = useState<EstadisticasDetallResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await getEstadisticasDetall({ year, mes });
            setData(result);
        } catch (e: any) {
            setError(e?.message ?? 'Error carregant detall');
        } finally {
            setIsLoading(false);
        }
    }, [year, mes]);

    useEffect(() => { fetch(); }, [fetch]);

    return { data, isLoading, error };
}
