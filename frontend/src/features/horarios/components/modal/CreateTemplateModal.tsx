import React, { useState, useCallback, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Alert,
    ActivityIndicator,
    useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC, cardShadow } from '../../constants/horarios.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import {
    createDefaultRotation,
    type JornadaFormState,
    type DiaRotacio,
    type PlantillaSummary,
    type JornadaPlantillaResponse
} from '../../types/jornades.types';
import { createJornada, updateJornada } from '../../services/jornades.service';
import { RotationTabs } from './RotationTabs';
import { WeeklyEditor } from './WeeklyEditor';

/* ──────────────────────────────────────────
   CreateTemplateModal
   Modal completa para crear una plantilla
   de jornada con rotaciones y tramos
   ────────────────────────────────────────── */

interface CreateTemplateModalProps {
    visible: boolean;
    initialData?: JornadaPlantillaResponse;
    onClose: () => void;
    onSuccess?: () => void;
}

const buildInitialState = (): JornadaFormState => ({
    nom: '',
    activa: true,
    rotacions: [createDefaultRotation(0)],
});

export const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({
    visible,
    initialData,
    onClose,
    onSuccess,
}) => {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const theme = useTheme();

    const [form, setForm] = useState<JornadaFormState>(buildInitialState);
    const [activeRotation, setActiveRotation] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    /* Reset cuando se abre */
    useEffect(() => {
        if (visible) {
            if (initialData) {
                // If we have initialData, pre-fill the form
                setForm({
                    nom: initialData.nom,
                    activa: initialData.activa ?? true,
                    // If rotacions exist in initialData, we map them here
                    rotacions: initialData.rotacions && initialData.rotacions.length > 0
                        ? initialData.rotacions.map(r => ({
                            index: r.index,
                            nom: r.nom || `Rotación ${r.index + 1}`,
                            dies: r.dies ? r.dies : createDefaultRotation(r.index).dies
                        }))
                        : [createDefaultRotation(0)]
                });
            } else {
                setForm(buildInitialState());
            }
            setActiveRotation(0);
            setErrors({});
        }
    }, [visible, initialData]);

    /* ── Handlers ─────────────────────── */
    const handleNameChange = useCallback((text: string) => {
        setForm((prev) => ({ ...prev, nom: text }));
        if (errors.nom) setErrors((prev) => ({ ...prev, nom: '' }));
    }, [errors.nom]);

    const handleToggleActiva = useCallback(() => {
        setForm((prev) => ({ ...prev, activa: !prev.activa }));
    }, []);

    const handleAddRotation = useCallback(() => {
        setForm((prev) => {
            const newIndex = prev.rotacions.length;
            return {
                ...prev,
                rotacions: [...prev.rotacions, createDefaultRotation(newIndex)],
            };
        });
    }, []);

    const handleUpdateDay = useCallback((dow: number, updated: DiaRotacio) => {
        setForm((prev) => ({
            ...prev,
            rotacions: prev.rotacions.map((r) => {
                if (r.index !== activeRotation) return r;
                return {
                    ...r,
                    dies: r.dies.map((d) => (d.dow === dow ? updated : d)),
                };
            }),
        }));
    }, [activeRotation]);

    /* ── Validación ───────────────────── */
    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!form.nom.trim()) newErrors.nom = 'El nombre es obligatorio';
        if (form.rotacions.length === 0) newErrors.rotaciones = 'Debe haber al menos una rotación';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /* ── Guardar ──────────────────────── */
    const handleSave = async () => {
        if (!validate()) return;

        // Strip potential DB ids (like id, rotacioId, diaId) to avoid 400 Validation Errors
        const cleanRotacions = form.rotacions.map(r => ({
            index: r.index,
            nom: r.nom,
            dies: r.dies.map(d => ({
                dow: d.dow,
                esDescans: d.esDescans,
                trams: (d.trams || []).map(t => ({
                    iniciMin: t.iniciMin,
                    fiMin: t.fiMin
                }))
            }))
        }));

        const payload = {
            nom: form.nom.trim(),
            activa: form.activa,
            rotacions: cleanRotacions,
        };

        try {
            setLoading(true);
            if (initialData?.id) {
                 await updateJornada(initialData.id, payload);
            } else {
                 await createJornada(payload);
            }
            onSuccess?.();
            onClose();
        } catch (err: any) {
            Alert.alert(
                'Error',
                err?.response?.data?.message || 'No se pudo guardar la plantilla',
            );
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) onClose();
    };

    /* ── Rotación activa ──────────────── */
    const currentRotation = form.rotacions.find((r) => r.index === activeRotation)
        ?? form.rotacions[0];

    /* ── Render ───────────────────────── */
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
                        <Text style={styles.headerTitle}>{initialData ? 'Editar plantilla' : 'Crear plantilla'}</Text>
                        <TouchableOpacity onPress={handleClose} disabled={loading}>
                            <Ionicons name="close" size={24} color={HC.textMuted} />
                        </TouchableOpacity>
                    </View>

                    {/* ── Scrollable content ────── */}
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Bloque info básica */}
                        <View style={[styles.infoCard, isDesktop && styles.infoCardDesktop]}>
                            {/* Nombre */}
                            <View style={isDesktop ? styles.nameBlockDesktop : styles.nameBlock}>
                                <Text style={styles.fieldLabel}>Nombre de la plantilla</Text>
                                <TextInput
                                    style={[styles.input, errors.nom ? styles.inputError : null]}
                                    placeholder="Ej. Jornada Mañana Intensiva"
                                    placeholderTextColor={HC.textLight}
                                    value={form.nom}
                                    onChangeText={handleNameChange}
                                    editable={!loading}
                                />
                                {errors.nom ? <Text style={styles.errorText}>{errors.nom}</Text> : null}
                            </View>

                            {/* Activa toggle */}
                            <TouchableOpacity
                                style={styles.activaBlock}
                                onPress={handleToggleActiva}
                                disabled={loading}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.checkbox, form.activa && { backgroundColor: theme.primary, borderColor: theme.primary }]}>
                                    {form.activa && (
                                        <Ionicons name="checkmark" size={14} color={HC.white} />
                                    )}
                                </View>
                                <View>
                                    <Text style={styles.activaTitle}>Activa</Text>
                                    <Text style={styles.activaSubtitle}>
                                        Las plantillas activas pueden asignarse al personal.
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Sección rotaciones */}
                        <View style={styles.rotationsSection}>
                            <Text style={styles.sectionTitle}>Rotaciones</Text>
                            <Text style={styles.sectionSubtitle}>
                                Cada rotación representa una semana. Las rotaciones se repiten en ciclo.
                            </Text>

                            <RotationTabs
                                rotations={form.rotacions}
                                activeIndex={activeRotation}
                                onSelect={setActiveRotation}
                                onAdd={handleAddRotation}
                            />

                            {/* Editor semanal */}
                            {currentRotation && (
                                <WeeklyEditor
                                    dies={currentRotation.dies}
                                    onUpdateDay={handleUpdateDay}
                                    disabled={loading}
                                />
                            )}
                        </View>
                    </ScrollView>

                    {/* ── Footer ────────────────── */}
                    <View style={[styles.footer, isDesktop && styles.footerDesktop]}>
                        <TouchableOpacity
                            style={styles.btnCancel}
                            onPress={handleClose}
                            disabled={loading}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.btnCancelText}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.btnSave, { backgroundColor: theme.primary }, loading && styles.btnDisabled]}
                            onPress={handleSave}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color={HC.white} size="small" />
                            ) : (
                                <Text style={styles.btnSaveText}>{initialData ? 'Guardar cambios' : 'Guardar plantilla'}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

/* ══════════════════════════════════════════
   Styles
   ══════════════════════════════════════════ */
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    /* ── Modal container ──────────── */
    modal: {
        width: '100%',
        height: '100%',
        backgroundColor: HC.white,
        flexDirection: 'column',
    },
    modalDesktop: {
        width: '90%',
        maxWidth: 920,
        height: '90%',
        maxHeight: 750,
        borderRadius: 16,
        ...cardShadow,
        shadowOpacity: 0.15,
        elevation: 8,
    },

    /* ── Header ───────────────────── */
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

    /* ── Scroll ───────────────────── */
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 16,
    },

    /* ── Info card ─────────────────── */
    infoCard: {
        borderWidth: 1,
        borderColor: HC.border,
        borderRadius: 14,
        padding: 20,
        marginBottom: 28,
    },
    infoCardDesktop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 32,
    },
    nameBlock: {
        marginBottom: 16,
    },
    nameBlockDesktop: {
        flex: 1,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: HC.textPrimary,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: HC.border,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: HC.textPrimary,
        backgroundColor: HC.white,
    },
    inputError: {
        borderColor: '#EF4444',
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        fontWeight: '500',
        marginTop: 4,
    },

    /* Activa block */
    activaBlock: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginTop: 4,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: HC.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },
    checkboxActive: {
        backgroundColor: HC.primary,
        borderColor: HC.primary,
    },
    activaTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: HC.textPrimary,
        marginBottom: 2,
    },
    activaSubtitle: {
        fontSize: 13,
        color: HC.textMuted,
        maxWidth: 260,
    },

    /* ── Rotations section ─────────── */
    rotationsSection: {},
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: HC.textPrimary,
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: HC.textMuted,
        marginBottom: 16,
    },

    /* ── Footer ───────────────────── */
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
        minWidth: 160,
        alignItems: 'center',
    },
    btnSaveText: {
        fontSize: 14,
        fontWeight: '600',
        color: HC.white,
    },
    btnDisabled: {
        opacity: 0.6,
    },
});
