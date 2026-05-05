import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CalendarEvent } from './types';
import { palette } from "@/constants/theme";
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/core/i18n';

interface EventCardProps {
    event: CalendarEvent;
    onPress: (event: CalendarEvent) => void;
    style?: any;
    hourHeight: number;
}

function madridHM(date: Date): { h: number; m: number } {
    const fmt = new Intl.DateTimeFormat('en', { hour: 'numeric', minute: 'numeric', hour12: false, timeZone: 'Europe/Madrid' });
    const parts = fmt.formatToParts(date);
    return {
        h: parseInt(parts.find(p => p.type === 'hour')?.value ?? '0'),
        m: parseInt(parts.find(p => p.type === 'minute')?.value ?? '0'),
    };
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPress, style, hourHeight }) => {
    const { t } = useLanguage();
    const { h: startHour, m: startMin } = madridHM(event.start);
    const { h: endHour, m: endMin } = madridHM(event.end);

    const top = (startHour + startMin / 60) * hourHeight;
    const bottom = (endHour + endMin / 60) * hourHeight;
    const height = bottom - top;

    const isMaintenance = event.type === 'maintenance';

    if (isMaintenance) {
        return (
            <View style={[styles.maintenanceOverlay, style, { top, height }]}>
                <Text style={styles.maintenanceText}>{t('calendarMaintenanceDay')}</Text>
            </View>
        );
    }

    const containerStyle = {
        backgroundColor: colorWithOpacity(event.color || '#e2e8f0', 0.92),
        borderLeftColor: adjustColor(event.color || '#e2e8f0'),
        top: top + 1,
        height: height - 2,
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
                            color={palette.textPrimary}
                            style={{ marginLeft: 4 }}
                        />
                    )}
                </View>

                <Text style={styles.time}>
                    {formatTime(event.start)} - {formatTime(event.end)}
                </Text>

                {event.client && (
                    <View style={styles.clientRow}>
                        {event.clientInitials && (
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{event.clientInitials}</Text>
                            </View>
                        )}
                        <Text style={styles.clientName} numberOfLines={1}>{event.client}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
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

const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' });
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 2,
        right: 2,
        borderRadius: 6,
        borderLeftWidth: 3,
        padding: 6,
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
        fontWeight: '500',
        color: palette.textPrimary,
        opacity: 0.75,
        marginBottom: 4,
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
        fontSize: 8,
        fontWeight: '700',
        color: palette.textPrimary,
    },
    clientName: {
        fontSize: 10,
        fontWeight: '500',
        color: palette.textPrimary,
        flex: 1,
    },
});
