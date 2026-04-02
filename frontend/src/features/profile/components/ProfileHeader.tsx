import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { palette, spacing, typography } from '@/constants/theme';
import { HC } from '@/features/home/constants/inicio.constants';

export const ProfileHeader: React.FC = () => (
    <View style={styles.container}>
        <View style={styles.leftBlock}>
            <Text style={styles.title}>Perfil</Text>
            <View style={styles.subtitleRow}>
                <View style={styles.subtitleDot} />
                <Text style={styles.subtitle}>Tu información y citas del día.</Text>
            </View>
        </View>
    </View>
);

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
        backgroundColor: HC.primary,
    },
    subtitle: {
        fontSize: 14,
        color: palette.textMuted,
    },
});
