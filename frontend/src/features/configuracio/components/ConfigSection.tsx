import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HC } from '@/features/home/constants/inicio.constants';

export function ConfigSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View style={styles.card}>
            <Text style={styles.title} accessibilityRole="header">{title}</Text>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: HC.card,
        borderWidth: 1,
        borderColor: HC.border,
        borderRadius: 16,
        padding: 20,
        gap: 16,
    },
    title: { fontSize: 17, fontWeight: '600', color: HC.textPrimary },
});
