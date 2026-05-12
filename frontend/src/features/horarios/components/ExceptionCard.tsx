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
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';

/* ── Absence row item ───────────────────────── */
function AbsenciaItem({
    item, onEdit, onDelete, tipusConfig, formatDateRange,
}: { item: AbsenciaEmpresa; onEdit: () => void; onDelete: () => void; tipusConfig: Record<TipusAbsenciaEmpresa, { label: string; color: string; bg: string }>; formatDateRange: (i: string, f: string) => string }) {
    const cfg = tipusConfig[item.tipus];
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
    const theme = useTheme();
    const { t, lang } = useLanguage();
    const locale = lang === 'ca' ? 'ca-ES' : 'es-ES';

    const formatDateRange = (inici: string, fi: string): string => {
        const s = new Date(inici);
        const e = new Date(fi);
        const fmt = (d: Date) => d.toLocaleDateString(locale, { day: '2-digit', month: 'short' });
        return s.toDateString() === e.toDateString() ? fmt(s) : `${fmt(s)} – ${fmt(e)}`;
    };

    const TIPUS_CONFIG: Record<TipusAbsenciaEmpresa, { label: string; color: string; bg: string }> = {
        FESTA_LOCAL: { label: t('tipusFiestaLocal'), color: theme.primary, bg: theme.primaryLight },
        FESTA_ESTATAL: { label: t('tipusFiestaEstatal'), color: '#3B82F6', bg: '#EFF6FF' },
        PONT: { label: t('tipusPuente'), color: HC.yellow, bg: HC.yellowLight },
        ALTRE: { label: t('absAltre'), color: HC.textMuted, bg: HC.borderSoft },
    };

    const {
        data, total, page, totalPages,
        isLoading, setPage, create, update, remove,
    } = useAbsenciesEmpresa();

    const [modalVisible, setModalVisible] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<AbsenciaEmpresa | null>(null);

    const handleDelete = (item: AbsenciaEmpresa) => {
        const msg = `${t('delete')} "${item.titol}"?`;
        const execute = async () => {
            try {
                await remove(item.id);
            } catch (e: any) {
                const err = e?.response?.data?.message || t('exceptionDeleteError');
                Platform.OS === 'web' ? window.alert(err) : Alert.alert(t('error'), err);
            }
        };
        if (Platform.OS === 'web') {
            if (window.confirm(msg)) execute();
        } else {
            Alert.alert(t('delete'), msg, [
                { text: t('cancel'), style: 'cancel' },
                { text: t('delete'), style: 'destructive', onPress: execute },
            ]);
        }
    };

    return (
        <>
            {/* ── Header ── */}
            <View style={styles.panelHeader}>
                <View style={styles.panelHeaderLeft}>
                    <Text style={styles.panelTitle}>{t('exceptionTitle')}</Text>
                    {total > 0 && (
                        <View style={[styles.countBadge, { backgroundColor: theme.primaryLight }]}>
                            <Text style={[styles.countBadgeText, { color: theme.primary }]}>{total}</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* ── Content (always visible) ── */}
            <View style={styles.panelBody}>
                    {isLoading ? (
                        <ActivityIndicator color={theme.primary} style={{ marginVertical: 16 }} />
                    ) : data.length === 0 ? (
                        <Text style={styles.emptyText}>{t('exceptionEmpty')}</Text>
                    ) : (
                        <>
                            {data.map(item => (
                                <AbsenciaItem
                                    key={item.id}
                                    item={item}
                                    tipusConfig={TIPUS_CONFIG}
                                    formatDateRange={formatDateRange}
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
                        style={[styles.addBtn, { borderColor: theme.primary }]}
                        onPress={() => { setItemToEdit(null); setModalVisible(true); }}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={16} color={theme.primary} />
                        <Text style={[styles.addBtnText, { color: theme.primary }]}>{t('exceptionAdd')}</Text>
                    </TouchableOpacity>
                </View>

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
export const ExceptionSectionDesktop: React.FC = () => {
    const theme = useTheme();
    return (
        <View style={[styles.desktopContainer, { backgroundColor: theme.primaryLight, borderWidth: theme.softBorderWidth, borderColor: theme.softBorderColor }]}>
            <FestiosPanel />
        </View>
    );
};

export const ExceptionCardMobile: React.FC = () => {
    const theme = useTheme();
    return (
        <View style={[styles.mobileContainer, { backgroundColor: theme.primaryLight, borderWidth: theme.softBorderWidth, borderColor: theme.softBorderColor }]}>
            <FestiosPanel />
        </View>
    );
};

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
