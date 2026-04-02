import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC, cardShadow } from '../constants/inicio.constants';
import { useAbsenciesPendents, useUpdateEstatAbsencia } from '../hooks/useAbsenciesPendents';
import type { AbsenciaPendent, TipusAbsencia } from '../services/absencies-pendents.service';

const TIPUS_LABEL: Record<TipusAbsencia, string> = {
    VACANCES: 'Vacances',
    MALALTIA: 'Malaltia',
    PERMIS: 'Permís',
    ALTRE: 'Altre',
};

const ROWS = 4;

function formatRange(inici: string, fi: string): string {
    const fmt = (s: string) => new Date(s).toLocaleDateString('ca-ES', { day: '2-digit', month: 'short' });
    const days = Math.round((new Date(fi).getTime() - new Date(inici).getTime()) / 86_400_000) + 1;
    const start = inici.substring(0, 10);
    const end = fi.substring(0, 10);
    return start === end
        ? `${fmt(inici)} · 1 dia`
        : `${fmt(inici)} – ${fmt(fi)} · ${days}d`;
}

function Avatar({ nom, fotoPerfil }: { nom: string; fotoPerfil: string | null }) {
    if (fotoPerfil) {
        return <Image source={{ uri: fotoPerfil }} style={styles.avatar} />;
    }
    const initial = nom.trim().charAt(0).toUpperCase();
    return (
        <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitial}>{initial}</Text>
        </View>
    );
}

function AbsenciaRow({
    item,
    isLast,
    onAprovar,
    onRebutjar,
    loading,
}: {
    item: AbsenciaPendent;
    isLast: boolean;
    onAprovar: () => void;
    onRebutjar: () => void;
    loading: boolean;
}) {
    return (
        <View style={[styles.row, !isLast && styles.rowBorder]}>
            <Avatar nom={item.treballador.nom} fotoPerfil={item.treballador.Usuari.fotoPerfil} />
            <View style={styles.rowBody}>
                <Text style={styles.workerName} numberOfLines={1}>{item.treballador.nom}</Text>
                <View style={styles.rowMeta}>
                    <View style={styles.tipusBadge}>
                        <Text style={styles.tipusText}>{TIPUS_LABEL[item.tipus]}</Text>
                    </View>
                    <Text style={styles.dates}>{formatRange(item.inici, item.fi)}</Text>
                </View>
            </View>
            <View style={styles.actions}>
                {loading ? (
                    <ActivityIndicator size="small" color={HC.primary} />
                ) : (
                    <>
                        <TouchableOpacity style={styles.btnAprovar} onPress={onAprovar} activeOpacity={0.75}>
                            <Ionicons name="checkmark" size={16} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnRebutjar} onPress={onRebutjar} activeOpacity={0.75}>
                            <Ionicons name="close" size={16} color={HC.red} />
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
}

export function AbsenciesPendentsCard() {
    const [page, setPage] = useState(1);
    const { data, isLoading } = useAbsenciesPendents(page);
    const { mutate: updateEstat, variables: pendingVars, isPending } = useUpdateEstatAbsencia();

    const totalPages = data?.totalPages ?? 1;
    const items = data?.data ?? [];

    return (
        <View style={styles.card}>
            {/* Header */}
            <View style={styles.headerRow}>
                <Text style={styles.title}>Absències pendents</Text>
                {totalPages > 1 && (
                    <View style={styles.pagination}>
                        <TouchableOpacity
                            style={[styles.arrowBtn, page === 1 && styles.arrowBtnDisabled]}
                            onPress={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            <Ionicons name="chevron-back" size={15} color={page === 1 ? HC.textMuted : HC.textPrimary} />
                        </TouchableOpacity>
                        <Text style={styles.pageIndicator}>{page}/{totalPages}</Text>
                        <TouchableOpacity
                            style={[styles.arrowBtn, page === totalPages && styles.arrowBtnDisabled]}
                            onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            <Ionicons name="chevron-forward" size={15} color={page === totalPages ? HC.textMuted : HC.textPrimary} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Body */}
            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator color={HC.primary} />
                </View>
            ) : items.length === 0 ? (
                <View style={styles.center}>
                    <Ionicons name="checkmark-circle-outline" size={32} color={HC.textMuted} />
                    <Text style={styles.emptyText}>Cap absència per aprovar</Text>
                </View>
            ) : (
                items.map((item, i) => (
                    <AbsenciaRow
                        key={item.id}
                        item={item}
                        isLast={i === items.length - 1}
                        loading={isPending && pendingVars?.id === item.id}
                        onAprovar={() => updateEstat({ id: item.id, estat: 'APROVADA' })}
                        onRebutjar={() => updateEstat({ id: item.id, estat: 'REBUTJADA' })}
                    />
                ))
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: HC.white,
        borderRadius: 16,
        padding: 18,
        ...cardShadow,
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    title: {
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
        width: 26,
        height: 26,
        borderRadius: 6,
        backgroundColor: HC.inputBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    arrowBtnDisabled: {
        opacity: 0.35,
    },
    pageIndicator: {
        fontSize: 11,
        color: HC.textMuted,
        fontWeight: '600',
        minWidth: 26,
        textAlign: 'center',
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 24,
        gap: 8,
    },
    emptyText: {
        fontSize: 13,
        color: HC.textMuted,
        fontStyle: 'italic',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
    },
    rowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: HC.borderSoft,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    avatarFallback: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: HC.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        fontSize: 14,
        fontWeight: '700',
        color: HC.primary,
    },
    rowBody: {
        flex: 1,
        gap: 3,
    },
    workerName: {
        fontSize: 13,
        fontWeight: '600',
        color: HC.textPrimary,
    },
    rowMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
    },
    tipusBadge: {
        backgroundColor: HC.primaryLight,
        borderRadius: 20,
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    tipusText: {
        fontSize: 9,
        fontWeight: '700',
        color: HC.primary,
        letterSpacing: 0.3,
    },
    dates: {
        fontSize: 11,
        color: HC.textMuted,
    },
    actions: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
        minWidth: 76,
        justifyContent: 'flex-end',
    },
    btnAprovar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: HC.green,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnRebutjar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FEF2F2',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
