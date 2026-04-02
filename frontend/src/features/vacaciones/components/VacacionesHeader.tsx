import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, typography } from '@/constants/theme';
import { HC } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';

export function VacacionesHeader() {
    const theme = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.headerBg }]}>
            <View style={styles.leftBlock}>
                <Text style={[styles.title, { color: theme.headerText }]}>Gestión de Vacaciones</Text>
                <View style={styles.subtitleRow}>
                    <View style={[styles.subtitleDot, { backgroundColor: theme.primary }]} />
                    <Text style={[styles.subtitle, { color: theme.headerSubtitle }]}>
                        Planifica tus descansos y consulta tu saldo de días para el año 2025.
                    </Text>
                </View>
            </View>
            <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: theme.primary }]} activeOpacity={0.85}>
                <Ionicons name="add" size={18} color={theme.textOnPrimary} />
                <Text style={[styles.btnPrimaryText, { color: theme.textOnPrimary }]}>Solicitar Días</Text>
            </TouchableOpacity>
        </View>
    );
}

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
        marginRight: 16,
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
        backgroundColor: HC.primary,
    },
    subtitle: {
        ...typography.body,
        color: palette.textMuted,
        fontSize: 14,
    },
    btnPrimary: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: HC.primary,
    },
    btnPrimaryText: {
        fontSize: 14,
        fontWeight: '600',
        color: HC.white,
    },
});
