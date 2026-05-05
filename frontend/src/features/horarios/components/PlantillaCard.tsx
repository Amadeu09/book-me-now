import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC, cardShadow } from '../constants/horarios.constants';
import type { PlantillaSummary } from '../types/jornades.types';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';

interface PlantillaCardProps {
    template: PlantillaSummary;
    onOptions?: () => void;
    onEdit?: (template: PlantillaSummary) => void;
    onDelete?: (template: PlantillaSummary) => void;
}

export const PlantillaCard: React.FC<PlantillaCardProps> = ({ template, onOptions, onEdit, onDelete }) => {
    const [showMenu, setShowMenu] = useState(false);
    const theme = useTheme();
    const { t } = useLanguage();

    return (
        <View style={[styles.card, {
            backgroundColor: theme.primaryLight,
            borderWidth: theme.softBorderWidth,
            borderColor: theme.softBorderColor,
            borderLeftWidth: 4,
            borderLeftColor: template.accentColor,
            zIndex: showMenu ? 100 : 1,
        }]}>
            <View style={styles.content}>
                <View style={styles.nameRow}>
                    <Text style={styles.name}>{template.nom}</Text>
                    {!template.activa && (
                        <View style={styles.inactiveBadge}>
                            <Text style={styles.inactiveBadgeText}>{t('plantillaInactive')}</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.details}>
                    <Text style={styles.days}>{template.daysLabel}</Text>
                    {'   '}
                    {template.hoursLabel}
                    {template.rotationsCount > 1 ? ` • ${template.rotationsCount} ${t('plantillaRotations')}` : ''}
                </Text>
            </View>
            <View style={{ position: 'relative', zIndex: 10 }}>
                <TouchableOpacity onPress={() => setShowMenu(!showMenu)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="ellipsis-vertical" size={18} color={HC.textMuted} />
                </TouchableOpacity>
                {showMenu && (
                    <View style={styles.menuPopover}>
                        <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); onEdit?.(template); }}>
                            <Text style={styles.menuItemText}>{t('edit')}</Text>
                        </TouchableOpacity>
                        <View style={styles.menuDivider} />
                        <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); onDelete?.(template); }}>
                            <Text style={[styles.menuItemText, { color: HC.red }]}>{t('delete')}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

/* ── Empty / Loading / Error states ───── */

export const PlantillaListEmpty: React.FC = () => {
    const { t } = useLanguage();
    return (
        <View style={styles.emptyContainer}>
            <Ionicons name="layers-outline" size={40} color={HC.textLight} />
            <Text style={styles.emptyTitle}>{t('plantillaEmpty')}</Text>
            <Text style={styles.emptySubtitle}>{t('plantillaEmptySubtitle')}</Text>
        </View>
    );
};

export const PlantillaListLoading: React.FC = () => {
    const { t } = useLanguage();
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator color={HC.primary} />
            <Text style={styles.loadingText}>{t('plantillaLoading')}</Text>
        </View>
    );
};

export const PlantillaListError: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => {
    const { t } = useLanguage();
    return (
        <View style={styles.emptyContainer}>
            <Ionicons name="warning-outline" size={40} color={HC.red} />
            <Text style={styles.emptyTitle}>{t('error')}</Text>
            <Text style={styles.emptySubtitle}>{message}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.7}>
                <Text style={styles.retryText}>{t('retry')}</Text>
            </TouchableOpacity>
        </View>
    );
};

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
    menuPopover: {
        position: 'absolute',
        top: 24,
        right: 0,
        backgroundColor: HC.white,
        borderRadius: 8,
        paddingVertical: 4,
        minWidth: 120,
        ...cardShadow,
        elevation: 5,
        zIndex: 1000,
    },
    menuItem: {
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    menuItemText: {
        fontSize: 14,
        color: HC.textPrimary,
    },
    menuDivider: {
        height: 1,
        backgroundColor: HC.borderSoft,
    },
});
