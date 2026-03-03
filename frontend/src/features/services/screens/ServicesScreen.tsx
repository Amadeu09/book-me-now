import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    useWindowDimensions,
    FlatList,
    TouchableOpacity,
    Alert,
    Image,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { palette, spacing } from "@/constants/theme";
import type { Servei } from "@/types/servei.types";
import { ServicesHeader } from '../components/ServicesHeader';
import { getServeis, createServei, updateServei, deleteServei } from "@/features/services/services/services.service";
import ServiceFormModal, { ServiceFormValues } from "@/features/services/components/ServiceFormModal";
import DeleteConfirmModal from "@/features/services/components/DeleteConfirmModal";

export default function Services() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    const [items, setItems] = useState<Servei[]>([]);
    const [loadingList, setLoadingList] = useState(false);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ page: 1, pageSize: 4, total: 0, pageCount: 1 });
    const [selectedService, setSelectedService] = useState<Servei | null>(null);

    // Form / Mutating State
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

    const handleEdit = (service: Servei) => {
        setFormMode('edit');
        setEditing(service);
        setFormVisible(true);
    };

    const handleDelete = (service: Servei) => {
        setDeleteTarget(service);
    };

    const handleSave = async (values: ServiceFormValues) => {
        try {
            setMutating(true);
            if (editing) {
                const updated = await updateServei(editing.id, values);
                if (selectedService?.id === updated.id) setSelectedService(updated);
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

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            setMutating(true);
            await deleteServei(deleteTarget.id);
            if (selectedService?.id === deleteTarget.id) setSelectedService(null);

            const nextPage = page > 1 && items.length === 1 ? page - 1 : page;
            await loadPage(nextPage);
            setDeleteTarget(null);
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || 'No se pudo eliminar');
        } finally {
            setMutating(false);
        }
    };

    const renderListItem = ({ item }: { item: Servei }) => {
        const isSelected = selectedService?.id === item.id;
        const imageUri = `https://picsum.photos/seed/servei-${item.id}/600/400`; // Placeholder estático determinista

        return (
            <TouchableOpacity
                style={[
                    styles.listItem,
                    isSelected && styles.listItemSelected
                ]}
                onPress={() => setSelectedService(item)}
                activeOpacity={0.7}
            >
                <Image source={{ uri: imageUri }} style={styles.listImage} resizeMode="cover" />
                <View style={styles.listItemContent}>
                    <Text style={[styles.listItemTitle, isSelected && styles.listItemTitleSelected]} numberOfLines={1}>
                        {item.nom}
                    </Text>
                    <Text style={[styles.listItemSubtitle, isSelected && styles.listItemSubtitleSelected]}>
                        {item.duradaMin} min • {Number(item.preu || 0).toFixed(2)} €
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderDetail = () => {
        if (!selectedService) {
            return (
                <View style={styles.detailPlaceholder}>
                    <Text style={styles.detailPlaceholderText}>
                        Seleccione un servicio para ver los detalles
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.detailContainer}>
                {!isTablet && (
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => setSelectedService(null)}
                    >
                        <Text style={styles.backButtonText}>← Volver a la lista</Text>
                    </TouchableOpacity>
                )}
                <View style={styles.detailImageContainer}>
                    <Image
                        source={{ uri: `https://picsum.photos/seed/servei-${selectedService.id}/600/400` }}
                        style={styles.detailImage}
                        resizeMode="cover"
                    />
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setSelectedService(null)}
                    >
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.detailContent}>
                    <Text style={styles.detailTitle}>{selectedService.nom}</Text>
                    <Text style={styles.detailInfo}>Duración: {selectedService.duradaMin} min</Text>
                    <Text style={styles.detailInfo}>Precio: {Number(selectedService.preu || 0).toFixed(2)} €</Text>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.button, styles.editButton]}
                            onPress={() => handleEdit(selectedService)}
                        >
                            <Text style={styles.buttonText}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.deleteButton]}
                            onPress={() => handleDelete(selectedService)}
                        >
                            <Text style={styles.buttonText}>Eliminar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const showList = isTablet || !selectedService;
    const showDetail = isTablet || !!selectedService;

    return (
        <View style={styles.safe}>
            <ServicesHeader />
            <View style={styles.mainContent}>
                {showList && (
                    <View style={[styles.listSection, isTablet && styles.listSectionTablet]}>
                        <View style={styles.headerRow}>


                            <TouchableOpacity
                                style={[styles.pageBtn, (page <= 1 || loadingList) && styles.pageBtnDisabled]}
                                disabled={page <= 1 || loadingList}
                                onPress={() => loadPage(page - 1)}
                            >
                                <Text style={styles.pageBtnText}>←</Text>
                            </TouchableOpacity>
                            <Text style={styles.pageMeta}>
                                Página {page} de {Math.max(meta.pageCount, 1)}
                            </Text>
                            <TouchableOpacity
                                style={[styles.pageBtn, (page >= meta.pageCount || loadingList) && styles.pageBtnDisabled]}
                                disabled={page >= meta.pageCount || loadingList}
                                onPress={() => loadPage(page + 1)}
                            >
                                <Text style={styles.pageBtnText}>→</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.btnPrimary, (loadingList || mutating) && styles.btnDisabled]}
                                onPress={openCreate}
                                disabled={loadingList || mutating}
                            >
                                <Text style={styles.btnPrimaryText}>+ Añadir servicio</Text>
                            </TouchableOpacity>
                        </View>
                        {loadingList && items.length === 0 ? (
                            <View style={styles.loaderBox}>
                                <ActivityIndicator size="large" color={palette.accent} />
                            </View>
                        ) : (
                            <>
                                <FlatList
                                    data={items}
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={renderListItem}
                                    contentContainerStyle={styles.listContent}
                                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                                    ListEmptyComponent={<Text style={styles.emptyText}>No hay servicios aún</Text>}
                                />

                            </>
                        )}
                    </View>
                )}
                {showDetail && (
                    <View style={[styles.detailSection, isTablet && styles.detailSectionTablet]}>
                        {renderDetail()}
                    </View>
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
        </View>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: palette.background,
    },
    mainContent: {
        flex: 1,
        flexDirection: 'row',
    },
    listSection: {
        flex: 1,
        backgroundColor: palette.background,
    },
    listSectionTablet: {
        width: 350,
        borderRightWidth: 1,
        borderRightColor: palette.borderSoft,
    },
    detailSection: {
        flex: 1,
        backgroundColor: palette.background,
    },
    detailSectionTablet: {
        flex: 0.65,
    },
    listContent: {
        padding: spacing.md,
    },
    listItem: {
        minHeight: 64,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    listItemSelected: {
        backgroundColor: '#e2e8f0',
    },
    listItemContent: {
        flex: 1,
        justifyContent: 'center',
    },
    listImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: spacing.md,
        backgroundColor: palette.borderSoft,
    },
    listItemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: palette.textPrimary,
        marginBottom: 4,
    },
    listItemTitleSelected: {
        color: palette.accent,
    },
    listItemSubtitle: {
        fontSize: 14,
        color: palette.textMuted,
    },
    listItemSubtitleSelected: {
        color: palette.accent,
    },
    separator: {
        height: 1,
        backgroundColor: palette.borderSoft,
        marginVertical: 4,
    },
    detailPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    detailPlaceholderText: {
        fontSize: 16,
        color: palette.textMuted,
        textAlign: 'center',
    },
    detailContainer: {
        flex: 1,
        padding: spacing.md,
    },
    backButton: {
        minHeight: 44,
        paddingHorizontal: spacing.md,
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: palette.borderSoft,
    },
    backButtonText: {
        fontSize: 16,
        color: palette.accent,
        fontWeight: '500',
    },
    detailImageContainer: {
        position: 'relative',
        width: '100%',
    },
    detailImage: {
        width: '100%',
        height: 280,
        backgroundColor: palette.borderSoft,
    },
    closeButton: {
        position: 'absolute',
        top: spacing.md,
        right: spacing.md,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    closeButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        lineHeight: 20,
    },
    detailContent: {
        padding: spacing.xl,
    },
    detailTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: palette.textPrimary,
        marginBottom: spacing.md,
    },
    detailInfo: {
        fontSize: 16,
        color: palette.textSubtle,
        marginBottom: spacing.sm,
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: spacing.xl,
        gap: spacing.md,
    },
    button: {
        flex: 1,
        minHeight: 44,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editButton: {
        backgroundColor: palette.accent,
    },
    deleteButton: {
        backgroundColor: palette.danger,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    loaderBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: palette.textMuted,
        textAlign: 'center',
        marginTop: spacing.xl,
    },
    paginationRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        borderTopWidth: 1,
        borderTopColor: palette.borderSoft,
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
    btnDisabled: {
        opacity: 0.5,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: spacing.md,
        paddingBottom: 0,
    },
    btnPrimary: {
        backgroundColor: palette.accent,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    btnPrimaryText: {
        color: palette.background,
        fontWeight: '600',
        fontSize: 14,
    },
    pageBtnText: {
        color: palette.textPrimary,
        fontWeight: '600',
    },
    pageMeta: {
        fontSize: 14,
        color: palette.textMuted,
        minWidth: 100,
        textAlign: 'center',
    },
});
