import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Alert,
    StyleSheet,
    ActivityIndicator,
    useWindowDimensions,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';
import type { Servei } from "@/types/servei.types";
import { ServicesHeader } from '../components/ServicesHeader';
import ServiceCard from '../components/ServiceCard';
import { getServeis, createServei, updateServei, deleteServei, uploadFotoServei } from "@/features/services/services/services.service";
import ServiceFormModal, { ServiceFormValues } from "@/features/services/components/ServiceFormModal";
import DeleteConfirmModal from "@/features/services/components/DeleteConfirmModal";

const PADDING = 20;
const GAP = 16;

export default function Services() {
    const { width } = useWindowDimensions();
    const theme = useTheme();
    const { t } = useLanguage();

    const [items, setItems] = useState<Servei[]>([]);
    const [loadingList, setLoadingList] = useState(false);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ page: 1, pageSize: 4, total: 0, pageCount: 1 });
    const [mutating, setMutating] = useState(false);
    const [formVisible, setFormVisible] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [editing, setEditing] = useState<Servei | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Servei | null>(null);

    const loadPage = async (targetPage = page) => {
        try {
            setLoadingList(true);
            const res = await getServeis(targetPage);
            setItems(res.data);
            setMeta(res.meta);
            setPage(res.meta.page);
        } catch (err: any) {
            Alert.alert(t('error'), err?.response?.data?.message || t('servLoadError'));
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        loadPage(1);
    }, []);

    const _isFirstFocus = useRef(true);
    useFocusEffect(useCallback(() => {
        if (_isFirstFocus.current) { _isFirstFocus.current = false; return; }
        loadPage(1);
    }, []));

    const openCreate = () => {
        setFormMode('create');
        setEditing(null);
        setFormVisible(true);
    };

    const handleEdit = (service: Servei) => {
        setFormMode('edit');
        setEditing(service);
        setFormVisible(true);
    };

    const handleDelete = (service: Servei) => {
        setDeleteTarget(service);
    };

    const handleSave = async (values: ServiceFormValues, photoUri?: string) => {
        try {
            setMutating(true);
            if (editing) {
                await updateServei(editing.id, values);
                if (photoUri) await uploadFotoServei(editing.id, photoUri);
            } else {
                const created = await createServei(values);
                if (photoUri) await uploadFotoServei(created.id, photoUri);
            }
            setFormVisible(false);
            setEditing(null);
            setFormMode('create');
            await loadPage(editing ? page : 1);
        } catch (err: any) {
            Alert.alert(t('error'), err?.response?.data?.message || t('servSaveError'));
        } finally {
            setMutating(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            setMutating(true);
            await deleteServei(deleteTarget.id);
            const nextPage = page > 1 && items.length === 1 ? page - 1 : page;
            await loadPage(nextPage);
            setDeleteTarget(null);
        } catch (err: any) {
            Alert.alert(t('error'), err?.response?.data?.message || t('servDeleteError'));
        } finally {
            setMutating(false);
        }
    };

    // Responsive grid layout
    const isDesktop = Platform.OS === 'web' && width >= 1024;
    const availableWidth = width - (isDesktop ? 240 : 0);
    const cols = availableWidth < 500 ? 1 : availableWidth <= 900 ? 2 : 3;
    const cardWidth = Math.min(280, (availableWidth - PADDING * 2 - GAP * (cols - 1)) / cols);

    const disablePrev = page <= 1 || loadingList || mutating;
    const disableNext = page >= meta.pageCount || loadingList || mutating;

    const renderCard = ({ item }: { item: Servei }) => (
        <ServiceCard
            service={item}
            onPress={handleEdit}
            style={{ width: cardWidth }}
        />
    );

    const PaginationRow = () => (
        <View style={styles.paginationRow}>
            <TouchableOpacity
                style={[styles.pageBtn, disablePrev && styles.pageBtnDisabled]}
                onPress={() => loadPage(page - 1)}
                disabled={disablePrev}
            >
                <Ionicons name="chevron-back" size={14} color="#0f172a" />
            </TouchableOpacity>
            <Text style={styles.pageMeta}>{page} / {Math.max(meta.pageCount, 1)}</Text>
            <TouchableOpacity
                style={[styles.pageBtn, disableNext && styles.pageBtnDisabled]}
                onPress={() => loadPage(page + 1)}
                disabled={disableNext}
            >
                <Ionicons name="chevron-forward" size={14} color="#0f172a" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.safe, { backgroundColor: theme.background }]}>
            <ServicesHeader onNew={openCreate} loading={loadingList || mutating} />

            {loadingList && items.length === 0 ? (
                <View style={styles.loaderBox}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    key={String(cols)}
                    data={items}
                    numColumns={cols}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderCard}
                    contentContainerStyle={styles.gridContent}
                    columnWrapperStyle={cols > 1 ? styles.columnWrapper : undefined}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <Text style={styles.sectionTitle}>Els teus serveis</Text>
                    }
                    ListEmptyComponent={
                        !loadingList ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="cube-outline" size={48} color="#94a3b8" />
                                <Text style={styles.emptyText}>{t('servEmpty')}</Text>
                            </View>
                        ) : null
                    }
                    ListFooterComponent={meta.pageCount > 1 ? <PaginationRow /> : null}
                />
            )}

            <ServiceFormModal
                visible={formVisible}
                initialValue={editing ? {
                    nom: editing.nom,
                    duradaMin: editing.duradaMin,
                    preu: editing.preu,
                    actiu: editing.actiu,
                    descripcio: editing.descripcio ?? '',
                    categoria: editing.categoria ?? 'ALTRES',
                } : undefined}
                initialFotoUrl={editing?.fotoUrl}
                onSubmit={handleSave}
                onClose={() => { setFormVisible(false); setEditing(null); }}
                onDelete={editing ? () => {
                    const target = editing;
                    setFormVisible(false);
                    setEditing(null);
                    setDeleteTarget(target);
                } : undefined}
                loading={mutating}
                title={formMode === 'edit' ? t('servEditTitle') : t('servNewTitle')}
                submitLabel={formMode === 'edit' ? t('save') : t('create')}
            />

            <DeleteConfirmModal
                visible={!!deleteTarget}
                service={deleteTarget}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
                loading={mutating}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
    loaderBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gridContent: {
        padding: PADDING,
        paddingBottom: 40,
        gap: GAP,
    },
    columnWrapper: {
        gap: GAP,
        justifyContent: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: 16,
        marginTop: 4,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 14,
        color: '#94a3b8',
        fontStyle: 'italic',
    },
    paginationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 8,
        paddingVertical: 8,
    },
    pageBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pageBtnDisabled: {
        opacity: 0.35,
    },
    pageMeta: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '600',
        minWidth: 40,
        textAlign: 'center',
    },
});
