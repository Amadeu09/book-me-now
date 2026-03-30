import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    ActivityIndicator, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC, cardShadow } from '../constants/horarios.constants';
import { useAbsenciesEmpresa } from '../hooks/useAbsenciesEmpresa';
import { AbsenciaEmpresaModal } from './modal/AbsenciaEmpresaModal';
import type { AbsenciaEmpresa, TipusAbsenciaEmpresa } from '../types/absencies-empresa.types';

/* ── Tipus config ──────────────────────────── */
const TIPUS_CONFIG: Record<TipusAbsenciaEmpresa, { label: string; color: string; bg: string }> = {
    FESTA_LOCAL:   { label: 'Festa Local',   color: HC.primary,    bg: HC.primaryLight },
    FESTA_ESTATAL: { label: 'Festa Estatal', color: '#3B82F6',     bg: '#EFF6FF' },
    PONT:          { label: 'Pont',          color: HC.yellow,     bg: HC.yellowLight },
    ALTRE:         { label: 'Altre',         color: HC.textMuted,  bg: HC.borderSoft },
};

function formatDateRange(inici: string, fi: string): string {
    const s = new Date(inici);
    const e = new Date(fi);
    const fmt = (d: Date) => d.toLocaleDateString('ca-ES', { day: '2-digit', month: 'short' });
    return s.toDateString() === e.toDateString() ? fmt(s) : `${fmt(s)} – ${fmt(e)}`;
}

