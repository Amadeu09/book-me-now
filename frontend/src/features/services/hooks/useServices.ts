import { useState, useEffect } from 'react';
import { getServeis } from '../services/services.service';

/**
 * Pre-fetches all services by using a large page size (e.g. 100)
 * Or modifies query to just use page 1 if not natively supported "get all"
 */
export function useAllServices() {
    const [data, setData] = useState<{data: any[]} | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getServeis(1).then(res => {
            setData(res);
            setIsLoading(false);
        }).catch(err => {
            console.error('Error fetching serveis:', err);
            setIsLoading(false);
        });
    }, []);

    return { data, isLoading };
}
