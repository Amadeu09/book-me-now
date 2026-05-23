import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC, cardShadow } from '@/features/home/constants/inicio.constants';
import type { ProfileServei } from '../services/profile.service';

const CATEGORY_ICONS: Record<string, string> = {
    PERRUQUERIA: 'cut-outline',
    BARBERIA: 'man-outline',
    ESTETICA: 'sparkles-outline',
    SPA: 'leaf-outline',
    MASSATGES: 'hand-left-outline',
    NUTRICIONISTA: 'nutrition-outline',
    FISIOTERAPIA: 'medkit-outline',
    DENTAL: 'happy-outline',
    VETERINARIA: 'paw-outline',
    ALTRES: 'grid-outline',
    OTROS: 'grid-outline',
};

function getCategoryIcon(categoria?: string | null): string {
    return CATEGORY_ICONS[categoria ?? ''] ?? 'grid-outline';
}
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';

const MAX_VISIBLE = 3;

interface ServiceItemProps {
    item: ProfileServei;
}

const ServiceItem: React.FC<ServiceItemProps> = ({ item }) => {
    const theme = useTheme();
    return (
    <View style={styles.serviceCard}>
        {item.fotoUrl ? (
            <Image source={{ uri: item.fotoUrl }} style={styles.serviceImage} resizeMode="cover" />
        ) : (
            <View style={[styles.serviceIcon, { backgroundColor: theme.primaryMid }]}>
                <Ionicons name={getCategoryIcon(item.categoria) as any} size={20} color={theme.primary} />
            </View>
        )}

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
};

interface AssignedServicesProps {
    services: ProfileServei[];
    isLoading: boolean;
}

export const AssignedServices: React.FC<AssignedServicesProps> = ({ services, isLoading }) => {
    const [expanded, setExpanded] = useState(false);
    const theme = useTheme();
    const { t } = useLanguage();

    const hasMore = services.length > MAX_VISIBLE;
    const visible = expanded ? services : services.slice(0, MAX_VISIBLE);

    return (
        <View style={[styles.container, { backgroundColor: theme.primaryLight, borderWidth: theme.softBorderWidth, borderColor: theme.softBorderColor }]}>
            <View style={styles.header}>
                <Text style={styles.title}>{t('assignedServices')}</Text>
                {hasMore && (
                    <TouchableOpacity onPress={() => setExpanded((v) => !v)}>
                        <Text style={[styles.link, { color: theme.primary }]}>{expanded ? t('showLess') : t('showAllMasc')}</Text>
                    </TouchableOpacity>
                )}
            </View>

            {isLoading ? (
                <ActivityIndicator color={theme.primary} style={styles.spinner} />
            ) : services.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="briefcase-outline" size={32} color={HC.textLight} />
                    <Text style={styles.emptyText}>{t('noAssignedServices')}</Text>
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
    serviceImage: {
        width: 40,
        height: 40,
        borderRadius: 10,
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
