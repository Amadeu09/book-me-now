import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { palette, spacing, typography, radius } from "@/constants/theme";
import { ViewMode } from './types';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';

interface CalendarHeaderProps {
    viewMode: ViewMode;
    onViewChange: (mode: ViewMode) => void;
    onQuickCreate: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
    viewMode,
    onViewChange,
    onQuickCreate
}) => {
    const theme = useTheme();
    const { t } = useLanguage();

    const MODE_LABELS: Record<ViewMode, string> = {
        day: t('calendarViewDay'),
        week: t('calendarViewWeek'),
        month: t('calendarViewMonth'),
    };
    const { width } = useWindowDimensions();
    const isDesktop = Platform.OS === 'web' && width >= 1024;

    const availableModes: ViewMode[] = isDesktop ? ['week', 'month'] : ['day', 'week'];

    return (
        <View style={[styles.container, { backgroundColor: theme.headerBg, borderBottomColor: theme.primary + '22' }]}>
            <View>
                <Text style={[styles.title, { color: theme.headerText }]}>{t('calendarTitle')}</Text>
                {isDesktop && (
                    <Text style={[styles.subtitle, { color: theme.headerSubtitle }]}>{t('calendarSubtitle')}</Text>
                )}
            </View>

            <View style={styles.actions}>
                {isDesktop && (
                    <View style={styles.segmentControl}>
                        {availableModes.map((mode) => {
                            const isActive = viewMode === mode;
                            return (
                                <TouchableOpacity
                                    key={mode}
                                    style={[
                                        styles.segmentButton,
                                        isActive && { backgroundColor: theme.primary },
                                    ]}
                                    onPress={() => onViewChange(mode)}
                                >
                                    <Text style={[
                                        styles.segmentText,
                                        { color: isActive ? '#ffffff' : palette.textMuted,
                                          fontWeight: isActive ? '600' : '500' },
                                    ]}>
                                        {MODE_LABELS[mode]}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                <TouchableOpacity style={[styles.createButton, { backgroundColor: theme.primary }]} onPress={onQuickCreate}>
                    <Ionicons name="add" size={20} color={theme.textOnPrimary} />
                    {isDesktop && <Text style={[styles.createButtonText, { color: theme.textOnPrimary }]}>{t('calendarNewBooking')}</Text>}
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
        paddingHorizontal: spacing.gutterWeb,
        paddingVertical: spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: palette.borderSoft,
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
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.lg,
    },
    segmentControl: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9', // slate-100
        borderRadius: radius.md,
        padding: 4,
    },
    segmentButton: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: radius.sm,
    },
    segmentText: {
        fontSize: 14,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: palette.accent,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: radius.md,
        gap: 6,
    },
    createButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 14,
    },
});
