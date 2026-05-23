import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { palette } from "@/constants/theme";
import { Feather } from '@expo/vector-icons';

import { CalendarHeader } from "@/features/calendar/components/CalendarHeader";
import { CalendarControls } from "@/features/calendar/components/CalendarControls";
import { CreateBookingModal } from "@/features/calendar/components/CreateBookingModal";
import { BookingDetailModal } from "@/features/calendar/components/BookingDetailModal";
import { WeekGrid } from "@/features/calendar/components/WeekGrid";
import { DayGrid } from "@/features/calendar/components/DayGrid";
import { ViewMode, CalendarEvent } from "@/features/calendar/components/types";
import { getUser } from '@/utils/session';
import { useBookings } from '@/features/calendar/hooks/useBookings';
import { fetchGetTreballadors, fetchGetServeis } from '@/features/calendar/services/calendarApi';
import type { ApiTreballador, ApiServei } from '@/features/calendar/types';
import { useTheme } from '@/core/theme/ThemeProvider';

import { addWeeks, subWeeks, addDays, subDays, format, startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Bookings() {
    const theme = useTheme();
    const { width } = useWindowDimensions();
    const isDesktop = Platform.OS === 'web' && width >= 1024;
    const [isAdmin, setIsAdmin] = useState(false);
    const [userRole, setUserRole] = useState<string | undefined>(undefined);
    const [userId, setUserId] = useState<string | undefined>(undefined);
    const [currentUserTreballadorId, setCurrentUserTreballadorId] = useState<number | undefined>(undefined);
    const [workers, setWorkers] = useState<ApiTreballador[]>([]);
    const [selectedWorkerId, setSelectedWorkerId] = useState<string | undefined>(undefined);
    const [services, setServices] = useState<ApiServei[]>([]);
    const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);

    const userRoleRef = useRef<string | undefined>(undefined);
    const userIdRef = useRef<string | undefined>(undefined);

    const loadWorkersAndServices = useCallback(async () => {
        const role = userRoleRef.current;
        const uid = userIdRef.current;
        if (!role) return;

        if (role === 'ADMIN_GENERAL') {
            const [workersData, servicesData] = await Promise.all([
                fetchGetTreballadors().catch(() => [] as ApiTreballador[]),
                fetchGetServeis().catch(() => [] as ApiServei[]),
            ]);
            setWorkers(workersData);
            setServices(servicesData);
        } else if (role === 'EMPLEAT') {
            const [servicesData, workersData] = await Promise.all([
                fetchGetServeis().catch(() => [] as ApiServei[]),
                fetchGetTreballadors().catch(() => [] as ApiTreballador[]),
            ]);
            setServices(servicesData);
            const myWorker = (workersData as ApiTreballador[]).find(
                w => w.idUsuari === parseInt(uid ?? '0', 10)
            );
            if (myWorker) setCurrentUserTreballadorId(myWorker.id);
        }
    }, []);

    useEffect(() => {
        getUser().then(user => {
            userRoleRef.current = user?.rol;
            userIdRef.current = user?.id?.toString();
            setUserRole(user?.rol);
            setUserId(user?.id?.toString());
            if (user?.rol === 'ADMIN_GENERAL') setIsAdmin(true);
            loadWorkersAndServices();
        });
    }, [loadWorkersAndServices]);

    const [viewMode, setViewMode] = useState<ViewMode>(isDesktop ? 'week' : 'day');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

    const { start, end, dateRange } = useMemo(() => {
        if (viewMode === 'day') {
            const s = startOfDay(currentDate);
            const e = endOfDay(currentDate);
            const label = format(currentDate, "EEEE, d MMM yyyy", { locale: es });
            return { start: s, end: e, dateRange: label.charAt(0).toUpperCase() + label.slice(1) };
        }
        const s = startOfWeek(currentDate, { weekStartsOn: 1 });
        const e = endOfWeek(currentDate, { weekStartsOn: 1 });
        return { start: s, end: e, dateRange: `${format(s, 'MMM d')} - ${format(e, 'MMM d, yyyy')}` };
    }, [currentDate, viewMode]);

    const handlePrev = () => {
        if (viewMode === 'day') setCurrentDate(subDays(currentDate, 1));
        else setCurrentDate(subWeeks(currentDate, 1));
    };
    const handleNext = () => {
        if (viewMode === 'day') setCurrentDate(addDays(currentDate, 1));
        else setCurrentDate(addWeeks(currentDate, 1));
    };
    const handleQuickCreate = () => setIsCreateModalVisible(true);

    // Fetch API data for the current week
    const { events, loading, error, refetch } = useBookings(start, end, userRole, userId, selectedWorkerId, selectedServiceId);

    const _isFirstFocus = useRef(true);
    useFocusEffect(useCallback(() => {
        if (_isFirstFocus.current) { _isFirstFocus.current = false; return; }
        refetch();
        loadWorkersAndServices();
    }, [refetch, loadWorkersAndServices]));

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <CalendarHeader
                viewMode={viewMode}
                onViewChange={setViewMode}
                onQuickCreate={handleQuickCreate}
            />

            <CalendarControls
                dateRange={dateRange}
                onPrev={handlePrev}
                onNext={handleNext}
                workers={workers}
                selectedWorkerId={selectedWorkerId}
                onWorkerSelect={(id) => setSelectedWorkerId(id || undefined)}
                services={services}
                selectedServiceId={selectedServiceId}
                onServiceSelect={(id) => setSelectedServiceId(id || undefined)}
                showWorkerFilter={isAdmin}
            />

            <CreateBookingModal
                visible={isCreateModalVisible}
                onClose={() => setIsCreateModalVisible(false)}
                onSuccess={() => refetch()}
                workers={workers}
                services={services}
                isAdmin={isAdmin}
                currentUserTreballadorId={currentUserTreballadorId}
            />

            <BookingDetailModal
                visible={selectedEvent !== null}
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
                onStatusChanged={() => { refetch(); setSelectedEvent(null); }}
            />

            <View style={styles.content}>
                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Feather name="loader" size={24} color={palette.accent} />
                    </View>
                ) : viewMode === 'day' ? (
                    <DayGrid
                        events={events}
                        currentDate={currentDate}
                        loading={loading}
                        onEventPress={(event) => setSelectedEvent(event)}
                    />
                ) : (
                    <WeekGrid
                        events={events}
                        currentDate={currentDate}
                        loading={loading}
                        onEventPress={(event) => setSelectedEvent(event)}
                    />
                )}

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: palette.background,
    },
    content: {
        flex: 1,
        backgroundColor: palette.background,
    },
});
