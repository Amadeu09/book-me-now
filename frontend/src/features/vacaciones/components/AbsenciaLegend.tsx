import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HC, cardShadow } from '@/features/home/constants/inicio.constants';
import {
    TREBALLADOR_COLORS, EMPRESA_COLORS,
    TREBALLADOR_LABELS, EMPRESA_LABELS,
} from '../constants/vacaciones.constants';
import { useTheme } from '@/core/theme/ThemeProvider';

const TREBALLADOR_KEYS = Object.keys(TREBALLADOR_COLORS) as string[];
const EMPRESA_KEYS = Object.keys(EMPRESA_COLORS) as string[];

function LegendRow({ color, label, borderColor }: { color: string; label: string; borderColor?: string }) {
    return (
        <View style={styles.row}>
            <View style={[
                styles.dot,
                { backgroundColor: color },
                borderColor ? { borderWidth: 1.5, borderColor: borderColor } : null,
            ]} />
            <Text style={styles.label}>{label}</Text>
        </View>
    );
}

export function AbsenciaLegend() {
    const theme = useTheme();
    return (
        <View style={[styles.card, { backgroundColor: theme.primaryLight, borderWidth: theme.softBorderWidth, borderColor: theme.softBorderColor }]}>
            <Text style={styles.title}>Llegenda del Calendari</Text>
            <View style={styles.columns}>
                <View style={styles.col}>
                    <Text style={styles.colTitle}>Absències Treballador</Text>
                    {TREBALLADOR_KEYS.map(key => {
                        const isVacances = key === 'VACANCES';
                        return (
                            <LegendRow
                                key={key}
                                color={isVacances ? theme.primaryMid : TREBALLADOR_COLORS[key]}
                                label={TREBALLADOR_LABELS[key]}
                                borderColor={isVacances ? theme.primary : undefined}
                            />
                        );
                    })}
                </View>
                <View style={styles.divider} />
                <View style={styles.col}>
                    <Text style={styles.colTitle}>Festius Empresa</Text>
                    {EMPRESA_KEYS.map(key => (
                        <LegendRow key={key} color={EMPRESA_COLORS[key]} label={EMPRESA_LABELS[key]} />
                    ))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: HC.card,
        borderRadius: 14,
        padding: 18,
        ...cardShadow,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        color: HC.textPrimary,
        marginBottom: 14,
    },
    columns: {
        flexDirection: 'row',
        gap: 0,
    },
    col: {
        flex: 1,
        gap: 10,
    },
    colTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: HC.textMuted,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    divider: {
        width: 1,
        backgroundColor: HC.borderSoft,
        marginHorizontal: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    label: {
        fontSize: 13,
        color: HC.textSecondary,
        fontWeight: '500',
    },
});
