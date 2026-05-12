import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
    const start = new Date(inici);
    const end = new Date(fi);
    const days = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
    return `${fmt(inici)} – ${fmt(fi)} · ${days}d`;
}

type Props = { items: AbsenciaTreballador[] };

export function SolicitudesRecientes({ items }: Props) {
    const [page, setPage] = useState(0);
    const theme = useTheme();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = [...items]
        .filter(a => new Date(a.inici) >= today)
        .sort((a, b) => new Date(a.inici).getTime() - new Date(b.inici).getTime());

    const totalPages = Math.max(1, Math.ceil(upcoming.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages - 1);
    const pageItems = upcoming.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

    return (
        <View style={[styles.card, { backgroundColor: theme.primaryLight, borderWidth: theme.softBorderWidth, borderColor: theme.softBorderColor }]}>
            <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>Pròximes Absències</Text>
                {upcoming.length > PAGE_SIZE && (
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
            {upcoming.length === 0 ? (
                <Text style={styles.empty}>No hi ha absències pròximes.</Text>
            ) : (
                pageItems.map((r, i) => {
                    const icon = TIPUS_ICON[r.tipus];
                    const tipusLabel = TIPUS_LABEL[r.tipus];
                    const estatCfg = ESTAT_CONFIG[r.estat] ?? ESTAT_CONFIG.PENDENT;
                    return (
                        <View key={r.id} style={[styles.item, i < pageItems.length - 1 && styles.itemBorder]}>
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
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 10,
    },
    itemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: HC.borderSoft,
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
});
