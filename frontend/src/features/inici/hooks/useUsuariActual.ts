import { useEffect, useState } from 'react';
import { getUser } from '@/utils/session';
import type { AuthUser } from '@/features/auth/services/auth.service';
import { useMiTreballador } from '@/features/profile/hooks/useProfile';

/** Usuari de la sessió i el seu registre de treballador (si en té). */
export function useUsuariActual() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [carregat, setCarregat] = useState(false);

    useEffect(() => {
        getUser().then((u) => {
            setUser(u);
            setCarregat(true);
        });
    }, []);

    const usuariId = user?.id ? parseInt(user.id, 10) : null;
    const empresaId = user?.empresaId ?? null;
    const { data: treballador, isLoading: carregantTreballador } = useMiTreballador(empresaId, usuariId);

    return {
        user,
        setUser,
        carregat,
        esAdmin: user?.rol === 'ADMIN_GENERAL',
        treballador: treballador ?? null,
        treballadorId: (treballador?.id as number | undefined) ?? null,
        carregantTreballador,
    };
}
