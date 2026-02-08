import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    useWindowDimensions,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import ServiceCard from '@/components/services/ServiceCard';
import ServiceFormModal, { ServiceFormValues } from '@/components/services/ServiceFormModal';
import DeleteConfirmModal from '@/components/services/DeleteConfirmModal';
import { StyleSheet } from 'react-native';
import { palette, spacing } from '@/styles/theme';
import {
    createServei,
    deleteServei,
    getServeis,
    updateServei,
} from '@/services/services.service';
import type { Servei } from '@/types/servei.types';

export default function Services() {
    const { width } = useWindowDimensions();
    const isWeb = width > 900;

    const [loadingList, setLoadingList] = useState(false);
    const [mutating, setMutating] = useState(false);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ page: 1, pageSize: 4, total: 0, pageCount: 1 });
    const [items, setItems] = useState<Servei[]>([]);
    const [editing, setEditing] = useState<Servei | null>(null);
    const [formVisible, setFormVisible] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [deleteTarget, setDeleteTarget] = useState<Servei | null>(null);

    const gridColumns = isWeb ? 4 : 1; // mostramos 4 en web, scroll vertical en mobile

    const loadPage = async (targetPage = page) => {
        try {
            setLoadingList(true);
            const res = await getServeis(targetPage);
            setItems(res.data);
            setMeta(res.meta);
            setPage(res.meta.page);
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || 'No se pudieron cargar los servicios');
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        loadPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openCreate = () => {
        setFormMode('create');
        setEditing(null);
        setFormVisible(true);
    };

    const openEdit = (svc: Servei) => {
        setFormMode('edit');
        setEditing(svc);
        setFormVisible(true);
    };

    const handleSave = async (values: ServiceFormValues) => {
        try {
            setMutating(true);
            if (editing) {
                await updateServei(editing.id, values);
            } else {
                await createServei(values);
            }
            setFormVisible(false);
            setEditing(null);
            setFormMode('create');
            await loadPage(editing ? page : 1);
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || 'No se pudo guardar el servicio');
        } finally {
            setMutating(false);
        }
    };

    const handleDeleteRequest = (svc: Servei) => {
        setDeleteTarget(svc);
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
            Alert.alert('Error', err?.response?.data?.message || 'No se pudo eliminar');
        } finally {
            setMutating(false);
        }
    };

    const renderCard = ({ item }: { item: Servei }) => {
        return (
            <ServiceCard
                service={item}
                onEdit={openEdit}
                onDelete={handleDeleteRequest}
                style={{ flex: 1 / gridColumns }}
            />
        );
    };

    const disablePrev = page <= 1 || loadingList || mutating;
    const disableNext = page >= meta.pageCount || loadingList || mutating;

    const keyExtractor = (item: Servei) => String(item.id);

    return (
        <View style={styles.safe}>
            <View style={[styles.container, isWeb && styles.containerWeb]}>
                <View style={{ flex: 1 }}>
                    <View style={styles.headerRow}>
                        <Text style={styles.title}>Servicios</Text>
                        <View style={styles.paginationRow}>
                            <TouchableOpacity style={[styles.pageBtn, disablePrev && styles.pageBtnDisabled]} disabled={disablePrev} onPress={() => loadPage(page - 1)}>
                                <Text style={styles.pageBtnText}>←</Text>
                            </TouchableOpacity>
                            <Text style={styles.pageMeta}>Página {page} de {Math.max(meta.pageCount, 1)}</Text>
                            <TouchableOpacity style={[styles.pageBtn, disableNext && styles.pageBtnDisabled]} disabled={disableNext} onPress={() => loadPage(page + 1)}>
                                <Text style={styles.pageBtnText}>→</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={[styles.btnPrimary, (loadingList || mutating) && styles.btnDisabled]} onPress={openCreate} disabled={loadingList || mutating}>
                            <Text style={styles.btnPrimaryText}>Añadir servicio</Text>
                        </TouchableOpacity>
                    </View>

                    {loadingList && items.length === 0 ? (
                        <View style={styles.loaderBox}><ActivityIndicator size="large" color="#111" /></View>
                    ) : (
                        <FlatList
                            key={gridColumns}
                            data={items}
                            keyExtractor={keyExtractor}
                            renderItem={renderCard}
                            numColumns={gridColumns}
                            columnWrapperStyle={gridColumns > 1 ? styles.columnWrapper : undefined}
                            contentContainerStyle={items.length === 0 ? styles.emptyContainer : styles.listContent}
                            ListEmptyComponent={!loadingList ? <Text style={styles.emptyText}>No hay servicios aún</Text> : null}
                            style={{ flex: 1 }}
                        />
                    )}
                </View>

                <View style={[styles.employeesSection, { flex: 1 }]}>
                    <View style={styles.employeesHeader}>
                        <Text style={styles.title}>Empleados</Text>
                        <TouchableOpacity style={styles.btnPrimary}>
                            <Text style={styles.btnPrimaryText}>Añadir empleado</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.emptyText}>No hay empleados aún</Text>
                </View>

            </View>

            <ServiceFormModal
                visible={formVisible}
                initialValue={editing ? {
                    nom: editing.nom,
                    duradaMin: editing.duradaMin,
                    preu: editing.preu,
                    actiu: editing.actiu,
                } : undefined}
                onSubmit={handleSave}
                onClose={() => { setFormVisible(false); setEditing(null); }}
                loading={mutating}
                title={formMode === 'edit' ? 'Editar servicio' : 'Nuevo servicio'}
                submitLabel={formMode === 'edit' ? 'Guardar' : 'Crear'}
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
        backgroundColor: palette.background,
        paddingTop: spacing.md,
    },
    container: {
        flex: 1,
        padding: spacing.md,
        gap: spacing.sm,
    },
    containerWeb: {
        padding: spacing.lg,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: spacing.md,
        flexWrap: 'wrap',
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: palette.textPrimary,
    },
    loaderBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    columnWrapper: {
        gap: spacing.sm,
    },
    listContent: {
        gap: spacing.sm,
        paddingBottom: spacing.sm,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: palette.textMuted,
        textAlign: 'center',
    },
    paginationRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.md,
    },
    pageBtn: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 6,
        backgroundColor: palette.borderSoft,
    },
    pageBtnDisabled: {
        opacity: 0.5,
    },
    pageBtnText: {
        color: palette.textPrimary,
        fontWeight: '600',
    },
    pageMeta: {
        fontSize: 14,
        color: palette.textMuted,
        minWidth: 120,
        textAlign: 'center',
    },
    btnPrimary: {
        backgroundColor: palette.accent,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 6,
    },
    btnPrimaryText: {
        color: palette.background,
        fontWeight: '600',
        fontSize: 14,
    },
    btnDisabled: {
        opacity: 0.5,
    },
    employeesSection: {
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: palette.border,
        gap: spacing.sm,
    },
    employeesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: spacing.md,
    },
});
