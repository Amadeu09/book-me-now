import { useState, useEffect, useCallback } from 'react';
import { getEstadisticasResum } from '../services/estadisticas.service';
import type { EstadisticasResumResponse } from '../types/estadisticas.types';

export function useEstadisticasResum(mesVisites: number, mesNoShow: number) {
    const [data, setData] = useState<EstadisticasResumResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await getEstadisticasResum({ mesVisites, mesNoShow });
            setData(result);
        } catch (e: any) {
            setError(e?.message ?? 'Error carregant estadístiques');
        } finally {
            setIsLoading(false);
        }
    }, [mesVisites, mesNoShow]);

    useEffect(() => { fetch(); }, [fetch]);

    return { data, isLoading, error };
}
