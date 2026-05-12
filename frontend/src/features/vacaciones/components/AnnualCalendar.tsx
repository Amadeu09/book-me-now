import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HC } from '@/features/home/constants/inicio.constants';
import { MonthMini } from './MonthMini';
import type { TipusAbsenciaTreballador, TipusAbsenciaEmpresa } from '../types/vacaciones.types';
import { useTheme } from '@/core/theme/ThemeProvider';

const ALL_MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function Legend({ theme }: { theme: any }) {
    return (
        <View style={styles.legend}>
            <View style={styles.legendItem}>
                <View style={[styles.dot, { borderWidth: 2, borderColor: theme.primary }]} />
                <Text style={styles.legendText}>AVUI</Text>
            </View>
            <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: theme.primaryLight, borderWidth: 1, borderColor: theme.primary }]} />
                <Text style={styles.legendText}>SELECCIÓ</Text>
            </View>
        </View>
    );
}

type Props = {
    numCols: 2 | 4;
    year: number;
    holidayDates: Map<string, TipusAbsenciaEmpresa>;
    absenciaDates: Map<string, TipusAbsenciaTreballador>;
    selStart: string | null;
    selEnd: string | null;
    onDayPress: (dateStr: string) => void;
};

export function AnnualCalendar({ numCols, year, holidayDates, absenciaDates, selStart, selEnd, onDayPress }: Props) {
    const theme = useTheme();
    const rows: number[][] = [];
    for (let i = 0; i < ALL_MONTHS.length; i += numCols) {
        rows.push(ALL_MONTHS.slice(i, i + numCols));
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Calendari Anual {year}</Text>
                <Legend theme={theme} />
            </View>

            {rows.map((row, ri) => (
                <View key={ri} style={styles.monthRow}>
                    {row.map(month => (
                        <MonthMini
                            key={month}
                            month={month}
                            year={year}
                            holidayDates={holidayDates}
                            absenciaDates={absenciaDates}
                            selStart={selStart}
                            selEnd={selEnd}
                            onDayPress={onDayPress}
                        />
                    ))}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: HC.textPrimary,
    },
    legend: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    dot: {
        width: 9,
        height: 9,
        borderRadius: 5,
    },
    legendText: {
        fontSize: 10,
        color: HC.textMuted,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    monthRow: {
        flexDirection: 'row',
        gap: 10,
    },
});
