import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { palette, spacing, radius } from "@/constants/theme";
import { Feather } from '@expo/vector-icons';
import { useLanguage } from '@/core/i18n';

interface CalendarControlsProps {
    dateRange: string;
    onPrev: () => void;
    onNext: () => void;
}

const Dropdown = ({ label, icon }: { label: string; icon: keyof typeof Feather.glyphMap }) => (
    <TouchableOpacity style={styles.dropdown}>
        <Feather name={icon} size={16} color={palette.textMuted} style={{ marginRight: 8 }} />
        <Text style={styles.dropdownText}>{label}</Text>
        <Feather name="chevron-down" size={16} color={palette.textMuted} style={{ marginLeft: 'auto' }} />
    </TouchableOpacity>
);

export const CalendarControls: React.FC<CalendarControlsProps> = ({
    dateRange,
    onPrev,
    onNext
}) => {
    const { t } = useLanguage();
    return (
        <View style={styles.container}>
            <View style={styles.filters}>
                <Dropdown label={t('calendarAllEmployees')} icon="users" />
                <Dropdown label={t('calendarAllServices')} icon="grid" />
                <Dropdown label={t('calendarAllRooms')} icon="map" />
            </View>

            <View style={styles.navigator}>
                <TouchableOpacity onPress={onPrev} style={styles.navButton}>
                    <Feather name="chevron-left" size={20} color={palette.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.dateRange}>{dateRange}</Text>
                <TouchableOpacity onPress={onNext} style={styles.navButton}>
                    <Feather name="chevron-right" size={20} color={palette.textPrimary} />
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
        paddingVertical: spacing.md,
        backgroundColor: palette.background,
        borderBottomWidth: 1,
        borderBottomColor: palette.borderSoft,
    },
    filters: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: palette.borderSoft,
        borderRadius: radius.md,
        paddingVertical: 8,
        paddingHorizontal: 12,
        minWidth: 160,
    },
    dropdownText: {
        fontSize: 14,
        color: palette.textPrimary,
        fontWeight: '500',
    },
    navigator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    navButton: {
        padding: 4,
    },
    dateRange: {
        fontSize: 16,
        fontWeight: '600',
        color: palette.textPrimary,
        minWidth: 160,
        textAlign: 'center',
    },
});
