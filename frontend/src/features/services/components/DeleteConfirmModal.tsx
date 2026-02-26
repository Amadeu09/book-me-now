import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { Servei } from "@/types/servei.types";
import { palette, radius, spacing } from "@/constants/theme";
import { Button } from '@/ui/components/common';

type Props = {
    visible: boolean;
    service?: Servei | null;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
};

export default function DeleteConfirmModal({ visible, service, onConfirm, onCancel, loading }: Props) {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Text style={styles.title}>Eliminar servicio</Text>
                    <Text style={styles.body}>¿Eliminar &quot;{service?.nom}&quot;?</Text>
                    <View style={styles.actions}>
                        <Button variant="ghost" label="Cancelar" onPress={onCancel} disabled={loading} />
                        <Button variant="danger" label={loading ? 'Eliminando...' : 'Eliminar'} onPress={onConfirm} loading={loading} />
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
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.gutter,
    },
    card: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: palette.background,
        borderRadius: radius.modal,
        padding: spacing.gutter,
        gap: spacing.md,
        borderWidth: 1,
        borderColor: palette.borderSoft,
    },
    title: { fontSize: 18, fontWeight: '800', color: palette.textPrimary },
    body: { fontSize: 15, color: palette.textPrimary },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: spacing.sm,
        marginTop: spacing.xs,
    },
});
