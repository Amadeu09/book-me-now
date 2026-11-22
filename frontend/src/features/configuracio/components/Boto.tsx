import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { HC } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';

type Variant = 'primary' | 'secondary' | 'danger';

interface BotoProps {
    label: string;
    onPress: () => void;
    variant?: Variant;
    loading?: boolean;
    disabled?: boolean;
}

export function Boto({ label, onPress, variant = 'secondary', loading, disabled }: BotoProps) {
    const theme = useTheme();
    const primary = variant === 'primary';
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            accessibilityRole="button"
            accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
            style={[
                styles.btn,
                primary ? { backgroundColor: theme.primary, borderColor: theme.primary } : variant === 'danger' ? styles.danger : styles.secondary,
                (disabled || loading) && styles.disabled,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={primary ? theme.textOnPrimary : theme.primary} />
            ) : (
                <Text style={[styles.text, primary ? { color: theme.textOnPrimary } : variant === 'danger' ? styles.dangerText : styles.secondaryText]}>{label}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    btn: { paddingHorizontal: 18, paddingVertical: 11, minHeight: 44, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    secondary: { backgroundColor: HC.card, borderColor: HC.border },
    secondaryText: { color: HC.textSecondary },
    danger: { backgroundColor: HC.card, borderColor: '#FECACA' },
    dangerText: { color: HC.statusRedText },
    disabled: { opacity: 0.5 },
    text: { fontSize: 14, fontWeight: '600' },
});
