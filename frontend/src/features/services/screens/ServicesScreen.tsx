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
    TextInput,
    Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

    const [inlineForm, setInlineForm] = useState({
        nom: '',
        duradaMin: 30,
        preu: 0,
        actiu: true,
        descripcio: '',
    });
    const [inlineDirty, setInlineDirty] = useState(false);

    const loadPage = async (targetPage = page) => {
        try {
            setLoadingList(true);
            const res = await getServeis(targetPage);
            setItems(res.data);
            setMeta(res.meta);
            setPage(res.meta.page);
            if (!selectedService && res.data.length > 0) {
                setSelectedService(res.data[0]);
            }
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || 'No se pudieron cargar los servicios');
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        loadPage(1);
    }, []);

    useEffect(() => {
        if (selectedService) {
            setInlineForm({
                nom: selectedService.nom,
                duradaMin: selectedService.duradaMin,
                preu: selectedService.preu,
                actiu: selectedService.actiu,
                descripcio: selectedService.descripcio ?? '',
            });
            setInlineDirty(false);
        }
    }, [selectedService?.id]);

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

    const handleInlineSave = async () => {
        if (!selectedService) return;
        try {
            setMutating(true);
            await updateServei(selectedService.id, inlineForm);
            await loadPage(page);
            setInlineDirty(false);
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || 'No se pudo guardar');
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

    const showList = isTablet || !selectedService;
    const showDetail = isTablet || !!selectedService;

    const disablePrev = page <= 1 || loadingList || mutating;
    const disableNext = page >= meta.pageCount || loadingList || mutating;

    // ─── List item ─────────────────────────────────────────────────────────────
    const renderListItem = ({ item }: { item: Servei }) => {
        const isSelected = selectedService?.id === item.id;
        return (
            <TouchableOpacity
                style={[styles.listItem, isSelected && styles.listItemSelected]}
                onPress={() => setSelectedService(item)}
                activeOpacity={0.7}
            >
                {item.fotoUrl ? (
                    <Image source={{ uri: item.fotoUrl }} style={styles.listImage} resizeMode="cover" />
                ) : (
                    <View style={[styles.listImage, styles.listImagePlaceholder]}>
                        <Ionicons name="cut-outline" size={18} color={HC.textLight} />
                    </View>
                )}
                <View style={styles.listItemContent}>
                    <Text style={[styles.listItemTitle, isSelected && styles.listItemTitleSelected]} numberOfLines={1}>
                        {item.nom}
                    </Text>
                    <Text style={styles.listItemSubtitle}>
                        {item.duradaMin} min · {Number(item.preu || 0).toFixed(2)} €
                    </Text>
                </View>
                {isSelected && <Ionicons name="chevron-forward" size={13} color={theme.primary} />}
            </TouchableOpacity>
        );
    };

    // ─── Detail panel (inline edit) ────────────────────────────────────────────
    const renderDetail = () => {
        if (!selectedService) {
            return (
                <View style={styles.detailPlaceholder}>
                    <Ionicons name="cube-outline" size={32} color={HC.textLight} />
                    <Text style={styles.detailPlaceholderText}>
                        Selecciona un servicio para editarlo
                    </Text>
                </View>
            );
        }

        const saveDisabled = !inlineDirty || mutating;

        return (
            <View style={styles.detailContainer}>
                {!isTablet && (
                    <TouchableOpacity style={styles.backButton} onPress={() => setSelectedService(null)}>
                        <Ionicons name="chevron-back" size={16} color="#2D5A27" />
                        <Text style={[styles.backButtonText, { color: '#2D5A27' }]}>Volver a la lista</Text>
                    </TouchableOpacity>
                )}

                {/* Image */}
                <View style={[styles.detailImageSquareContainer, { backgroundColor: theme.background }]}>
                    {selectedService.fotoUrl ? (
                        <Image source={{ uri: selectedService.fotoUrl }} style={styles.detailImageSquare} resizeMode="cover" />
                    ) : (
                        <View style={[styles.detailImageSquare, styles.detailImagePlaceholderFull]}>
                            <View style={styles.placeholderIconCircle}>
                                <Ionicons name="cut-outline" size={32} color="#CCCCCC" />
                            </View>
                        </View>
                    )}
                    <TouchableOpacity
                        style={styles.pencilButton}
                        onPress={() => handleEdit(selectedService)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="pencil-outline" size={16} color="#111111" />
                    </TouchableOpacity>
                </View>

                {/* Inline form */}
                <ScrollView
                    style={styles.detailScroll}
                    contentContainerStyle={styles.detailScrollContent}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    <Text style={styles.detailTitle}>{selectedService.nom}</Text>
                    <Text style={styles.detailSubtitle}>Edita els detalls del servei directament aquí</Text>

                    <Text style={styles.inlineLabel}>NOM DEL SERVEI</Text>
                    <TextInput
                        style={styles.inlineInput}
                        value={inlineForm.nom}
                        onChangeText={(v) => { setInlineForm({ ...inlineForm, nom: v }); setInlineDirty(true); }}
                        placeholder="Nom del servei"
                        placeholderTextColor="#CCCCCC"
                    />

                    <View style={styles.inlineRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.inlineLabel}>PREU (€)</Text>
                            <TextInput
                                style={styles.inlineInput}
                                value={String(inlineForm.preu)}
                                onChangeText={(v) => { setInlineForm({ ...inlineForm, preu: parseFloat(v) || 0 }); setInlineDirty(true); }}
                                keyboardType="decimal-pad"
                                placeholder="0.00"
                                placeholderTextColor="#CCCCCC"
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.inlineLabel}>DURACIÓ (MIN)</Text>
                            <TextInput
                                style={styles.inlineInput}
                                value={String(inlineForm.duradaMin)}
                                onChangeText={(v) => { setInlineForm({ ...inlineForm, duradaMin: parseInt(v, 10) || 0 }); setInlineDirty(true); }}
                                keyboardType="number-pad"
                                placeholder="30"
                                placeholderTextColor="#CCCCCC"
                            />
                        </View>
                    </View>

                    <Text style={styles.inlineLabel}>DESCRIPCIÓ</Text>
                    <TextInput
                        style={[styles.inlineInput, styles.inlineTextarea]}
                        value={inlineForm.descripcio}
                        onChangeText={(v) => { setInlineForm({ ...inlineForm, descripcio: v }); setInlineDirty(true); }}
                        multiline
                        numberOfLines={4}
                        placeholder="Descripció opcional..."
                        placeholderTextColor="#CCCCCC"
                        textAlignVertical="top"
                    />
                </ScrollView>

                {/* Action bar */}
                <View style={styles.actionBar}>
                    <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDelete(selectedService)}
                        activeOpacity={0.75}
                    >
                        <Ionicons name="trash-outline" size={14} color="#E5352A" />
                        <Text style={styles.deleteBtnText}>Eliminar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.saveBtn, saveDisabled && { opacity: 0.4 }, { backgroundColor: theme.primary }]}
                        onPress={handleInlineSave}
                        disabled={saveDisabled}
                        activeOpacity={0.75}
                    >
                        <Text style={styles.saveBtnText}>Guardar canvis</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // ─── Pagination ────────────────────────────────────────────────────────────
    const PaginationRow = () => (
        <View style={styles.paginationRow}>
            <TouchableOpacity
                style={[styles.pageBtn, disablePrev && styles.pageBtnDisabled]}
                onPress={() => loadPage(page - 1)}
                disabled={disablePrev}
                activeOpacity={0.7}
            >
                <Ionicons name="chevron-back" size={14} color={HC.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.pageMeta}>{page} / {Math.max(meta.pageCount, 1)}</Text>
            <TouchableOpacity
                style={[styles.pageBtn, disableNext && styles.pageBtnDisabled]}
                onPress={() => loadPage(page + 1)}
                disabled={disableNext}
                activeOpacity={0.7}
            >
                <Ionicons name="chevron-forward" size={14} color={HC.textPrimary} />
            </TouchableOpacity>
        </View>
    );

    // ─── Left panel ────────────────────────────────────────────────────────────
    const LeftPanel = () => (
        <>
            <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>Serveis</Text>
                <View style={styles.panelHeaderRight}>
                    <PaginationRow />
                    <TouchableOpacity
                        style={[styles.btnPrimary, (loadingList || mutating) && styles.btnDisabled]}
                        onPress={openCreate}
                        disabled={loadingList || mutating}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={14} color={HC.white} />
                        <Text style={styles.btnPrimaryText}>Añadir</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {loadingList && items.length === 0 ? (
                <View style={styles.loaderBox}>
                    <ActivityIndicator size="small" color={HC.primary} />
                </View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderListItem}
                    contentContainerStyle={styles.listContent}
                    ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
                    ListEmptyComponent={
                        !loadingList ? <Text style={styles.emptyText}>No hay servicios aún</Text> : null
                    }
                />
            )}
        </>
    );

    // ─── Render ────────────────────────────────────────────────────────────────
    return (
        <View style={styles.safe}>
            <ServicesHeader />

            {isTablet ? (
                <View style={styles.outerPad}>
                    <View style={styles.cardLeft}>
                        <LeftPanel />
                    </View>
                    <View style={styles.cardRight}>
                        {renderDetail()}
                    </View>
                </View>
            ) : (
                <View style={styles.mobileContainer}>
                    {showList && !showDetail && (
                        <>
                            <View style={styles.panelHeader}>
                                <Text style={styles.panelTitle}>Serveis</Text>
                                <View style={styles.panelHeaderRight}>
                                    <PaginationRow />
                                    <TouchableOpacity
                                        style={[styles.btnPrimary, (loadingList || mutating) && styles.btnDisabled]}
                                        onPress={openCreate}
                                        disabled={loadingList || mutating}
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons name="add" size={14} color={HC.white} />
                                        <Text style={styles.btnPrimaryText}>Añadir</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {loadingList && items.length === 0 ? (
                                <View style={styles.loaderBox}>
                                    <ActivityIndicator size="large" color={HC.primary} />
                                </View>
                            ) : (
                                <FlatList
                                    data={items}
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={renderListItem}
                                    contentContainerStyle={styles.mobileListContent}
                                    ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
                                    ListEmptyComponent={
                                        !loadingList ? <Text style={styles.emptyText}>No hay servicios aún</Text> : null
                                    }
                                />
                            )}
                        </>
                    )}

                    {showDetail && renderDetail()}
                </View>
            )}

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

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: HC.screenBg,
    },

    // ─── Tablet: dos cards flotants ────────────────────────────────────────────
    outerPad: {
        flex: 1,
        flexDirection: 'row',
        paddingHorizontal: 48,
        paddingTop: 24,
        paddingBottom: 40,
        gap: 16,
        backgroundColor: HC.screenBg,
        width: '100%',
    },
    cardLeft: {
        width: 460,
        flexShrink: 0,
        backgroundColor: HC.card,
        borderRadius: 14,
        overflow: 'hidden',
        flexDirection: 'column',
        ...cardShadow,
    },
    cardRight: {
        flex: 1,
        backgroundColor: HC.card,
        borderRadius: 14,
        overflow: 'hidden',
        ...cardShadow,
    },

    // ─── Mobile ────────────────────────────────────────────────────────────────
    mobileContainer: {
        flex: 1,
        backgroundColor: HC.screenBg,
    },
    mobileListContent: {
        padding: 16,
        gap: 4,
    },

    // ─── Panel header ──────────────────────────────────────────────────────────
    panelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        paddingVertical: 14,
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
        gap: 8,
    },

    // ─── List ──────────────────────────────────────────────────────────────────
    listContent: {
        padding: 10,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: HC.card,
    },
    listItemSelected: {
        backgroundColor: '#F0F0F0',
        borderLeftWidth: 3,
        borderLeftColor: HC.primary,
    },
    listImage: {
        width: 56,
        height: 56,
        borderRadius: 10,
    },
    listImagePlaceholder: {
        backgroundColor: HC.inputBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listItemContent: {
        flex: 1,
        gap: 2,
    },
    listItemTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: HC.textPrimary,
    },
    listItemTitleSelected: {
        color: '#111111',
    },
    listItemSubtitle: {
        fontSize: 11,
        color: HC.textMuted,
    },
    listSeparator: {
        height: 2,
        backgroundColor: 'transparent',
    },

    // ─── Detail ────────────────────────────────────────────────────────────────
    detailContainer: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: HC.card,
    },
    detailPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: 32,
    },
    detailPlaceholderText: {
        fontSize: 13,
        color: HC.textLight,
        textAlign: 'center',
    },

    // Image
    detailImageSquareContainer: {
        position: 'relative',
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 28,
        borderBottomWidth: 1,
        borderBottomColor: HC.border,
    },
    detailImageSquare: {
        width: 180,
        height: 180,
        borderRadius: 14,
    },
    detailImagePlaceholderFull: {
        backgroundColor: '#EEEEEE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#E0E0E0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pencilButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.90)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },

    // Inline form
    detailScroll: {
        flex: 1,
    },
    detailScrollContent: {
        paddingHorizontal: 28,
        paddingVertical: 24,
    },
    detailTitle: {
        fontSize: 21,
        fontWeight: '300',
        color: '#111111',
        letterSpacing: -0.3,
        marginBottom: 4,
    },
    detailSubtitle: {
        fontSize: 13,
        color: '#888888',
        marginBottom: 24,
        lineHeight: 20,
    },
    inlineLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: '#AAAAAA',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: 6,
        marginTop: 16,
    },
    inlineInput: {
        backgroundColor: '#F7F7F8',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        paddingHorizontal: 14,
        paddingVertical: 11,
        fontSize: 14,
        color: '#111111',
    },
    inlineTextarea: {
        minHeight: 96,
        paddingTop: 11,
    },
    inlineRow: {
        flexDirection: 'row',
        gap: 12,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 16,
        marginBottom: 4,
    },
    switchLabel: {
        fontSize: 13,
        color: '#555555',
    },

    // Action bar
    actionBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderTopWidth: 1,
        borderTopColor: HC.border,
        padding: 16,
        backgroundColor: HC.card,
    },
    deleteBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        height: 42,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#E5352A',
        backgroundColor: HC.card,
        justifyContent: 'center',
    },
    deleteBtnText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#E5352A',
    },
    saveBtn: {
        flex: 1,
        height: 42,
        borderRadius: 8,
        backgroundColor: HC.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    // ─── Back button (mobile) ──────────────────────────────────────────────────
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: HC.screenBg,
        borderBottomWidth: 1,
        borderBottomColor: HC.border,
    },
    backButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },

    // ─── Pagination ────────────────────────────────────────────────────────────
    paginationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    pageBtn: {
        width: 28,
        height: 28,
        borderRadius: 7,
        backgroundColor: HC.inputBg,
        borderWidth: 1,
        borderColor: HC.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pageBtnDisabled: {
        opacity: 0.35,
    },
    pageMeta: {
        fontSize: 11,
        color: HC.textMuted,
        fontWeight: '600',
        minWidth: 28,
        textAlign: 'center',
    },
    btnPrimary: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: HC.primary,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 7,
    },
    btnPrimaryText: {
        color: HC.white,
        fontSize: 12,
        fontWeight: '600',
    },
    btnDisabled: {
        opacity: 0.45,
    },

    // ─── Misc ──────────────────────────────────────────────────────────────────
    loaderBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 13,
        color: HC.textMuted,
        textAlign: 'center',
        fontStyle: 'italic',
        paddingVertical: 20,
    },
});
