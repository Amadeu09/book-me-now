import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    useWindowDimensions,
    TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC, cardShadow } from '../../constants/horarios.constants';
import { RotationTabs } from './RotationTabs';

// Hooks & Services
import { useCreateUsuari, useCreateTreballador } from '../../hooks/useTreballadors';
import { updateTreballador } from '../../services/treballadors.service';
import { useAllServices } from '../../../services/hooks/useServices';
import { getJornades } from '../../services/jornades.service';

interface CreateTrabajadorModalProps {
    visible: boolean;
    initialData?: any; // The worker data from EmployeeShiftCard
    onClose: () => void;
    onSuccess?: () => void;
}

export const CreateTrabajadorModal: React.FC<CreateTrabajadorModalProps> = ({
    visible,
    initialData,
    onClose,
    onSuccess,
}) => {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;

    // Tabs
    const [activeTab, setActiveTab] = useState(0);
    const tabs = [
        { index: 0, nom: 'Usuari' },
        { index: 1, nom: 'Serveis' },
        { index: 2, nom: 'Jornada' },
    ];

    // Form State - Usuari
    const [email, setEmail] = useState('');
    const [nom, setNom] = useState('');
    const [password, setPassword] = useState('');
    const [usuariError, setUsuariError] = useState('');

    // Form State - Serveis
    const [serveisIds, setServeisIds] = useState<number[]>([]);

    // Form State - Jornada
    const [plantillaJornadaId, setPlantillaJornadaId] = useState<number | null>(null);
    const [dataInici, setDataInici] = useState('');
    const [dataFi, setDataFi] = useState('');

    // Mutations
    const { mutateAsync: createUsuari, isPending: isCreatingUsuari } = useCreateUsuari();
    const { mutateAsync: createTreballador, isPending: isCreatingTreballador } = useCreateTreballador();
    const [isUpdating, setIsUpdating] = useState(false);
    const isSubmitting = isCreatingUsuari || isCreatingTreballador || isUpdating;

    // Queries
    const { data: serveisData, isLoading: isLoadingServeis } = useAllServices();
    const serveisList = serveisData?.data || [];

    const [jornadesData, setJornadesData] = useState<any[]>([]);
    const [isLoadingJornades, setIsLoadingJornades] = useState(true);

    useEffect(() => {
        getJornades().then(res => {
            setJornadesData(Array.isArray(res) ? res : (res.data || []));
            setIsLoadingJornades(false);
        }).catch(err => {
            console.error('Error fetching jornades:', err);
            setIsLoadingJornades(false);
        });
    }, []);
    const jornadesList = jornadesData || [];

    // Pre-fill form if editing
    useEffect(() => {
        if (visible) {
            if (initialData) {
                setNom(initialData.nom || '');
                setEmail(initialData.usuari?.email || '');
                setPassword(''); // Don't pre-fill password, handled separately or hidden in edit
                
                // Pre-fill services
                if (initialData.serveis && Array.isArray(initialData.serveis)) {
                    setServeisIds(initialData.serveis.map((ts: any) => ts.serveiId));
                }
                
                // Pre-fill templates (just the active one)
                if (initialData.jornadesPlantillaAssignacions && initialData.jornadesPlantillaAssignacions.length > 0) {
                    const activeAssig = initialData.jornadesPlantillaAssignacions[0];
                    setPlantillaJornadaId(activeAssig.plantillaJornadaId);
                    // Extract YYYY-MM-DD
                    setDataInici(activeAssig.dataInici ? new Date(activeAssig.dataInici).toISOString().split('T')[0] : '');
                    setDataFi(activeAssig.dataFi ? new Date(activeAssig.dataFi).toISOString().split('T')[0] : '');
                }
            } else {
                resetForm();
            }
        }
    }, [visible, initialData]);

    /* ── Handlers ─────────────────────── */
    const handleClose = () => {
        if (isSubmitting) return;
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setActiveTab(0);
        setEmail('');
        setNom('');
        setPassword('');
        setUsuariError('');
        setServeisIds([]);
        setPlantillaJornadaId(null);
        setDataInici('');
        setDataFi('');
    };

    const toggleService = (id: number) => {
        setServeisIds((prev) =>
            prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        setUsuariError('');
        
        // 1. Validate mandatory fields
        if (initialData) {
            // Edit mode: password is not mandatory, email is not updatable via this API currently
            if (!nom.trim()) {
                setUsuariError('El nombre es obligatorio.');
                setActiveTab(0);
                return;
            }
        } else {
            // Create mode
            if (!email.trim() || !nom.trim() || !password.trim()) {
                setUsuariError('Email, nombre y contraseña son obligatorios.');
                setActiveTab(0);
                return;
            }
        }

        try {
            if (initialData) {
                setIsUpdating(true);
                // 2a. Update Treballador
                const updatePayload: any = {
                    nom: nom.trim(),
                    serveisIds: serveisIds,
                };
                
                if (plantillaJornadaId && dataInici) {
                     updatePayload.jornadaTreballador = {
                         plantillaJornadaId,
                         dataInici: new Date(dataInici).toISOString(),
                         // dataFi is optional
                     };
                     if (dataFi) {
                         updatePayload.jornadaTreballador.dataFi = new Date(dataFi).toISOString();
                     }
                }
                
                await updateTreballador(initialData.id, updatePayload);
                setIsUpdating(false);
            } else {
                // 2b. Create User
                const usuariRes = await createUsuari({
                    email: email.trim(),
                    nom: nom.trim(),
                    password: password.trim(),
                });

                // 3. Create Treballador
                const treballadorPayload: any = {
                    nom: nom.trim(),
                    idUsuari: usuariRes.id,
                };

                if (serveisIds.length > 0) {
                    treballadorPayload.serveisIds = serveisIds;
                }

                if (plantillaJornadaId && dataInici) {
                    treballadorPayload.jornadaTreballador = {
                        plantillaJornadaId,
                        dataInici: new Date(dataInici).toISOString(),
                    };
                    if (dataFi) {
                        treballadorPayload.jornadaTreballador.dataFi = new Date(dataFi).toISOString();
                    }
                }

                await createTreballador(treballadorPayload);
            }

            // 4. Success handling
            resetForm();
            onSuccess?.();
            onClose();

        } catch (error: any) {
            console.error('Error creating worker:', error);
            const msg = error?.response?.data?.message || error.message || 'Error al guardar el trabajador.';
            setUsuariError(Array.isArray(msg) ? msg.join(', ') : msg);
        }
    };

    /* ── Render Tabs ───────────────────────── */
    const renderUsuariTab = () => (
        <View style={styles.tabContainer}>
            {usuariError ? <Text style={styles.errorText}>{usuariError}</Text> : null}
            
            <Text style={styles.label}>Nombre complete *</Text>
            <TextInput
                style={styles.input}
                placeholder="Ej. Juan Pérez"
                value={nom}
                onChangeText={setNom}
                editable={!isSubmitting}
            />

            <Text style={styles.label}>Email {initialData ? '' : '*'}</Text>
            <TextInput
                style={[styles.input, initialData && styles.inputDisabled]}
                placeholder="Ej. worker@bookmenow.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isSubmitting && !initialData}
            />

            {!initialData && (
                <>
                    <Text style={styles.label}>Contraseña *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Mínimo 8 caracteres"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        editable={!isSubmitting}
                    />
                </>
            )}
        </View>
    );

    const renderServeisTab = () => (
        <View style={styles.tabContainer}>
            <Text style={styles.sectionTitle}>Selecciona los servicios asignados:</Text>
            
            {isLoadingServeis ? (
                <ActivityIndicator size="large" color={HC.primary} style={{ marginTop: 20 }} />
            ) : serveisList.length === 0 ? (
                <Text style={styles.emptyText}>No hay servicios disponibles.</Text>
            ) : (
                <View style={styles.servicesGrid}>
                    {serveisList.map((servei: any) => {
                        const isSelected = serveisIds.includes(servei.id);
                        return (
                            <TouchableOpacity
                                key={servei.id}
                                style={[styles.serviceCard, isSelected && styles.serviceCardSelected]}
                                onPress={() => toggleService(servei.id)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={isSelected ? "checkbox" : "square-outline"}
                                    size={20}
                                    color={isSelected ? HC.primary : HC.textMuted}
                                />
                                <Text style={[styles.serviceText, isSelected && styles.serviceTextSelected]}>
                                    {servei.nom}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
        </View>
    );

    const renderJornadaTab = () => (
        <View style={styles.tabContainer}>
            <Text style={styles.sectionTitle}>Asignar una jornada (Opcional):</Text>
            
            <Text style={styles.label}>Plantilla de Jornada</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                {isLoadingJornades ? (
                    <ActivityIndicator size="small" color={HC.primary} />
                ) : jornadesList.length === 0 ? (
                    <Text style={styles.emptyText}>No hay plantillas de jornada.</Text>
                ) : (
                    jornadesList.map((j: any) => {
                        const isSelected = plantillaJornadaId === j.id;
                        return (
                            <TouchableOpacity
                                key={j.id}
                                style={[styles.chip, isSelected && styles.chipSelected]}
                                onPress={() => setPlantillaJornadaId(isSelected ? null : j.id)}
                            >
                                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                                    {j.nom || `Plantilla #${j.id}`}
                                </Text>
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>

            <View style={styles.row}>
                <View style={[styles.col, { paddingRight: 8 }]}>
                    <Text style={styles.label}>Fecha Inicio</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="YYYY-MM-DD"
                        value={dataInici}
                        onChangeText={setDataInici}
                        editable={!isSubmitting}
                    />
                </View>
                <View style={[styles.col, { paddingLeft: 8 }]}>
                    <Text style={styles.label}>Fecha Fin</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="YYYY-MM-DD"
                        value={dataFi}
                        onChangeText={setDataFi}
                        editable={!isSubmitting}
                    />
                </View>
            </View>
            <Text style={styles.helperText}>Formato esperado: YYYY-MM-DD Ej: 2026-02-07</Text>
        </View>
    );

    /* ── Main Render ───────────────────────── */
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.modal, isDesktop && styles.modalDesktop]}>

                    {/* ── Header ────────────────── */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>{initialData ? 'Editar trabajador' : 'Crear trabajador'}</Text>
                        <TouchableOpacity onPress={handleClose} disabled={isSubmitting}>
                            <Ionicons name="close" size={24} color={HC.textMuted} />
                        </TouchableOpacity>
                    </View>

                    {/* ── Tabs ──────────────────── */}
                    <View style={styles.tabsWrapper}>
                        <RotationTabs
                            rotations={tabs}
                            activeIndex={activeTab}
                            onSelect={setActiveTab}
                            onAdd={() => {}}
                        />
                    </View>

                    {/* ── Scrollable content ────── */}
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {activeTab === 0 && renderUsuariTab()}
                        {activeTab === 1 && renderServeisTab()}
                        {activeTab === 2 && renderJornadaTab()}
                    </ScrollView>

                    {/* ── Footer ────────────────── */}
                    <View style={[styles.footer, isDesktop && styles.footerDesktop]}>
                        <TouchableOpacity
                            style={styles.btnCancel}
                            onPress={handleClose}
                            activeOpacity={0.7}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.btnCancelText}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.btnSave, isSubmitting && styles.btnSaveDisabled]}
                            onPress={handleSave}
                            activeOpacity={0.8}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color={HC.white} />
                            ) : (
                                <Text style={styles.btnSaveText}>Confirmar</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

/* ══════════════════════════════════════════
   Styles
   ══════════════════════════════════════════ */
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        width: '100%',
        height: '100%',
        backgroundColor: HC.white,
        flexDirection: 'column',
    },
    modalDesktop: {
        width: '90%',
        maxWidth: 700,
        height: '90%',
        maxHeight: 700,
        borderRadius: 16,
        ...cardShadow,
        shadowOpacity: 0.15,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: HC.border,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: HC.textPrimary,
    },
    tabsWrapper: {
        paddingHorizontal: 24,
        paddingTop: 8,
        backgroundColor: HC.white,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    tabContainer: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: HC.textPrimary,
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: HC.textPrimary,
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: HC.border,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        color: HC.textPrimary,
        backgroundColor: HC.screenBg,
    },
    inputDisabled: {
        backgroundColor: HC.border,
        color: HC.textMuted,
    },
    errorText: {
        color: HC.red,
        fontSize: 14,
        marginBottom: 12,
        backgroundColor: HC.redLight,
        padding: 12,
        borderRadius: 8,
        overflow: 'hidden',
    },
    emptyText: {
        color: HC.textMuted,
        fontStyle: 'italic',
        marginTop: 8,
    },
    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    serviceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: HC.border,
        borderRadius: 8,
        backgroundColor: HC.white,
        minWidth: '45%',
    },
    serviceCardSelected: {
        borderColor: HC.primary,
        backgroundColor: '#F1F5F9', // Light tint based on project preference or just off-white
    },
    serviceText: {
        marginLeft: 8,
        fontSize: 14,
        color: HC.textPrimary,
    },
    serviceTextSelected: {
        fontWeight: '600',
        color: HC.primary,
    },
    horizontalScroll: {
        flexGrow: 0,
        marginBottom: 16,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: HC.border,
        backgroundColor: HC.white,
        marginRight: 10,
    },
    chipSelected: {
        borderColor: HC.primary,
        backgroundColor: HC.primary,
    },
    chipText: {
        fontSize: 14,
        color: HC.textPrimary,
    },
    chipTextSelected: {
        color: HC.white,
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    col: {
        flex: 1,
    },
    helperText: {
        fontSize: 12,
        color: HC.textMuted,
        marginTop: 6,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: HC.border,
        backgroundColor: HC.white,
    },
    footerDesktop: {
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    btnCancel: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: HC.border,
        backgroundColor: HC.white,
    },
    btnCancelText: {
        fontSize: 14,
        fontWeight: '600',
        color: HC.textPrimary,
    },
    btnSave: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: HC.primary,
        minWidth: 120,
        alignItems: 'center',
    },
    btnSaveDisabled: {
        opacity: 0.7,
    },
    btnSaveText: {
        fontSize: 14,
        fontWeight: '600',
        color: HC.white,
    },
});
