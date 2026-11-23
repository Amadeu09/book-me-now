import { useEffect, useState } from 'react';
import { consultarInvitacio, type InvitacioPublica } from '../services/auth.service';

export type EstatInvitacio =
  | { estat: 'sense' }
  | { estat: 'carregant' }
  | { estat: 'invalida' }
  | { estat: 'valida'; dades: InvitacioPublica };

/** Comprova el token d'invitació de l'enllaç de registre. */
export function useInvitacio(token: string | undefined): EstatInvitacio {
  const [estat, setEstat] = useState<EstatInvitacio>(token ? { estat: 'carregant' } : { estat: 'sense' });

  useEffect(() => {
    if (!token) {
      setEstat({ estat: 'sense' });
      return;
    }
    let cancel = false;
    setEstat({ estat: 'carregant' });
    consultarInvitacio(token)
      .then((dades) => { if (!cancel) setEstat({ estat: 'valida', dades }); })
      .catch(() => { if (!cancel) setEstat({ estat: 'invalida' }); });
    return () => { cancel = true; };
  }, [token]);

  return estat;
}
