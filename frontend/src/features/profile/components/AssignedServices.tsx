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
import type { ProfileServei } from '../services/profile.service';

const MAX_VISIBLE = 3;

interface ServiceItemProps {
    item: ProfileServei;
}

const ServiceItem: React.FC<ServiceItemProps> = ({ item }) => (
    <View style={styles.serviceCard}>
        <View style={styles.serviceIcon}>
            <Ionicons name="cut-outline" size={20} color={HC.primary} />
        </View>

        <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{item.nom}</Text>
            <View style={styles.serviceMeta}>
                <Ionicons name="time-outline" size={12} color={HC.textMuted} />
                <Text style={styles.metaText}>{item.duradaMin} min</Text>
                <Text style={styles.metaDot}>·</Text>
                <Ionicons name="cash-outline" size={12} color={HC.textMuted} />
                <Text style={styles.metaText}>{Number(item.preu).toFixed(2)} €</Text>
            </View>
        </View>

        <Ionicons name="chevron-forward" size={18} color={HC.textLight} />
    </View>
);

interface AssignedServicesProps {
    services: ProfileServei[];
    isLoading: boolean;
}

export const AssignedServices: React.FC<AssignedServicesProps> = ({ services, isLoading }) => {
    const [expanded, setExpanded] = useState(false);

    const hasMore = services.length > MAX_VISIBLE;
    const visible = expanded ? services : services.slice(0, MAX_VISIBLE);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Servicios Asignados</Text>
                {hasMore && (
                    <TouchableOpacity onPress={() => setExpanded((v) => !v)}>
                        <Text style={styles.link}>{expanded ? 'Ver menos' : 'Ver todos →'}</Text>
                    </TouchableOpacity>
                )}
            </View>

            {isLoading ? (
                <ActivityIndicator color={HC.primary} style={styles.spinner} />
            ) : services.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="briefcase-outline" size={32} color={HC.textLight} />
                    <Text style={styles.emptyText}>No tienes servicios asignados</Text>
                </View>
            ) : (
                <FlatList
                    data={visible}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => <ServiceItem item={item} />}
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
    serviceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 4,
    },
    serviceIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: HC.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    serviceInfo: {
        flex: 1,
    },
    serviceName: {
        fontSize: 14,
        fontWeight: '600',
        color: HC.textPrimary,
        marginBottom: 3,
    },
    serviceMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        color: HC.textMuted,
    },
    metaDot: {
        fontSize: 12,
        color: HC.textLight,
    },
});
