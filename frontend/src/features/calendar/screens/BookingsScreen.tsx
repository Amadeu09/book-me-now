import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { palette, shadow } from "@/constants/theme";
import { Feather } from '@expo/vector-icons';

import { CalendarHeader } from "@/features/calendar/components/CalendarHeader";
import { CalendarControls } from "@/features/calendar/components/CalendarControls";
import { CreateBookingModal } from "@/features/calendar/components/CreateBookingModal";
import { WeekGrid } from "@/features/calendar/components/WeekGrid";
import { ViewMode } from "@/features/calendar/components/types";
import { getUser } from '@/utils/session';
import { useBookings } from '@/features/calendar/hooks/useBookings';
import { fetchGetTreballadors, fetchGetServeis } from '@/features/calendar/services/calendarApi';
import type { ApiTreballador, ApiServei } from '@/features/calendar/types';

import { addWeeks, subWeeks, format, startOfWeek, endOfWeek } from 'date-fns';

export default function Bookings() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [userRole, setUserRole] = useState<string | undefined>(undefined);
    const [userId, setUserId] = useState<string | undefined>(undefined);
    const [workers, setWorkers] = useState<ApiTreballador[]>([]);
    const [selectedWorkerId, setSelectedWorkerId] = useState<string | undefined>(undefined);
    const [services, setServices] = useState<ApiServei[]>([]);
    const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);

    useEffect(() => {
        getUser().then(user => {
            setUserRole(user?.rol);
            setUserId(user?.id?.toString());

            if (user?.rol === 'ADMIN_GENERAL') {
                setIsAdmin(true);

                Promise.all([
                    fetchGetTreballadors().catch(err => {
                        console.error("Error fetching workers in Screen:", err);
                        return [];
                    }),
                    fetchGetServeis().catch(err => {
                        console.error("Error fetching services in Screen:", err);
                        return [];
                    })
                ]).then(([workersData, servicesData]) => {
                    setWorkers(workersData);
                    if (workersData.length > 0) {
                        setSelectedWorkerId(workersData[0].id.toString());
                    }

                    setServices(servicesData);
                    // Optionally set default service
                    // if (servicesData.length > 0) {
                    //     setSelectedServiceId(servicesData[0].id.toString());
                    // }
                });
            } else if (user?.rol === 'EMPLEAT') {
                fetchGetServeis().catch(err => {
                    console.error("Error fetching services in Screen:", err);
                    return [];
                }).then(servicesData => {
                    setServices(servicesData);
                });
            }
        });
    }, []);

    const [viewMode, setViewMode] = useState<ViewMode>('week');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

    // Memoised so Date references only change when currentDate changes,
    // preventing the useBookings effect from firing on unrelated re-renders.
    const start = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
    const end = useMemo(() => endOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
    const dateRange = `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;

    const handlePrev = () => setCurrentDate(subWeeks(currentDate, 1));
    const handleNext = () => setCurrentDate(addWeeks(currentDate, 1));
    const handleQuickCreate = () => setIsCreateModalVisible(true);

    // Fetch API data for the current week
    const { events, loading, error, refetch } = useBookings(start, end, userRole, userId, selectedWorkerId, selectedServiceId);

    return (
        <SafeAreaView style={styles.container}>
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
            />

            <View style={styles.content}>
                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Feather name="loader" size={24} color={palette.accent} />
                    </View>
                ) : (
                    <WeekGrid
                        events={events}
                        currentDate={currentDate}
                        loading={loading}
                        onEventPress={(event) => console.log('Event pressed:', event.title)}
                    />
                )}

                {/* Floating Action Button */}
                <TouchableOpacity style={styles.fab} onPress={handleQuickCreate}>
                    <Feather name="plus" size={24} color="#ffffff" />
                </TouchableOpacity>
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
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: palette.accent,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadow.card,
    },
});
