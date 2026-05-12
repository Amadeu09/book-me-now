import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    getAbsenciesEmpresa,
    createAbsenciaEmpresa,
    updateAbsenciaEmpresa,
    deleteAbsenciaEmpresa,
} from '../services/absencies-empresa.service';
import type { AbsenciaEmpresa, CreateAbsenciaEmpresaDto } from '../types/absencies-empresa.types';

const PAGE_SIZE = 4;

export function useAbsenciesEmpresa() {
    const [empresaId, setEmpresaId] = useState<number | null>(null);
    const [allFuture, setAllFuture] = useState<AbsenciaEmpresa[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        AsyncStorage.getItem('user').then(u => {
            if (u) setEmpresaId(JSON.parse(u).empresaId);
        });
    }, []);

    const fetchData = useCallback(async () => {
        if (!empresaId) return;
        setIsLoading(true);
        try {
            const all = await getAbsenciesEmpresa(empresaId);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const future = all
                .filter(a => new Date(a.fi) >= today)
                .sort((a, b) => new Date(a.inici).getTime() - new Date(b.inici).getTime());
            setAllFuture(future);
            setPage(1);
        } catch (e) {
            console.error('[useAbsenciesEmpresa] fetch error', e);
        } finally {
            setIsLoading(false);
        }
    }, [empresaId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const create = useCallback(async (dto: CreateAbsenciaEmpresaDto) => {
        if (!empresaId) throw new Error('empresaId not available');
        await createAbsenciaEmpresa(empresaId, dto);
        await fetchData();
    }, [empresaId, fetchData]);

    const update = useCallback(async (id: number, dto: Partial<CreateAbsenciaEmpresaDto>) => {
        if (!empresaId) throw new Error('empresaId not available');
        await updateAbsenciaEmpresa(empresaId, id, dto);
        await fetchData();
    }, [empresaId, fetchData]);

    const remove = useCallback(async (id: number) => {
        if (!empresaId) throw new Error('empresaId not available');
        await deleteAbsenciaEmpresa(empresaId, id);
        await fetchData();
    }, [empresaId, fetchData]);

    const totalPages = Math.max(1, Math.ceil(allFuture.length / PAGE_SIZE));
    const paginatedData = allFuture.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return {
        data: paginatedData,
        total: allFuture.length,
        page,
        totalPages,
        isLoading,
        setPage,
        refetch: fetchData,
        create,
        update,
        remove,
    };
}
