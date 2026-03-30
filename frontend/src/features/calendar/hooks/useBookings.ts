import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { fetchGetTreballadors, fetchWeekBookings } from '../services/calendarApi';
import type { ApiReserva, ApiTreballador } from '../types';
import type { CalendarEvent } from '../components/types';
import { HC } from '@/features/home/constants/inicio.constants';

export const useBookings = (startDate: Date, endDate: Date, isAdmin: boolean, treballadorId?: string, serveiId?: string) => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refetch = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    useEffect(() => {
        const loadBookings = async () => {
            // Only fetch if it's admin (for now, based on your instructions)
            if (!isAdmin) {
                setEvents([]);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                // Ensure date format matches 'YYYY-MM-DD' exactly as backend expects
                const startStr = format(startDate, 'yyyy-MM-dd');
                const endStr = format(endDate, 'yyyy-MM-dd');

                const data: ApiReserva[] = await fetchWeekBookings(startStr, endStr, treballadorId);
                
                // Filter by service if provided
                const filteredData = serveiId 
                    ? data.filter(res => res.serveiId.toString() === serveiId)
                    : data;

                // Map API response to Component UI standard (CalendarEvent)
                const mappedEvents: CalendarEvent[] = filteredData.map(res => {
                    const startRaw = new Date(res.dataHora);
                    const durada = res.servei?.duradaMin || 60; // default 1h if no service duration provided
                    const endRaw = new Date(startRaw.getTime() + durada * 60000);

                    // Choose colors based on status or service
                    let eventColor: string = HC.eventBlueBg;
                    let iconName = 'clock';

                    if (res.estat === 'CONFIRMADA') {
                        eventColor = HC.statusGreenBg;
                        iconName = 'check-circle';
                    } else if (res.estat === 'CANCELLADA' || res.estat === 'NO_SHOW') {
                        eventColor = HC.statusRedBg;
                        iconName = 'x-circle';
                    }

                    // Extract initials dynamically
                    const nom = res.clientNom || res.client?.nom || 'Client';
                    const initials = nom.substring(0, 2).toUpperCase();

                    return {
                        id: res.id.toString(),
                        title: res.servei?.nom || 'Reserva',
                        start: startRaw,
                        end: endRaw,
                        type: 'appointment',
                        color: eventColor,
                        client: nom,
                        clientInitials: initials,
                        icon: iconName,
                        badges: res.estat !== 'PENDENT' ? [res.estat] : undefined,
                    };
                });

                setEvents(mappedEvents);
            } catch (err: any) {
                console.error('Error fetching bookings:', err);
                setError(err.message || 'Error occurred');
            } finally {
                setLoading(false);
            }
        };

        loadBookings();
    }, [startDate, endDate, isAdmin, treballadorId, serveiId, refreshTrigger]);

    return { events, loading, error, refetch };
};
