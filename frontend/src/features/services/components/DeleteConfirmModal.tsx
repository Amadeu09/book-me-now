import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { Servei } from "@/types/servei.types";
import { Button } from '@/ui/components/common';
import { useLanguage } from '@/core/i18n';

type Props = {
    visible: boolean;
    service?: Servei | null;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
};

export default function DeleteConfirmModal({ visible, service, onConfirm, onCancel, loading }: Props) {
    const { t } = useLanguage();
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Text style={styles.title}>{t('servDeleteTitle')}</Text>
                    <Text style={styles.body}>{t('servDeleteBody').replace('{name}', service?.nom ?? '')}</Text>
                    <View style={styles.actions}>
                        <Button variant="ghost" label={t('cancel')} onPress={onCancel} disabled={loading} />
                        <Button variant="danger" label={loading ? t('servDeleting') : t('delete')} onPress={onConfirm} loading={loading} />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 28,
    },
    card: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 28,
        borderWidth: 1,
        borderColor: '#EBEBEB',
        gap: 12,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111111',
    },
    body: {
        fontSize: 14,
        color: '#888888',
        lineHeight: 22,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        marginTop: 4,
    },
});
