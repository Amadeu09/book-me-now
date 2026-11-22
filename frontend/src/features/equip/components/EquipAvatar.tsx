import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '@/core/theme/ThemeProvider';
import { tintPrimari } from '@/core/theme/tint';

/** Inicials del nom (màxim dues lletres). */
export function inicials(nom: string): string {
    const parts = nom.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    const primera = parts[0][0] ?? '';
    const segona = parts.length > 1 ? parts[parts.length - 1][0] : parts[0][1] ?? '';
    return (primera + segona).toUpperCase();
}

interface Props {
    nom: string;
    foto?: string | null;
    mida?: number;
}

export function EquipAvatar({ nom, foto, mida = 36 }: Props) {
    const theme = useTheme();
    const dims = { width: mida, height: mida, borderRadius: mida / 2 };
    if (foto) {
        return <Image source={{ uri: foto }} style={[styles.base, dims]} accessibilityIgnoresInvertColors />;
    }
    return (
        <View style={[styles.base, dims, { backgroundColor: tintPrimari(theme) }]}>
            <Text style={[styles.text, { color: theme.primary, fontSize: Math.round(mida * 0.36) }]}>{inicials(nom)}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    base: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    text: { fontWeight: '700' },
});
