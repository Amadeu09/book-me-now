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
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { HC, cardShadow } from '../../constants/horarios.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';
import { RotationTabs } from './RotationTabs';

// Hooks & Services
import { useCreateUsuari, useCreateTreballador } from '../../hooks/useTreballadors';
import { updateTreballador, uploadFotoUsuari } from '../../services/treballadors.service';
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
    const theme = useTheme();
    const { t } = useLanguage();

    // Tabs — computed inside component so t() works
    const tabs = [
        { index: 0, nom: t('tabUsuari') },
        { index: 1, nom: t('tabServeis') },
        { index: 2, nom: t('tabJornada') },
    ];

    const [activeTab, setActiveTab] = useState(0);

    // Form State - Usuari
    const [email, setEmail] = useState('');
    const [nom, setNom] = useState('');
    const [password, setPassword] = useState('');
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [usuariError, setUsuariError] = useState('');

    // Form State - Serveis
    const [serveisIds, setServeisIds] = useState<number[]>([]);

    // Form State - Vacances
    const [diesVacancesAnuals, setDiesVacancesAnuals] = useState('25');

    // Form State - Jornada
    const [plantillaJornadaId, setPlantillaJornadaId] = useState<number | null>(null);

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
                setEmail(initialData.Usuari?.email || '');
                setPassword(''); // Don't pre-fill password, handled separately or hidden in edit
                
                // Pre-fill services
                if (initialData.serveis && Array.isArray(initialData.serveis)) {
                    setServeisIds(initialData.serveis.map((ts: any) => ts.serveiId));
                }
                
                // Pre-fill vacation days
                setDiesVacancesAnuals(String(initialData.diesVacancesAnuals ?? 25));

                setPlantillaJornadaId(initialData.plantilla?.id ?? null);
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
        setPhotoUri(null);
        setUsuariError('');
        setServeisIds([]);
        setDiesVacancesAnuals('25');
        setPlantillaJornadaId(null);
    };

    const pickPhoto = async () => {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
            Alert.alert(t('permissionRequired'), t('galleryPermission'));
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (!result.canceled && result.assets[0]) {
            setPhotoUri(result.assets[0].uri);
        }
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
            if (!nom.trim()) {
                setUsuariError(t('nameRequired'));
                setActiveTab(0);
                return;
            }
        } else {
            if (!email.trim() || !nom.trim() || !password.trim()) {
                setUsuariError(t('workerFieldsRequired'));
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
                    diesVacancesAnuals: parseInt(diesVacancesAnuals, 10) || 25,
                };
                
                updatePayload.plantillaId = plantillaJornadaId;
                
                await updateTreballador(initialData.id, updatePayload);
                setIsUpdating(false);
            } else {
                // 2b. Create User
                const usuariRes = await createUsuari({
                    email: email.trim(),
                    nom: nom.trim(),
                    password: password.trim(),
                });

                // 2c. Upload profile photo if selected (non-blocking)
                if (photoUri) {
                    try {
                        await uploadFotoUsuari(usuariRes.id, photoUri);
                    } catch (photoErr) {
                        console.warn('⚠️ Error subiendo foto de perfil:', photoErr);
                    }
                }

                // 3. Create Treballador
                const treballadorPayload: any = {
                    nom: nom.trim(),
                    idUsuari: usuariRes.id,
                };

                if (serveisIds.length > 0) {
                    treballadorPayload.serveisIds = serveisIds;
                }

                if (plantillaJornadaId) {
                    treballadorPayload.plantillaId = plantillaJornadaId;
                }

                await createTreballador(treballadorPayload);
            }

            // 4. Success handling
            resetForm();
            onSuccess?.();
            onClose();

        } catch (error: unknown) {
            console.error('Error creating worker:', error);
            const msg =
                (error as { response?: { data?: { message?: string | string[] } }; message?: string })?.response?.data?.message ||
                (error as { message?: string })?.message ||
                t('workerSaveError');
            setUsuariError(Array.isArray(msg) ? msg.join(', ') : (msg ?? t('workerSaveError')));
        }
    };

    /* ── Render Tabs ───────────────────────── */
    const renderUsuariTab = () => (
        <View style={styles.tabContainer}>
            {usuariError ? <Text style={styles.errorText}>{usuariError}</Text> : null}

            {/* Avatar picker — only shown in create mode */}
            {!initialData && (
                <View style={styles.avatarRow}>
                    <TouchableOpacity onPress={pickPhoto} style={styles.avatarTouch} activeOpacity={0.8}>
                        {photoUri ? (
                            <Image source={{ uri: photoUri }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Ionicons name="person-outline" size={32} color={HC.textMuted} />
                            </View>
                        )}
                        <View style={[styles.avatarBadge, { backgroundColor: theme.primary }]}>
                            <Ionicons name="camera" size={12} color={HC.white} />
                        </View>
                    </TouchableOpacity>
                    <View style={styles.avatarInfo}>
                        <Text style={styles.avatarLabel}>{t('workerPhotoLabel')}</Text>
                        <Text style={styles.avatarHint}>{t('workerPhotoHint')}</Text>
                    </View>
                </View>
            )}

            <Text style={styles.label}>{t('workerNameLabel')}</Text>
            <TextInput
                style={styles.input}
                placeholder={t('workerNamePh')}
                value={nom}
                onChangeText={setNom}
                editable={!isSubmitting}
            />

            <Text style={styles.label}>{t('workerEmailLabel')}{initialData ? '' : ' *'}</Text>
            <TextInput
                style={[styles.input, initialData && styles.inputDisabled]}
                placeholder={t('workerEmailPh')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isSubmitting && !initialData}
            />

            {!initialData && (
                <>
                    <Text style={styles.label}>{t('workerPasswordLabel')}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={t('workerPasswordPh')}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        editable={!isSubmitting}
                    />
                </>
            )}

            <Text style={styles.label}>{t('workerVacationDaysLabel')}</Text>
            <TextInput
                style={styles.input}
                placeholder="25"
                value={diesVacancesAnuals}
                onChangeText={v => setDiesVacancesAnuals(v.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                maxLength={3}
                editable={!isSubmitting}
            />
        </View>
    );

    const renderServeisTab = () => (
        <View style={styles.tabContainer}>
            <Text style={styles.sectionTitle}>{t('workerServicesTitle')}</Text>
            
            {isLoadingServeis ? (
                <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />
            ) : serveisList.length === 0 ? (
                <Text style={styles.emptyText}>{t('workerNoServices')}</Text>
            ) : (
                <View style={styles.servicesGrid}>
                    {serveisList.map((servei: any) => {
                        const isSelected = serveisIds.includes(servei.id);
                        return (
                            <TouchableOpacity
                                key={servei.id}
                                style={[styles.serviceCard, isSelected && { borderColor: theme.primary, backgroundColor: '#F1F5F9' }]}
                                onPress={() => toggleService(servei.id)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={isSelected ? "checkbox" : "square-outline"}
                                    size={20}
                                    color={isSelected ? theme.primary : HC.textMuted}
                                />
                                <Text style={[styles.serviceText, isSelected && { fontWeight: '600', color: theme.primary }]}>
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
            <Text style={styles.sectionTitle}>{t('workerJornadaTitle')}</Text>

            <Text style={styles.label}>{t('workerJornadaLabel')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                {isLoadingJornades ? (
                    <ActivityIndicator size="small" color={HC.primary} />
                ) : jornadesList.length === 0 ? (
                    <Text style={styles.emptyText}>{t('workerNoJornades')}</Text>
                ) : (
                    jornadesList.map((j: any) => {
                        const isSelected = plantillaJornadaId === j.id;
                        return (
                            <TouchableOpacity
                                key={j.id}
                                style={[styles.chip, isSelected && { borderColor: theme.primary, backgroundColor: theme.primary }]}
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
                        <Text style={styles.headerTitle}>{initialData ? t('workerModalTitleEdit') : t('workerModalTitleCreate')}</Text>
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
                            <Text style={styles.btnCancelText}>{t('cancel')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.btnSave, { backgroundColor: theme.primary }, isSubmitting && styles.btnSaveDisabled]}
                            onPress={handleSave}
                            activeOpacity={0.8}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color={HC.white} />
                            ) : (
                                <Text style={styles.btnSaveText}>{t('confirm')}</Text>
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
    avatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: HC.border,
    },
    avatarTouch: {
        width: 72,
        height: 72,
        borderRadius: 36,
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
    },
    avatarPlaceholder: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: HC.screenBg,
        borderWidth: 1,
        borderColor: HC.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarBadge: {
        position: 'absolute',
        bottom: 1,
        right: 1,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: HC.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: HC.white,
    },
    avatarInfo: {
        marginLeft: 16,
    },
    avatarLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: HC.textPrimary,
    },
    avatarHint: {
        fontSize: 12,
        color: HC.textMuted,
        marginTop: 2,
    },
});
