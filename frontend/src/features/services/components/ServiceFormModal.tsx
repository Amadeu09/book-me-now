import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/ui/components/common';
import { HC, cardShadow } from '../../horarios/constants/horarios.constants';
import { useTheme } from '@/core/theme/ThemeProvider';

export type ServiceFormValues = {
    nom: string;
    duradaMin: number;
    preu: number;
    actiu: boolean;
    descripcio?: string;
};

type Props = {
    visible: boolean;
    initialValue?: ServiceFormValues;
    initialFotoUrl?: string | null;
    onSubmit: (values: ServiceFormValues, photoUri?: string) => Promise<void>;
    onClose: () => void;
    loading?: boolean;
    title?: string;
    submitLabel?: string;
};

export default function ServiceFormModal({
    visible,
    initialValue,
    initialFotoUrl,
    onSubmit,
    onClose,
    loading = false,
    title = 'Nuevo servicio',
    submitLabel = 'Crear',
}: Props) {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const theme = useTheme();

    const [form, setForm] = useState<ServiceFormValues>({
        nom: '',
        duradaMin: 30,
        preu: 0,
        actiu: true,
        descripcio: '',
    });
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [photoUri, setPhotoUri] = useState<string | null>(null);

    useEffect(() => {
        if (initialValue) {
            setForm(initialValue);
        } else {
            setForm({ nom: '', duradaMin: 30, preu: 0, actiu: true, descripcio: '' });
        }
        setPhotoUri(null);
        setErrors({});
    }, [visible, initialValue]);

    const pickImage = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permisos', 'Se necesitan permisos para acceder a la galería.');
                return;
            }
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setPhotoUri(result.assets[0].uri);
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, boolean> = {};
        if (!form.nom.trim()) newErrors.nom = true;
        if (form.duradaMin < 1) newErrors.duradaMin = true;
        if (form.preu < 0) newErrors.preu = true;
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (validate()) {
            try {
                await onSubmit(form, photoUri ?? undefined);
                onClose();
            } catch {
                // Error handled by parent
            }
        }
    };

    const handleClose = () => {
        if (!loading) onClose();
    };

    const previewUri = photoUri ?? initialFotoUrl ?? null;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
            <View style={styles.overlay}>
                <View style={[styles.modal, isDesktop && styles.modalDesktop]}>

                    {/* ── Header ────────────────── */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>{title}</Text>
                        <TouchableOpacity onPress={handleClose} disabled={loading}>
                            <Ionicons name="close" size={24} color={HC.textMuted} />
                        </TouchableOpacity>
                    </View>

                    {/* ── Scrollable content ────── */}
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Pressable onPress={pickImage} disabled={loading} style={styles.imagePicker}>
                            {previewUri ? (
                                <Image source={{ uri: previewUri }} style={styles.imagePreview} resizeMode="cover" />
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <Text style={styles.imagePlaceholderText}>+ Añadir foto</Text>
                                </View>
                            )}
                            {previewUri && (
                                <View style={styles.imageOverlay}>
                                    <Text style={styles.imageOverlayText}>Cambiar foto</Text>
                                </View>
                            )}
                        </Pressable>

                        <View style={styles.form}>
                            <Input
                                label="Nombre"
                                placeholder="Ej: Corte de cabello"
                                value={form.nom}
                                onChangeText={(nom: string) => setForm({ ...form, nom })}
                                editable={!loading}
                                error={errors.nom ? 'Requerido' : undefined}
                            />

                            <Input
                                label="Duración (minutos)"
                                placeholder="30"
                                value={String(form.duradaMin)}
                                onChangeText={(duradaMin: string) => setForm({ ...form, duradaMin: parseInt(duradaMin) || 0 })}
                                keyboardType="numeric"
                                editable={!loading}
                                error={errors.duradaMin ? 'Requerido' : undefined}
                            />

                            <Input
                                label="Precio (€)"
                                placeholder="0.00"
                                value={String(form.preu)}
                                onChangeText={(preu: string) => setForm({ ...form, preu: parseFloat(preu) || 0 })}
                                keyboardType="numeric"
                                editable={!loading}
                                error={errors.preu ? 'Requerido' : undefined}
                            />

                            <View style={styles.textareaWrapper}>
                                <Text style={styles.label}>Descripción</Text>
                                <TextInput
                                    style={styles.textarea}
                                    placeholder="Describe el servicio..."
                                    placeholderTextColor={HC.textMuted}
                                    value={form.descripcio ?? ''}
                                    onChangeText={(descripcio) => setForm({ ...form, descripcio })}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    editable={!loading}
                                />
                            </View>
                        </View>
                    </ScrollView>

                    {/* ── Footer ────────────────── */}
                    <View style={[styles.footer, isDesktop && styles.footerDesktop]}>
                        <TouchableOpacity
                            style={styles.btnCancel}
                            onPress={handleClose}
                            activeOpacity={0.7}
                            disabled={loading}
                        >
                            <Text style={styles.btnCancelText}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.btnSave, { backgroundColor: theme.primary }, loading && styles.btnSaveDisabled]}
                            onPress={handleSubmit}
                            activeOpacity={0.8}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color={HC.white} />
                            ) : (
                                <Text style={styles.btnSaveText}>{submitLabel}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

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
        maxWidth: 560,
        height: 'auto',
        maxHeight: '90%',
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
        gap: 20,
    },
    imagePicker: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: HC.screenBg,
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: HC.border,
        borderStyle: 'dashed',
        borderRadius: 10,
        backgroundColor: HC.screenBg,
    },
    imagePlaceholderText: {
        fontSize: 13,
        color: HC.textMuted,
        fontWeight: '400',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.35)',
        paddingVertical: 8,
        alignItems: 'center',
    },
    imageOverlayText: {
        color: HC.white,
        fontSize: 12,
        fontWeight: '500',
    },
    form: {
        gap: 4,
    },
    textareaWrapper: {
        gap: 0,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: HC.textPrimary,
        marginBottom: 8,
        marginTop: 12,
    },
    textarea: {
        backgroundColor: HC.screenBg,
        borderWidth: 1,
        borderColor: HC.border,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        color: HC.textPrimary,
        minHeight: 96,
        lineHeight: 22,
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
