import { useQuery } from '@tanstack/react-query';
import { getCitesEmpresa, getCitesTreballador, getMevesAbsencies, type CitaInici } from '../services/inici.service';
import { rangPeriode, type PeriodeCites } from '../utils/dates';

const ESTATS_PENDENTS = new Set(['PENDENT', 'CONFIRMADA']);

/** Només les cites que encara han de passar i no estan cancel·lades. */
function nomesPendents(cites: CitaInici[], ara: Date): CitaInici[] {
    return cites
        .filter((c) => ESTATS_PENDENTS.has(c.estat) && new Date(c.dataHora) >= ara)
        .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime());
}

/**
 * Cites pendents del període. Un administrador veu les de tota l'empresa;
 * un empleat, només les seves.
 */
export function useCitesPendents(periode: PeriodeCites, esAdmin: boolean, treballadorId: number | null) {
    return useQuery({
        queryKey: ['inici-cites', periode, esAdmin, treballadorId],
        queryFn: async () => {
            const { inici, fi } = rangPeriode(periode);
            const cites = esAdmin
                ? await getCitesEmpresa(inici, fi)
                : await getCitesTreballador(treballadorId!, inici, fi);
            return nomesPendents(cites, new Date());
        },
        enabled: esAdmin || treballadorId !== null,
        staleTime: 60_000,
    });
}

/** Sol·licituds d'absència pròpies encara sense resposta (vista d'empleat). */
export function useMevesAbsenciesPendents(enabled: boolean) {
    return useQuery({
        queryKey: ['inici-meves-absencies'],
        queryFn: async () => (await getMevesAbsencies()).filter((a) => a.estat === 'PENDENT'),
        enabled,
        staleTime: 60_000,
    });
}
