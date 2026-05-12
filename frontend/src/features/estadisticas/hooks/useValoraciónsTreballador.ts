import { useState, useEffect, useCallback } from 'react';
import { getValoraciónsTreballador } from '../services/estadisticas.service';
import type { ValoracionsEmpresaResponse } from '../types/estadisticas.types';

export function useValoraciónsTreballador(treballadorId: number | null, page: number, limit: number = 5) {
    const [data, setData] = useState<ValoracionsEmpresaResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        if (treballadorId === null) { setData(null); setIsLoading(false); return; }
        setIsLoading(true);
        setError(null);
        try {
            const result = await getValoraciónsTreballador(treballadorId, { page, limit });
            setData(result);
        } catch (e: any) {
            setError(e?.message ?? 'Error carregant valoracions');
        } finally {
            setIsLoading(false);
        }
    }, [treballadorId, page, limit]);

    useEffect(() => { fetch(); }, [fetch]);

    return { data, isLoading, error };
}
