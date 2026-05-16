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
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';
import type { TranslationKeys } from '@/core/i18n/locales/ca';

export const BUSINESS_CATEGORIES: { value: string; icon: string; tKey: TranslationKeys }[] = [
    { value: 'PERRUQUERIA', icon: 'cut-outline', tKey: 'btPerruqueria' },
    { value: 'BARBERIA', icon: 'man-outline', tKey: 'btBarberia' },
    { value: 'ESTETICA', icon: 'sparkles-outline', tKey: 'btEstetica' },
    { value: 'SPA', icon: 'water-outline', tKey: 'btSpa' },
    { value: 'MASSATGES', icon: 'hand-right-outline', tKey: 'btMassatges' },
    { value: 'NUTRICIONISTA', icon: 'nutrition-outline', tKey: 'btNutricionista' },
    { value: 'FISIOTERAPIA', icon: 'medkit-outline', tKey: 'btFisioterapia' },
    { value: 'DENTAL', icon: 'happy-outline', tKey: 'btDental' },
    { value: 'VETERINARIA', icon: 'paw-outline', tKey: 'btVeterinaria' },
    { value: 'ALTRES', icon: 'grid-outline', tKey: 'btAltres' },
];

export type ServiceFormValues = {
    nom: string;
    duradaMin: number;
    preu: number;
    actiu: boolean;
    descripcio?: string;
    categoria?: string;
};

