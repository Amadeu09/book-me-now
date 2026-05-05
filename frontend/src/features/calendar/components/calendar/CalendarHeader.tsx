import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { palette, spacing, typography, radius } from "@/constants/theme";
import { Feather } from '@expo/vector-icons';
import { useLanguage } from '@/core/i18n';
import { ViewMode } from '../types';

interface CalendarHeaderProps {
    viewMode: ViewMode;
    onChangeViewMode: (mode: ViewMode) => void;
    onQuickCreate: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
    viewMode,
    onChangeViewMode,
    onQuickCreate
}) => {
    const { t } = useLanguage();
    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.title}>{t('calendarTitle')}</Text>
                <Text style={styles.subtitle}>{t('calendarSubtitle')}</Text>
            </View>

            <View style={styles.rightSection}>
                <View style={styles.viewSwitcher}>
                    {(['week', 'month', 'day'] as ViewMode[]).map((mode) => (
                        <TouchableOpacity
                            key={mode}
                            style={[
                                styles.switchButton,
                                viewMode === mode && styles.switchButtonActive
                            ]}
                            onPress={() => onChangeViewMode(mode)}
                        >
                            <Text style={[
                                styles.switchText,
                                viewMode === mode && styles.switchTextActive
                            ]}>
                                {mode === 'day' ? t('calendarViewDay') : mode === 'week' ? t('calendarViewWeek') : t('calendarViewMonth')}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.createButton} onPress={onQuickCreate}>
                    <Feather name="plus" size={18} color="white" style={{ marginRight: 6 }} />
                    <Text style={styles.createButtonText}>{t('calendarQuickCreate')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xxl,
        paddingTop: spacing.xxl,
        paddingBottom: spacing.lg,
        backgroundColor: palette.background,
    },
    title: {
        ...typography.h1,
        color: palette.textPrimary,
        marginBottom: 4,
    },
    subtitle: {
        ...typography.body,
        color: palette.textMuted,
    },
    rightSection: {
        flexDirection: 'row',
        gap: spacing.lg,
        alignItems: 'center',
    },
    viewSwitcher: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9', // slate-100
        borderRadius: radius.md,
        padding: 4,
    },
    switchButton: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: radius.sm,
    },
    switchButtonActive: {
        backgroundColor: '#ffffff',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    switchText: {
        fontSize: 14,
        fontWeight: '500',
        color: palette.textMuted,
    },
    switchTextActive: {
        color: palette.textPrimary,
        fontWeight: '600',
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: palette.accent,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: radius.md,
    },
    createButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 14,
    },
});
