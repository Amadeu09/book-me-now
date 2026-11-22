import React from 'react';
import { Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/core/theme/ThemeProvider';

interface HeaderButtonProps {
    label: string;
    icon?: React.ComponentProps<typeof Ionicons>['name'];
    onPress: () => void;
    disabled?: boolean;
}

/** Botó d'acció principal per a la capçalera; contrasta tant amb capçalera blanca com de color. */
export function HeaderButton({ label, icon = 'add', onPress, disabled }: HeaderButtonProps) {
    const theme = useTheme();
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const headerClar = theme.headerBg.toLowerCase() === '#ffffff';
    const bg = headerClar ? theme.primary : '#FFFFFF';
    const fg = headerClar ? theme.textOnPrimary : theme.primary;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={label}
            style={[styles.btn, { backgroundColor: bg }, !isDesktop && styles.btnIcon, disabled && styles.disabled]}
        >
            <Ionicons name={icon} size={20} color={fg} />
            {isDesktop ? <Text style={[styles.text, { color: fg }]}>{label}</Text> : null}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    btn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, height: 44, borderRadius: 12 },
    btnIcon: { width: 44, paddingHorizontal: 0, justifyContent: 'center' },
    text: { fontSize: 14, fontWeight: '600' },
    disabled: { opacity: 0.6 },
});
