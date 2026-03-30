import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC, cardShadow } from '@/features/home/constants/inicio.constants';
import type { AbsenciaTreballador, TipusAbsenciaTreballador } from '../types/vacaciones.types';

const TIPUS_CONFIG: Record<TipusAbsenciaTreballador, {
    icon: string; label: string; bg: string; text: string;
}> = {
    VACANCES: { icon: 'airplane-outline',       label: 'VACANCES',  bg: HC.statusGreenBg,   text: HC.statusGreenText },
    MALALTIA: { icon: 'medkit-outline',          label: 'MALALTIA',  bg: HC.statusYellowBg,  text: HC.statusYellowText },
    PERMIS:   { icon: 'document-text-outline',   label: 'PERMÍS',    bg: HC.primaryLight,    text: HC.primary },
    ALTRE:    { icon: 'ellipsis-horizontal-outline', label: 'ALTRE', bg: HC.borderSoft,       text: HC.textMuted },
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
    const recent = [...items]
        .sort((a, b) => new Date(b.inici).getTime() - new Date(a.inici).getTime())
        .slice(0, 5);

    return (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>Absències Recents</Text>
            </View>
            {recent.length === 0 ? (
                <Text style={styles.empty}>No hi ha absències registrades.</Text>
            ) : (
                recent.map((r, i) => {
                    const cfg = TIPUS_CONFIG[r.tipus];
                    return (
                        <View key={r.id} style={[styles.item, i < recent.length - 1 && styles.itemBorder]}>
                            <View style={styles.iconBox}>
                                <Ionicons name={cfg.icon as any} size={18} color={HC.textMuted} />
                            </View>
                            <View style={styles.itemBody}>
                                <Text style={styles.itemTitle}>{r.motiu || cfg.label}</Text>
                                <Text style={styles.itemDates}>{formatRange(r.inici, r.fi)}</Text>
                            </View>
                            <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
                                <Text style={[styles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
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
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: HC.textPrimary,
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
