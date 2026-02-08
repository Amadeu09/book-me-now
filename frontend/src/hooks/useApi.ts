import { useState, useCallback } from 'react';

export interface ApiErrorResponse {
    message: string;
    statusCode?: number;
    data?: any;
}

interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: ApiErrorResponse | null;
}

export function useApi<T>() {
    const [state, setState] = useState<UseApiState<T>>({
        data: null,
        loading: false,
        error: null,
    });

    const execute = useCallback(async (request: Promise<T>) => {
        setState({ data: null, loading: true, error: null });
        try {
            const data = await request;
            setState({ data, loading: false, error: null });
            return { data, error: null };
        } catch (err: any) {
            const error: ApiErrorResponse = {
                message: err?.response?.data?.message || err?.message || 'Unknown error',
                statusCode: err?.response?.status,
                data: err?.response?.data,
            };
            setState({ data: null, loading: false, error });
            return { data: null, error };
        }
    }, []);

    const reset = useCallback(() => {
        setState({ data: null, loading: false, error: null });
    }, []);

    return { ...state, execute, reset };
}