/* ── Absence row item ───────────────────────── */
function AbsenciaItem({
    item, onEdit, onDelete,
}: { item: AbsenciaEmpresa; onEdit: () => void; onDelete: () => void }) {
    const cfg = TIPUS_CONFIG[item.tipus];
    return (
        <View style={styles.item}>
            <View style={[styles.tipusBadge, { backgroundColor: cfg.bg }]}>
                <Text style={[styles.tipusText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
            <View style={styles.itemBody}>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.titol}</Text>
                <Text style={styles.itemDate}>{formatDateRange(item.inici, item.fi)}</Text>
            </View>
            <View style={styles.itemActions}>
                <TouchableOpacity onPress={onEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="pencil-outline" size={16} color={HC.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="trash-outline" size={16} color={HC.red} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

/* ── Shared panel content ───────────────────── */
function FestiosPanel() {
    const {
        data, total, page, totalPages,
        isLoading, setPage, create, update, remove,
    } = useAbsenciesEmpresa();

    const [expanded, setExpanded] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<AbsenciaEmpresa | null>(null);

    const handleDelete = (item: AbsenciaEmpresa) => {
        const msg = `Eliminar "${item.titol}"?`;
        const execute = async () => {
            try {
                await remove(item.id);
            } catch (e: any) {
                const err = e?.response?.data?.message || 'No s\'ha pogut eliminar.';
                Platform.OS === 'web' ? window.alert(err) : Alert.alert('Error', err);
            }
        };
        if (Platform.OS === 'web') {
            if (window.confirm(msg)) execute();
        } else {
            Alert.alert('Eliminar', msg, [
                { text: 'Cancel·lar', style: 'cancel' },
                { text: 'Eliminar', style: 'destructive', onPress: execute },
            ]);
        }
    };

    return (
        <>
            {/* ── Header (always visible) ── */}
            <TouchableOpacity
                style={styles.panelHeader}
                onPress={() => setExpanded(v => !v)}
                activeOpacity={0.7}
            >
                <View style={styles.panelHeaderLeft}>
                    <Ionicons name="calendar" size={17} color={HC.red} />
                    <Text style={styles.panelTitle}>Excepcions & Festius</Text>
                    {total > 0 && (
                        <View style={styles.countBadge}>
                            <Text style={styles.countBadgeText}>{total}</Text>
                        </View>
                    )}
                </View>
                <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={HC.textMuted}
                />
            </TouchableOpacity>

            {/* ── Expanded content ── */}
            {expanded && (
                <View style={styles.panelBody}>
                    {isLoading ? (
                        <ActivityIndicator color={HC.primary} style={{ marginVertical: 16 }} />
                    ) : data.length === 0 ? (
                        <Text style={styles.emptyText}>No hi ha festius propers registrats.</Text>
                    ) : (
                        <>
                            {data.map(item => (
                                <AbsenciaItem
                                    key={item.id}
                                    item={item}
                                    onEdit={() => { setItemToEdit(item); setModalVisible(true); }}
                                    onDelete={() => handleDelete(item)}
                                />
                            ))}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <View style={styles.pagination}>
                                    <TouchableOpacity
                                        onPress={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        style={[styles.pageBtn, page === 1 && { opacity: 0.3 }]}
                                    >
                                        <Ionicons name="chevron-back" size={16} color={HC.textPrimary} />
                                    </TouchableOpacity>
                                    <Text style={styles.pageText}>{page} / {totalPages}</Text>
                                    <TouchableOpacity
                                        onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        style={[styles.pageBtn, page === totalPages && { opacity: 0.3 }]}
                                    >
                                        <Ionicons name="chevron-forward" size={16} color={HC.textPrimary} />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </>
                    )}

                    {/* Add button */}
                    <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => { setItemToEdit(null); setModalVisible(true); }}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={16} color={HC.primary} />
                        <Text style={styles.addBtnText}>Afegir absència</Text>
                    </TouchableOpacity>
                </View>
            )}

            <AbsenciaEmpresaModal
                visible={modalVisible}
                initialData={itemToEdit}
                onClose={() => setModalVisible(false)}
                onSubmit={async (dto) => {
                    if (itemToEdit) {
                        await update(itemToEdit.id, dto);
                    } else {
                        await create(dto);
                    }
                }}
            />
        </>
    );
}

/* ── Public exports (same names as before) ─── */
export const ExceptionSectionDesktop: React.FC = () => (
    <View style={styles.desktopContainer}>
        <FestiosPanel />
    </View>
);

export const ExceptionCardMobile: React.FC = () => (
    <View style={styles.mobileContainer}>
        <FestiosPanel />
    </View>
);

/* ── Styles ─────────────────────────────────── */
const styles = StyleSheet.create({
    /* Desktop wrapper */
    desktopContainer: {
        backgroundColor: HC.white,
        borderRadius: 14,
        padding: 20,
        ...cardShadow,
    },

    /* Mobile wrapper */
    mobileContainer: {
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        backgroundColor: HC.white,
        borderRadius: 14,
        padding: 16,
        ...cardShadow,
    },

    /* Panel header */
    panelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    panelHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    panelTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: HC.textPrimary,
    },
    countBadge: {
        backgroundColor: HC.primaryLight,
        borderRadius: 10,
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    countBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: HC.primary,
    },

    /* Panel body */
    panelBody: {
        marginTop: 14,
        gap: 2,
    },
    emptyText: {
        fontSize: 13,
        color: HC.textMuted,
        textAlign: 'center',
        paddingVertical: 12,
    },

    /* Absence item */
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 9,
        borderBottomWidth: 1,
        borderBottomColor: HC.borderSoft,
    },
    tipusBadge: {
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    tipusText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    itemBody: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: HC.textPrimary,
    },
    itemDate: {
        fontSize: 11,
        color: HC.textMuted,
        marginTop: 1,
    },
    itemActions: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },

    /* Pagination */
    pagination: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        paddingVertical: 10,
    },
    pageBtn: {
        padding: 4,
    },
    pageText: {
        fontSize: 13,
        fontWeight: '600',
        color: HC.textMuted,
    },

    /* Add button */
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 10,
        paddingVertical: 9,
        borderWidth: 1,
        borderColor: HC.primary,
        borderRadius: 10,
        borderStyle: 'dashed',
    },
    addBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: HC.primary,
    },
});
