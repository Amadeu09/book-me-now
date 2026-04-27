import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    useWindowDimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Input, Button } from '@/ui/components/common';

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
    const isWeb = width > 900;

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
                <View style={[styles.card, isWeb && styles.cardWeb]}>
                    <ScrollView
                        style={styles.scroll}
                        contentContainerStyle={styles.cardContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Text style={styles.title}>{title}</Text>

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
                                <Text style={styles.textareaLabel}>Descripción</Text>
                                <TextInput
                                    style={styles.textarea}
                                    placeholder="Describe el servicio..."
                                    placeholderTextColor="#CCCCCC"
                                    value={form.descripcio ?? ''}
                                    onChangeText={(descripcio) => setForm({ ...form, descripcio })}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    editable={!loading}
                                />
                            </View>
                        </View>

                        <View style={styles.actions}>
                            <Button
                                variant="ghost"
                                label="Cancelar"
                                onPress={handleClose}
                                disabled={loading}
                            />
                            <Button
                                label={loading ? 'Guardando...' : submitLabel}
                                onPress={handleSubmit}
                                loading={loading}
                            />
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.25)',
        padding: 20,
        justifyContent: 'center',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#EBEBEB',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    cardWeb: {
        maxWidth: 560,
        alignSelf: 'center',
        width: '100%',
    },
    scroll: {
        flex: 1,
    },
    cardContent: {
        padding: 28,
        gap: 20,
        flexGrow: 1,
    },
    title: {
        fontSize: 17,
        fontWeight: '400',
        color: '#111111',
        letterSpacing: -0.2,
    },
    imagePicker: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#F5F5F5',
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
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
        borderRadius: 10,
        backgroundColor: '#FAFAFA',
    },
    imagePlaceholderText: {
        fontSize: 13,
        color: '#CCCCCC',
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
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
    },
    form: {
        gap: 16,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        marginTop: 8,
    },
    textareaWrapper: {
        gap: 6,
    },
    textareaLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#555555',
    },
    textarea: {
        backgroundColor: '#FAFAFA',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 14,
        fontSize: 14,
        color: '#111111',
        minHeight: 96,
        lineHeight: 22,
    },
});
