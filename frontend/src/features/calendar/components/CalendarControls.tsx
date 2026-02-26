import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { palette, spacing, radius } from "@/constants/theme";
import { Ionicons } from '@expo/vector-icons';

interface CalendarControlsProps {
    dateRange: string;
    onPrev: () => void;
    onNext: () => void;
}

const FilterButton = ({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) => (
    <TouchableOpacity style={styles.filterButton}>
        <Ionicons name={icon} size={16} color={palette.textMuted} />
        <Text style={styles.filterText}>{label}</Text>
        <Ionicons name="chevron-down" size={14} color={palette.textSubtle} />
    </TouchableOpacity>
);

export const CalendarControls: React.FC<CalendarControlsProps> = ({
    dateRange,
    onPrev,
    onNext
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.filters}>
                <FilterButton icon="people-outline" label="All Employees" />
                <FilterButton icon="shapes-outline" label="All Service Types" />
                <FilterButton icon="business-outline" label="All Rooms" />
            </View>

            <View style={styles.navigation}>
                <TouchableOpacity onPress={onPrev} style={styles.navButton}>
                    <Ionicons name="chevron-back" size={20} color={palette.textPrimary} />
                </TouchableOpacity>

                <Text style={styles.dateRange}>{dateRange}</Text>

                <TouchableOpacity onPress={onNext} style={styles.navButton}>
                    <Ionicons name="chevron-forward" size={20} color={palette.textPrimary} />
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
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: palette.borderSoft,
        backgroundColor: palette.background,
    },
    filters: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: palette.border,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: radius.md,
        gap: 8,
    },
    filterText: {
        fontSize: 14,
        color: palette.textPrimary,
        fontWeight: '500',
    },
    navigation: {
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
