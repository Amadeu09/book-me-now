import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { palette, spacing } from "@/constants/theme";
import { useTheme } from '@/core/theme/ThemeProvider';
import { HOURS, HOUR_HEIGHT, START_HOUR } from './constants';
import { CalendarEvent } from './types';
import { EventCard } from './EventCard';
import { addDays, startOfWeek, format, isSameDay } from 'date-fns';

interface WeekGridProps {
    events: CalendarEvent[];
    currentDate: Date;
    onEventPress: (event: CalendarEvent) => void;
    loading?: boolean;
}

export const WeekGrid: React.FC<WeekGridProps> = ({ events, currentDate, onEventPress, loading = false }) => {
    const theme = useTheme();

    // Generate the 7 days of the current week
    const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));

    const renderEventsForDay = (dayDate: Date) => {
        // Filter events that fall on this specific day
        const dayEvents = events.filter(e => isSameDay(e.start, dayDate));

        return dayEvents.map((event) => {
            // Calculate top position relative to START_HOUR
            // Handle day overflow if needed (e.g. 2 AM next day should be bottom of previous day?)
            // For now, assuming events start/end within the 7AM-6AM window of the "logical" day.

            // Simple logic: Calculate minutes from START_HOUR
            let startHour = event.start.getHours();
            const startMin = event.start.getMinutes();

            // Adjust for 24h wrap-around relative to START_HOUR (7)
            // If event is 2 AM, and start is 7 AM. 2 < 7, so it's 2+24 = 26. 26-7 = 19h offset.
            if (startHour < START_HOUR) {
                startHour += 24;
            }

            const top = ((startHour - START_HOUR) + startMin / 60) * HOUR_HEIGHT;

            // Calculate height
            let endHour = event.end.getHours();
            const endMin = event.end.getMinutes();
            if (endHour < START_HOUR) {
                endHour += 24;
            }
            // If end hour is smaller than start (crossing midnight), we already adjusted. 
            // If end matches start but is next day... logic handles it if duration > 0

            const durationHours = (endHour - startHour) + (endMin - startMin) / 60;
            const height = durationHours * HOUR_HEIGHT;

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
    };

    return (
        <View style={styles.container}>
            {/* Header Row (Days) */}
            <View style={styles.headerRow}>
                <View style={styles.timeColumnHeader} />
                {weekDays.map((date) => {
                    const isToday = isSameDay(date, new Date());
                    const name = format(date, 'EEE').toUpperCase();
                    const num = format(date, 'd');

                    return (
                        <View key={date.toISOString()} style={styles.dayHeader}>
                            <Text style={styles.dayName}>{name}</Text>
                            <View style={[styles.dayNumber, isToday && { backgroundColor: theme.primary }]}>
                                <Text style={[styles.dayNumberText, isToday && { color: theme.textOnPrimary }]}>
                                    {num}
                                </Text>
                            </View>
                        </View>
                    );
                })}
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

                    {/* Columns for Days */}
                    {weekDays.map((date) => (
                        <View key={date.toISOString()} style={styles.dayColumn}>
                            {/* Grid Lines */}
                            {HOURS.map((_, i) => (
                                <View key={i} style={[styles.gridCell, { height: HOUR_HEIGHT }]} />
                            ))}

                            {/* Events Layer */}
                            <View style={StyleSheet.absoluteFill}>
                                {renderEventsForDay(date)}
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Empty state overlay — shown only when no events and not loading */}
            {!loading && events.length === 0 && (
                <View style={styles.emptyOverlay} pointerEvents="none">
                    <Text style={styles.emptyText}>No hay reservas esta semana</Text>
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
        borderBottomColor: palette.borderSoft,
        paddingBottom: spacing.sm,
        paddingTop: spacing.sm,
    },
    timeColumnHeader: {
        width: 60,
    },
    dayHeader: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayName: {
        fontSize: 11,
        fontWeight: '600',
        color: palette.textMuted,
        marginBottom: 4,
    },
    dayNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayNumberText: {
        fontSize: 16,
        fontWeight: '700',
        color: palette.textPrimary,
    },
    todayBadge: {
        backgroundColor: '#3b82f6', // blue-500
    },
    todayText: {
        color: '#ffffff',
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
        top: 56, // below the header row
    },
    emptyText: {
        fontSize: 14,
        color: palette.textMuted,
    },
});
