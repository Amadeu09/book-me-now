import { useState, useEffect, useCallback } from 'react';
import { createUsuari, createTreballador, getTreballadorsPaginats } from '../services/treballadors.service';
import type { CreateUsuariPayload, CreateTreballadorPayload, TreballadorPaginatedResponse } from '../types/treballadors.types';

export function useCreateUsuari() {
    const [isPending, setIsPending] = useState(false);

    const mutateAsync = async (data: Omit<CreateUsuariPayload, 'empresaId' | 'rol'>) => {
        setIsPending(true);
        try {
            return await createUsuari(data);
        } finally {
            setIsPending(false);
        }
    };

    return { mutateAsync, isPending };
}

export function useCreateTreballador() {
    const [isPending, setIsPending] = useState(false);

    const mutateAsync = async (data: CreateTreballadorPayload) => {
        setIsPending(true);
        try {
            const result = await createTreballador(data);
            return result;
        } finally {
            setIsPending(false);
        }
    };

    return { mutateAsync, isPending };
}

export function useTreballadors(initialPage: number, rows: number) {
    const [data, setData] = useState<TreballadorPaginatedResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(initialPage);

    const fetchData = useCallback((targetPage = page) => {
        setIsLoading(true);
        getTreballadorsPaginats(targetPage, rows)
            .then(res => {
                setData(res);
                setPage(targetPage);
            })
            .catch(err => console.error('Error fetching treballadors:', err))
            .finally(() => setIsLoading(false));
    }, [page, rows]);

    useEffect(() => {
        fetchData(initialPage);
    }, [initialPage, rows]);

    return { 
        data, 
        isLoading, 
        refetch: fetchData 
    };
}
