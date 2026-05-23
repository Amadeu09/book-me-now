import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC, cardShadow } from '@/features/home/constants/inicio.constants';
import type { AbsenciaTreballador, TipusAbsenciaTreballador, EstatAbsencia } from '../types/vacaciones.types';
import { useTheme } from '@/core/theme/ThemeProvider';

const PAGE_SIZE = 5;

const TIPUS_ICON: Record<TipusAbsenciaTreballador, string> = {
    VACANCES: 'airplane-outline',
    MALALTIA: 'medkit-outline',
    PERMIS: 'document-text-outline',
    ALTRE: 'ellipsis-horizontal-outline',
};

const TIPUS_LABEL: Record<TipusAbsenciaTreballador, string> = {
    VACANCES: 'Vacances',
    MALALTIA: 'Malaltia',
    PERMIS: 'Permís',
    ALTRE: 'Altre',
};

const ESTAT_CONFIG: Record<EstatAbsencia, { label: string; bg: string; text: string }> = {
    APROVADA: { label: 'Acceptada', bg: HC.statusGreenBg, text: HC.statusGreenText },
    REBUTJADA: { label: 'Rebutjada', bg: HC.statusRedBg, text: HC.statusRedText },
    PENDENT: { label: 'Pendent', bg: HC.statusYellowBg, text: HC.statusYellowText },
};

function formatRange(inici: string, fi: string): string {
    const fmt = (s: string) => new Date(s).toLocaleDateString('ca-ES', { day: '2-digit', month: 'short' });
    const days = Math.round((new Date(fi).getTime() - new Date(inici).getTime()) / 86_400_000) + 1;
    return `${fmt(inici)} – ${fmt(fi)} · ${days}d`;
}

type Props = {
    items: AbsenciaTreballador[];
    isAdmin?: boolean;
    onDelete?: (id: number) => Promise<void>;
    onEdit?: (absencia: AbsenciaTreballador) => void;
};

