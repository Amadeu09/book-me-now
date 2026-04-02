import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { HC, cardShadow } from '@/features/home/constants/inicio.constants';
import { MONTH_NAMES, DAY_LABELS, TREBALLADOR_COLORS, EMPRESA_COLORS } from '../constants/vacaciones.constants';
import type { TipusAbsenciaTreballador, TipusAbsenciaEmpresa } from '../types/vacaciones.types';
import { useTheme } from '@/core/theme/ThemeProvider';

const BADGE_SIZE = 30;
const CELL_HEIGHT = 38;

function toDateStr(year: number, month: number, day: number): string {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function buildCells(year: number, month: number): (number | null)[] {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const offset = (firstDay + 6) % 7;
    const daysInMonth = new Date(year, month, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
}

type DayInfo =
    | { kind: 'treballador'; color: string }
    | { kind: 'empresa'; color: string }
    | { kind: 'today' }
    | null;

function getDayInfo(
    year: number, month: number, day: number,
    holidayDates: Map<string, TipusAbsenciaEmpresa>,
    absenciaDates: Map<string, TipusAbsenciaTreballador>,
    themePrimary: string
): DayInfo {
    const today = new Date();
    if (today.getFullYear() === year && today.getMonth() + 1 === month && today.getDate() === day) {
        return { kind: 'today' };
    }
    const str = toDateStr(year, month, day);
    const empresaTipus = holidayDates.get(str);
    if (empresaTipus) return { kind: 'empresa', color: EMPRESA_COLORS[empresaTipus] ?? '#F97316' };
    const treballadorTipus = absenciaDates.get(str);
    if (treballadorTipus) return { kind: 'treballador', color: TREBALLADOR_COLORS[treballadorTipus] ?? themePrimary };
    return null;
}

type Props = {
    month: number;
    year: number;
    holidayDates: Map<string, TipusAbsenciaEmpresa>;
    absenciaDates: Map<string, TipusAbsenciaTreballador>;
    selStart: string | null;
    selEnd: string | null;
    onDayPress: (date: string) => void;
};

export function MonthMini({ month, year, holidayDates, absenciaDates, selStart, selEnd, onDayPress }: Props) {
    const theme = useTheme();
    const cells = useMemo(() => buildCells(year, month), [year, month]);
    const rows: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

    return (
        <View style={[styles.card, { backgroundColor: theme.primaryLight }]}>
            <Text style={styles.monthName}>{MONTH_NAMES[month - 1]}</Text>

            {/* Day-of-week header */}
            <View style={styles.row}>
                {DAY_LABELS.map((l, ci) => (
                    <View key={ci} style={[styles.cell, (ci === 5 || ci === 6) && styles.weekendCell]}>
                        <Text style={[styles.dayLabel, (ci === 5 || ci === 6) && styles.weekendLabel]}>{l}</Text>
                    </View>
                ))}
            </View>

            {/* Day rows */}
            {rows.map((row, ri) => (
                <View key={ri} style={styles.row}>
                    {row.map((day, ci) => {
                        const isWeekend = ci === 5 || ci === 6;

                        if (!day) {
                            return <View key={ci} style={[styles.cell, isWeekend && styles.weekendCell]} />;
                        }

                        const dateStr = toDateStr(year, month, day);
                        const isRangeStart = selStart !== null && dateStr === selStart;
                        const isRangeEnd = selEnd !== null && dateStr === selEnd;
                        const isRangeMid = selStart !== null && selEnd !== null
                            && dateStr > selStart && dateStr < selEnd;
                        const isSelected = isRangeStart || isRangeEnd;
                        const info = (isSelected || isRangeMid) ? null : getDayInfo(year, month, day, holidayDates, absenciaDates, theme.primary);

                        // Badge background color
                        let badgeColor: string | null = null;
                        let textColor: string = HC.textSecondary;
                        let badgeBorder: object | null = null;

                        if (isSelected) {
                            badgeColor = theme.primary;
                            textColor = theme.textOnPrimary;
                        } else if (info?.kind === 'treballador' || info?.kind === 'empresa') {
                            badgeColor = info.color;
                            textColor = HC.white;
                        } else if (info?.kind === 'today') {
                            badgeBorder = { borderWidth: 2, borderColor: theme.primary };
                            textColor = theme.primary;
                        }

                        return (
                            <TouchableOpacity
                                key={ci}
                                style={[
                                    styles.cell,
                                    isWeekend && !isRangeMid && !isSelected && styles.weekendCell,
                                    isRangeMid && { backgroundColor: theme.primaryLight },
                                ]}
                                onPress={() => onDayPress(dateStr)}
                                activeOpacity={0.7}
                            >
                                <View style={[
                                    styles.badge,
                                    badgeColor ? { backgroundColor: badgeColor } : null,
                                    badgeBorder,
                                ]}>
                                    <Text style={[styles.dayNum, { color: textColor },
                                        (isSelected || info?.kind === 'treballador' || info?.kind === 'empresa') && styles.dayNumBold,
                                        isRangeMid && { color: theme.primary, fontWeight: '600' },
                                    ]}>
                                        {day}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: HC.card,
        borderRadius: 12,
        padding: 10,
        ...cardShadow,
    },
    monthName: {
        fontSize: 13,
        fontWeight: '700',
        color: HC.textPrimary,
        marginBottom: 6,
        paddingLeft: 2,
    },
    row: {
        flexDirection: 'row',
    },
    dayLabel: {
        fontSize: 9,
        color: HC.textMuted,
        fontWeight: '600',
        textAlign: 'center',
    },
    weekendLabel: {
        opacity: 0.6,
    },
    cell: {
        flex: 1,
        height: CELL_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
    },
    weekendCell: {
        backgroundColor: '#F9FAFB',
    },
    rangeMidCell: {
        backgroundColor: HC.primaryLight,
    },
    badge: {
        width: BADGE_SIZE,
        height: BADGE_SIZE,
        borderRadius: BADGE_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayNum: {
        fontSize: 12,
        textAlign: 'center',
        lineHeight: BADGE_SIZE,
    },
    dayNumBold: {
        fontWeight: '700',
    },
    rangeMidText: {
        color: HC.primary,
        fontWeight: '600',
    },
});
