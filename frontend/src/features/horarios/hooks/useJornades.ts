import { useState, useEffect, useCallback, useRef } from 'react';
import { getJornadesPaginadas } from '../services/jornades.service';
import {
    summarizePlantilla,
    type JornadaPlantillaResponse,
    type PlantillaSummary,
} from '../types/jornades.types';

/* ──────────────────────────────────────────
   useJornades – Fetches and manages
   jornada plantillas from the API
   ────────────────────────────────────────── */

export interface UseJornadesReturn {
    plantillas: PlantillaSummary[];
    rawPlantillas: JornadaPlantillaResponse[];
    total: number;
    page: number;
    totalPages: number;
    loading: boolean;
    error: string | null;
    refetch: (newPage?: number) => void;
}

export function useJornades(initialPage = 1, rows = 2): UseJornadesReturn {
    const [plantillas, setPlantillas] = useState<PlantillaSummary[]>([]);
    const [rawPlantillas, setRawPlantillas] = useState<JornadaPlantillaResponse[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const pageRef = useRef(initialPage);

    const fetchData = useCallback(async (targetPage: number = pageRef.current) => {
        try {
            setLoading(true);
            setError(null);
            const { data, total: totalItems, page: currentPage, totalPages: tPages } = await getJornadesPaginadas(targetPage, rows);
            const summaries = data.map((p: any, i: number) => summarizePlantilla(p, i));
            setRawPlantillas(data);
            setPlantillas(summaries);
            setTotal(totalItems);
            pageRef.current = currentPage;
            setPage(currentPage);
            setTotalPages(tPages);
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                'No se pudieron cargar las plantillas';
            setError(msg);
            setPlantillas([]);
            setRawPlantillas([]);
            setTotal(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [rows]);

    useEffect(() => {
        fetchData(initialPage);
    }, [initialPage, rows]);

    return { plantillas, rawPlantillas, total, page, totalPages, loading, error, refetch: fetchData };
}
