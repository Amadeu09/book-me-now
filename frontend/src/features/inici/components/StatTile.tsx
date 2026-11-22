import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { HC } from '@/features/home/constants/inicio.constants';

interface StatTileProps {
    label: string;
    value: number | string;
    detail: string;
    warning?: boolean;
    onPress?: () => void;
}

/** Comptador gran de la capçalera de l'Inici (només escriptori). */
export function StatTile({ label, value, detail, warning, onPress }: StatTileProps) {
    return (
        <TouchableOpacity
            style={[styles.tile, warning && styles.tileWarning]}
            onPress={onPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`${label}: ${value}`}
        >
            <Text style={[styles.label, warning && styles.textWarning]}>{label}</Text>
            <Text style={[styles.value, warning && styles.textWarning]}>{value}</Text>
            <Text style={[styles.detail, warning && styles.textWarning]} numberOfLines={1}>{detail}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    tile: {
        flex: 1,
        minWidth: 180,
        backgroundColor: HC.card,
        borderWidth: 1,
        borderColor: HC.border,
        borderRadius: 14,
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 4,
    },
    tileWarning: { backgroundColor: HC.yellowLight, borderColor: '#FCD34D' },
    label: { fontSize: 13, fontWeight: '500', color: HC.textMuted },
    value: { fontSize: 32, fontWeight: '700', color: HC.textPrimary },
    detail: { fontSize: 13, color: HC.textMuted },
    textWarning: { color: '#92400E' },
});
