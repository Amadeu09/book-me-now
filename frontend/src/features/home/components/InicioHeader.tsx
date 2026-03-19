import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { palette, spacing, typography } from "@/constants/theme";
import { HC } from '../constants/inicio.constants';

export const InicioHeader: React.FC = () => {
    return (
        <View style={styles.container}>
            <View style={styles.leftBlock}>
                <Text style={styles.title}>Inicio</Text>
                <View style={styles.subtitleRow}>
                    <View style={styles.subtitleDot} />
                    <Text style={styles.subtitle}>
                        Bienvenido al panel de control de tu negocio.
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.gutterWeb,
        paddingVertical: spacing.xl + 4,
        borderBottomWidth: 1,
        borderBottomColor: palette.borderSoft,
        backgroundColor: palette.background,
    },
    leftBlock: {
        flex: 1,
    },
    title: {
        ...typography.h1,
        color: palette.textPrimary,
        marginBottom: 6,
    },
    subtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    subtitleDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: HC.yellow,
    },
    subtitle: {
        ...typography.body,
        color: palette.textMuted,
        fontSize: 14,
    },
});
