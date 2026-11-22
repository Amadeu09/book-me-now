import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HC } from '@/features/home/constants/inicio.constants';

interface IniciCardProps {
    title: string;
    right?: React.ReactNode;
    children: React.ReactNode;
}

/** Targeta blanca amb títol, comuna a totes les seccions de l'Inici. */
export function IniciCard({ title, right, children }: IniciCardProps) {
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.title} accessibilityRole="header">{title}</Text>
                {right}
            </View>
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
        paddingHorizontal: 20,
        paddingVertical: 18,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 8,
        flexWrap: 'wrap',
    },
    title: { fontSize: 17, fontWeight: '600', color: HC.textPrimary },
});
