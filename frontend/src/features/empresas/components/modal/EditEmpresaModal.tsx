import React, { useState, useCallback, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Alert,
    ActivityIndicator,
    useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { HC, cardShadow } from '@/features/home/constants/inicio.constants';
import type { AuthUser } from '@/features/auth/services/auth.service';
import { updateEmpresa } from '../../services/empresas.service';
import { patchStoredEmpresa } from '@/utils/session';
import { useLanguage } from '@/core/i18n';
import type { TranslationKeys } from '@/core/i18n/locales/ca';

const BUSINESS_TYPES: { labelKey: TranslationKeys; value: string }[] = [
    { labelKey: 'btPerruqueria', value: 'PERRUQUERIA' },
    { labelKey: 'btBarberia', value: 'BARBERIA' },
    { labelKey: 'btEstetica', value: 'ESTETICA' },
    { labelKey: 'btSpa', value: 'SPA' },
    { labelKey: 'btMassatges', value: 'MASSATGES' },
    { labelKey: 'btNutricionista', value: 'NUTRICIONISTA' },
    { labelKey: 'btFisioterapia', value: 'FISIOTERAPIA' },
    { labelKey: 'btDental', value: 'DENTAL' },
    { labelKey: 'btVeterinaria', value: 'VETERINARIA' },
    { labelKey: 'btAltres', value: 'ALTRES' },
];

interface EditEmpresaModalProps {
    visible: boolean;
    initialData?: AuthUser['empresa'];
    onClose: () => void;
    onSuccess?: () => void;
}

interface EmpresaFormState {
    nom: string;
    ubicacio: string;
    capacitat: string;
    descripcio: string;
    tipo: string;
    diasAntesReserva: string;
}

import { useTheme } from '@/core/theme/ThemeProvider';

export const EditEmpresaModal: React.FC<EditEmpresaModalProps> = ({
    visible,
    initialData,
    onClose,
    onSuccess,
}) => {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const queryClient = useQueryClient();
    const theme = useTheme();
    const { t } = useLanguage();

    const [form, setForm] = useState<EmpresaFormState>({
        nom: '',
        ubicacio: '',
        capacitat: '',
        descripcio: '',
        tipo: '',
        diasAntesReserva: '14',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (visible && initialData) {
            setForm({
                nom: initialData.nom || '',
                ubicacio: initialData.ubicacio || '',
                capacitat: initialData.capacitat ? String(initialData.capacitat) : '',
                descripcio: initialData.descripcio || '',
                tipo: initialData.tipo || '',
                diasAntesReserva: initialData.diasAntesReserva ? String(initialData.diasAntesReserva) : '14',
            });
            setErrors({});
        }
    }, [visible, initialData]);

    const handleTextChange = useCallback((field: keyof EmpresaFormState, text: string) => {
        setForm((prev) => ({ ...prev, [field]: text }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    }, [errors]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!form.nom.trim()) newErrors.nom = t('nameRequired');
        if (!form.ubicacio.trim()) newErrors.ubicacio = t('locationRequired');
        if (form.capacitat && isNaN(Number(form.capacitat))) {
            newErrors.capacitat = t('mustBeNumber');
        }
        if (form.diasAntesReserva && (isNaN(Number(form.diasAntesReserva)) || Number(form.diasAntesReserva) < 1)) {
            newErrors.diasAntesReserva = t('mustBePositiveNumber');
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate() || !initialData?.id) return;

        const payload = {
            nom: form.nom.trim(),
            ubicacio: form.ubicacio.trim(),
            capacitat: form.capacitat.trim() ? Number(form.capacitat) : null,
            descripcio: form.descripcio.trim() || undefined,
            tipo: form.tipo || undefined,
            diasAntesReserva: form.diasAntesReserva.trim() ? Number(form.diasAntesReserva) : undefined,
        };

        try {
            setLoading(true);
            await updateEmpresa(initialData.id, payload);
            await patchStoredEmpresa(payload);
            queryClient.invalidateQueries({ queryKey: ['empresa', initialData.id] });
            onSuccess?.();
            onClose();
        } catch (err: any) {
            Alert.alert(t('error'), err?.response?.data?.message || t('empresaUpdateError'));
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => { if (!loading) onClose(); };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
            <View style={styles.overlay}>
                <View style={[styles.modal, isDesktop && styles.modalDesktop]}>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>{t('empresaEdit')}</Text>
                        <TouchableOpacity onPress={handleClose} disabled={loading}>
                            <Ionicons name="close" size={24} color={HC.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Nombre */}
                        <View style={styles.fieldBlock}>
                            <Text style={styles.fieldLabel}>{t('empresaName')}</Text>
                            <TextInput
                                style={[styles.input, errors.nom ? styles.inputError : null]}
                                placeholder={t('empresaNamePh')}
                                placeholderTextColor={HC.textLight}
                                value={form.nom}
                                onChangeText={(t) => handleTextChange('nom', t)}
                                editable={!loading}
                            />
                            {errors.nom ? <Text style={styles.errorText}>{errors.nom}</Text> : null}
                        </View>

                        {/* Ubicación */}
                        <View style={styles.fieldBlock}>
                            <Text style={styles.fieldLabel}>{t('empresaLocation')}</Text>
                            <TextInput
                                style={[styles.input, errors.ubicacio ? styles.inputError : null]}
                                placeholder={t('empresaLocationPh')}
                                placeholderTextColor={HC.textLight}
                                value={form.ubicacio}
                                onChangeText={(t) => handleTextChange('ubicacio', t)}
                                editable={!loading}
                            />
                            {errors.ubicacio ? <Text style={styles.errorText}>{errors.ubicacio}</Text> : null}
                        </View>

                        {/* Capacidad */}
                        <View style={styles.fieldBlock}>
                            <Text style={styles.fieldLabel}>{t('empresaCapacity')}</Text>
                            <TextInput
                                style={[styles.input, errors.capacitat ? styles.inputError : null]}
                                placeholder={t('empresaCapacityPh')}
                                placeholderTextColor={HC.textLight}
                                value={form.capacitat}
                                keyboardType="numeric"
                                onChangeText={(t) => handleTextChange('capacitat', t)}
                                editable={!loading}
                            />
                            {errors.capacitat ? <Text style={styles.errorText}>{errors.capacitat}</Text> : null}
                        </View>

                        {/* Dies d'antelació */}
                        <View style={styles.fieldBlock}>
                            <Text style={styles.fieldLabel}>{t('empresaDaysAhead')}</Text>
                            <TextInput
                                style={[styles.input, errors.diasAntesReserva ? styles.inputError : null]}
                                placeholder={t('empresaDaysAheadPh')}
                                placeholderTextColor={HC.textLight}
                                value={form.diasAntesReserva}
                                keyboardType="numeric"
                                onChangeText={(t) => handleTextChange('diasAntesReserva', t)}
                                editable={!loading}
                            />
                            {errors.diasAntesReserva ? <Text style={styles.errorText}>{errors.diasAntesReserva}</Text> : null}
                        </View>

                        {/* Descripción */}
                        <View style={styles.fieldBlock}>
                            <Text style={styles.fieldLabel}>{t('empresaDesc')}</Text>
                            <TextInput
                                style={[styles.input, styles.inputMultiline]}
                                placeholder={t('empresaDescPh')}
                                placeholderTextColor={HC.textLight}
                                value={form.descripcio}
                                onChangeText={(t) => handleTextChange('descripcio', t)}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                editable={!loading}
                            />
                        </View>

                        {/* Tipo de negoci */}
                        <View style={styles.fieldBlock}>
                            <Text style={styles.fieldLabel}>{t('empresaType')}</Text>
                            <View style={styles.tipoGrid}>
                                {BUSINESS_TYPES.map((bt) => (
                                    <TouchableOpacity
                                        key={bt.value}
                                        style={[
                                            styles.tipoChip,
                                            form.tipo === bt.value && { backgroundColor: theme.primary, borderColor: theme.primary },
                                        ]}
                                        onPress={() => setForm((prev) => ({ ...prev, tipo: prev.tipo === bt.value ? '' : bt.value }))}
                                        disabled={loading}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[
                                            styles.tipoChipText,
                                            form.tipo === bt.value && { color: '#fff' },
                                        ]}>
                                            {t(bt.labelKey)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                    </ScrollView>

                    {/* Footer */}
                    <View style={[styles.footer, isDesktop && styles.footerDesktop]}>
                        <TouchableOpacity
                            style={styles.btnCancel}
                            onPress={handleClose}
                            disabled={loading}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.btnCancelText}>{t('cancel')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.btnSave, { backgroundColor: theme.primary }, loading && styles.btnDisabled]}
                            onPress={handleSave}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading
                                ? <ActivityIndicator color={HC.white} size="small" />
                                : <Text style={styles.btnSaveText}>{t('save')}</Text>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: HC.modalOverlay,
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
        maxWidth: 600,
        height: 'auto',
        maxHeight: '90%',
        borderRadius: 16,
        ...cardShadow,
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
        fontSize: 18,
        fontWeight: '700',
        color: HC.textPrimary,
    },
    scrollView: { flexShrink: 1 },
    scrollContent: { padding: 24 },

    fieldBlock: { marginBottom: 20 },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: HC.textSecondary,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: HC.borderInput,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: HC.textPrimary,
        backgroundColor: HC.inputBg,
    },
    inputMultiline: {
        minHeight: 96,
        paddingTop: 12,
    },
    inputError: { borderColor: HC.red },
    errorText: {
        fontSize: 12,
        color: HC.red,
        fontWeight: '500',
        marginTop: 4,
    },

    tipoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tipoChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: HC.borderInput,
        backgroundColor: HC.inputBg,
    },
    tipoChipText: {
        fontSize: 13,
        fontWeight: '500',
        color: HC.textSecondary,
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
        borderColor: HC.borderInput,
        backgroundColor: HC.white,
    },
    btnCancelText: {
        fontSize: 14,
        fontWeight: '600',
        color: HC.textSecondary,
    },
    btnSave: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: HC.primary,
        minWidth: 120,
        alignItems: 'center',
    },
    btnDisabled: { opacity: 0.6 },
    btnSaveText: {
        fontSize: 14,
        fontWeight: '600',
        color: HC.white,
    },
});
