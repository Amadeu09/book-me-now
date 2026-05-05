import React, { useState } from 'react';
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
import { palette, spacing, radius, shadow } from "@/constants/theme";
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';
import type { ApiTreballador, ApiServei, ApiClient } from '../types';
import { createReserva, fetchClientsByEmpresa } from '../services/calendarApi';
import { DatePickerField } from '@/features/horarios/components/DatePickerField';
import { TimePickerField } from './TimePickerField';
import { getEmpresaId } from '@/utils/session';

interface CreateBookingModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    workers: ApiTreballador[];
    services: ApiServei[];
}

export const CreateBookingModal: React.FC<CreateBookingModalProps> = ({
    visible,
    onClose,
    onSuccess,
    workers,
    services
}) => {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const theme = useTheme();
    const { t } = useLanguage();

    // Form State
    const [nom, setNom] = useState('');
    const [email, setEmail] = useState('');
    const [telefon, setTelefon] = useState('');
    const [data, setData] = useState('');
    const [hora, setHora] = useState('');
    const [observacions, setObservacions] = useState('');
    const [idServei, setIdServei] = useState<number | null>(null);
    const [idTreballador, setIdTreballador] = useState<number | null>(null);

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Client picker
    const [showPicker, setShowPicker] = useState(false);
    const [clients, setClients] = useState<ApiClient[]>([]);
    const [clientSearch, setClientSearch] = useState('');
    const [loadingClients, setLoadingClients] = useState(false);

    const handleClose = () => {
        if (isSubmitting) return;
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setNom('');
        setEmail('');
        setTelefon('');
        setData('');
        setHora('');
        setObservacions('');
        setIdServei(null);
        setIdTreballador(null);
        setError('');
        setShowPicker(false);
        setClients([]);
        setClientSearch('');
    };

    const handleOpenPicker = async () => {
        if (showPicker) { setShowPicker(false); return; }
        setLoadingClients(true);
        setShowPicker(true);
        try {
            const empresaId = await getEmpresaId();
            if (!empresaId) return;
            const data = await fetchClientsByEmpresa(empresaId);
            setClients(data);
        } catch {
            setClients([]);
        } finally {
            setLoadingClients(false);
        }
    };

    const handleSelectClient = (client: ApiClient) => {
        setNom(client.nom);
        setEmail(client.email ?? '');
        setTelefon(client.telefon ?? '');
        setShowPicker(false);
        setClientSearch('');
    };

    const filteredClients = clients.filter(c =>
        c.nom.toLowerCase().includes(clientSearch.toLowerCase()) ||
        (c.email ?? '').toLowerCase().includes(clientSearch.toLowerCase()) ||
        (c.telefon ?? '').includes(clientSearch),
    );

    const handleSave = async () => {
        setError('');
        
        if (!nom.trim() || !data.trim() || !hora.trim() || !idServei || !idTreballador) {
            setError(t('bookingFieldsRequired'));
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                nom: nom.trim(),
                ...(email.trim() && { email: email.trim() }),
                ...(telefon.trim() && { telefon: telefon.trim() }),
                data: data.trim(),
                hora: hora.trim(),
                observacions: observacions.trim(),
                idServei,
                idTreballador
            };

            await createReserva(payload);
            
            resetForm();
            onSuccess();
            onClose();
        } catch (err: unknown) {
            console.error('Error creating booking:', err);
            const axiosErr = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
            const status = axiosErr?.response?.status;
            const rawMsg = axiosErr?.response?.data?.message || axiosErr?.message || '';
            const msg = status === 409
                ? t('bookingNoAvailability')
                : Array.isArray(rawMsg) ? rawMsg.join(', ') : rawMsg || t('bookingCreateError');
            setError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.modal, isDesktop && styles.modalDesktop]}>

                    {/* ── Header ────────────────── */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>{t('bookingCreateTitle')}</Text>
                        <TouchableOpacity onPress={handleClose} disabled={isSubmitting}>
                            <Ionicons name="close" size={24} color={palette.textMuted} />
                        </TouchableOpacity>
                    </View>

                    {/* ── Scrollable content ────── */}
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <View style={styles.sectionRow}>
                            <Text style={styles.sectionTitle}>{t('bookingClientData')}</Text>
                            <TouchableOpacity
                                style={[styles.pickerBtn, showPicker && { backgroundColor: theme.primary }]}
                                onPress={handleOpenPicker}
                                disabled={isSubmitting}
                            >
                                <Ionicons name="search" size={13} color={showPicker ? '#fff' : theme.primary} />
                                <Text style={[styles.pickerBtnText, showPicker && { color: '#fff' }]}>
                                    {t('bookingSearchExisting')}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {showPicker && (
                            <View style={styles.pickerPanel}>
                                <TextInput
                                    style={styles.pickerSearch}
                                    placeholder={t('bookingSearchPh')}
                                    value={clientSearch}
                                    onChangeText={setClientSearch}
                                    autoFocus
                                />
                                {loadingClients ? (
                                    <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 12 }} />
                                ) : filteredClients.length === 0 ? (
                                    <Text style={styles.pickerEmpty}>{t('bookingNoClient')}</Text>
                                ) : (
                                    <ScrollView style={styles.pickerList} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                                        {filteredClients.map(c => (
                                            <TouchableOpacity
                                                key={c.id}
                                                style={styles.pickerItem}
                                                onPress={() => handleSelectClient(c)}
                                            >
                                                <View style={styles.pickerItemAvatar}>
                                                    <Text style={[styles.pickerItemInitial, { color: theme.primary }]}>
                                                        {c.nom.charAt(0).toUpperCase()}
                                                    </Text>
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.pickerItemNom}>{c.nom}</Text>
                                                    {(c.email || c.telefon) && (
                                                        <Text style={styles.pickerItemSub}>
                                                            {[c.email, c.telefon].filter(Boolean).join(' · ')}
                                                        </Text>
                                                    )}
                                                </View>
                                                <Ionicons name="chevron-forward" size={14} color={palette.textMuted} />
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                )}
                            </View>
                        )}

                        <Text style={styles.label}>{t('bookingFullName')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={t('bookingFullNamePh')}
                            value={nom}
                            onChangeText={setNom}
                            editable={!isSubmitting}
                        />

                        <Text style={styles.label}>{t('bookingEmailLabel')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={t('bookingEmailPh')}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!isSubmitting}
                        />

                        <Text style={styles.label}>{t('bookingPhoneLabel')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={t('bookingPhonePh')}
                            value={telefon}
                            onChangeText={setTelefon}
                            keyboardType="phone-pad"
                            editable={!isSubmitting}
                        />

                        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>{t('bookingDetails')}</Text>

                        <View style={styles.row}>
                            <View style={[styles.col, { paddingRight: 8 }]}>
                                <Text style={styles.label}>{t('bookingDateLabel')}</Text>
                                <DatePickerField
                                    value={data}
                                    onChange={setData}
                                    placeholder={t('bookingDatePh')}
                                    disabled={isSubmitting}
                                />
                            </View>
                            <View style={[styles.col, { paddingLeft: 8 }]}>
                                <Text style={styles.label}>{t('bookingHourLabel')}</Text>
                                <TimePickerField
                                    value={hora}
                                    onChange={setHora}
                                    placeholder={t('bookingHourPh')}
                                    disabled={isSubmitting}
                                />
                            </View>
                        </View>

                        <Text style={styles.label}>{t('bookingWorkerLabel')}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                            {workers.map((w: any) => {
                                const isSelected = idTreballador === w.id;
                                return (
                                    <TouchableOpacity
                                        key={w.id}
                                        style={[styles.chip, isSelected && { borderColor: theme.primary, backgroundColor: theme.primary }]}
                                        onPress={() => setIdTreballador(isSelected ? null : w.id)}
                                    >
                                        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                                            {w.nom}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        <Text style={styles.label}>{t('bookingServiceLabel')}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                            {services.map((s: any) => {
                                const isSelected = idServei === s.id;
                                return (
                                    <TouchableOpacity
                                        key={s.id}
                                        style={[styles.chip, isSelected && { borderColor: theme.primary, backgroundColor: theme.primary }]}
                                        onPress={() => setIdServei(isSelected ? null : s.id)}
                                    >
                                        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                                            {s.nom}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        <Text style={styles.label}>{t('bookingNotesLabel')}</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder={t('bookingNotesPh')}
                            value={observacions}
                            onChangeText={setObservacions}
                            editable={!isSubmitting}
                            multiline
                            numberOfLines={3}
                        />
                    </ScrollView>

                    {/* ── Footer ────────────────── */}
                    <View style={[styles.footer, isDesktop && styles.footerDesktop]}>
                        <TouchableOpacity
                            style={styles.btnCancel}
                            onPress={handleClose}
                            activeOpacity={0.7}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.btnCancelText}>{t('cancel')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.btnSave, { backgroundColor: theme.primary }, isSubmitting && styles.btnSaveDisabled]}
                            onPress={handleSave}
                            activeOpacity={0.8}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.btnSaveText}>{t('confirm')}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modal: {
        width: '100%',
        height: '100%',
        backgroundColor: palette.background,
        flexDirection: 'column',
    },
    modalDesktop: {
        width: '90%',
        maxWidth: 700,
        height: '90%',
        maxHeight: 700,
        borderRadius: radius.lg,
        ...shadow.card,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: palette.borderSoft,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: palette.textPrimary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.xl,
        paddingBottom: 40,
    },
    sectionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: palette.textPrimary,
    },
    pickerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: '#f8fafc',
    },
    pickerBtnText: {
        fontSize: 12,
        fontWeight: '600',
    },
    pickerPanel: {
        borderWidth: 1,
        borderColor: palette.border,
        borderRadius: radius.md,
        backgroundColor: '#fff',
        marginBottom: spacing.md,
        overflow: 'hidden',
    },
    pickerSearch: {
        borderBottomWidth: 1,
        borderBottomColor: palette.borderSoft,
        paddingHorizontal: spacing.md,
        paddingVertical: 10,
        fontSize: 13,
        color: palette.textPrimary,
    },
    pickerList: {
        maxHeight: 200,
    },
    pickerEmpty: {
        fontSize: 13,
        color: palette.textMuted,
        textAlign: 'center',
        paddingVertical: 16,
    },
    pickerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: spacing.md,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: palette.borderSoft,
    },
    pickerItemAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pickerItemInitial: {
        fontSize: 13,
        fontWeight: '700',
    },
    pickerItemNom: {
        fontSize: 13,
        fontWeight: '600',
        color: palette.textPrimary,
    },
    pickerItemSub: {
        fontSize: 11,
        color: palette.textMuted,
        marginTop: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: palette.textPrimary,
        marginBottom: spacing.sm,
        marginTop: spacing.md,
    },
    input: {
        borderWidth: 1,
        borderColor: palette.border,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        fontSize: 14,
        color: palette.textPrimary,
        backgroundColor: '#f8fafc',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    errorText: {
        color: '#dc2626',
        fontSize: 14,
        marginBottom: spacing.md,
        backgroundColor: '#fee2e2',
        padding: spacing.md,
        borderRadius: radius.md,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.sm,
    },
    col: {
        flex: 1,
    },
    horizontalScroll: {
        flexGrow: 0,
        marginBottom: spacing.md,
    },
    chip: {
        paddingHorizontal: spacing.lg,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: palette.background,
        marginRight: 10,
    },
    chipSelected: {
        borderColor: palette.accent,
        backgroundColor: palette.accent,
    },
    chipText: {
        fontSize: 14,
        color: palette.textPrimary,
    },
    chipTextSelected: {
        color: '#fff',
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: spacing.md,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: palette.borderSoft,
        backgroundColor: palette.background,
    },
    footerDesktop: {
        borderBottomLeftRadius: radius.lg,
        borderBottomRightRadius: radius.lg,
    },
    btnCancel: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: palette.background,
    },
    btnCancelText: {
        fontSize: 14,
        fontWeight: '600',
        color: palette.textPrimary,
    },
    btnSave: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: radius.md,
        backgroundColor: palette.accent,
        minWidth: 120,
        alignItems: 'center',
    },
    btnSaveDisabled: {
        opacity: 0.7,
    },
    btnSaveText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
});
