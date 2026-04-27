import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { palette, spacing } from "@/constants/theme";
import { useTheme } from '@/core/theme/ThemeProvider';
import { HOURS, HOUR_HEIGHT, START_HOUR } from './constants';
import { CalendarEvent } from './types';
import { EventCard } from './EventCard';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface DayGridProps {
    events: CalendarEvent[];
    currentDate: Date;
    onEventPress: (event: CalendarEvent) => void;
    loading?: boolean;
}

export const DayGrid: React.FC<DayGridProps> = ({ events, currentDate, onEventPress, loading = false }) => {
    const theme = useTheme();
    const isToday = isSameDay(currentDate, new Date());
    const dayName = format(currentDate, 'EEE', { locale: es }).toUpperCase();
    const dayNum = format(currentDate, 'd');
    const monthYear = format(currentDate, 'MMMM yyyy', { locale: es });

    const dayEvents = events.filter(e => isSameDay(e.start, currentDate));

    const renderedEvents = dayEvents.map((event) => {
        let startHour = event.start.getHours();
        const startMin = event.start.getMinutes();
        if (startHour < START_HOUR) startHour += 24;
        const top = ((startHour - START_HOUR) + startMin / 60) * HOUR_HEIGHT;

        let endHour = event.end.getHours();
        const endMin = event.end.getMinutes();
        if (endHour < START_HOUR) endHour += 24;
        const durationHours = (endHour - startHour) + (endMin - startMin) / 60;
        const height = Math.max(durationHours * HOUR_HEIGHT, 32);

        return (
            <EventCard
                key={event.id}
                event={event}
                onPress={onEventPress}
                hourHeight={HOUR_HEIGHT}
                style={{ top, height }}
            />
        );
    });

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.headerRow, { borderBottomColor: palette.borderSoft }]}>
                <View style={styles.timeColumnHeader} />
                <View style={styles.dayHeader}>
                    <Text style={[styles.dayName, { color: palette.textMuted }]}>{dayName}</Text>
                    <View style={[styles.dayNumber, isToday && { backgroundColor: theme.primary }]}>
                        <Text style={[styles.dayNumberText, isToday && { color: theme.textOnPrimary }]}>
                            {dayNum}
                        </Text>
                    </View>
                    <Text style={[styles.monthYear, { color: palette.textMuted }]}>
                        {monthYear.charAt(0).toUpperCase() + monthYear.slice(1)}
                    </Text>
                </View>
            </View>

            {/* Scrollable Grid */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.gridContainer}>
                    {/* Time Column */}
                    <View style={styles.timeColumn}>
                        {HOURS.map((hour) => (
                            <View key={hour} style={[styles.timeSlot, { height: HOUR_HEIGHT }]}>
                                <Text style={styles.timeText}>{hour}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Single Day Column */}
                    <View style={styles.dayColumn}>
                        {HOURS.map((_, i) => (
                            <View key={i} style={[styles.gridCell, { height: HOUR_HEIGHT }]} />
                        ))}
                        <View style={StyleSheet.absoluteFill}>
                            {renderedEvents}
                        </View>
                    </View>
                </View>
            </ScrollView>

            {!loading && dayEvents.length === 0 && (
                <View style={styles.emptyOverlay} pointerEvents="none">
                    <Text style={styles.emptyText}>No hay reservas este día</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: palette.background,
    },
    headerRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        paddingVertical: spacing.sm,
    },
    timeColumnHeader: {
        width: 60,
    },
    dayHeader: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    dayName: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 2,
    },
    dayNumber: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayNumberText: {
        fontSize: 22,
        fontWeight: '700',
        color: palette.textPrimary,
    },
    monthYear: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: spacing.xl,
    },
    gridContainer: {
        flexDirection: 'row',
    },
    timeColumn: {
        width: 60,
        backgroundColor: palette.background,
    },
    timeSlot: {
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    timeText: {
        fontSize: 11,
        color: palette.textMuted,
        transform: [{ translateY: -8 }],
    },
    dayColumn: {
        flex: 1,
        borderLeftWidth: 1,
        borderLeftColor: palette.borderSoft,
    },
    gridCell: {
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    emptyOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        top: 72,
    },
    emptyText: {
        fontSize: 14,
        color: palette.textMuted,
    },
});
