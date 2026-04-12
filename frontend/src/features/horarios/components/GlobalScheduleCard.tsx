import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
    HC, cardShadow,
    MOCK_DAY_SCHEDULE, DAY_STATUS_CONFIG, WEEKDAY_LABELS,
    type DayScheduleConfig,
} from '../constants/horarios.constants';
import { useTheme } from '@/core/theme/ThemeProvider';

/* ──────────────────────────────────────────
   GlobalScheduleCard
   Renders the "Horario Global" block
   – Desktop: full card with day columns
   – Mobile:  compact card with weekday dots
   ────────────────────────────────────────── */

interface GlobalScheduleCardProps {
    schedule?: DayScheduleConfig[];
    isActive?: boolean;
}

export const GlobalScheduleCard: React.FC<GlobalScheduleCardProps> = ({
    schedule = MOCK_DAY_SCHEDULE,
    isActive = true,
}) => {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const theme = useTheme();

    const onPrimary = theme.isDefault ? '#0f172a' : theme.textOnPrimary;
    const onPrimaryFaint = theme.isDefault ? '#e2e8f0' : onPrimary + '33';
    const onPrimaryMuted = theme.isDefault ? '#6b7280' : onPrimary + 'aa';
    const cardBg = theme.isDefault ? '#ffffff' : theme.primary;

    return (
        <View style={[styles.card, { backgroundColor: cardBg, borderWidth: theme.isDefault ? 1 : 0, borderColor: '#e2e8f0' }]}>
            {/* ── Top row: icon + title + toggle ── */}
            <View style={styles.topRow}>
                <View style={styles.titleBlock}>
                    <Text style={[styles.title, { color: onPrimary }]}>Horario Global de Apertura</Text>
                    <Text style={[styles.subtitle, { color: onPrimaryMuted }]}>Configuración predeterminada para el establecimiento</Text>
                </View>
                <View style={styles.toggleRow}>
                    <View style={[styles.toggleTrack, isActive && styles.toggleTrackActive]}>
                        <View style={[styles.toggleThumb, isActive && styles.toggleThumbActive]} />
                    </View>
                    <Text style={[styles.toggleLabel, { color: isActive ? HC.green : onPrimaryMuted }]}>
                        {isActive ? 'Activo' : 'Inactivo'}
                    </Text>
                </View>
            </View>

            {/* ── Day columns (desktop) or compact card (mobile) ── */}
            {isDesktop ? (
                <View style={[styles.daysRow, { borderTopColor: onPrimaryFaint }]}>
                    {schedule.map((day, i) => {
                        const cfg = DAY_STATUS_CONFIG[day.status];
                        return (
                            <View
                                key={day.label}
                                style={[
                                    styles.dayColumn,
                                    i < schedule.length - 1 && { borderRightWidth: 1, borderRightColor: onPrimaryFaint },
                                ]}
                            >
                                <View style={styles.dayHeaderRow}>
                                    <Text style={[styles.dayLabel, { color: onPrimary }]}>{day.label}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: cfg.bgColor }]}>
                                        <View style={[styles.statusDot, { backgroundColor: cfg.color }]} />
                                        <Text style={[styles.statusBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
                                    </View>
                                </View>
                                {day.status !== 'closed' ? (
                                    <View style={styles.timeRow}>
                                        <View style={[styles.timeBox, { borderColor: onPrimaryFaint }]}>
                                            <Text style={[styles.timeText, { color: onPrimary }]}>{day.timeStart}</Text>
                                            <Ionicons name="chevron-down" size={14} color={onPrimaryMuted} />
                                        </View>
                                        <Text style={[styles.timeSep, { color: onPrimaryMuted }]}>a</Text>
                                        <View style={[styles.timeBox, { borderColor: onPrimaryFaint }]}>
                                            <Text style={[styles.timeText, { color: onPrimary }]}>{day.timeEnd}</Text>
                                            <Ionicons name="chevron-down" size={14} color={onPrimaryMuted} />
                                        </View>
                                    </View>
                                ) : (
                                    <Text style={[styles.closedText, { color: onPrimaryMuted }]}>Sin disponibilidad configurada</Text>
                                )}
                            </View>
                        );
                    })}
                </View>
            ) : (
                /* ── Mobile compact ── */
                <View style={[styles.mobileBody, { borderTopColor: onPrimaryFaint }]}>
                    <View style={styles.mobileInfoRow}>
                        <View>
                            <Text style={[styles.mobileDayTitle, { color: onPrimary }]}>Lunes a Viernes</Text>
                            <Text style={[styles.mobileTime, { color: onPrimaryMuted }]}>09:00 AM - 06:00 PM</Text>
                        </View>
                    </View>
                    <View style={styles.mobileBottomRow}>
                        <View style={styles.weekdayDots}>
                            {WEEKDAY_LABELS.map((d, i) => (
                                <View key={i} style={[styles.weekdayCircle, { backgroundColor: onPrimary + '22' }]}>
                                    <Text style={[styles.weekdayText, { color: onPrimary }]}>{d}</Text>
                                </View>
                            ))}
                        </View>
                        <View style={[styles.activeBadge, { borderColor: HC.green }]}>
                            <Text style={[styles.activeBadgeText, { color: HC.green }]}>Activo ahora</Text>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

/* ── Styles ────────────────────────────── */
const styles = StyleSheet.create({
    card: {
        backgroundColor: HC.white,
        borderRadius: 16,
        padding: 20,
        ...cardShadow,
    },

    /* Top row */
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: HC.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    titleBlock: { flex: 1 },
    title: {
        fontSize: 17,
        fontWeight: '700',
        color: HC.textPrimary,
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 13,
        color: HC.textMuted,
    },

    /* Toggle */
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    toggleTrack: {
        width: 44,
        height: 24,
        borderRadius: 12,
        backgroundColor: HC.border,
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    toggleTrackActive: { backgroundColor: HC.green },
    toggleThumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: HC.white,
    },
    toggleThumbActive: { alignSelf: 'flex-end' },
    toggleLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: HC.textMuted,
    },

    /* Desktop: day columns */
    daysRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: HC.border,
        paddingTop: 18,
    },
    dayColumn: {
        flex: 1,
        paddingHorizontal: 14,
    },
    dayColumnBorder: {
        borderRightWidth: 1,
        borderRightColor: HC.border,
    },
    dayHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    dayLabel: {
        fontSize: 13,
        fontWeight: '800',
        letterSpacing: 0.5,
        color: HC.textPrimary,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 5,
    },
    statusDot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
    },
    statusBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    timeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: HC.border,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 6,
    },
    timeText: {
        fontSize: 14,
        fontWeight: '600',
        color: HC.textPrimary,
    },
    timeSep: {
        fontSize: 14,
        color: HC.textMuted,
    },
    closedText: {
        fontSize: 13,
        color: HC.textLight,
        fontStyle: 'italic',
        marginTop: 4,
    },

    /* Mobile compact */
    mobileBody: {
        borderTopWidth: 1,
        borderTopColor: HC.border,
        paddingTop: 16,
    },
    mobileInfoRow: {
        marginBottom: 14,
    },
    mobileDayTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: HC.textPrimary,
        marginBottom: 2,
    },
    mobileTime: {
        fontSize: 14,
        color: HC.textMuted,
    },
    mobileBottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    weekdayDots: {
        flexDirection: 'row',
        gap: 6,
    },
    weekdayCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: HC.textPrimary, // intentional: dark dot for weekday labels
        justifyContent: 'center',
        alignItems: 'center',
    },
    weekdayText: {
        color: HC.white,
        fontSize: 12,
        fontWeight: '700',
    },
    activeBadge: {
        borderWidth: 1,
        borderColor: HC.green,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 6,
    },
    activeBadgeText: {
        fontSize: 13,
        fontWeight: '600',
        color: HC.green,
    },
});
