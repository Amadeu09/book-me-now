import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    useWindowDimensions,
    FlatList,
    ScrollView,
    TouchableOpacity,
    Alert,
    Image,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radius } from "@/constants/theme";
import { HC, cardShadow } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import type { Servei } from "@/types/servei.types";
import { ServicesHeader } from '../components/ServicesHeader';
import { getServeis, createServei, updateServei, deleteServei, uploadFotoServei } from "@/features/services/services/services.service";
import ServiceFormModal, { ServiceFormValues } from "@/features/services/components/ServiceFormModal";
import DeleteConfirmModal from "@/features/services/components/DeleteConfirmModal";

export default function Services() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;
    const theme = useTheme();

    const [items, setItems] = useState<Servei[]>([]);
    const [loadingList, setLoadingList] = useState(false);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ page: 1, pageSize: 4, total: 0, pageCount: 1 });
    const [selectedService, setSelectedService] = useState<Servei | null>(null);

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

    const handleSave = async (values: ServiceFormValues, photoUri?: string) => {
        try {
            setMutating(true);
            if (editing) {
                let updated = await updateServei(editing.id, values);
                if (photoUri) updated = await uploadFotoServei(editing.id, photoUri);
                if (selectedService?.id === updated.id) setSelectedService(updated);
            } else {
                const created = await createServei(values);
                if (photoUri) await uploadFotoServei(created.id, photoUri);
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
        return (
            <TouchableOpacity
                style={[
                    styles.listItem,
                    isSelected && { backgroundColor: theme.primaryLight },
                ]}
                onPress={() => setSelectedService(item)}
                activeOpacity={0.7}
            >
                {item.fotoUrl ? (
                    <Image source={{ uri: item.fotoUrl }} style={styles.listImage} resizeMode="cover" />
                ) : (
                    <View style={[styles.listImage, styles.listImagePlaceholder, { backgroundColor: theme.primaryMid }]}>
                        <Ionicons name="cut-outline" size={20} color={theme.primary} />
                    </View>
                )}
                <View style={styles.listItemContent}>
                    <Text
                        style={[styles.listItemTitle, isSelected && { color: theme.primary }]}
                        numberOfLines={1}
                    >
                        {item.nom}
                    </Text>
                    <Text style={[styles.listItemSubtitle, isSelected && { color: theme.primary + 'aa' }]}>
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
                        Selecciona un servicio para ver los detalles
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.detailContainer}>
                {/* Botó "Volver" fora del scroll, fix al top */}
                {!isTablet && (
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => setSelectedService(null)}
                    >
                        <Text style={[styles.backButtonText, { color: theme.primary }]}>← Volver a la lista</Text>
                    </TouchableOpacity>
                )}

                {/* Contingut scrollable: imatge + info */}
                <ScrollView
                    style={styles.detailScroll}
                    contentContainerStyle={styles.detailScrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Imatge amb botó X */}
                    <View style={styles.detailImageContainer}>
                        {selectedService.fotoUrl ? (
                            <Image
                                source={{ uri: selectedService.fotoUrl }}
                                style={styles.detailImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={[styles.detailImage, styles.detailImagePlaceholder]}>
                                <View style={[styles.detailPlaceholderIcon, { backgroundColor: theme.primaryMid }]}>
                                    <Ionicons name="cut-outline" size={40} color={theme.primary} />
                                </View>
                            </View>
                        )}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setSelectedService(null)}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Info */}
                    <View style={styles.detailContent}>
                        <Text style={styles.detailTitle}>{selectedService.nom}</Text>
                        <Text style={styles.detailInfo}>Duración: {selectedService.duradaMin} min</Text>
                        <Text style={styles.detailInfo}>Precio: {Number(selectedService.preu || 0).toFixed(2)} €</Text>
                        {selectedService.descripcio ? (
                            <View style={styles.descripcioBox}>
                                <Text style={styles.descripcioLabel}>Descripción</Text>
                                <Text style={styles.descripcioText}>{selectedService.descripcio}</Text>
                            </View>
                        ) : null}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.button, styles.editButton, { backgroundColor: theme.primary }]}
                                onPress={() => handleEdit(selectedService)}
                            >
                                <Text style={[styles.buttonText, { color: theme.textOnPrimary }]}>Editar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.deleteButton]}
                                onPress={() => handleDelete(selectedService)}
                            >
                                <Text style={styles.buttonText}>Eliminar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    };

    const showList = isTablet || !selectedService;
    const showDetail = isTablet || !!selectedService;

    return (
        <View style={[styles.safe, { backgroundColor: theme.background }]}>
            <ServicesHeader />

            {/* Àrea principal: padding per tots costats → el card flota */}
            <View style={styles.outerPad}>
                <View style={[styles.card, { flexDirection: isTablet ? 'row' : 'column' }]}>

                    {/* ── Panell esquerre: llista ── */}
                    {showList && (
                        <View style={[
                            styles.listSection,
                            isTablet ? styles.listSectionTablet : { flex: 1 },
                        ]}>
                            {/* Capçalera del panell */}
                            <View style={[styles.panelHeader, { borderBottomColor: HC.border + '55' }]}>
                                <Text style={styles.panelTitle}>Llista de serveis</Text>
                                <View style={styles.panelHeaderRight}>
                                    <TouchableOpacity
                                        style={[styles.pageBtn, (page <= 1 || loadingList) && styles.pageBtnDisabled]}
                                        disabled={page <= 1 || loadingList}
                                        onPress={() => loadPage(page - 1)}
                                    >
                                        <Text style={styles.pageBtnText}>‹</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.pageMeta}>{page}/{Math.max(meta.pageCount, 1)}</Text>
                                    <TouchableOpacity
                                        style={[styles.pageBtn, (page >= meta.pageCount || loadingList) && styles.pageBtnDisabled]}
                                        disabled={page >= meta.pageCount || loadingList}
                                        onPress={() => loadPage(page + 1)}
                                    >
                                        <Text style={styles.pageBtnText}>›</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.btnPrimary,
                                            { backgroundColor: theme.primary },
                                            (loadingList || mutating) && styles.btnDisabled,
                                        ]}
                                        onPress={openCreate}
                                        disabled={loadingList || mutating}
                                    >
                                        <Text style={[styles.btnPrimaryText, { color: theme.textOnPrimary }]}>+ Añadir</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {loadingList && items.length === 0 ? (
                                <View style={styles.loaderBox}>
                                    <ActivityIndicator size="large" color={theme.primary} />
                                </View>
                            ) : (
                                <FlatList
                                    data={items}
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={renderListItem}
                                    contentContainerStyle={styles.listContent}
                                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                                    ListEmptyComponent={<Text style={styles.emptyText}>No hay servicios aún</Text>}
                                />
                            )}
                        </View>
                    )}

                    {/* ── Línia divisòria vertical (tablet) ── */}
                    {isTablet && showList && showDetail && (
                        <View style={[styles.divider, { backgroundColor: HC.border + '44' }]} />
                    )}

                    {/* ── Panell dret: detall ── */}
                    {showDetail && (
                        <View style={styles.detailSection}>
                            {renderDetail()}
                        </View>
                    )}
                </View>
            </View>

            <ServiceFormModal
                visible={formVisible}
                initialValue={editing ? {
                    nom: editing.nom,
                    duradaMin: editing.duradaMin,
                    preu: editing.preu,
                    actiu: editing.actiu,
                    descripcio: editing.descripcio ?? '',
                } : undefined}
                initialFotoUrl={editing?.fotoUrl}
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

