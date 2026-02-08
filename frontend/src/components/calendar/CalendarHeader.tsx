import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { palette, spacing, typography, radius } from '@/styles/theme';
import { ViewMode } from './types';
import { Ionicons } from '@expo/vector-icons';

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
    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.title}>Calendar</Text>
                <Text style={styles.subtitle}>Manage bookings and check availability.</Text>
            </View>

            <View style={styles.actions}>
                <View style={styles.segmentControl}>
                    {(['week', 'month', 'day'] as ViewMode[]).map((mode) => (
                        <TouchableOpacity
                            key={mode}
                            style={[
                                styles.segmentButton,
                                viewMode === mode && styles.segmentButtonActive
                            ]}
                            onPress={() => onViewChange(mode)}
                        >
                            <Text style={[
                                styles.segmentText,
                                viewMode === mode && styles.segmentTextActive
                            ]}>
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.createButton} onPress={onQuickCreate}>
                    <Ionicons name="add" size={20} color="#fff" />
                    <Text style={styles.createButtonText}>Quick Create</Text>
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
    segmentButtonActive: {
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    segmentText: {
        fontSize: 14,
        fontWeight: '500',
        color: palette.textMuted,
    },
    segmentTextActive: {
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
        gap: 6,
    },
    createButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 14,
    },
});
