import React, { useState, useEffect, useCallback } from 'react';
import {
    Modal, View, Text, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator, ScrollView,
    useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, radius, shadow } from '@/constants/theme';
import { useTheme } from '@/core/theme/ThemeProvider';
import {
    createHorariTram, deleteHorariTram,
    type HorariEmpresa,
} from '../../services/horari-empresa.service';

/* ── Helpers ────────────────────────────── */

const DOW_SHORT = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'];
const DOW_FULL  = ['Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte', 'Diumenge'];

export const minsToHHMM = (mins: number) => {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
};

const HHMMToMins = (s: string): number | null => {
    const parts = s.trim().split(':');
    if (parts.length !== 2) return null;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
    return h * 60 + m;
};

/* ── Draft types ────────────────────────── */

interface DraftTram { id?: number; iniciMin: number; fiMin: number; }
type DraftState = DraftTram[][];

const buildDraft = (trams: HorariEmpresa[]): DraftState =>
    Array.from({ length: 7 }, (_, i) =>
        trams.filter(t => t.dow === i).map(t => ({ id: t.id, iniciMin: t.iniciMin, fiMin: t.fiMin }))
    );

/* ── Shared time-range row ──────────────── */

interface TimeRangeRowProps {
    inici: string; fi: string;
    onChangeInici: (v: string) => void;
    onChangeFi: (v: string) => void;
}
const TimeRangeRow: React.FC<TimeRangeRowProps> = ({ inici, fi, onChangeInici, onChangeFi }) => (
    <View style={styles.timeRangeRow}>
        <TextInput
            style={styles.timeInput}
            value={inici}
            onChangeText={onChangeInici}
            placeholder="09:00"
            placeholderTextColor={palette.textMuted}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
            selectTextOnFocus
        />
        <Text style={styles.timeSep}>–</Text>
        <TextInput
            style={styles.timeInput}
            value={fi}
            onChangeText={onChangeFi}
            placeholder="18:00"
            placeholderTextColor={palette.textMuted}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
            selectTextOnFocus
        />
    </View>
);

/* ── EditScheduleModal ──────────────────── */

interface EditScheduleModalProps {
    visible: boolean;
    trams: HorariEmpresa[];
    empresaId: number;
    onClose: () => void;
    onSaved: () => void;
}

