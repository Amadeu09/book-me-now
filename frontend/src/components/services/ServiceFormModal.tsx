import React, { useEffect, useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from 'react-native';
import { palette, radius, spacing } from '@/styles/theme';
import { Input, Button } from '@/components/common';

export type ServiceFormValues = {
    nom: string;
    duradaMin: number;
    preu: number;
    actiu: boolean;
};

type Props = {
    visible: boolean;
    initialValue?: ServiceFormValues;
    onSubmit: (values: ServiceFormValues) => Promise<void>;
    onClose: () => void;
    loading?: boolean;
    title?: string;
    submitLabel?: string;
};

export default function ServiceFormModal({
    visible,
    initialValue,
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
    });

    const [errors, setErrors] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (initialValue) {
            setForm(initialValue);
        } else {
            setForm({
                nom: '',
                duradaMin: 30,
                preu: 0,
                actiu: true,
            });
        }
        setErrors({});
    }, [visible, initialValue]);

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
                await onSubmit(form);
                onClose();
            } catch (err) {
                // Error handled by parent
            }
        }
    };

    const handleClose = () => {
        if (!loading) onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
            <View style={styles.overlay}>
                <View style={[styles.card, isWeb && styles.cardWeb]}>
                    <Text style={styles.title}>{title}</Text>

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
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: palette.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.gutter,
    },
    card: {
        width: '100%',
        maxWidth: 480,
        backgroundColor: palette.background,
        borderRadius: radius.modal,
        padding: spacing.gutter,
        gap: spacing.lg,
        borderWidth: 1,
        borderColor: palette.borderSoft,
    },
    cardWeb: {
        maxWidth: 500,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: palette.textPrimary,
    },
    form: {
        gap: spacing.md,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: spacing.sm,
        marginTop: spacing.md,
    },
});
