import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { tintPrimari } from '@/core/theme/tint';

interface Props {
    label: string;
    actiu: boolean;
    onPress: () => void;
    /** 'radio' per triar-ne un; 'check' per marcar-ne diversos. */
    tipus?: 'radio' | 'check';
}

export function OpcioChip({ label, actiu, onPress, tipus = 'check' }: Props) {
    const theme = useTheme();
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole={tipus === 'radio' ? 'radio' : 'checkbox'}
            accessibilityState={tipus === 'radio' ? { selected: actiu } : { checked: actiu }}
            style={[
                styles.chip,
                actiu && { backgroundColor: tintPrimari(theme), borderColor: theme.primary },
            ]}
        >
            {actiu && tipus === 'check' ? <Ionicons name="checkmark" size={14} color={theme.primary} /> : null}
            <Text style={[styles.text, actiu && { color: theme.primary }]}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    chip: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        borderWidth: 1, borderColor: HC.borderInput, borderRadius: 999,
        paddingHorizontal: 12, paddingVertical: 7, minHeight: 36, backgroundColor: HC.card,
    },
    text: { fontSize: 13, fontWeight: '600', color: HC.textSecondary },
});
