import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { palette, spacing } from "@/constants/theme";
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';
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

function computeEventLayouts(
    events: CalendarEvent[],
): Array<{ event: CalendarEvent; col: number; totalCols: number }> {
    if (!events.length) return [];

    const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());

    // Group events that overlap (transitively: A+B overlap, B+C overlap → same group)
    const groups: CalendarEvent[][] = [];
    for (const event of sorted) {
        const idx = groups.findIndex(g =>
            g.some(e =>
                e.start.getTime() < event.end.getTime() &&
                e.end.getTime() > event.start.getTime()
            )
        );
        if (idx !== -1) {
            groups[idx].push(event);
        } else {
            groups.push([event]);
        }
    }

    const result: Array<{ event: CalendarEvent; col: number; totalCols: number }> = [];

    for (const group of groups) {
        // Greedy column assignment: put each event in the first column that is free
        const colEnds: number[] = [];
        const colMap = new Map<string, number>();

        for (const event of group) {
            const startMs = event.start.getTime();
            let col = colEnds.findIndex(t => t <= startMs);
            if (col === -1) {
                col = colEnds.length;
                colEnds.push(0);
            }
            colEnds[col] = event.end.getTime();
            colMap.set(event.id, col);
        }

        const totalCols = colEnds.length;
        for (const event of group) {
            result.push({ event, col: colMap.get(event.id)!, totalCols });
        }
    }

    return result;
}

export const WeekGrid: React.FC<WeekGridProps> = ({ events, currentDate, onEventPress, loading = false }) => {
    const theme = useTheme();
    const { t } = useLanguage();

    // Generate the 7 days of the current week
    const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));

    const renderEventsForDay = (dayDate: Date) => {
        const dayEvents = events.filter(e => isSameDay(e.start, dayDate));
        const layouts = computeEventLayouts(dayEvents);

        return layouts.map(({ event, col, totalCols }) => {
            const madridHM = (d: Date) => {
                const fmt = new Intl.DateTimeFormat('en', { hour: 'numeric', minute: 'numeric', hour12: false, timeZone: 'Europe/Madrid' });
                const parts = fmt.formatToParts(d);
                return { h: parseInt(parts.find(p => p.type === 'hour')?.value ?? '0'), m: parseInt(parts.find(p => p.type === 'minute')?.value ?? '0') };
            };
            const { h: sh, m: startMin } = madridHM(event.start);
            let startHour = sh < START_HOUR ? sh + 24 : sh;
            const top = ((startHour - START_HOUR) + startMin / 60) * HOUR_HEIGHT;

            const { h: eh, m: endMin } = madridHM(event.end);
            let endHour = eh < START_HOUR ? eh + 24 : eh;
            const durationHours = (endHour - startHour) + (endMin - startMin) / 60;
            const height = durationHours * HOUR_HEIGHT;

            const overlapStyle = totalCols > 1 ? {
                left: `${(col / totalCols * 100).toFixed(1)}%`,
                right: `${((totalCols - col - 1) / totalCols * 100).toFixed(1)}%`,
            } : {};

            return (
                <EventCard
                    key={event.id}
                    event={event}
                    onPress={onEventPress}
                    hourHeight={HOUR_HEIGHT}
                    style={{ top, height, ...overlapStyle }}
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
                    <Text style={styles.emptyText}>{t('calendarNoWeekBookings')}</Text>
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
        marginTop: -HOUR_HEIGHT,
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
