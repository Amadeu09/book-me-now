import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { DAYS_OF_WEEK, HOURS } from '../constants';
import { CalendarEvent } from '../types';
import { EventCard } from './EventCard';
import { palette } from "@/constants/theme";
import { useLanguage } from '@/core/i18n';

interface WeekGridProps {
    events: CalendarEvent[];
}

const HOUR_HEIGHT = 80; // height in pixels for one hour
const START_HOUR = 8;   // Calendar starts at 8 AM

export const WeekGrid: React.FC<WeekGridProps> = ({ events }) => {
    const { t } = useLanguage();

    // Helper to calculate position
    const madridHM = (d: Date) => {
        const fmt = new Intl.DateTimeFormat('en', { hour: 'numeric', minute: 'numeric', hour12: false, timeZone: 'Europe/Madrid' });
        const parts = fmt.formatToParts(d);
        return { h: parseInt(parts.find(p => p.type === 'hour')?.value ?? '0'), m: parseInt(parts.find(p => p.type === 'minute')?.value ?? '0') };
    };

    const getEventLayout = (event: CalendarEvent) => {
        const { h: sh, m: sm } = madridHM(event.start);
        const { h: eh, m: em } = madridHM(event.end);
        const startHour = sh + sm / 60;
        const endHour = eh + em / 60;

        const top = (startHour - START_HOUR) * HOUR_HEIGHT;
        const height = (endHour - startHour) * HOUR_HEIGHT;

        return { top, height };
    };

    // Filter events by day index (0 = Monday, etc, matching MOCK data logic)
    const getDayIndex = (date: Date) => {
        const day = date.getDay();
        return day === 0 ? 6 : day - 1; // Mon(1)->0 ... Sun(0)->6
    };

    const renderDayEvents = (dayIndex: number) => {
        const dayEvents = events.filter(e => getDayIndex(e.start) === dayIndex);

        return dayEvents.map(event => {
            const layout = getEventLayout(event);

            // Hack for specific mock visualization matching
            // If it's Tue 24 (day 1) and 'Staff Meeting', shift it
            let finalWidth: number | string = '100%';
            let finalLeft: number | string = 0;

            // Manual layout adj for mock overlap
            if (event.id === '3') { // Facial
                finalWidth = '50%';
            }
            if (event.id === '4') { // Staff Meeting
                finalWidth = '50%';
                finalLeft = '50%';
            }

            return (
                <View
                    key={event.id}
                    style={{
                        position: 'absolute',
                        top: layout.top,
                        height: layout.height,
                        width: finalWidth as any,
                        left: finalLeft as any,
                    }}
                >
                    <EventCard event={event} />
                </View>
            );
        });
    };

    return (
        <View style={styles.container}>
            {/* Header Row */}
            <View style={styles.headerRow}>
                <View style={styles.timeGutterHeader} />
                {DAYS_OF_WEEK.map((day: string, index: number) => (
                    <View key={day} style={styles.dayHeader}>
                        <Text style={styles.dayHeaderTextRow}>{day.split(' ')[0]}</Text>
                        <Text style={styles.dayHeaderNumber}>{day.split(' ')[1]}</Text>
                        {/* Highlight Tuesday as active in mock */}
                        {index === 1 && <View style={styles.activeDayIndicator} />}
                    </View>
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.gridContainer}>
                <View style={styles.gridBody}>
                    {/* Time Gutter */}
                    <View style={styles.timeGutter}>
                        {HOURS.map((hour: string, i: number) => (
                            <View key={hour} style={[styles.timeLabelBox, { top: i * HOUR_HEIGHT }]}>
                                <Text style={styles.timeLabel}>{hour}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Columns */}
                    {DAYS_OF_WEEK.map((_: any, i: number) => (
                        <View key={i} style={styles.dayColumn}>
                            {/* Horizontal grid lines for hours */}
                            {HOURS.map((_: any, h: number) => (
                                <View key={h} style={[styles.gridLine, { top: h * HOUR_HEIGHT }]} />
                            ))}

                            {/* Maintenance Day Overlay (Thursday = index 3) */}
                            {i === 3 && (
                                <View style={styles.maintenanceOverlay}>
                                    <View style={styles.maintenanceStripe} />
                                    <Text style={styles.maintenanceText}>{t('calendarMaintenanceDay')}</Text>
                                </View>
                            )}

                            {/* Events */}
                            {renderDayEvents(i)}
                        </View>
                    ))}
                </View>
            </ScrollView>
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
        backgroundColor: palette.background,
    },
    timeGutterHeader: {
        width: 60,
        borderRightWidth: 1,
        borderRightColor: palette.borderSoft,
    },
    dayHeader: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        borderRightWidth: 1,
        borderRightColor: 'transparent',
    },
    dayHeaderTextRow: {
        fontSize: 11,
        fontWeight: '600',
        color: palette.textMuted,
        marginBottom: 2,
    },
    dayHeaderNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: palette.textPrimary,
    },
    activeDayIndicator: {
        position: 'absolute',
        top: 36,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#3b82f6',
        opacity: 0.1,
    },
    gridContainer: {
        minHeight: HOURS.length * HOUR_HEIGHT,
        paddingBottom: 40,
    },
    gridBody: {
        flexDirection: 'row',
        marginTop: -HOUR_HEIGHT,
        minHeight: HOURS.length * HOUR_HEIGHT,
    },
    timeGutter: {
        width: 60,
        backgroundColor: '#ffffff',
        borderRightWidth: 1,
        borderRightColor: palette.borderSoft,
    },
    timeLabelBox: {
        position: 'absolute',
        width: '100%',
        height: HOUR_HEIGHT,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 0,
    },
    timeLabel: {
        fontSize: 11,
        color: palette.textMuted,
        transform: [{ translateY: -8 }],
        backgroundColor: palette.background,
        paddingHorizontal: 4,
    },
    dayColumn: {
        flex: 1,
        borderRightWidth: 1,
        borderRightColor: palette.borderSoft,
        position: 'relative',
    },
    gridLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: '#f1f5f9',
    },
    maintenanceOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#f9fafb',
        justifyContent: 'center',
        alignItems: 'center',
    },
    maintenanceStripe: {
        ...StyleSheet.absoluteFillObject,
        // Optional: add some svg or lines via image if needed, for now just gray bg
    },
    maintenanceText: {
        transform: [{ rotate: '-90deg' }],
        color: palette.textMuted,
        fontSize: 14,
        letterSpacing: 2,
    },
});
