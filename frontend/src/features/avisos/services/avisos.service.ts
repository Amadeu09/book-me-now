import api from '@/core/api/api';

export interface Avis {
  id: number;
  tipus: 'RESERVA_NOVA' | 'RESERVA_CANCELLADA' | 'RESERVA_CANVIADA' | string;
  titol: string;
  cos: string;
  reservaId: number | null;
  llegida: boolean;
  createdAt: string;
}

export const getAvisos = () => api.get<{ data: Avis[]; noLlegides: number }>('/avisos').then((r) => r.data);
export const marcarTotsLlegits = () => api.post('/avisos/llegits');
export const marcarLlegit = (id: number) => api.post(`/avisos/${id}/llegit`);
export const getClauPush = () => api.get<{ clau: string | null }>('/avisos/push/clau').then((r) => r.data.clau);
export const enviarSubscripcio = (s: PushSubscriptionJSON) => api.post('/avisos/push/subscripcio', s);
export const baixaSubscripcio = (endpoint: string) => api.post('/avisos/push/baixa', { endpoint });
