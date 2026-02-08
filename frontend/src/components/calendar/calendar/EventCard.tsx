import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CalendarEvent } from './types';
import { palette, radius } from '@/styles/theme';
import { Feather } from '@expo/vector-icons';

interface EventCardProps {
    event: CalendarEvent;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
    // Basic text formatting for time range
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    // Calculate duration for styling decisions
    const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60);
    const isSmallShort = duration < 45;

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: event.color || '#e2e8f0',
                borderLeftColor: adjustColor(event.color || '#e2e8f0', -20),
            }
        ]}>
            <View style={styles.headerRow}>
                <Text style={styles.title} numberOfLines={1}>
                    {event.icon && (
                        <Feather name={event.icon as any} size={12} color={palette.textPrimary} style={{ marginRight: 4 }} />
                    )}
                    {event.title}
                </Text>
                {event.isVip && (
                    <Feather name="check-circle" size={12} color="#2563eb" style={{ marginLeft: 4 }} />
                )}
            </View>

            {!isSmallShort && (
                <Text style={styles.time}>
                    {formatTime(event.start)} - {formatTime(event.end)}
                </Text>
            )}

            {event.client && !isSmallShort && (
                <View style={styles.clientRow}>
                    {event.clientInitials && (
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{event.clientInitials}</Text>
                        </View>
                    )}
                    <Text style={styles.clientName} numberOfLines={1}>{event.client}</Text>
                </View>
            )}

            {event.badges && !isSmallShort && (
                <View style={styles.badges}>
                    {event.badges.map(badge => (
                        <View key={badge} style={styles.badge}>
                            <Text style={styles.badgeText}>{badge}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

// Simple helper to darken color for border
function adjustColor(color: string, amount: number) {
    return color; // Placeholder
}

const styles = StyleSheet.create({
    container: {
        flex: 1, // Fill the parent wrapper
        borderRadius: radius.sm,
        borderLeftWidth: 4,
        padding: 6,
        overflow: 'hidden',
        marginRight: 4, // Spacing between events/cols
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 12,
        fontWeight: '700',
        color: palette.textPrimary,
        flex: 1,
    },
    time: {
        fontSize: 11,
        color: palette.textMuted,
        marginTop: 2,
    },
    clientRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    avatar: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 4,
    },
    avatarText: {
        fontSize: 9,
        fontWeight: '600',
        color: palette.textPrimary,
    },
    clientName: {
        fontSize: 11,
        color: palette.textSubtle,
    },
    badges: {
        flexDirection: 'row',
        marginTop: 4,
        gap: 4,
    },
    badge: {
        backgroundColor: 'rgba(255,255,255,0.6)',
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 9,
        fontWeight: '600',
        color: '#1e40af', // blue-800
    },
});