type Props = {
    visible: boolean;
    initialValue?: ServiceFormValues;
    initialFotoUrl?: string | null;
    onSubmit: (values: ServiceFormValues, photoUri?: string) => Promise<void>;
    onClose: () => void;
    onDelete?: () => void;
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
    onDelete,
    loading = false,
    title,
    submitLabel,
}: Props) {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 1024;
    const theme = useTheme();
    const { t } = useLanguage();
    const resolvedTitle = title ?? t('servNewTitle');
    const resolvedSubmitLabel = submitLabel ?? t('create');

    const [form, setForm] = useState<ServiceFormValues>({
        nom: '',
        duradaMin: 30,
        preu: 0,
        actiu: true,
        descripcio: '',
        categoria: 'ALTRES',
    });
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [photoUri, setPhotoUri] = useState<string | null>(null);

    useEffect(() => {
        if (initialValue) {
            setForm(initialValue);
        } else {
            setForm({ nom: '', duradaMin: 30, preu: 0, actiu: true, descripcio: '', categoria: 'ALTRES' });
        }
        setPhotoUri(null);
        setErrors({});
    }, [visible, initialValue]);

    const pickImage = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(t('permissionRequired'), t('galleryPermission'));
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
        <Modal
            visible={visible}
            transparent
            animationType={isDesktop ? 'fade' : 'slide'}
            onRequestClose={handleClose}
        >
            <View style={[styles.overlay, !isDesktop && styles.overlayMobile]}>
                <View style={[styles.modal, isDesktop ? styles.modalDesktop : styles.modalMobile]}>

                    {/* ── Header ────────────────── */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>{resolvedTitle}</Text>
                        <TouchableOpacity onPress={handleClose} disabled={loading} style={styles.closeBtn}>
                            <Ionicons name="close-outline" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    {/* ── Scrollable content ────── */}
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Image picker */}
                        <Pressable onPress={pickImage} disabled={loading} style={styles.imagePicker}>
                            {previewUri ? (
                                <>
                                    <Image source={{ uri: previewUri }} style={styles.imagePreview} resizeMode="cover" />
                                    <View style={styles.imageOverlay}>
                                        <Ionicons name="camera-outline" size={16} color="#ffffff" />
                                        <Text style={styles.imageOverlayText}>{t('servFormChangePhoto')}</Text>
                                    </View>
                                </>
                            ) : (
                                <View style={[styles.imagePlaceholder, { borderColor: theme.primary }]}>
                                    <Ionicons name="camera-outline" size={28} color={theme.primary} />
                                    <Text style={[styles.imagePlaceholderText, { color: theme.primary }]}>
                                        {t('servFormAddPhoto')}
                                    </Text>
                                </View>
                            )}
                        </Pressable>

                        <View style={styles.form}>
                            <Input
                                label={t('servFormNomLabel')}
                                placeholder={t('servFormNomPh')}
                                value={form.nom}
                                onChangeText={(nom: string) => setForm({ ...form, nom })}
                                editable={!loading}
                                error={errors.nom ? t('required') : undefined}
                            />

                            <View style={styles.row}>
                                <View style={styles.rowField}>
                                    <Input
                                        label={t('servFormPreuLabel')}
                                        placeholder="0.00"
                                        value={String(form.preu)}
                                        onChangeText={(preu: string) => setForm({ ...form, preu: parseFloat(preu) || 0 })}
                                        keyboardType="numeric"
                                        editable={!loading}
                                        error={errors.preu ? t('required') : undefined}
                                    />
                                </View>
                                <View style={styles.rowField}>
                                    <Input
                                        label={t('servFormDuracioLabel')}
                                        placeholder="30"
                                        value={String(form.duradaMin)}
                                        onChangeText={(v: string) => setForm({ ...form, duradaMin: parseInt(v) || 0 })}
                                        keyboardType="numeric"
                                        editable={!loading}
                                        error={errors.duradaMin ? t('required') : undefined}
                                    />
                                </View>
                            </View>

                            <View style={styles.fieldWrapper}>
                                <Text style={styles.label}>{t('servFormDescLabel')}</Text>
                                <TextInput
                                    style={styles.textarea}
                                    placeholder={t('servFormDescPh')}
                                    placeholderTextColor="#94a3b8"
                                    value={form.descripcio ?? ''}
                                    onChangeText={(descripcio) => setForm({ ...form, descripcio })}
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                    editable={!loading}
                                />
                            </View>

                            <View style={styles.fieldWrapper}>
                                <Text style={styles.label}>{t('servFormCategoryLabel')}</Text>
                                <View style={styles.categoryGrid}>
                                    {BUSINESS_CATEGORIES.map((cat) => {
                                        const selected = (form.categoria ?? 'ALTRES') === cat.value;
                                        return (
                                            <TouchableOpacity
                                                key={cat.value}
                                                style={[
                                                    styles.categoryPill,
                                                    selected && {
                                                        backgroundColor: theme.primary + '22',
                                                        borderColor: theme.primary,
                                                    },
                                                ]}
                                                onPress={() => setForm({ ...form, categoria: cat.value })}
                                                activeOpacity={0.7}
                                                disabled={loading}
                                            >
                                                <Ionicons
                                                    name={cat.icon as any}
                                                    size={14}
                                                    color={selected ? theme.primary : '#64748b'}
                                                />
                                                <Text
                                                    style={[
                                                        styles.categoryPillText,
                                                        selected && { color: theme.primary },
                                                    ]}
                                                >
                                                    {t(cat.tKey)}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                    {/* ── Footer ────────────────── */}
                    <View style={styles.footer}>
                        {onDelete && (
                            <TouchableOpacity
                                style={[styles.btn, styles.btnDelete]}
                                onPress={onDelete}
                                activeOpacity={0.7}
                                disabled={loading}
                            >
                                <Text style={styles.btnDeleteText}>{t('delete')}</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.btn, styles.btnSave, { backgroundColor: theme.primary }, loading && styles.btnDisabled]}
                            onPress={handleSubmit}
                            activeOpacity={0.8}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <Text style={styles.btnSaveText}>{resolvedSubmitLabel}</Text>
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
    overlayMobile: {
        justifyContent: 'flex-end',
        alignItems: 'stretch',
    },
    modal: {
        backgroundColor: '#ffffff',
        flexDirection: 'column',
    },
    modalDesktop: {
        width: 520,
        maxHeight: '90%',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
    },
    modalMobile: {
        width: '100%',
        maxHeight: '85%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
    },
    closeBtn: {
        padding: 4,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 32,
        gap: 16,
    },
    imagePicker: {
        width: '100%',
        height: 180,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f8f9fb',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderRadius: 12,
    },
    imagePlaceholderText: {
        fontSize: 13,
        fontWeight: '500',
        marginTop: 6,
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(0,0,0,0.45)',
        paddingVertical: 7,
        paddingHorizontal: 12,
        borderTopLeftRadius: 8,
    },
    imageOverlayText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '500',
    },
    form: {
        gap: 4,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    rowField: {
        flex: 1,
    },
    fieldWrapper: {
        gap: 0,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
        marginTop: 8,
    },
    textarea: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 15,
        color: '#0f172a',
        backgroundColor: '#ffffff',
        height: 80,
        lineHeight: 22,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 4,
    },
    categoryPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        backgroundColor: '#f1f5f9',
    },
    categoryPillText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#64748b',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        backgroundColor: '#ffffff',
    },
    btn: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 13,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnDelete: {
        borderWidth: 1.5,
        borderColor: '#ef4444',
        backgroundColor: 'transparent',
    },
    btnDeleteText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#ef4444',
    },
    btnSave: {},
    btnSaveText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#ffffff',
    },
    btnDisabled: {
        opacity: 0.4,
    },
});
