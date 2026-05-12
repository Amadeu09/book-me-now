import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    getHorariEmpresa,
    createHorariTram,
    updateHorariTram,
    deleteHorariTram,
    type HorariEmpresa,
    type CreateHorariEmpresaDto,
    type UpdateHorariEmpresaDto,
} from '../services/horari-empresa.service';

export function useHorariEmpresa() {
    const [empresaId, setEmpresaId] = useState<number | null>(null);
    const [trams, setTrams] = useState<HorariEmpresa[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem('user').then(u => {
            if (u) {
                const parsed = JSON.parse(u);
                setEmpresaId(parsed.empresaId);
                setIsAdmin(parsed.rol === 'ADMIN_GENERAL');
            }
        });
    }, []);

    const fetchData = useCallback(async () => {
        if (!empresaId) return;
        setIsLoading(true);
        try {
            const data = await getHorariEmpresa(empresaId);
            setTrams(data);
        } catch (e) {
            console.error('[useHorariEmpresa] fetch error', e);
        } finally {
            setIsLoading(false);
        }
    }, [empresaId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const create = useCallback(async (dto: CreateHorariEmpresaDto) => {
        if (!empresaId) throw new Error('empresaId not available');
        await createHorariTram(empresaId, dto);
        await fetchData();
    }, [empresaId, fetchData]);

    const update = useCallback(async (id: number, dto: UpdateHorariEmpresaDto) => {
        if (!empresaId) throw new Error('empresaId not available');
        await updateHorariTram(empresaId, id, dto);
        await fetchData();
    }, [empresaId, fetchData]);

    const remove = useCallback(async (id: number) => {
        if (!empresaId) throw new Error('empresaId not available');
        await deleteHorariTram(empresaId, id);
        await fetchData();
    }, [empresaId, fetchData]);

    return { trams, isLoading, isAdmin, empresaId, refetch: fetchData, create, update, remove };
}
