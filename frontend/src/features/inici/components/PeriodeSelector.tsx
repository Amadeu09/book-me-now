import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { HC } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';
import type { PeriodeCites } from '../utils/dates';

const OPCIONS: { value: PeriodeCites; key: 'iniciAvui' | 'iniciDema' | 'iniciSetmana' }[] = [
    { value: 'avui', key: 'iniciAvui' },
    { value: 'dema', key: 'iniciDema' },
    { value: 'setmana', key: 'iniciSetmana' },
];

interface PeriodeSelectorProps {
    value: PeriodeCites;
    onChange: (p: PeriodeCites) => void;
}

export function PeriodeSelector({ value, onChange }: PeriodeSelectorProps) {
    const theme = useTheme();
    const { t } = useLanguage();
    return (
        <View style={styles.row} accessibilityRole="radiogroup">
            {OPCIONS.map((o) => {
                const actiu = o.value === value;
                return (
                    <TouchableOpacity
                        key={o.value}
                        onPress={() => onChange(o.value)}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: actiu }}
                        style={[styles.chip, actiu && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                    >
                        <Text style={[styles.chipText, actiu && { color: theme.textOnPrimary, fontWeight: '600' }]}>{t(o.key)}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', gap: 6 },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: HC.border,
        backgroundColor: HC.card,
    },
    chipText: { fontSize: 13, color: HC.textSecondary },
});
