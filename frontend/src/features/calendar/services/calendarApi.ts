import api from '@/core/api/api';

export interface CreateReservaPayload {
    nom: string;
    cognoms: string;
    email: string;
    telefon: string;
    data: string;
    hora: string;
    observacions: string;
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
