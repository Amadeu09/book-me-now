import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, typography } from "@/constants/theme";
import { HC } from '../constants/horarios.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';

export const HorariosHeader: React.FC = () => {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const theme = useTheme();
    const { t } = useLanguage();

    return (
        <View style={[styles.container, { backgroundColor: theme.headerBg, borderBottomColor: theme.primary + '22' }]}>
            <View style={styles.leftBlock}>
                <Text style={[styles.title, { color: theme.headerText }]}>{t('horariosTitle')}</Text>
                <View style={styles.subtitleRow}>
                    <View style={[styles.subtitleDot, { backgroundColor: theme.primary }]} />
                    <Text style={[styles.subtitle, { color: theme.headerSubtitle }]}>
                        {t('horariosSubtitle')}
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
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    btnOutline: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: HC.border,
        borderRadius: 10,
        paddingHorizontal: 18,
        paddingVertical: 10,
        backgroundColor: HC.white,
    },
    btnOutlineText: {
        fontSize: 14,
        fontWeight: '600',
        color: HC.textPrimary,
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
