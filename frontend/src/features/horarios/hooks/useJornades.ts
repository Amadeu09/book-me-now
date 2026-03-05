import { useState, useEffect, useCallback } from 'react';
import { getJornades } from '../services/jornades.service';
import {
    summarizePlantilla,
    type JornadaPlantillaResponse,
    type PlantillaSummary,
} from '../types/jornades.types';

/* ──────────────────────────────────────────
   useJornades – Fetches and manages
   jornada plantillas from the API
   ────────────────────────────────────────── */

interface UseJornadesReturn {
    plantillas: PlantillaSummary[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useJornades(): UseJornadesReturn {
    const [plantillas, setPlantillas] = useState<PlantillaSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const raw: JornadaPlantillaResponse[] = await getJornades();
            const summaries = raw.map((p, i) => summarizePlantilla(p, i));
            setPlantillas(summaries);
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                'No se pudieron cargar las plantillas';
            setError(msg);
            setPlantillas([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { plantillas, loading, error, refetch: fetchData };
}