export function SolicitudesRecientes({ items, isAdmin, onDelete, onEdit }: Props) {
    const [page, setPage] = useState(0);
    const [confirmId, setConfirmId] = useState<number | null>(null);
    const [loadingId, setLoadingId] = useState<number | null>(null);
    const theme = useTheme();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const displayItems = isAdmin
        ? [...items].sort((a, b) => new Date(b.inici).getTime() - new Date(a.inici).getTime())
        : [...items]
            .filter(a => new Date(a.inici) >= today)
            .sort((a, b) => new Date(a.inici).getTime() - new Date(b.inici).getTime());

    const totalPages = Math.max(1, Math.ceil(displayItems.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages - 1);
    const pageItems = displayItems.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

    const handleDeletePress = (id: number) => {
        setConfirmId(prev => prev === id ? null : id);
    };

    const handleConfirmDelete = async (id: number) => {
        setConfirmId(null);
        setLoadingId(id);
        try {
            await onDelete?.(id);
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <View style={[styles.card, { backgroundColor: theme.primaryLight, borderWidth: theme.softBorderWidth, borderColor: theme.softBorderColor }]}>
            <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>{isAdmin ? 'Absències' : 'Pròximes Absències'}</Text>
                {displayItems.length > PAGE_SIZE && (
                    <View style={styles.pagination}>
                        <TouchableOpacity
                            onPress={() => setPage(p => Math.max(0, p - 1))}
                            disabled={safePage === 0}
                            style={[styles.arrowBtn, safePage === 0 && styles.arrowBtnDisabled]}
                        >
                            <Ionicons name="chevron-back" size={16} color={safePage === 0 ? HC.textMuted : HC.textPrimary} />
                        </TouchableOpacity>
                        <Text style={styles.pageIndicator}>{safePage + 1}/{totalPages}</Text>
                        <TouchableOpacity
                            onPress={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={safePage === totalPages - 1}
                            style={[styles.arrowBtn, safePage === totalPages - 1 && styles.arrowBtnDisabled]}
                        >
                            <Ionicons name="chevron-forward" size={16} color={safePage === totalPages - 1 ? HC.textMuted : HC.textPrimary} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {displayItems.length === 0 ? (
                <Text style={styles.empty}>
                    {isAdmin ? 'No hi ha absències registrades.' : 'No hi ha absències pròximes.'}
                </Text>
            ) : (
                pageItems.map((r, i) => {
                    const icon = TIPUS_ICON[r.tipus];
                    const tipusLabel = TIPUS_LABEL[r.tipus];
                    const estatCfg = ESTAT_CONFIG[r.estat] ?? ESTAT_CONFIG.PENDENT;
                    const isConfirming = confirmId === r.id;
                    const isDeleting = loadingId === r.id;

                    return (
                        <View key={r.id} style={[styles.itemWrapper, i < pageItems.length - 1 && styles.itemBorder]}>
                            <View style={styles.item}>
                                <View style={styles.iconBox}>
                                    <Ionicons name={icon as any} size={18} color={HC.textMuted} />
                                </View>
                                <View style={styles.itemBody}>
                                    <Text style={styles.itemTitle}>{r.motiu || tipusLabel}</Text>
                                    <Text style={styles.itemDates}>{formatRange(r.inici, r.fi)}</Text>
                                </View>
                                <View style={[styles.badge, { backgroundColor: estatCfg.bg }]}>
                                    <Text style={[styles.badgeText, { color: estatCfg.text }]}>{estatCfg.label}</Text>
                                </View>
                                {isAdmin && (
                                    <View style={styles.adminActions}>
                                        {isDeleting ? (
                                            <ActivityIndicator size="small" color={HC.red} />
                                        ) : (
                                            <>
                                                <TouchableOpacity
                                                    style={styles.actionBtn}
                                                    onPress={() => { setConfirmId(null); onEdit?.(r); }}
                                                    activeOpacity={0.7}
                                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
                                                >
                                                    <Ionicons name="pencil-outline" size={15} color={HC.textMuted} />
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[styles.actionBtn, isConfirming && styles.actionBtnActive]}
                                                    onPress={() => handleDeletePress(r.id)}
                                                    activeOpacity={0.7}
                                                    hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
                                                >
                                                    <Ionicons name="trash-outline" size={15} color={HC.red} />
                                                </TouchableOpacity>
                                            </>
                                        )}
                                    </View>
                                )}
                            </View>

                            {isConfirming && (
                                <View style={styles.confirmRow}>
                                    <Text style={styles.confirmText}>Eliminar aquesta absència?</Text>
                                    <TouchableOpacity
                                        style={styles.confirmNo}
                                        onPress={() => setConfirmId(null)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.confirmNoText}>No</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.confirmYes}
                                        onPress={() => handleConfirmDelete(r.id)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.confirmYesText}>Sí, eliminar</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    );
                })
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: HC.card,
        borderRadius: 14,
        padding: 18,
        ...cardShadow,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: HC.textPrimary,
    },
    pagination: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    arrowBtn: {
        width: 28,
        height: 28,
        borderRadius: 7,
        backgroundColor: HC.inputBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    arrowBtnDisabled: {
        opacity: 0.4,
    },
    pageIndicator: {
        fontSize: 11,
        color: HC.textMuted,
        fontWeight: '600',
        minWidth: 28,
        textAlign: 'center',
    },
    empty: {
        fontSize: 13,
        color: HC.textMuted,
        fontStyle: 'italic',
    },
    itemWrapper: {
        paddingVertical: 2,
    },
    itemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: HC.borderSoft,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: HC.inputBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemBody: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: HC.textPrimary,
    },
    itemDates: {
        fontSize: 11,
        color: HC.textMuted,
        marginTop: 1,
    },
    badge: {
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    badgeText: {
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 0.4,
    },
    adminActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        marginLeft: 4,
    },
    actionBtn: {
        padding: 6,
        borderRadius: 6,
    },
    actionBtnActive: {
        backgroundColor: HC.redLight,
    },
    confirmRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 4,
        paddingBottom: 8,
    },
    confirmText: {
        fontSize: 12,
        color: HC.textSecondary,
        flex: 1,
    },
    confirmNo: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: HC.border,
        backgroundColor: HC.white,
    },
    confirmNoText: {
        fontSize: 12,
        fontWeight: '600',
        color: HC.textPrimary,
    },
    confirmYes: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: HC.red,
    },
    confirmYesText: {
        fontSize: 12,
        fontWeight: '600',
        color: HC.white,
    },
});
