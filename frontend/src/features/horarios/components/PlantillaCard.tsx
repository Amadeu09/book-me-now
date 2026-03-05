import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC, cardShadow } from '../constants/horarios.constants';
import type { PlantillaSummary } from '../types/jornades.types';

interface PlantillaCardProps {
    template: PlantillaSummary;
    onOptions?: () => void;
}

export const PlantillaCard: React.FC<PlantillaCardProps> = ({ template, onOptions }) => (
    <View style={[styles.card, { borderLeftColor: template.accentColor }]}>
        <View style={styles.content}>
            <View style={styles.nameRow}>
                <Text style={styles.name}>{template.nom}</Text>
                {!template.activa && (
                    <View style={styles.inactiveBadge}>
                        <Text style={styles.inactiveBadgeText}>Inactiva</Text>
                    </View>
                )}
            </View>
            <Text style={styles.details}>
                <Text style={styles.days}>{template.daysLabel}</Text>
                {'   '}
                {template.hoursLabel}
                {template.rotationsCount > 1 ? ` • ${template.rotationsCount} rotaciones` : ''}
            </Text>
        </View>
        <TouchableOpacity onPress={onOptions} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="ellipsis-vertical" size={18} color={HC.textMuted} />
        </TouchableOpacity>
    </View>
);

/* ── Empty / Loading / Error states ───── */

export const PlantillaListEmpty: React.FC = () => (
    <View style={styles.emptyContainer}>
        <Ionicons name="layers-outline" size={40} color={HC.textLight} />
        <Text style={styles.emptyTitle}>Sin plantillas</Text>
        <Text style={styles.emptySubtitle}>Crea tu primera plantilla de jornada</Text>
    </View>
);

export const PlantillaListLoading: React.FC = () => (
    <View style={styles.loadingContainer}>
        <ActivityIndicator color={HC.primary} />
        <Text style={styles.loadingText}>Cargando plantillas…</Text>
    </View>
);

export const PlantillaListError: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
    <View style={styles.emptyContainer}>
        <Ionicons name="warning-outline" size={40} color={HC.red} />
        <Text style={styles.emptyTitle}>Error</Text>
        <Text style={styles.emptySubtitle}>{message}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.7}>
            <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: HC.white,
        borderRadius: 12,
        borderLeftWidth: 4,
        padding: 16,
        marginBottom: 10,
        ...cardShadow,
    },
    content: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    name: {
        fontSize: 15,
        fontWeight: '700',
        color: HC.textPrimary,
    },
    inactiveBadge: {
        backgroundColor: HC.borderSoft,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    inactiveBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: HC.textMuted,
    },
    details: {
        fontSize: 13,
        color: HC.textMuted,
    },
    days: {
        fontWeight: '700',
        color: HC.textSecondary,
    },

    /* Empty / Loading / Error */
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 32,
        gap: 8,
    },
    emptyTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: HC.textPrimary,
    },
    emptySubtitle: {
        fontSize: 13,
        color: HC.textMuted,
        textAlign: 'center',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 24,
        gap: 10,
    },
    loadingText: {
        fontSize: 13,
        color: HC.textMuted,
    },
    retryBtn: {
        marginTop: 8,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: HC.primary,
    },
    retryText: {
        fontSize: 13,
        fontWeight: '600',
        color: HC.white,
    },
});
