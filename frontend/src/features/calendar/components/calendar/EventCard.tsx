import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CalendarEvent } from '../types';
import { palette } from "@/constants/theme";
import { Feather } from '@expo/vector-icons';

interface EventCardProps {
    event: CalendarEvent;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60);
    const isSmallShort = duration < 45;

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: colorWithOpacity(event.color || '#e2e8f0', 0.92),
                borderLeftColor: adjustColor(event.color || '#e2e8f0'),
            }
        ]}>
            <View style={styles.headerRow}>
                <Text style={styles.title} numberOfLines={1}>
                    {event.icon && (
                        <Feather name={event.icon as any} size={12} color={palette.textPrimary} style={{ marginRight: 4 }} />
                    )}
                    {event.title}
                </Text>
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
                    {event.badges.map((badge: string) => (
                        <View key={badge} style={styles.badge}>
                            <Text style={styles.badgeText}>{badge}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

function colorWithOpacity(color: string, opacity: number): string {
    if (!color.startsWith('#') || color.length < 7) return color;
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${opacity})`;
}

function adjustColor(color: string): string {
    if (!color.startsWith('#') || color.length < 7) return color;
    const r = Math.max(0, parseInt(color.slice(1, 3), 16) - 40);
    const g = Math.max(0, parseInt(color.slice(3, 5), 16) - 40);
    const b = Math.max(0, parseInt(color.slice(5, 7), 16) - 40);
    return `rgb(${r},${g},${b})`;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 6,
        borderLeftWidth: 3,
        padding: 6,
        overflow: 'hidden',
        marginRight: 4,
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
        fontSize: 10,
        fontWeight: '500',
        color: palette.textPrimary,
        opacity: 0.75,
        marginTop: 2,
    },
    clientRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 3,
    },
    avatar: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: 'rgba(0,0,0,0.15)',
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
        fontSize: 10,
        fontWeight: '500',
        color: palette.textPrimary,
        flex: 1,
    },
    badges: {
        flexDirection: 'row',
        marginTop: 4,
        gap: 4,
    },
    badge: {
        backgroundColor: 'rgba(255,255,255,0.5)',
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 8,
        fontWeight: '600',
        color: palette.textPrimary,
    },
});
