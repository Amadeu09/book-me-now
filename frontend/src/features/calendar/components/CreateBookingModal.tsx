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
import type { ApiTreballador, ApiServei } from '../types';
import { createReserva } from '../services/calendarApi';

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

    // Form State
    const [nom, setNom] = useState('');
    const [cognoms, setCognoms] = useState('');
    const [email, setEmail] = useState('');
    const [telefon, setTelefon] = useState('');
    const [data, setData] = useState('');
    const [hora, setHora] = useState('');
    const [observacions, setObservacions] = useState('');
    const [idServei, setIdServei] = useState<number | null>(null);
    const [idTreballador, setIdTreballador] = useState<number | null>(null);

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleClose = () => {
        if (isSubmitting) return;
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setNom('');
        setCognoms('');
        setEmail('');
        setTelefon('');
        setData('');
        setHora('');
        setObservacions('');
        setIdServei(null);
        setIdTreballador(null);
        setError('');
    };

    const handleSave = async () => {
        setError('');
        
        if (!nom.trim() || !cognoms.trim() || !email.trim() || !telefon.trim() || !data.trim() || !hora.trim() || !idServei || !idTreballador) {
            setError('Todos los campos son obligatorios excepto observaciones.');
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                nom: nom.trim(),
                cognoms: cognoms.trim(),
                email: email.trim(),
                telefon: telefon.trim(),
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
            const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
            const msg = axiosErr?.response?.data?.message || axiosErr?.message || 'Error al crear la reserva.';
            setError(Array.isArray(msg) ? msg.join(', ') : msg);
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
                        <Text style={styles.headerTitle}>Crear Nueva Reserva</Text>
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

                        <Text style={styles.sectionTitle}>Datos del Cliente</Text>
                        
                        <View style={styles.row}>
                            <View style={[styles.col, { paddingRight: 8 }]}>
                                <Text style={styles.label}>Nombre *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ej. Martí"
                                    value={nom}
                                    onChangeText={setNom}
                                    editable={!isSubmitting}
                                />
                            </View>
                            <View style={[styles.col, { paddingLeft: 8 }]}>
                                <Text style={styles.label}>Apellidos *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ej. Garcia"
                                    value={cognoms}
                                    onChangeText={setCognoms}
                                    editable={!isSubmitting}
                                />
                            </View>
                        </View>

                        <Text style={styles.label}>Email *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej. marti@email.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!isSubmitting}
                        />

                        <Text style={styles.label}>Teléfono *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej. 666777888"
                            value={telefon}
                            onChangeText={setTelefon}
                            keyboardType="phone-pad"
                            editable={!isSubmitting}
                        />

                        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Detalles de la Reserva</Text>

                        <View style={styles.row}>
                            <View style={[styles.col, { paddingRight: 8 }]}>
                                <Text style={styles.label}>Fecha *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="YYYY-MM-DD"
                                    value={data}
                                    onChangeText={setData}
                                    editable={!isSubmitting}
                                />
                            </View>
                            <View style={[styles.col, { paddingLeft: 8 }]}>
                                <Text style={styles.label}>Hora *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="HH:MM"
                                    value={hora}
                                    onChangeText={setHora}
                                    editable={!isSubmitting}
                                />
                            </View>
                        </View>

                        <Text style={styles.label}>Trabajador *</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                            {workers.map((w: any) => {
                                const isSelected = idTreballador === w.id;
                                return (
                                    <TouchableOpacity
                                        key={w.id}
                                        style={[styles.chip, isSelected && styles.chipSelected]}
                                        onPress={() => setIdTreballador(isSelected ? null : w.id)}
                                    >
                                        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                                            {w.nom}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        <Text style={styles.label}>Servicio *</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                            {services.map((s: any) => {
                                const isSelected = idServei === s.id;
                                return (
                                    <TouchableOpacity
                                        key={s.id}
                                        style={[styles.chip, isSelected && styles.chipSelected]}
                                        onPress={() => setIdServei(isSelected ? null : s.id)}
                                    >
                                        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                                            {s.nom}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        <Text style={styles.label}>Observaciones</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Ej. Alergia al tinte"
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
                            <Text style={styles.btnCancelText}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.btnSave, isSubmitting && styles.btnSaveDisabled]}
                            onPress={handleSave}
                            activeOpacity={0.8}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.btnSaveText}>Confirmar</Text>
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
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: palette.textPrimary,
        marginBottom: spacing.md,
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
