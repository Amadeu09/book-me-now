import { useState, useEffect, useCallback } from 'react';
import { getClientsPaginats } from '../services/clients.service';
import type { ClientsPaginatedResponse } from '../types/clients.types';

export function useClientsEmpresa(
    initialPage: number = 1,
    orderBy: 'nom' | 'concurrencia' = 'nom',
) {
    const [data, setData] = useState<ClientsPaginatedResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(initialPage);

    const fetchData = useCallback((targetPage = page) => {
        setIsLoading(true);
        setError(null);
        getClientsPaginats(targetPage, orderBy)
            .then(res => {
                setData(res);
                setPage(targetPage);
            })
            .catch(() => setError('No s\'han pogut carregar els clients'))
            .finally(() => setIsLoading(false));
    }, [page, orderBy]);

    useEffect(() => {
        fetchData(1);
    }, [orderBy]);

    useEffect(() => {
        fetchData(initialPage);
    }, []);

    return { data, isLoading, error, refetch: fetchData };
}
