import { useQuery } from '@tanstack/react-query';
import { getTreballadorsPaginats } from '@/features/horarios/services/treballadors.service';
import { getServeisPerTreballador, getReservesTreballador, ProfileReserva } from '../services/profile.service';

/** Finds the treballador record for the currently logged-in user */
export function useMiTreballador(empresaId: number | null, usuariId: number | null) {
    return useQuery({
        queryKey: ['mi-treballador', empresaId, usuariId],
        queryFn: async () => {
            const res = await getTreballadorsPaginats(1, 100);
            const list: any[] = res?.data ?? [];
            return list.find((t) => t.idUsuari === usuariId) ?? null;
        },
        enabled: !!empresaId && !!usuariId,
        staleTime: 5 * 60 * 1000,
    });
}

/** Services assigned to a treballador */
export function useTreballadorServeis(treballadorId: number | null) {
    return useQuery({
        queryKey: ['treballador-serveis-profile', treballadorId],
        queryFn: () => getServeisPerTreballador(treballadorId!),
        enabled: treballadorId !== null,
        staleTime: 5 * 60 * 1000,
    });
}

function isToday(dateStr: string): boolean {
    const d = new Date(dateStr);
    const now = new Date();
    return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
    );
}

/** Today's bookings for the treballador (filtered client-side) */
export function useTodayBookings(treballadorId: number | null) {
    return useQuery({
        queryKey: ['treballador-reserves-profile', treballadorId],
        queryFn: async () => {
            const all = await getReservesTreballador(treballadorId!);
            return all.filter((r: ProfileReserva) => isToday(r.dataHora));
        },
        enabled: treballadorId !== null,
        staleTime: 60 * 1000,
    });
}