export const EditScheduleModal: React.FC<EditScheduleModalProps> = ({
    visible, trams, empresaId, onClose, onSaved,
}) => {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const theme = useTheme();

    const [draft, setDraft] = useState<DraftState>(() => buildDraft(trams));
    const [addingDow, setAddingDow] = useState<number | null>(null);
    const [addInici, setAddInici] = useState('09:00');
    const [addFi, setAddFi] = useState('18:00');
    const [addError, setAddError] = useState('');

    const [rangDays, setRangDays] = useState<boolean[]>(Array(7).fill(false));
    const [rangInici, setRangInici] = useState('09:00');
    const [rangFi, setRangFi] = useState('18:00');
    const [rangError, setRangError] = useState('');

    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    useEffect(() => {
        if (visible) {
            setDraft(buildDraft(trams));
            setAddingDow(null);
            setAddInici('09:00');
            setAddFi('18:00');
            setAddError('');
            setRangDays(Array(7).fill(false));
            setRangInici('09:00');
            setRangFi('18:00');
            setRangError('');
            setSaving(false);
            setSaveError('');
        }
    }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

    /* ── Rang general ── */

    const toggleRangDay = useCallback((dow: number) => {
        setRangDays(prev => { const n = [...prev]; n[dow] = !n[dow]; return n; });
    }, []);

    const handleApplyRang = useCallback(() => {
        setRangError('');
        const ini = HHMMToMins(rangInici);
        const fi  = HHMMToMins(rangFi);
        if (ini === null || fi === null) { setRangError('Format invàlid. Usa HH:MM (ex: 09:00)'); return; }
        if (ini >= fi) { setRangError("L'inici ha de ser anterior a la fi"); return; }
        if (!rangDays.some(Boolean)) { setRangError('Selecciona almenys un dia'); return; }
        setDraft(prev => {
            const next = prev.map(d => [...d]);
            rangDays.forEach((sel, dow) => { if (sel) next[dow] = [...next[dow], { iniciMin: ini, fiMin: fi }]; });
            return next;
        });
        setRangDays(Array(7).fill(false));
        setRangInici('09:00');
        setRangFi('18:00');
    }, [rangDays, rangInici, rangFi]);

    /* ── Per-day add ── */

    const handleOpenAdd = useCallback((dow: number) => {
        setAddInici('09:00'); setAddFi('18:00'); setAddError('');
        setAddingDow(dow);
    }, []);

    const handleConfirmAdd = useCallback(() => {
        setAddError('');
        const ini = HHMMToMins(addInici);
        const fi  = HHMMToMins(addFi);
        if (ini === null || fi === null) { setAddError('Format invàlid (HH:MM)'); return; }
        if (ini >= fi) { setAddError("L'inici ha de ser anterior a la fi"); return; }
        setDraft(prev => {
            const next = prev.map(d => [...d]);
            next[addingDow!] = [...next[addingDow!], { iniciMin: ini, fiMin: fi }];
            return next;
        });
        setAddingDow(null);
    }, [addingDow, addInici, addFi]);

    const handleRemoveTram = useCallback((dow: number, idx: number) => {
        setDraft(prev => {
            const next = prev.map(d => [...d]);
            next[dow] = next[dow].filter((_, i) => i !== idx);
            return next;
        });
    }, []);

    /* ── Save ── */

    const handleSave = useCallback(async () => {
        setSaving(true); setSaveError('');
        try {
            const originalIds = new Set(trams.map(t => t.id));
            const keptIds = new Set<number>();
            const toCreate: { dow: number; iniciMin: number; fiMin: number }[] = [];

            draft.forEach((dayTrams, dow) => {
                dayTrams.forEach(t => {
                    if (t.id !== undefined) keptIds.add(t.id);
                    else toCreate.push({ dow, iniciMin: t.iniciMin, fiMin: t.fiMin });
                });
            });

            const toDelete = [...originalIds].filter(id => !keptIds.has(id));

            await Promise.all([
                ...toDelete.map(id => deleteHorariTram(empresaId, id)),
                ...toCreate.map(t  => createHorariTram(empresaId, t)),
            ]);

            onSaved();
            onClose();
        } catch {
            setSaveError('Error en guardar. Torna-ho a intentar.');
        } finally {
            setSaving(false);
        }
    }, [draft, trams, empresaId, onSaved, onClose]);

    /* ── Render ── */

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.modal, isDesktop && styles.modalDesktop]}>

                    {/* ── Header ── */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Editar horari d'obertura</Text>
                        <TouchableOpacity onPress={onClose} disabled={saving}>
                            <Ionicons name="close" size={24} color={palette.textMuted} />
                        </TouchableOpacity>
                    </View>

                    {/* ── Scrollable content ── */}
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* ── Rang general section ── */}
                        <Text style={styles.sectionTitle}>Aplicar rang a múltiples dies</Text>

                        {/* Day pills */}
                        <View style={styles.dayPills}>
                            {DOW_SHORT.map((label, dow) => (
                                <TouchableOpacity
                                    key={dow}
                                    onPress={() => toggleRangDay(dow)}
                                    style={[
                                        styles.dayPill,
                                        rangDays[dow] && { backgroundColor: theme.primary, borderColor: theme.primary },
                                    ]}
                                >
                                    <Text style={[styles.dayPillText, rangDays[dow] && styles.dayPillTextActive]}>
                                        {label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Time range */}
                        <Text style={styles.label}>Rang horari</Text>
                        <TimeRangeRow
                            inici={rangInici} fi={rangFi}
                            onChangeInici={v => { setRangInici(v); setRangError(''); }}
                            onChangeFi={v => { setRangFi(v); setRangError(''); }}
                        />
                        {rangError ? <Text style={styles.errorText}>{rangError}</Text> : null}

                        <TouchableOpacity
                            style={[styles.applyBtn, { backgroundColor: theme.primary }]}
                            onPress={handleApplyRang}
                        >
                            <Ionicons name="checkmark" size={15} color="#fff" />
                            <Text style={styles.applyBtnText}>Aplicar als dies seleccionats</Text>
                        </TouchableOpacity>

                        {/* ── Days section ── */}
                        <Text style={[styles.sectionTitle, { marginTop: spacing.xxl }]}>Dies de la setmana</Text>

                        {draft.map((dayTrams, dow) => (
                            <View key={dow} style={[styles.dayRow, dow < 6 && styles.dayRowBorder]}>

                                {/* Day header row */}
                                <View style={styles.dayLabelRow}>
                                    <View style={[styles.dayBadge, { backgroundColor: theme.primary + '18' }]}>
                                        <Text style={[styles.dayBadgeText, { color: theme.primary }]}>{DOW_SHORT[dow]}</Text>
                                    </View>
                                    <Text style={styles.dayName}>{DOW_FULL[dow]}</Text>
                                    {addingDow !== dow && (
                                        <TouchableOpacity
                                            style={[styles.addDayBtn, { borderColor: theme.primary }]}
                                            onPress={() => handleOpenAdd(dow)}
                                        >
                                            <Ionicons name="add" size={16} color={theme.primary} />
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {/* Tram chips */}
                                {dayTrams.length === 0 && addingDow !== dow && (
                                    <Text style={styles.tancat}>Tancat</Text>
                                )}
                                {dayTrams.length > 0 && (
                                    <View style={styles.chips}>
                                        {dayTrams.map((t, idx) => (
                                            <View key={idx} style={styles.chip}>
                                                <Text style={styles.chipText}>
                                                    {minsToHHMM(t.iniciMin)} – {minsToHHMM(t.fiMin)}
                                                </Text>
                                                {!t.id && (
                                                    <View style={styles.newBadge}>
                                                        <Text style={styles.newBadgeText}>nou</Text>
                                                    </View>
                                                )}
                                                <TouchableOpacity
                                                    onPress={() => handleRemoveTram(dow, idx)}
                                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                                >
                                                    <Ionicons name="close-circle" size={16} color={palette.danger} />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Inline add form */}
                                {addingDow === dow && (
                                    <View style={styles.addForm}>
                                        <TimeRangeRow
                                            inici={addInici} fi={addFi}
                                            onChangeInici={v => { setAddInici(v); setAddError(''); }}
                                            onChangeFi={v => { setAddFi(v); setAddError(''); }}
                                        />
                                        {addError ? <Text style={styles.errorText}>{addError}</Text> : null}
                                        <View style={styles.addFormBtns}>
                                            <TouchableOpacity
                                                style={[styles.addConfirmBtn, { backgroundColor: theme.primary }]}
                                                onPress={handleConfirmAdd}
                                            >
                                                <Text style={styles.addConfirmText}>Afegir</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.addCancelBtn}
                                                onPress={() => setAddingDow(null)}
                                            >
                                                <Text style={styles.addCancelText}>Cancel·lar</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </View>
                        ))}

                        {saveError ? (
                            <Text style={[styles.errorText, { marginTop: spacing.md }]}>{saveError}</Text>
                        ) : null}
                    </ScrollView>

                    {/* ── Footer ── */}
                    <View style={[styles.footer, isDesktop && styles.footerDesktop]}>
                        <TouchableOpacity
                            style={styles.btnCancel}
                            onPress={onClose}
                            activeOpacity={0.7}
                            disabled={saving}
                        >
                            <Text style={styles.btnCancelText}>Cancel·lar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.btnSave, { backgroundColor: theme.primary }, saving && styles.btnSaveDisabled]}
                            onPress={handleSave}
                            activeOpacity={0.8}
                            disabled={saving}
                        >
                            {saving
                                ? <ActivityIndicator size="small" color="#fff" />
                                : <Text style={styles.btnSaveText}>Desar canvis</Text>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

/* ── Styles ─────────────────────────────── */

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

    /* Header */
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

    /* Scroll */
    scrollView: { flex: 1 },
    scrollContent: {
        padding: spacing.xl,
        paddingBottom: 40,
    },

    /* Section titles */
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: palette.textPrimary,
        marginBottom: spacing.lg,
    },

    /* Day pills */
    dayPills: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    dayPill: {
        paddingHorizontal: spacing.lg,
        paddingVertical: 8,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: palette.background,
    },
    dayPillText: {
        fontSize: 13,
        fontWeight: '700',
        color: palette.textPrimary,
    },
    dayPillTextActive: { color: '#fff' },

    /* Time range row */
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: palette.textPrimary,
        marginBottom: spacing.sm,
        marginTop: spacing.md,
    },
    timeRangeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    timeInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: palette.border,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        fontSize: 18,
        fontWeight: '700',
        color: palette.textPrimary,
        textAlign: 'center',
        backgroundColor: '#f8fafc',
    },
    timeSep: {
        fontSize: 18,
        fontWeight: '600',
        color: palette.textMuted,
    },

    /* Apply button */
    applyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        borderRadius: radius.md,
        paddingVertical: spacing.md,
        marginTop: spacing.lg,
    },
    applyBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },

    /* Days */
    dayRow: { paddingVertical: spacing.lg },
    dayRowBorder: { borderBottomWidth: 1, borderBottomColor: palette.borderSoft },
    dayLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.sm,
    },
    dayBadge: {
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayBadgeText: { fontSize: 12, fontWeight: '800' },
    dayName: { flex: 1, fontSize: 14, fontWeight: '600', color: palette.textPrimary },
    addDayBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tancat: {
        fontSize: 13,
        fontStyle: 'italic',
        color: palette.textMuted,
        marginLeft: 44,
    },
    chips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginLeft: 44,
        marginTop: spacing.xs,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: palette.border,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: '#f8fafc',
    },
    chipText: { fontSize: 13, fontWeight: '600', color: palette.textPrimary },
    newBadge: {
        backgroundColor: '#22c55e',
        borderRadius: 4,
        paddingHorizontal: 4,
        paddingVertical: 1,
    },
    newBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },

    /* Inline add form */
    addForm: {
        marginLeft: 44,
        marginTop: spacing.sm,
        padding: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: '#f8fafc',
        gap: spacing.sm,
    },
    addFormBtns: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.xs,
    },
    addConfirmBtn: {
        flex: 1,
        borderRadius: radius.md,
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    addConfirmText: { fontSize: 13, fontWeight: '700', color: '#fff' },
    addCancelBtn: {
        flex: 1,
        borderRadius: radius.md,
        paddingVertical: spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: palette.background,
    },
    addCancelText: { fontSize: 13, fontWeight: '600', color: palette.textMuted },

    /* Error */
    errorText: {
        color: '#dc2626',
        fontSize: 13,
        marginTop: spacing.sm,
        backgroundColor: '#fee2e2',
        padding: spacing.md,
        borderRadius: radius.md,
        overflow: 'hidden',
    },

    /* Footer */
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
    btnCancelText: { fontSize: 14, fontWeight: '600', color: palette.textPrimary },
    btnSave: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: radius.md,
        minWidth: 120,
        alignItems: 'center',
    },
    btnSaveDisabled: { opacity: 0.7 },
    btnSaveText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
