import React, { useState, useEffect } from 'react';
import {
    Modal, View, Text, TextInput, TouchableOpacity,
    StyleSheet, ScrollView, ActivityIndicator, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC, cardShadow } from '../../constants/horarios.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { DatePickerField } from '../DatePickerField';
import type { AbsenciaEmpresa, CreateAbsenciaEmpresaDto, TipusAbsenciaEmpresa } from '../../types/absencies-empresa.types';

const TIPUS_OPTIONS: { key: TipusAbsenciaEmpresa; label: string }[] = [
    { key: 'FESTA_LOCAL',   label: 'Festa Local' },
    { key: 'FESTA_ESTATAL', label: 'Festa Estatal' },
    { key: 'PONT',          label: 'Pont' },
    { key: 'ALTRE',         label: 'Altre' },
];

interface Props {
    visible: boolean;
    initialData?: AbsenciaEmpresa | null;
    onClose: () => void;
    onSubmit: (dto: CreateAbsenciaEmpresaDto) => Promise<void>;
}

export function AbsenciaEmpresaModal({ visible, initialData, onClose, onSubmit }: Props) {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const isEdit = !!initialData;
    const theme = useTheme();

    const [titol, setTitol] = useState('');
    const [inici, setInici] = useState('');
    const [fi, setFi] = useState('');
    const [tipus, setTipus] = useState<TipusAbsenciaEmpresa>('FESTA_LOCAL');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (visible) {
            setTitol(initialData?.titol ?? '');
            setInici(initialData?.inici ? initialData.inici.split('T')[0] : '');
            setFi(
                initialData?.fi && initialData.fi !== initialData.inici
                    ? initialData.fi.split('T')[0]
                    : '',
            );
            setTipus(initialData?.tipus ?? 'FESTA_LOCAL');
            setError('');
        }
    }, [visible, initialData]);

    const handleClose = () => {
        if (isSubmitting) return;
        onClose();
    };

    const handleSubmit = async () => {
        setError('');
        if (!titol.trim()) return setError('El títol és obligatori.');
        if (!inici) return setError('La data d\'inici és obligatòria.');

        setIsSubmitting(true);
        try {
            await onSubmit({ titol: titol.trim(), inici, fi: fi || undefined, tipus });
            onClose();
        } catch (e: any) {
            const msg = e?.response?.data?.message || 'No s\'ha pogut guardar l\'absència.';
            setError(Array.isArray(msg) ? msg.join(', ') : msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
            <View style={styles.overlay}>
                <View style={[styles.modal, isDesktop && styles.modalDesktop]}>

                    {/* ── Header ── */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>
                            {isEdit ? 'Editar absència' : 'Nova absència'}
                        </Text>
                        <TouchableOpacity
                            onPress={handleClose}
                            disabled={isSubmitting}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons name="close" size={24} color={HC.textMuted} />
                        </TouchableOpacity>
                    </View>

                    {/* ── Content ── */}
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {!!error && (
                            <Text style={styles.errorText}>{error}</Text>
                        )}

                        <Text style={styles.label}>Títol *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="ex. Sant Joan, Pont Constitució..."
                            placeholderTextColor={HC.textMuted}
                            value={titol}
                            onChangeText={setTitol}
                            editable={!isSubmitting}
                        />

                        <View style={styles.dateRow}>
                            <View style={styles.dateCol}>
                                <Text style={styles.label}>Data inici *</Text>
                                <DatePickerField
                                    value={inici}
                                    onChange={setInici}
                                    placeholder="Seleccionar inici"
                                    disabled={isSubmitting}
                                />
                            </View>
                            <View style={styles.dateCol}>
                                <Text style={styles.label}>Data fi (opcional)</Text>
                                <DatePickerField
                                    value={fi}
                                    onChange={setFi}
                                    placeholder="Seleccionar fi"
                                    disabled={isSubmitting}
                                />
                            </View>
                        </View>

                        <Text style={styles.label}>Tipus *</Text>
                        <View style={styles.chipsRow}>
                            {TIPUS_OPTIONS.map(opt => (
                                <TouchableOpacity
                                    key={opt.key}
                                    style={[styles.chip, tipus === opt.key && { borderColor: theme.primary, backgroundColor: theme.primary }]}
                                    onPress={() => !isSubmitting && setTipus(opt.key)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.chipText, tipus === opt.key && styles.chipTextActive]}>
                                        {opt.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    {/* ── Footer ── */}
                    <View style={[styles.footer, isDesktop && styles.footerDesktop]}>
                        <TouchableOpacity
                            style={styles.btnCancel}
                            onPress={handleClose}
                            disabled={isSubmitting}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.btnCancelText}>Cancel·lar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.btnSave, { backgroundColor: theme.primary }, isSubmitting && styles.btnSaveDisabled]}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                            activeOpacity={0.8}
                        >
                            {isSubmitting
                                ? <ActivityIndicator color={HC.white} size="small" />
                                : <Text style={styles.btnSaveText}>{isEdit ? 'Guardar' : 'Crear'}</Text>
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
        maxWidth: 520,
        height: 'auto' as any,
        maxHeight: '90%' as any,
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
        paddingBottom: 32,
    },
    errorText: {
        color: HC.red,
        fontSize: 14,
        marginBottom: 12,
        backgroundColor: HC.redLight,
        padding: 12,
        borderRadius: 8,
        overflow: 'hidden',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: HC.textPrimary,
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: HC.border,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        color: HC.textPrimary,
        backgroundColor: HC.screenBg,
    },
    dateRow: {
        flexDirection: 'row',
        gap: 12,
    },
    dateCol: {
        flex: 1,
    },
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 4,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: HC.border,
        backgroundColor: HC.white,
    },
    chipActive: {
        borderColor: HC.primary,
        backgroundColor: HC.primary,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '500',
        color: HC.textPrimary,
    },
    chipTextActive: {
        color: HC.white,
        fontWeight: '600',
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
        backgroundColor: HC.primary,
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
