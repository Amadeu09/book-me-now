import api from '@/core/api/api';

export interface CreateReservaPayload {
    nom: string;
    cognoms?: string;
    email?: string;
    telefon?: string;
    data: string;
    hora: string;
    observacions?: string;
    idServei: number;
    idTreballador: number;
}

const calendarController = '/reserves/setmana';

export const fetchWeekBookings = async (startDate: string, endDate: string, treballadorId?: string) => {
  const response = await api.get(calendarController, {
    params: {
      inici: startDate,
      fi: endDate,
      ...(treballadorId && { treballadorId }),
    },
  });
  return response.data;
};

export const fetchWorkerBookings = async (treballadorId: string, startDate: string, endDate: string) => {
  const response = await api.get(`/reserves/treballador/${treballadorId}`, {
    params: {
      inici: startDate,
      fi: endDate,
    },
  });
  return response.data;
};

export const fetchGetTreballadors = async () => {
  const response = await api.get(`/treballadors`);
  return response.data;
};

export const fetchGetServeis = async () => {
  const response = await api.get(`/serveis`, { params: { rows: 100 } });
  // backend returns { data, meta } for paginated results
  return response.data.data || response.data;
};

export const createReserva = async (data: CreateReservaPayload) => {
  const response = await api.post(`/reserves`, data);
  return response.data;
};

export const updateReservaEstat = async (id: number, nouEstat: string) => {
  const response = await api.put(`/reserves/update/${id}`, { idReserva: id, nouEstat });
  return response.data;
};

export const deleteReserva = async (id: number) => {
  const response = await api.delete(`/reserves/${id}`);
  return response.data;
};

export const fetchClientsByEmpresa = async (empresaId: number) => {
  const response = await api.get(`/clients/empresa/${empresaId}`);
  return response.data;
};
