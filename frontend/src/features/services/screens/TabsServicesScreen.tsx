import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    useWindowDimensions,
    FlatList,
    ActivityIndicator,
    Alert,
    StyleSheet,
} from 'react-native';
import ServiceCard from "@/features/services/components/ServiceCard";
import ServiceFormModal, { ServiceFormValues } from "@/features/services/components/ServiceFormModal";
import DeleteConfirmModal from "@/features/services/components/DeleteConfirmModal";
import {
    createServei,
    deleteServei,
    getServeis,
    updateServei,
} from "@/features/services/services/services.service";
import type { Servei } from "@/types/servei.types";
import { Button } from '@/ui/components/common';
import { palette, spacing, radius } from "@/constants/theme";

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

    const gridColumns = isWeb ? 4 : 1;

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

    const styles = StyleSheet.create({
        safe: {
            flex: 1,
            backgroundColor: palette.background,
        },
        container: {
            flex: 1,
            padding: spacing.lg,
            gap: spacing.lg,
        },
        containerWeb: {
            padding: spacing.gutter,
        },
        headerRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: spacing.md,
        },
        title: {
            fontSize: 24,
            fontWeight: '800',
            color: palette.textPrimary,
        },
        loaderBox: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        columnWrapper: {
            gap: spacing.md,
        },
        listContent: {
            gap: spacing.md,
            paddingBottom: spacing.lg,
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
            paddingVertical: spacing.md,
        },
        pageMeta: {
            fontSize: 14,
            color: palette.textMuted,
            minWidth: 120,
            textAlign: 'center',
        },
    });

    return (
        <SafeAreaView style={styles.safe}>
            <View style={[styles.container, isWeb && styles.containerWeb]}>
                <View style={styles.headerRow}>
                    <Text style={styles.title}>Servicios</Text>
                    <View style={styles.paginationRow}>
                        <Button
                            label="←"
                            onPress={() => loadPage(page - 1)}
                            disabled={disablePrev}
                            variant="ghost"
                        />
                        <Text style={styles.pageMeta}>Página {page} de {Math.max(meta.pageCount, 1)}</Text>
                        <Button
                            label="→"
                            onPress={() => loadPage(page + 1)}
                            disabled={disableNext}
                            variant="ghost"
                        />
                    </View>
                    <Button
                        label="Añadir servicio"
                        onPress={openCreate}
                        disabled={loadingList || mutating}
                    />
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
                    />
                )}


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
        </SafeAreaView>
    );
}
