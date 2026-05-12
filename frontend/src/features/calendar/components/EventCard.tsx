import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@/constants/theme';
import { useLanguage } from '@/core/i18n';
import { CalendarEvent } from './types';
import type { ApiReserva } from '../types';

interface EventCardProps {
    event: CalendarEvent;
    onPress: (event: CalendarEvent) => void;
    style?: any;
    hourHeight: number;
}

interface StatusColors {
    borderColor: string;
    bg: string;
    text: string;
    subtext: string;
}

function getStatusColors(estat: ApiReserva['estat'] | undefined): StatusColors {
    switch (estat) {
        case 'CONFIRMADA':
        case 'FINALITZADA':
            return { borderColor: '#2e7d32', bg: '#e8f5e9', text: '#1b5e20', subtext: '#388e3c' };
        case 'PENDENT':
            return { borderColor: '#1565c0', bg: '#e3f2fd', text: '#0d47a1', subtext: '#1565c0' };
        case 'CANCELLADA':
            return { borderColor: '#c2185b', bg: '#fce4ec', text: '#880e4f', subtext: '#c2185b' };
        case 'NO_SHOW':
            return { borderColor: '#e65100', bg: '#fff3e0', text: '#bf360c', subtext: '#e65100' };
        default:
            return { borderColor: '#2e7d32', bg: '#e8f5e9', text: '#1b5e20', subtext: '#388e3c' };
    }
}

const pad = (n: number) => String(n).padStart(2, '0');

function madridHM(date: Date): { h: number; m: number } {
    const fmt = new Intl.DateTimeFormat('en', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
        timeZone: 'Europe/Madrid',
    });
    const parts = fmt.formatToParts(date);
    return {
        h: parseInt(parts.find(p => p.type === 'hour')?.value ?? '0'),
        m: parseInt(parts.find(p => p.type === 'minute')?.value ?? '0'),
    };
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPress, style }) => {
    const { t } = useLanguage();

    if (event.type === 'maintenance') {
        return (
            <View style={[styles.maintenanceOverlay, style]}>
                <Text style={styles.maintenanceText}>{t('calendarMaintenanceDay')}</Text>
            </View>
        );
    }

    const colors = getStatusColors(event.estat);

    const { h: sh, m: sm } = madridHM(event.start);
    const { h: eh, m: em } = madridHM(event.end);
    const timeLabel = `${pad(sh)}:${pad(sm)} – ${pad(eh)}:${pad(em)}`;
    const subtitle = event.client ? `${timeLabel} · ${event.client}` : timeLabel;

    const cardHeight = typeof style?.height === 'number' ? style.height : 0;
    const workerName = event.rawReserva?.treballador?.nom;
    const showWorkerPill = cardHeight >= 52 && !!workerName;

    return (
        <TouchableOpacity
            style={[
                styles.container,
                { borderLeftColor: colors.borderColor, backgroundColor: colors.bg },
                style,
            ]}
            onPress={() => onPress(event)}
            activeOpacity={0.8}
        >
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                {event.title}
            </Text>
            <Text style={[styles.subtitle, { color: colors.subtext }]} numberOfLines={1}>
                {subtitle}
            </Text>
            {showWorkerPill && (
                <View style={[styles.workerPill, { backgroundColor: colors.borderColor + '20' }]}>
                    <Ionicons name="person-outline" size={10} color={colors.borderColor} />
                    <Text style={[styles.workerText, { color: colors.borderColor }]} numberOfLines={1}>
                        {workerName}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 2,
        right: 2,
        borderRadius: 6,
        borderLeftWidth: 3,
        paddingHorizontal: 8,
        paddingVertical: 4,
        overflow: 'hidden',
    },
    maintenanceOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
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
    title: {
        fontSize: 12,
        fontWeight: '600',
    },
    subtitle: {
        fontSize: 11,
        marginTop: 1,
    },
    workerPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        alignSelf: 'flex-start',
        borderRadius: 20,
        paddingVertical: 2,
        paddingHorizontal: 6,
        marginTop: 3,
    },
    workerText: {
        fontSize: 10,
    },
});
