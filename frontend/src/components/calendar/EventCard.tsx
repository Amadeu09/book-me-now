import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CalendarEvent } from './types';
import { palette, radius, spacing, typography } from '@/styles/theme';
import { Ionicons } from '@expo/vector-icons';

interface EventCardProps {
    event: CalendarEvent;
    onPress: (event: CalendarEvent) => void;
    style?: any;
    hourHeight: number;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPress, style, hourHeight }) => {
    // Determine positioning based on time
    const startHour = event.start.getHours();
    const startMin = event.start.getMinutes();
    const endHour = event.end.getHours();
    const endMin = event.end.getMinutes();

    const top = (startHour + startMin / 60) * hourHeight;
    const bottom = (endHour + endMin / 60) * hourHeight;
    const height = bottom - top;

    // Specific styling for different event types
    const isMaintenance = event.type === 'maintenance';

    if (isMaintenance) {
        return (
            <View style={[styles.maintenanceOverlay, style, { top, height }]}>
                <Text style={styles.maintenanceText}>Maintenance Day</Text>
            </View>
        );
    }

    const containerStyle = {
        backgroundColor: event.color || '#fff',
        borderLeftColor: adjustColor(event.color || '#ccc', -20),
        top: top + 1, // +1 margin
        height: height - 2, // -2 gap
    };

    return (
        <TouchableOpacity
            style={[styles.container, containerStyle, style]}
            onPress={() => onPress(event)}
            activeOpacity={0.8}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
                    {event.icon && (
                        <Ionicons
                            name={event.icon as any}
                            size={12}
                            color={palette.textMuted}
                            style={{ marginLeft: 4 }}
                        />
                    )}
                </View>

                <Text style={styles.time}>
                    {formatTime(event.start)} - {formatTime(event.end)}
                </Text>

                <View style={styles.footer}>
                    {event.client && (
                        <View style={styles.clientBadge}>
                            {event.clientInitials && (
                                <View style={styles.initialsCircle}>
                                    <Text style={styles.initialsText}>{event.clientInitials}</Text>
                                </View>
                            )}
                            <Text style={styles.clientName} numberOfLines={1}>{event.client}</Text>
                        </View>
                    )}

                    {event.isVip && (
                        <View style={styles.vipBadge}>
                            <Text style={styles.vipText}>VIP</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

// Helper: Darken color for border
const adjustColor = (color: string, amount: number) => {
    return color; // Simplification for now, logic to darken hex would go here
};

const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 2,
        right: 2,
        borderRadius: radius.sm,
        borderLeftWidth: 4,
        padding: spacing.xs,
        overflow: 'hidden',
    },
    maintenanceOverlay: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 0,
    },
    maintenanceText: {
        transform: [{ rotate: '-90deg' }],
        color: palette.textSubtle,
        fontWeight: '600',
        letterSpacing: 1,
        width: 200,
        textAlign: 'center',
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    title: {
        fontSize: 12,
        fontWeight: '700',
        color: palette.textPrimary,
        flex: 1,
    },
    time: {
        fontSize: 10,
        color: palette.textMuted,
        marginBottom: 4,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 'auto',
    },
    clientBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        flex: 1,
    },
    initialsCircle: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#e2e8f0', // slate-200
        alignItems: 'center',
        justifyContent: 'center',
    },
    initialsText: {
        fontSize: 8,
        fontWeight: '700',
        color: palette.textSubtle,
    },
    clientName: {
        fontSize: 10,
        color: palette.textMuted,
        flex: 1,
    },
    vipBadge: {
        backgroundColor: '#dbeafe', // blue-100
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 4,
    },
    vipText: {
        fontSize: 8,
        fontWeight: '700',
        color: '#1e40af', // blue-800
    },
});
