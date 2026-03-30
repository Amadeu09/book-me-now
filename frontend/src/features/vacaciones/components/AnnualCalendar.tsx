import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC } from '@/features/home/constants/inicio.constants';
import { MonthMini } from './MonthMini';
import type { TipusAbsenciaTreballador, TipusAbsenciaEmpresa } from '../types/vacaciones.types';

const ALL_MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function fmtShort(d: string): string {
    const [, m, day] = d.split('-');
    return `${parseInt(day)}/${parseInt(m)}`;
}

function daysBetween(start: string, end: string): number {
    return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000) + 1;
}

function Legend() {
    return (
        <View style={styles.legend}>
            <View style={styles.legendItem}>
                <View style={[styles.dot, { borderWidth: 2, borderColor: HC.primary }]} />
                <Text style={styles.legendText}>AVUI</Text>
            </View>
            <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: HC.primaryLight, borderWidth: 1, borderColor: HC.primary }]} />
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
    onRequestCreate: (inici: string, fi: string) => void;
};

export function AnnualCalendar({ numCols, year, holidayDates, absenciaDates, onRequestCreate }: Props) {
    const [selStart, setSelStart] = useState<string | null>(null);
    const [selEnd, setSelEnd] = useState<string | null>(null);

    const rows: number[][] = [];
    for (let i = 0; i < ALL_MONTHS.length; i += numCols) {
        rows.push(ALL_MONTHS.slice(i, i + numCols));
    }

    const handleDayPress = (dateStr: string) => {
        if (selStart === null) {
            setSelStart(dateStr);
            setSelEnd(null);
        } else if (selEnd === null) {
            if (dateStr === selStart) {
                setSelStart(null);
            } else if (dateStr < selStart) {
                setSelEnd(selStart);
                setSelStart(dateStr);
            } else {
                setSelEnd(dateStr);
            }
        } else {
            setSelStart(dateStr);
            setSelEnd(null);
        }
    };

    const clearSelection = () => {
        setSelStart(null);
        setSelEnd(null);
    };

    const handleConfirm = () => {
        if (!selStart) return;
        onRequestCreate(selStart, selEnd ?? selStart);
    };

    const hasSelection = selStart !== null;
    const effectiveEnd = selEnd ?? selStart;
    const daysCount = selStart && effectiveEnd ? daysBetween(selStart, effectiveEnd) : 0;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Calendari Anual {year}</Text>
                <Legend />
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
                            onDayPress={handleDayPress}
                        />
                    ))}
                </View>
            ))}

            {/* Action bar */}
            {hasSelection && (
                <View style={styles.actionBar}>
                    <View style={styles.actionInfo}>
                        <Ionicons name="calendar-outline" size={16} color={HC.primary} />
                        <Text style={styles.actionText}>
                            {selEnd
                                ? `${fmtShort(selStart!)} → ${fmtShort(selEnd)}  ·  ${daysCount} dies`
                                : `${fmtShort(selStart!)}  ·  1 dia`}
                        </Text>
                    </View>
                    <View style={styles.actionBtns}>
                        <TouchableOpacity style={styles.btnCancel} onPress={clearSelection} activeOpacity={0.7}>
                            <Ionicons name="close" size={20} color={HC.red} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnConfirm} onPress={handleConfirm} activeOpacity={0.8}>
                            <Ionicons name="checkmark" size={20} color={HC.white} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
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
    actionBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: HC.card,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginTop: 4,
        borderWidth: 1.5,
        borderColor: HC.primary,
        shadowColor: HC.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 3,
    },
    actionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: HC.textPrimary,
    },
    actionBtns: {
        flexDirection: 'row',
        gap: 8,
    },
    btnCancel: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FEF2F2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnConfirm: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: HC.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
