import React, { useEffect, useState } from 'react';
import {
    Modal, View, Text, ScrollView, TouchableOpacity,
    TextInput, StyleSheet, ActivityIndicator, useWindowDimensions, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC, cardShadow } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { createClient, updateClient } from '../../services/clients.service';
import type { ClientItem } from '../../types/clients.types';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: ClientItem;
}

interface FormState {
    nom: string;
    email: string;
    telefon: string;
}

const EMPTY: FormState = { nom: '', email: '', telefon: '' };

export function CreateClientModal({ visible, onClose, onSuccess, initialData }: Props) {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const theme = useTheme();

    const [form, setForm] = useState<FormState>(EMPTY);
    const [errors, setErrors] = useState<Partial<FormState>>({});
    const [loading, setLoading] = useState(false);

    const isEditMode = !!initialData;

    useEffect(() => {
        if (visible) {
            setForm(initialData
                ? { nom: initialData.nom, email: initialData.email ?? '', telefon: initialData.telefon ?? '' }
                : EMPTY
            );
            setErrors({});
        }
    }, [visible, initialData]);

    const set = (field: keyof FormState) => (value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validate = (): boolean => {
        const newErrors: Partial<FormState> = {};
        if (!form.nom.trim()) newErrors.nom = 'El nom és obligatori';
        if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            newErrors.email = 'Format d\'email no vàlid';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const payload = {
                nom: form.nom.trim(),
                email: form.email.trim() || undefined,
                telefon: form.telefon.trim() || undefined,
            };
            if (isEditMode && initialData) {
                await updateClient(initialData.id, payload);
            } else {
                await createClient(payload);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            const msg = err?.response?.data?.message || (isEditMode ? 'No s\'ha pogut editar el client' : 'No s\'ha pogut crear el client');
            Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => { if (!loading) onClose(); };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
            <View style={s.overlay}>
                <View style={[s.modal, isDesktop && s.modalDesktop]}>

                    {/* Header */}
                    <View style={s.header}>
                        <Text style={s.headerTitle}>{isEditMode ? 'Editar client' : 'Añadir cliente'}</Text>
                        <TouchableOpacity onPress={handleClose} disabled={loading}>
                            <Ionicons name="close" size={24} color={HC.textMuted} />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <ScrollView
                        style={s.scroll}
                        contentContainerStyle={s.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={s.infoCard}>
                            {/* Nombre */}
                            <View style={s.fieldBlock}>
                                <Text style={s.fieldLabel}>Nom complet <Text style={s.required}>*</Text></Text>
                                <TextInput
                                    style={[s.input, errors.nom ? s.inputError : null]}
                                    placeholder="Ex. Anna García"
                                    placeholderTextColor={HC.textLight}
                                    value={form.nom}
                                    onChangeText={set('nom')}
                                    editable={!loading}
                                />
                                {errors.nom ? <Text style={s.errorText}>{errors.nom}</Text> : null}
                            </View>

                            {/* Email */}
                            <View style={s.fieldBlock}>
                                <Text style={s.fieldLabel}>Correu electrònic</Text>
                                <TextInput
                                    style={[s.input, errors.email ? s.inputError : null]}
                                    placeholder="Ex. anna@email.com"
                                    placeholderTextColor={HC.textLight}
                                    value={form.email}
                                    onChangeText={set('email')}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!loading}
                                />
                                {errors.email ? <Text style={s.errorText}>{errors.email}</Text> : null}
                            </View>

                            {/* Teléfono */}
                            <View style={[s.fieldBlock, s.lastField]}>
                                <Text style={s.fieldLabel}>Telèfon</Text>
                                <TextInput
                                    style={s.input}
                                    placeholder="Ex. 600 111 222"
                                    placeholderTextColor={HC.textLight}
                                    value={form.telefon}
                                    onChangeText={set('telefon')}
                                    keyboardType="phone-pad"
                                    editable={!loading}
                                />
                            </View>
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View style={[s.footer, isDesktop && s.footerDesktop]}>
                        <TouchableOpacity style={s.btnCancel} onPress={handleClose} disabled={loading} activeOpacity={0.7}>
                            <Text style={s.btnCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[s.btnSave, { backgroundColor: theme.primary }, loading && s.btnDisabled]}
                            onPress={handleSave}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading
                                ? <ActivityIndicator color={HC.white} size="small" />
                                : <Text style={s.btnSaveText}>{isEditMode ? 'Guardar canvis' : 'Guardar client'}</Text>
                            }
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
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
        maxWidth: 480,
        height: 'auto' as any,
        borderRadius: 16,
        ...cardShadow,
        shadowOpacity: 0.15,
        elevation: 8,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: HC.border,
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: HC.textPrimary },

    // Scroll
    scroll: { flex: 1 },
    scrollContent: { padding: 24, paddingBottom: 8 },

    // Info card
    infoCard: {
        borderWidth: 1,
        borderColor: HC.border,
        borderRadius: 14,
        padding: 20,
    },
    fieldBlock: { marginBottom: 20 },
    lastField: { marginBottom: 0 },
    fieldLabel: { fontSize: 14, fontWeight: '600', color: HC.textPrimary, marginBottom: 8 },
    required: { color: HC.red },
    input: {
        borderWidth: 1,
        borderColor: HC.border,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: HC.textPrimary,
        backgroundColor: HC.white,
    },
    inputError: { borderColor: HC.red },
    errorText: { fontSize: 12, color: HC.red, fontWeight: '500', marginTop: 4 },

    // Footer
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
    footerDesktop: { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
    btnCancel: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: HC.border,
        backgroundColor: HC.white,
    },
    btnCancelText: { fontSize: 14, fontWeight: '600', color: HC.textPrimary },
    btnSave: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
        minWidth: 160,
        alignItems: 'center',
    },
    btnSaveText: { fontSize: 14, fontWeight: '600', color: HC.white },
    btnDisabled: { opacity: 0.6 },
});
