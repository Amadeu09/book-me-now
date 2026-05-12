import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { palette, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';

export const ProfileHeader: React.FC = () => {
    const theme = useTheme();
    const { t } = useLanguage();
    return (
        <View style={[styles.container, { backgroundColor: theme.headerBg, borderBottomColor: theme.primary + '22' }]}>
            <View style={styles.leftBlock}>
                <Text style={[styles.title, { color: theme.headerText }]}>{t('profileTitle')}</Text>
                <Text style={[styles.subtitle, { color: theme.headerSubtitle }]}>{t('profileHeaderSubtitle')}</Text>
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
    subtitle: {
        fontSize: 14,
        color: palette.textMuted,
    },
});
