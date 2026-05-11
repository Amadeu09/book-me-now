import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, typography } from "@/constants/theme";
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';

interface ServicesHeaderProps {
    onNew?: () => void;
    loading?: boolean;
}

export const ServicesHeader: React.FC<ServicesHeaderProps> = ({ onNew, loading }) => {
    const theme = useTheme();
    const { t } = useLanguage();
    return (
        <View style={[styles.container, { backgroundColor: theme.headerBg, borderBottomColor: theme.primary + '22' }]}>
            <View style={styles.leftBlock}>
                <Text style={[styles.title, { color: theme.headerText }]}>{t('servTitle')}</Text>
                <Text style={[styles.subtitle, { color: theme.headerSubtitle }]}>{t('servSubtitle')}</Text>
            </View>
            {onNew && (
                <TouchableOpacity
                    style={[styles.newBtn, { backgroundColor: theme.primary }, loading && styles.btnDisabled]}
                    onPress={onNew}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add-outline" size={20} color={theme.textOnPrimary} />
                    <Text style={[styles.newBtnText, { color: theme.textOnPrimary }]}>{t('servNewTitle')}</Text>
                </TouchableOpacity>
            )}
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
    newBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
    },
    newBtnText: {
        fontSize: 14,
        fontWeight: '600',
    },
    btnDisabled: {
        opacity: 0.5,
    },
});
