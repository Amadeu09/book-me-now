import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { palette, spacing, typography } from "@/constants/theme";
import { useTheme } from '@/core/theme/ThemeProvider';

export const InicioHeader: React.FC = () => {
    const theme = useTheme();
    return (
        <View style={[styles.container, { backgroundColor: theme.headerBg, borderBottomColor: theme.primary + '22' }]}>
            <View style={styles.leftBlock}>
                <Text style={[styles.title, { color: theme.headerText }]}>Inicio</Text>
                <View style={styles.subtitleRow}>
                    <View style={[styles.subtitleDot, { backgroundColor: theme.primary }]} />
                    <Text style={[styles.subtitle, { color: theme.headerSubtitle }]}>
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
    },
    subtitle: {
        ...typography.body,
        color: palette.textMuted,
        fontSize: 14,
    },
});
