import React, { useState, useEffect } from 'react';
import {
    Modal, View, Text, ScrollView, TouchableOpacity,
    StyleSheet, useWindowDimensions, TextInput, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC, cardShadow } from '@/features/home/constants/inicio.constants';
import { useUpdateAbsencia } from '../../hooks/useVacaciones';
import type { AbsenciaTreballador, UpdateAbsenciaPayload } from '../../types/vacaciones.types';

function isValidDate(s: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const d = new Date(s);
    return !isNaN(d.getTime());
}

type Props = {
    visible: boolean;
    absencia: AbsenciaTreballador | null;
    onClose: () => void;
    onSuccess: () => void;
};

export function EditAbsenciaModal({ visible, absencia, onClose, onSuccess }: Props) {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;

    const [inici, setInici] = useState('');
    const [fi, setFi] = useState('');
    const [motiu, setMotiu] = useState('');
    const [apiError, setApiError] = useState<string | null>(null);

    const { mutateAsync, isPending } = useUpdateAbsencia();

    useEffect(() => {
        if (absencia) {
            setInici(absencia.inici.split('T')[0]);
            setFi(absencia.fi.split('T')[0]);
            setMotiu(absencia.motiu ?? '');
            setApiError(null);
        }
    }, [absencia]);

    const iniValid = isValidDate(inici);
    const fiValid = isValidDate(fi);
    const datesOk = iniValid && fiValid && fi >= inici;
    const canSave = datesOk && !isPending;

    const handleSave = async () => {
        if (!absencia || !canSave) return;
        setApiError(null);
        const payload: UpdateAbsenciaPayload = {
            inici,
            fi,
            motiu: motiu.trim() || undefined,
        };
        try {
            await mutateAsync({ id: absencia.id, payload });
            onSuccess();
            onClose();
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? e?.message ?? 'Error en actualitzar l\'absència.';
            setApiError(Array.isArray(msg) ? msg.join(', ') : msg);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.modal, isDesktop && styles.modalDesktop]}>

                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Editar absència</Text>
                        <TouchableOpacity onPress={onClose} disabled={isPending}>
                            <Ionicons name="close" size={24} color={HC.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.scroll}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.hint}>Format de dates: AAAA-MM-DD</Text>

                        <Text style={styles.label}>Data inici *</Text>
                        <TextInput
                            style={[styles.input, !iniValid && inici.length > 0 && styles.inputError]}
                            value={inici}
                            onChangeText={setInici}
                            placeholder="2026-06-01"
                            placeholderTextColor={HC.textMuted}
                            autoCapitalize="none"
                            editable={!isPending}
                        />

                        <Text style={styles.label}>Data fi *</Text>
                        <TextInput
                            style={[styles.input, !fiValid && fi.length > 0 && styles.inputError]}
                            value={fi}
                            onChangeText={setFi}
                            placeholder="2026-06-07"
                            placeholderTextColor={HC.textMuted}
                            autoCapitalize="none"
                            editable={!isPending}
                        />
                        {fiValid && iniValid && fi < inici && (
                            <Text style={styles.fieldError}>La data fi ha de ser posterior a l'inici.</Text>
                        )}

                        <Text style={styles.label}>Motiu (opcional)</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Descriu el motiu..."
                            placeholderTextColor={HC.textMuted}
                            value={motiu}
                            onChangeText={setMotiu}
                            multiline
                            numberOfLines={3}
                            editable={!isPending}
                        />

                        {apiError && (
                            <View style={styles.errorBox}>
                                <Ionicons name="alert-circle-outline" size={16} color={HC.red} />
                                <Text style={styles.errorText}>{apiError}</Text>
                            </View>
                        )}
                    </ScrollView>

                    <View style={[styles.footer, isDesktop && styles.footerDesktop]}>
                        <TouchableOpacity style={styles.btnCancel} onPress={onClose} disabled={isPending} activeOpacity={0.7}>
                            <Text style={styles.btnCancelText}>Cancel·lar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.btnSave, !canSave && styles.btnDisabled]}
                            onPress={handleSave}
                            disabled={!canSave}
                            activeOpacity={0.8}
                        >
                            {isPending
                                ? <ActivityIndicator size="small" color={HC.white} />
                                : <Text style={styles.btnSaveText}>Desar</Text>
                            }
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
        maxWidth: 440,
        height: 'auto' as any,
        maxHeight: '80%',
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
    scroll: { flex: 1 },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
        gap: 4,
    },
    hint: {
        fontSize: 12,
        color: HC.textMuted,
        marginBottom: 12,
        fontStyle: 'italic',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: HC.textPrimary,
        marginBottom: 8,
        marginTop: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: HC.border,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: HC.textPrimary,
        backgroundColor: HC.screenBg,
        marginBottom: 4,
    },
    inputError: {
        borderColor: HC.red,
    },
    fieldError: {
        fontSize: 12,
        color: HC.red,
        marginBottom: 4,
    },
    textArea: {
        borderWidth: 1,
        borderColor: HC.border,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: HC.textPrimary,
        backgroundColor: HC.screenBg,
        minHeight: 80,
        textAlignVertical: 'top',
        marginBottom: 4,
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        backgroundColor: HC.redLight,
        borderRadius: 8,
        padding: 12,
        marginTop: 8,
    },
    errorText: {
        fontSize: 13,
        color: HC.red,
        flex: 1,
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
        paddingHorizontal: 20,
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
        minWidth: 100,
        alignItems: 'center',
    },
    btnDisabled: { opacity: 0.5 },
    btnSaveText: {
        fontSize: 14,
        fontWeight: '600',
        color: HC.white,
    },
});
