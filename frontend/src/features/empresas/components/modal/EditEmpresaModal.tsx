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

const PALETAS = [
    { label: 'Blanco', value: '#FFFFFF' },
    { label: 'Pizarra', value: '#5B7A96' },
    { label: 'Índigo', value: '#6264A0' },
    { label: 'Lavanda', value: '#7B5E9A' },
    { label: 'Rosa', value: '#9E5A72' },
    { label: 'Coral', value: '#B55E54' },
    { label: 'Terracota', value: '#A86040' },
    { label: 'Ocre', value: '#9B7030' },
    { label: 'Oliva', value: '#6C7E4A' },
    { label: 'Salvia', value: '#4A7E68' },
    { label: 'Teal', value: '#3E7C7E' },
    { label: 'Marino', value: '#3E587A' },
    { label: 'Negro', value: '#000000ff' },
];

interface EditEmpresaModalProps {
    visible: boolean;
    initialData?: AuthUser['empresa'];
    onClose: () => void;
}

interface EmpresaFormState {
    nom: string;
    ubicacio: string;
    capacitat: string;
    descripcio: string;
    colorPrimari: string;
}

import { useTheme } from '@/core/theme/ThemeProvider';

export const EditEmpresaModal: React.FC<EditEmpresaModalProps> = ({
    visible,
    initialData,
    onClose,
}) => {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const queryClient = useQueryClient();
    const theme = useTheme();

    const [form, setForm] = useState<EmpresaFormState>({
        nom: '',
        ubicacio: '',
        capacitat: '',
        descripcio: '',
        colorPrimari: PALETAS[0].value,
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
                colorPrimari: initialData.colorPrimari || PALETAS[0].value,
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
        if (!form.nom.trim()) newErrors.nom = 'El nombre es obligatorio';
        if (!form.ubicacio.trim()) newErrors.ubicacio = 'La ubicación es obligatoria';
        if (form.capacitat && isNaN(Number(form.capacitat))) {
            newErrors.capacitat = 'Debe ser un número válido';
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
            colorPrimari: form.colorPrimari,
        };

        try {
            setLoading(true);
            await updateEmpresa(initialData.id, payload);
            await patchStoredEmpresa(payload);
            theme.setPrimaryColor(payload.colorPrimari);
            queryClient.invalidateQueries({ queryKey: ['empresa', initialData.id] });
            onClose();
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || 'No se pudo actualizar la empresa');
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
                        <Text style={styles.headerTitle}>Editar empresa</Text>
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
                            <Text style={styles.fieldLabel}>Nombre comercial</Text>
                            <TextInput
                                style={[styles.input, errors.nom ? styles.inputError : null]}
                                placeholder="Ej. Studio Belleza Elegance"
                                placeholderTextColor={HC.textLight}
                                value={form.nom}
                                onChangeText={(t) => handleTextChange('nom', t)}
                                editable={!loading}
                            />
                            {errors.nom ? <Text style={styles.errorText}>{errors.nom}</Text> : null}
                        </View>

                        {/* Ubicación */}
                        <View style={styles.fieldBlock}>
                            <Text style={styles.fieldLabel}>Dirección / Ubicación</Text>
                            <TextInput
                                style={[styles.input, errors.ubicacio ? styles.inputError : null]}
                                placeholder="Ciudad, Calle, Número"
                                placeholderTextColor={HC.textLight}
                                value={form.ubicacio}
                                onChangeText={(t) => handleTextChange('ubicacio', t)}
                                editable={!loading}
                            />
                            {errors.ubicacio ? <Text style={styles.errorText}>{errors.ubicacio}</Text> : null}
                        </View>

                        {/* Capacidad */}
                        <View style={styles.fieldBlock}>
                            <Text style={styles.fieldLabel}>Capacidad máxima (Opcional)</Text>
                            <TextInput
                                style={[styles.input, errors.capacitat ? styles.inputError : null]}
                                placeholder="Ej. 20"
                                placeholderTextColor={HC.textLight}
                                value={form.capacitat}
                                keyboardType="numeric"
                                onChangeText={(t) => handleTextChange('capacitat', t)}
                                editable={!loading}
                            />
                            {errors.capacitat ? <Text style={styles.errorText}>{errors.capacitat}</Text> : null}
                        </View>

                        {/* Descripción */}
                        <View style={styles.fieldBlock}>
                            <Text style={styles.fieldLabel}>Descripción</Text>
                            <TextInput
                                style={[styles.input, styles.inputMultiline]}
                                placeholder="Describe tu empresa, servicios, ambiente..."
                                placeholderTextColor={HC.textLight}
                                value={form.descripcio}
                                onChangeText={(t) => handleTextChange('descripcio', t)}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                editable={!loading}
                            />
                        </View>

                        {/* Color corporativo */}
                        <View style={styles.fieldBlock}>
                            <Text style={styles.fieldLabel}>Color corporativo</Text>
                            <View style={styles.paletaGrid}>
                                {PALETAS.map((p) => (
                                    <TouchableOpacity
                                        key={p.value}
                                        style={[
                                            styles.swatch,
                                            { backgroundColor: p.value },
                                            form.colorPrimari === p.value && styles.swatchSelected,
                                        ]}
                                        onPress={() => setForm((prev) => ({ ...prev, colorPrimari: p.value }))}
                                        disabled={loading}
                                        activeOpacity={0.8}
                                    >
                                        {form.colorPrimari === p.value && (
                                            <Ionicons name="checkmark" size={16} color={p.value === '#FFFFFF' ? '#000' : '#fff'} />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <View style={styles.colorPreviewRow}>
                                <View style={[styles.colorPreviewDot, { backgroundColor: form.colorPrimari }]} />
                                <Text style={styles.colorPreviewText}>
                                    {PALETAS.find(p => p.value === form.colorPrimari)?.label} · {form.colorPrimari}
                                </Text>
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
                            <Text style={styles.btnCancelText}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.btnSave, { backgroundColor: theme.primary }, loading && styles.btnDisabled]}
                            onPress={handleSave}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading
                                ? <ActivityIndicator color={HC.white} size="small" />
                                : <Text style={styles.btnSaveText}>Guardar</Text>
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

    paletaGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    swatch: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    swatchSelected: {
        borderColor: HC.textPrimary,
    },
    colorPreviewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
    },
    colorPreviewDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
    },
    colorPreviewText: {
        fontSize: 13,
        color: HC.textMuted,
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
