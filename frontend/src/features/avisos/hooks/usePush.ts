import { useCallback, useEffect, useState } from 'react';
import { activarPush, desactivarPush, estatPush, type EstatPush } from '../services/push';

export function usePush() {
  const [estat, setEstat] = useState<EstatPush | 'carregant'>('carregant');
  const [ocupat, setOcupat] = useState(false);
  const [error, setError] = useState<'error' | 'no-disponible' | null>(null);

  useEffect(() => {
    estatPush().then(setEstat).catch(() => setEstat('no-suportat'));
  }, []);

  const activar = useCallback(async () => {
    setOcupat(true);
    setError(null);
    try {
      setEstat(await activarPush());
    } catch (e) {
      setError((e as Error).message === 'PUSH_NO_DISPONIBLE' ? 'no-disponible' : 'error');
    } finally {
      setOcupat(false);
    }
  }, []);

  const desactivar = useCallback(async () => {
    setOcupat(true);
    await desactivarPush();
    setEstat(await estatPush());
    setOcupat(false);
  }, []);

  return { estat, ocupat, error, activar, desactivar };
}
