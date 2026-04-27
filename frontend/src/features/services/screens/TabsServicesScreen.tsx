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
    TouchableOpacity,
    ScrollView,
    Image,
    TextInput,
    Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

export default function Services() {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    const [loadingList, setLoadingList] = useState(false);
    const [mutating, setMutating] = useState(false);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ page: 1, pageSize: 4, total: 0, pageCount: 1 });
    const [items, setItems] = useState<Servei[]>([]);
    const [editing, setEditing] = useState<Servei | null>(null);
    const [formVisible, setFormVisible] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [deleteTarget, setDeleteTarget] = useState<Servei | null>(null);
    const [selectedItem, setSelectedItem] = useState<Servei | null>(null);

    const [inlineForm, setInlineForm] = useState({
        nom: '',
        duradaMin: 30,
        preu: 0,
        actiu: true,
        descripcio: '',
    });
    const [inlineDirty, setInlineDirty] = useState(false);

    const showDetail = !!selectedItem;

    const loadPage = async (targetPage = page) => {
        try {
            setLoadingList(true);
            const res = await getServeis(targetPage);
            setItems(res.data);
            setMeta(res.meta);
            setPage(res.meta.page);
            if (!selectedItem && res.data.length > 0) {
                setSelectedItem(res.data[0]);
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
        if (selectedItem) {
            setInlineForm({
                nom: selectedItem.nom,
                duradaMin: selectedItem.duradaMin,
                preu: selectedItem.preu,
                actiu: selectedItem.actiu,
                descripcio: selectedItem.descripcio ?? '',
            });
            setInlineDirty(false);
        }
    }, [selectedItem?.id]);

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

    const handleInlineSave = async () => {
        if (!selectedItem) return;
        try {
            setMutating(true);
            await updateServei(selectedItem.id, inlineForm);
            await loadPage(page);
            setInlineDirty(false);
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || 'No se pudo guardar');
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
            if (selectedItem?.id === deleteTarget.id) setSelectedItem(null);
            setDeleteTarget(null);
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || 'No se pudo eliminar');
        } finally {
            setMutating(false);
        }
    };

    const disablePrev = page <= 1 || loadingList || mutating;
    const disableNext = page >= meta.pageCount || loadingList || mutating;
    const keyExtractor = (item: Servei) => String(item.id);

    // ─── Tablet list item ──────────────────────────────────────────────────────
    const renderListItem = ({ item }: { item: Servei }) => {
        const isSelected = selectedItem?.id === item.id;
        return (
            <TouchableOpacity
                style={[styles.listItem, isSelected && styles.listItemSelected]}
                onPress={() => setSelectedItem(item)}
                activeOpacity={0.7}
            >
                {item.fotoUrl ? (
                    <Image source={{ uri: item.fotoUrl }} style={styles.listImage} resizeMode="cover" />
                ) : (
                    <View style={[styles.listImage, styles.listImagePlaceholder]}>
                        <Ionicons name="cut-outline" size={18} color="#CCCCCC" />
                    </View>
                )}
                <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[styles.listItemTitle, isSelected && styles.listItemTitleSelected]} numberOfLines={1}>
                        {item.nom}
                    </Text>
                    <Text style={styles.listItemSubtitle} numberOfLines={1}>
                        {item.duradaMin} min · {Number(item.preu).toFixed(2)} €
                    </Text>
                </View>
                {isSelected && <Ionicons name="chevron-forward" size={13} color="#CCCCCC" />}
            </TouchableOpacity>
        );
    };

    // ─── Mobile grid card ──────────────────────────────────────────────────────
    const renderCard = ({ item }: { item: Servei }) => (
        <ServiceCard
            service={item}
            onEdit={openEdit}
            onDelete={handleDeleteRequest}
            onPress={() => setSelectedItem(item)}
        />
    );

    // ─── Pagination row ────────────────────────────────────────────────────────
    const PaginationRow = () => (
        <View style={styles.paginationRow}>
            <TouchableOpacity
                style={[styles.pageBtn, disablePrev && styles.pageBtnDisabled]}
                onPress={() => loadPage(page - 1)}
                disabled={disablePrev}
                activeOpacity={0.7}
            >
                <Text style={styles.pageBtnText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.pageMeta}>{page} / {Math.max(meta.pageCount, 1)}</Text>
            <TouchableOpacity
                style={[styles.pageBtn, disableNext && styles.pageBtnDisabled]}
                onPress={() => loadPage(page + 1)}
                disabled={disableNext}
                activeOpacity={0.7}
            >
                <Text style={styles.pageBtnText}>→</Text>
            </TouchableOpacity>
        </View>
    );

    // ─── Detail panel (inline edit form) ──────────────────────────────────────
    const DetailPanel = () => {
        if (!selectedItem) {
            return (
                <View style={styles.detailPlaceholder}>
                    <Text style={styles.detailPlaceholderText}>
                        Selecciona un servicio para editarlo
                    </Text>
                </View>
            );
        }

        const discardChanges = () => {
            setInlineForm({
                nom: selectedItem.nom,
                duradaMin: selectedItem.duradaMin,
                preu: selectedItem.preu,
                actiu: selectedItem.actiu,
                descripcio: selectedItem.descripcio ?? '',
            });
            setInlineDirty(false);
        };

        const saveDisabled = !inlineDirty || mutating;

        return (
            <View style={styles.detailContainer}>
                {/* Image */}
                <View style={styles.detailImageWrapper}>
                    {selectedItem.fotoUrl ? (
                        <Image source={{ uri: selectedItem.fotoUrl }} style={styles.detailImage} resizeMode="cover" />
                    ) : (
                        <View style={[styles.detailImage, styles.detailImagePlaceholder]}>
                            <View style={styles.placeholderIconCircle}>
                                <Ionicons name="cut-outline" size={28} color="#CCCCCC" />
                            </View>
                        </View>
                    )}
                    <TouchableOpacity
                        style={styles.pencilButton}
                        onPress={() => { setEditing(selectedItem); setFormVisible(true); }}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="pencil-outline" size={16} color="#111111" />
                    </TouchableOpacity>
                </View>

                {/* Form */}
                <ScrollView
                    style={styles.detailScroll}
                    contentContainerStyle={styles.detailScrollContent}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    <Text style={styles.detailTitle}>{selectedItem.nom}</Text>
                    <Text style={styles.detailSubtitle}>Edita els detalls del servei directament aquí</Text>

                    {/* Nom */}
                    <Text style={styles.inlineLabel}>NOM DEL SERVEI</Text>
                    <TextInput
                        style={styles.inlineInput}
                        value={inlineForm.nom}
                        onChangeText={(v) => { setInlineForm({ ...inlineForm, nom: v }); setInlineDirty(true); }}
                        placeholder="Nom del servei"
                        placeholderTextColor="#CCCCCC"
                    />

                    {/* Preu + Durada */}
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

                    {/* Switch actiu */}
                    <View style={styles.switchRow}>
                        <Switch
                            value={inlineForm.actiu}
                            onValueChange={(v) => { setInlineForm({ ...inlineForm, actiu: v }); setInlineDirty(true); }}
                            trackColor={{ false: '#E0E0E0', true: '#111111' }}
                            thumbColor="#FFFFFF"
                        />
                        <Text style={styles.switchLabel}>Servei visible al web</Text>
                    </View>

                    {/* Descripció */}
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

                {/* Action buttons */}
                <View style={styles.actionBar}>
                    <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDeleteRequest(selectedItem)}
                        activeOpacity={0.75}
                    >
                        <Ionicons name="trash-outline" size={14} color="#E5352A" />
                        <Text style={styles.deleteBtnText}>Eliminar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.discardBtn, !inlineDirty && { opacity: 0.4 }]}
                        onPress={discardChanges}
                        disabled={!inlineDirty}
                        activeOpacity={0.75}
                    >
                        <Text style={styles.discardBtnText}>Descartar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.saveBtn, saveDisabled && { opacity: 0.4 }]}
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

    // ─── Left panel (tablet) ───────────────────────────────────────────────────
    const LeftPanel = () => (
        <View style={styles.listSection}>
            <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>SERVICIOS</Text>
                <TouchableOpacity
                    style={[styles.btnPrimary, (loadingList || mutating) && { opacity: 0.45 }]}
                    onPress={openCreate}
                    disabled={loadingList || mutating}
                    activeOpacity={0.8}
                >
                    <Text style={styles.btnPrimaryText}>+ Añadir</Text>
                </TouchableOpacity>
            </View>

            {loadingList && items.length === 0 ? (
                <View style={styles.loaderBox}>
                    <ActivityIndicator size="small" color="#111111" />
                </View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={keyExtractor}
                    renderItem={renderListItem}
                    ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        !loadingList ? (
                            <Text style={styles.emptyText}>No hay servicios aún</Text>
                        ) : null
                    }
                />
            )}

            <View style={styles.panelFooter}>
                <PaginationRow />
            </View>
        </View>
    );

    // ─── Render ────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.safe}>
            {isTablet ? (
                <View style={styles.outerPad}>
                    <View style={styles.cardLeft}>
                        <LeftPanel />
                    </View>
                    <View style={styles.cardRight}>
                        <DetailPanel />
                    </View>
                </View>
            ) : showDetail ? (
                <View style={styles.mobileDetailContainer}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => setSelectedItem(null)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="chevron-back" size={15} color="#111111" />
                        <Text style={styles.backButtonText}>Servicios</Text>
                    </TouchableOpacity>
                    <DetailPanel />
                </View>
            ) : (
                <View style={styles.mobileContainer}>
                    <View style={styles.mobileHeader}>
                        <Text style={styles.mobileTitle}>Servicios</Text>
                        <View style={styles.mobileHeaderRight}>
                            <PaginationRow />
                            <TouchableOpacity
                                style={[styles.btnPrimary, (loadingList || mutating) && { opacity: 0.45 }]}
                                onPress={openCreate}
                                disabled={loadingList || mutating}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.btnPrimaryText}>+ Añadir</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {loadingList && items.length === 0 ? (
                        <View style={styles.loaderBox}>
                            <ActivityIndicator size="large" color="#111111" />
                        </View>
                    ) : (
                        <FlatList
                            data={items}
                            keyExtractor={keyExtractor}
                            renderItem={renderCard}
                            contentContainerStyle={styles.mobileListContent}
                            ListEmptyComponent={
                                !loadingList ? (
                                    <View style={styles.emptyContainer}>
                                        <Text style={styles.emptyText}>No hay servicios aún</Text>
                                    </View>
                                ) : null
                            }
                        />
                    )}
                </View>
            )}

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

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#F2F2F2',
    },

    // ─── Tablet layout ─────────────────────────────────────────────────────────
    outerPad: {
        flex: 1,
        flexDirection: 'row',
        padding: 20,
        gap: 16,
        backgroundColor: '#F2F2F2',
    },
    cardLeft: {
        width: 280,
        flexShrink: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#EBEBEB',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        flexDirection: 'column',
    },
    cardRight: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#EBEBEB',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },

    // ─── Left panel ─────────────────────────────────────────────────────────
    listSection: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        flexDirection: 'column',
    },
    panelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#EBEBEB',
        backgroundColor: '#FAFAFA',
    },
    panelTitle: {
        fontSize: 10,
        fontWeight: '600',
        color: '#AAAAAA',
        letterSpacing: 1.4,
    },
    listContent: {
        padding: 8,
        paddingBottom: 8,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
    },
    listItemSelected: {
        backgroundColor: '#F0F0F0',
        borderLeftWidth: 3,
        borderLeftColor: '#2D5A27',
    },
    listImage: {
        width: 44,
        height: 44,
        borderRadius: 8,
    },
    listImagePlaceholder: {
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    listSeparator: {
        height: 4,
        backgroundColor: 'transparent',
    },
    listItemTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111111',
    },
    listItemTitleSelected: {
        color: '#111111',
    },
    listItemSubtitle: {
        fontSize: 12,
        color: '#888888',
    },
    panelFooter: {
        borderTopWidth: 1,
        borderTopColor: '#EBEBEB',
        backgroundColor: '#FAFAFA',
        paddingVertical: 8,
    },

    // ─── Detail panel ────────────────────────────────────────────────────────
    detailContainer: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
    },
    detailPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    detailPlaceholderText: {
        fontSize: 13,
        color: '#CCCCCC',
        textAlign: 'center',
    },
    detailImageWrapper: {
        position: 'relative',
    },
    detailImage: {
        width: '100%',
        height: 240,
        borderRadius: 0,
    },
    detailImagePlaceholder: {
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#EEEEEE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pencilButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.85)',
        alignItems: 'center',
        justifyContent: 'center',
    },
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

    // ─── Inline form ─────────────────────────────────────────────────────────
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

    // ─── Action bar ──────────────────────────────────────────────────────────
    actionBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderTopWidth: 1,
        borderTopColor: '#EBEBEB',
        padding: 16,
        backgroundColor: '#FFFFFF',
    },
    deleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        height: 42,
        paddingHorizontal: 14,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#E5352A',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
    },
    deleteBtnText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#E5352A',
    },
    discardBtn: {
        flex: 1,
        height: 42,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    discardBtnText: {
        fontSize: 13,
        color: '#888888',
    },
    saveBtn: {
        flex: 1,
        height: 42,
        borderRadius: 8,
        backgroundColor: '#2D5A27',
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    // ─── Pagination ──────────────────────────────────────────────────────────
    paginationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 4,
    },
    pageBtn: {
        width: 28,
        height: 28,
        borderRadius: 6,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pageBtnDisabled: {
        opacity: 0.35,
    },
    pageBtnText: {
        color: '#111111',
        fontSize: 14,
    },
    pageMeta: {
        fontSize: 11,
        color: '#AAAAAA',
        minWidth: 36,
        textAlign: 'center',
    },

    // ─── Add button ──────────────────────────────────────────────────────────
    btnPrimary: {
        backgroundColor: '#111111',
        borderRadius: 6,
        paddingHorizontal: 14,
        paddingVertical: 7,
    },
    btnPrimaryText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },

    // ─── Loader / empty ──────────────────────────────────────────────────────
    loaderBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 13,
        color: '#CCCCCC',
        textAlign: 'center',
        paddingVertical: 16,
    },

    // ─── Mobile layout ───────────────────────────────────────────────────────
    mobileContainer: {
        flex: 1,
        backgroundColor: '#F2F2F2',
    },
    mobileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#F2F2F2',
        borderBottomWidth: 1,
        borderBottomColor: '#EBEBEB',
    },
    mobileTitle: {
        fontSize: 20,
        fontWeight: '300',
        color: '#111111',
        letterSpacing: -0.5,
    },
    mobileHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    mobileListContent: {
        padding: 14,
        gap: 12,
    },
    mobileDetailContainer: {
        flex: 1,
        backgroundColor: '#F2F2F2',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FAFAFA',
        borderBottomWidth: 1,
        borderBottomColor: '#EBEBEB',
    },
    backButtonText: {
        color: '#111111',
        fontSize: 13,
    },
});