const PANEL_GAP = 20;

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },

    // Padding exterior que fa "flotar" el card
    outerPad: {
        flex: 1,
        padding: PANEL_GAP,
        maxWidth: 1400,
        minWidth: 1400,
        paddingTop: 60,
        alignContent: 'center',
        alignSelf: 'center',
    },

    // El card principal flotant (llista + detall)
    card: {
        flex: 1,
        backgroundColor: HC.card,
        borderRadius: 18,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
    },

    // ── Panell esquerre (llista) ──
    // flex: 1 s'aplica en mobile via style inline; en tablet s'usa width fix
    listSection: {
        backgroundColor: HC.screenBg,
    },
    listSectionTablet: {
        width: 300,
        flexShrink: 0,
        flexGrow: 0,
    },

    panelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md + 2,
        borderBottomWidth: 1,
        borderBottomColor: HC.border,
        backgroundColor: HC.screenBg,
    },
    panelTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: HC.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    panelHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },

    listContent: {
        padding: spacing.md,
        paddingBottom: spacing.xxl,
    },
    listItem: {
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: HC.card,
    },
    listItemContent: {
        flex: 1,
        justifyContent: 'center',
    },
    listImage: {
        width: 48,
        height: 48,
        borderRadius: radius.md,
        marginRight: spacing.md,
        backgroundColor: HC.borderSoft,
    },
    listImagePlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    listItemTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: HC.textPrimary,
        marginBottom: 2,
    },
    listItemSubtitle: {
        fontSize: 12,
        color: HC.textMuted,
    },
    separator: {
        height: 6,
        backgroundColor: 'transparent',
    },

    // ── Línia divisòria vertical ──
    divider: {
        width: 1,
        backgroundColor: HC.border,
    },

    // ── Panell dret (detall) ──
    detailSection: {
        flex: 1,
        minWidth: 0,           // crític en web: evita que el flex item desbordï
        overflow: 'hidden',    // clipa el contingut al límit del panell
        backgroundColor: HC.card,
    },
    detailPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    detailPlaceholderText: {
        fontSize: 14,
        color: HC.textMuted,
        textAlign: 'center',
    },
    detailContainer: {
        flex: 1,
        overflow: 'hidden',
    },
    detailScroll: {
        flex: 1,
    },
    detailScrollContent: {
        flexGrow: 1,
    },
    backButton: {
        minHeight: 44,
        paddingHorizontal: spacing.lg,
        justifyContent: 'center',
        backgroundColor: HC.screenBg,
        borderBottomWidth: 1,
        borderBottomColor: HC.border + '44',
    },
    backButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    detailImageContainer: {
        position: 'relative',
        width: '100%',
    },
    detailImage: {
        width: '100%',
        height: 240,
        backgroundColor: HC.borderSoft,
    },
    detailImagePlaceholder: {
        backgroundColor: HC.borderSoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailPlaceholderIcon: {
        width: 80,
        height: 80,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: spacing.md,
        right: spacing.md,
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: 'rgba(0,0,0,0.38)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    closeButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        lineHeight: 18,
    },
    detailContent: {
        padding: spacing.xl,
    },
    detailTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: HC.textPrimary,
        marginBottom: spacing.md,
    },
    detailInfo: {
        fontSize: 14,
        color: HC.textMuted,
        marginBottom: spacing.sm,
    },
    descripcioBox: {
        marginTop: spacing.md,
        padding: spacing.md,
        backgroundColor: HC.screenBg,
        borderRadius: radius.md,
    },
    descripcioLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: HC.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    descripcioText: {
        fontSize: 14,
        color: HC.textSecondary,
        lineHeight: 20,
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: spacing.xl,
        gap: spacing.md,
    },
    button: {
        flex: 1,
        minHeight: 42,
        borderRadius: radius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editButton: {
        backgroundColor: HC.primary,
    },
    deleteButton: {
        backgroundColor: HC.red,
    },
    buttonText: {
        color: HC.white,
        fontSize: 14,
        fontWeight: '600',
    },

    // ── Controls ──
    loaderBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: HC.textMuted,
        textAlign: 'center',
        marginTop: spacing.xl,
    },
    pageBtn: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: HC.card,
        borderWidth: 1,
        borderColor: HC.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pageBtnDisabled: {
        opacity: 0.35,
    },
    btnDisabled: {
        opacity: 0.5,
    },
    btnPrimary: {
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: radius.md,
    },
    btnPrimaryText: {
        fontWeight: '600',
        fontSize: 12,
    },
    pageBtnText: {
        color: HC.textPrimary,
        fontWeight: '700',
        fontSize: 16,
        lineHeight: 18,
    },
    pageMeta: {
        fontSize: 11,
        color: HC.textMuted,
        minWidth: 28,
        textAlign: 'center',
    },
});
