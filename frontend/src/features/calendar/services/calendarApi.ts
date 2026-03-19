import api from '@/core/api/api';

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

export const fetchGetTreballadors = async () => {
  const response = await api.get(`/treballadors`);
  return response.data;
};

export const fetchGetServeis = async () => {
  const response = await api.get(`/serveis`, { params: { rows: 100 } });
  // backend returns { data, meta } for paginated results
  return response.data.data || response.data;
};

export const createReserva = async (data: any) => {
  const response = await api.post(`/reserves`, data);
  return response.data;
};
