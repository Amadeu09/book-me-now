import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC, cardShadow } from '@/features/home/constants/inicio.constants';
import type { ProfileReserva } from '../services/profile.service';

const MAX_VISIBLE = 3;

function formatTime(dateStr: string): string {
    const d = new Date(dateStr);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
}

function formatEndTime(dateStr: string, duradaMin = 60): string {
    const d = new Date(new Date(dateStr).getTime() + duradaMin * 60 * 1000);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function isFutureOrNow(dateStr: string, duradaMin = 60): boolean {
    const end = new Date(new Date(dateStr).getTime() + duradaMin * 60 * 1000);
    return end >= new Date();
}

interface AppointmentItemProps {
    item: ProfileReserva;
}

const AppointmentItem: React.FC<AppointmentItemProps> = ({ item }) => {
    const durada = item.servei?.duradaMin ?? 60;
    const startTime = formatTime(item.dataHora);
    const endTime = formatEndTime(item.dataHora, durada);
    const upcoming = isFutureOrNow(item.dataHora, durada);
    const clientName = item.client?.nom ?? item.clientNom ?? 'Cliente';
    const serviceName = item.servei?.nom ?? 'Servicio';
    const initials = getInitials(clientName);

    return (
        <View style={styles.appointmentCard}>
            <View style={[styles.timeBadge, upcoming ? styles.timeBadgeUpcoming : styles.timeBadgePast]}>
                <Text style={[styles.timeText, upcoming ? styles.timeTextUpcoming : styles.timeTextPast]}>
                    {startTime} – {endTime}
                </Text>
            </View>

            <View style={styles.apptRow}>
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View style={styles.apptInfo}>
                    <Text style={styles.clientName}>{clientName}</Text>
                    <Text style={styles.serviceName}>{serviceName}</Text>
                </View>
            </View>
        </View>
    );
};

interface TodayAppointmentsProps {
    bookings: ProfileReserva[];
    isLoading: boolean;
}

export const TodayAppointments: React.FC<TodayAppointmentsProps> = ({ bookings, isLoading }) => {
    const [expanded, setExpanded] = useState(false);

    const sorted = [...bookings].sort(
        (a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime(),
    );
    const hasMore = sorted.length > MAX_VISIBLE;
    const visible = expanded ? sorted : sorted.slice(0, MAX_VISIBLE);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Citas de Hoy</Text>
                {hasMore && (
                    <TouchableOpacity onPress={() => setExpanded((v) => !v)}>
                        <Text style={styles.link}>{expanded ? 'Ver menos' : 'Ver todas →'}</Text>
                    </TouchableOpacity>
                )}
            </View>

            {isLoading ? (
                <ActivityIndicator color={HC.primary} style={styles.spinner} />
            ) : sorted.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="calendar-outline" size={32} color={HC.textLight} />
                    <Text style={styles.emptyText}>No tienes citas para hoy</Text>
                </View>
            ) : (
                <FlatList
                    data={visible}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => <AppointmentItem item={item} />}
                    scrollEnabled={false}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: HC.white,
        borderRadius: 16,
        padding: 20,
        flex: 1,
        ...cardShadow,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        color: HC.textPrimary,
    },
    link: {
        fontSize: 13,
        fontWeight: '600',
        color: HC.primary,
    },
    spinner: {
        marginVertical: 24,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 24,
        gap: 8,
    },
    emptyText: {
        fontSize: 14,
        color: HC.textMuted,
    },
    separator: {
        height: 10,
    },
    appointmentCard: {
        borderRadius: 10,
        backgroundColor: HC.screenBg,
        padding: 12,
        gap: 8,
    },
    timeBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    timeBadgeUpcoming: {
        backgroundColor: HC.primaryLight,
    },
    timeBadgePast: {
        backgroundColor: HC.borderSoft,
    },
    timeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    timeTextUpcoming: {
        color: HC.primary,
    },
    timeTextPast: {
        color: HC.textMuted,
    },
    apptRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    avatarCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: HC.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 14,
        fontWeight: '700',
        color: HC.primary,
    },
    apptInfo: {
        flex: 1,
    },
    clientName: {
        fontSize: 14,
        fontWeight: '600',
        color: HC.textPrimary,
    },
    serviceName: {
        fontSize: 12,
        color: HC.textMuted,
        marginTop: 2,
    },
});
