import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { palette, shadow } from "@/constants/theme";
import { Feather } from '@expo/vector-icons';

import { CalendarHeader } from "@/features/calendar/components/CalendarHeader";
import { CalendarControls } from "@/features/calendar/components/CalendarControls";
import { WeekGrid } from "@/features/calendar/components/WeekGrid";
import { MOCK_EVENTS } from "@/features/calendar/components/constants";
import { ViewMode } from "@/features/calendar/components/types";

import { addWeeks, subWeeks, format, startOfWeek, endOfWeek } from 'date-fns';

export default function Bookings() {
    const [viewMode, setViewMode] = useState<ViewMode>('week');
    const [currentDate, setCurrentDate] = useState(new Date());

    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    const dateRange = `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;

    const handlePrev = () => setCurrentDate(subWeeks(currentDate, 1));
    const handleNext = () => setCurrentDate(addWeeks(currentDate, 1));
    const handleQuickCreate = () => console.log('Quick create');

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
            />

            <View style={styles.content}>
                <WeekGrid
                    events={MOCK_EVENTS}
                    currentDate={currentDate}
                    onEventPress={(event) => console.log('Event pressed:', event.title)}
                />

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
