import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    useWindowDimensions,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC, cardShadow } from '@/features/home/constants/inicio.constants';
import { useCreateAbsencia } from '../../hooks/useVacaciones';
import type { TipusAbsenciaTreballador } from '../../types/vacaciones.types';

/* ── Types ──────────────────────────────── */
const TIPUS_OPTIONS: { value: TipusAbsenciaTreballador; label: string; icon: string }[] = [
    { value: 'VACANCES', label: 'Vacances', icon: 'airplane-outline' },
    { value: 'MALALTIA', label: 'Malaltia', icon: 'medical-outline' },
    { value: 'PERMIS',   label: 'Permís',   icon: 'document-text-outline' },
    { value: 'ALTRE',    label: 'Altre',    icon: 'ellipsis-horizontal-outline' },
];

/* ── Helpers ────────────────────────────── */
function fmtDate(d: string): string {
    return new Date(d).toLocaleDateString('ca-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

function daysBetween(start: string, end: string): number {
    return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000) + 1;
}

/* ── Props ──────────────────────────────── */
type Props = {
    visible: boolean;
    inici: string;
    fi: string;
    diesVacancesAnuals: number;
    vacancesUsed: number;
    onClose: () => void;
    onSuccess: () => void;
};

/* ── Component ──────────────────────────── */
export function CreateAbsenciaModal({ visible, inici, fi, diesVacancesAnuals, vacancesUsed, onClose, onSuccess }: Props) {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;

    const [tipus, setTipus] = useState<TipusAbsenciaTreballador>('VACANCES');
    const [motiu, setMotiu] = useState('');
    const [apiError, setApiError] = useState<string | null>(null);

    const { mutateAsync, isPending } = useCreateAbsencia();

    useEffect(() => {
        if (visible) {
            setTipus('VACANCES');
            setMotiu('');
            setApiError(null);
        }
    }, [visible]);

    const daysSelected = inici && fi ? daysBetween(inici, fi) : 0;
    const diasDisponibles = diesVacancesAnuals - vacancesUsed;
    const insufficientDays = tipus === 'VACANCES' && daysSelected > diasDisponibles;

    const handleConfirm = async () => {
        if (insufficientDays) return;
        setApiError(null);
        try {
            await mutateAsync({ inici, fi, tipus, motiu: motiu.trim() || undefined });
            onSuccess();
            onClose();
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? e?.message ?? 'Error en crear l\'absència.';
            setApiError(Array.isArray(msg) ? msg.join(', ') : msg);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.modal, isDesktop && styles.modalDesktop]}>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Sol·licitar absència</Text>
                        <TouchableOpacity onPress={onClose} disabled={isPending}>
                            <Ionicons name="close" size={24} color={HC.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Date range card */}
                        <View style={styles.dateCard}>
                            <View style={styles.dateRow}>
                                <View style={styles.dateCol}>
                                    <Text style={styles.dateLabel}>INICI</Text>
                                    <Text style={styles.dateValue}>{fmtDate(inici)}</Text>
                                </View>
                                <Ionicons name="arrow-forward" size={16} color={HC.textMuted} style={styles.dateArrow} />
                                <View style={styles.dateCol}>
                                    <Text style={styles.dateLabel}>FI</Text>
                                    <Text style={styles.dateValue}>{fmtDate(fi)}</Text>
                                </View>
                            </View>
                            <View style={styles.dateDivider} />
                            <View style={styles.daysRow}>
                                <Ionicons name="calendar-outline" size={14} color={HC.primary} />
                                <Text style={styles.daysText}>
                                    {daysSelected} {daysSelected === 1 ? 'dia seleccionat' : 'dies seleccionats'}
                                </Text>
                            </View>
                        </View>

                        {/* Quota info (VACANCES only) */}
                        {tipus === 'VACANCES' && (
                            <View style={[styles.quotaCard, insufficientDays && styles.quotaCardError]}>
                                <Ionicons
                                    name={insufficientDays ? 'warning-outline' : 'checkmark-circle-outline'}
                                    size={16}
                                    color={insufficientDays ? HC.red : '#22C55E'}
                                />
                                <Text style={[styles.quotaText, insufficientDays && styles.quotaTextError]}>
                                    {insufficientDays
                                        ? `No hi ha prou dies disponibles. Tens ${diasDisponibles} dies i en demanes ${daysSelected}.`
                                        : `${diasDisponibles} dies disponibles de ${diesVacancesAnuals}`}
                                </Text>
                            </View>
                        )}

                        {/* Tipus */}
                        <Text style={styles.label}>Tipus d'absència *</Text>
                        <View style={styles.tipusGrid}>
                            {TIPUS_OPTIONS.map(opt => {
                                const isActive = tipus === opt.value;
                                return (
                                    <TouchableOpacity
                                        key={opt.value}
                                        style={[styles.tipusCard, isActive && styles.tipusCardActive]}
                                        onPress={() => setTipus(opt.value)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons
                                            name={opt.icon as any}
                                            size={20}
                                            color={isActive ? HC.primary : HC.textMuted}
                                        />
                                        <Text style={[styles.tipusLabel, isActive && styles.tipusLabelActive]}>
                                            {opt.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Motiu */}
                        <Text style={styles.label}>Motiu (opcional)</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Descriu el motiu de l'absència..."
                            placeholderTextColor={HC.textMuted}
                            value={motiu}
                            onChangeText={setMotiu}
                            multiline
                            numberOfLines={3}
                            editable={!isPending}
                        />

                        {/* API error */}
                        {apiError && (
                            <View style={styles.errorBox}>
                                <Ionicons name="alert-circle-outline" size={16} color={HC.red} />
                                <Text style={styles.errorText}>{apiError}</Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* Footer */}
                    <View style={[styles.footer, isDesktop && styles.footerDesktop]}>
                        <TouchableOpacity style={styles.btnCancel} onPress={onClose} disabled={isPending} activeOpacity={0.7}>
                            <Text style={styles.btnCancelText}>Cancel·lar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.btnConfirm, (isPending || insufficientDays) && styles.btnDisabled]}
                            onPress={handleConfirm}
                            disabled={isPending || insufficientDays}
                            activeOpacity={0.8}
                        >
                            {isPending
                                ? <ActivityIndicator size="small" color={HC.white} />
                                : <Text style={styles.btnConfirmText}>Sol·licitar</Text>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

/* ── Styles ─────────────────────────────── */
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
        gap: 4,
    },
    dateCard: {
        backgroundColor: HC.screenBg,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateCol: {
        flex: 1,
    },
    dateArrow: {
        marginHorizontal: 8,
    },
    dateLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: HC.textMuted,
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    dateValue: {
        fontSize: 14,
        fontWeight: '600',
        color: HC.textPrimary,
    },
    dateDivider: {
        height: 1,
        backgroundColor: HC.border,
        marginVertical: 12,
    },
    daysRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    daysText: {
        fontSize: 13,
        fontWeight: '600',
        color: HC.primary,
    },
    quotaCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#F0FDF4',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
    },
    quotaCardError: {
        backgroundColor: HC.redLight,
    },
    quotaText: {
        fontSize: 13,
        color: '#166534',
        flex: 1,
    },
    quotaTextError: {
        color: HC.red,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: HC.textPrimary,
        marginBottom: 10,
        marginTop: 8,
    },
    tipusGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 4,
    },
    tipusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: HC.border,
        backgroundColor: HC.white,
        minWidth: '45%',
        flex: 1,
    },
    tipusCardActive: {
        borderColor: HC.primary,
        backgroundColor: HC.primaryLight,
    },
    tipusLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: HC.textSecondary,
    },
    tipusLabelActive: {
        color: HC.primary,
        fontWeight: '700',
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
    btnConfirm: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: HC.primary,
        minWidth: 120,
        alignItems: 'center',
    },
    btnDisabled: {
        opacity: 0.5,
    },
    btnConfirmText: {
        fontSize: 14,
        fontWeight: '600',
        color: HC.white,
    },
});
