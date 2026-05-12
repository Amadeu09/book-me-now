import { useState, useEffect, useCallback } from 'react';
import { getValoracionsEmpresa } from '../services/estadisticas.service';
import type { ValoracionsEmpresaResponse } from '../types/estadisticas.types';

export function useValoracionsEmpresa(page: number, limit: number = 5) {
    const [data, setData] = useState<ValoracionsEmpresaResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await getValoracionsEmpresa({ page, limit });
            setData(result);
        } catch (e: any) {
            setError(e?.message ?? 'Error carregant valoracions');
        } finally {
            setIsLoading(false);
        }
    }, [page, limit]);

    useEffect(() => { fetch(); }, [fetch]);

    return { data, isLoading, error };
}
