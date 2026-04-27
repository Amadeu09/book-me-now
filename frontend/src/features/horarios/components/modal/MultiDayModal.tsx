import React, { useState, useCallback } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC, cardShadow } from '../../constants/horarios.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { DOW_LABELS, type Tram } from '../../types/jornades.types';
import { TimelinePainter } from './TimelinePainter';
import { TimeRangeItem } from './TimeRangeItem';

/* ──────────────────────────────────────────
   MultiDayModal – popup that lets the user
   pick several days of the week and paint
   a shared time range, then apply it to all
   selected days of the current rotation.
   ────────────────────────────────────────── */

interface MultiDayModalProps {
    visible: boolean;
    onClose: () => void;
    /** Called with the selected DOWs and trams to apply */
    onApply: (dows: number[], trams: Tram[]) => void;
}

const ALL_DOWS = [1, 2, 3, 4, 5, 6, 7];

export const MultiDayModal: React.FC<MultiDayModalProps> = ({
    visible,
    onClose,
    onApply,
}) => {
    const theme = useTheme();

    const [selectedDows, setSelectedDows] = useState<number[]>([1, 2, 3, 4, 5]);
    const [trams, setTrams] = useState<Tram[]>([]);

    const handleToggleDow = useCallback((dow: number) => {
        setSelectedDows((prev) =>
            prev.includes(dow) ? prev.filter((d) => d !== dow) : [...prev, dow]
        );
    }, []);

    const handleRemoveTram = useCallback((idx: number) => {
        setTrams((prev) => prev.filter((_, i) => i !== idx));
    }, []);

    const handleApply = () => {
        if (selectedDows.length === 0 || trams.length === 0) return;
        onApply(selectedDows, trams);
        // Reset for next use
        setSelectedDows([1, 2, 3, 4, 5]);
        setTrams([]);
        onClose();
    };

    const handleClose = () => {
        setSelectedDows([1, 2, 3, 4, 5]);
        setTrams([]);
        onClose();
    };

    const canApply = selectedDows.length > 0 && trams.length > 0;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Aplicar a varis dies</Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Ionicons name="close" size={22} color={HC.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.scroll}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Day selector */}
                        <Text style={styles.sectionLabel}>Selecciona els dies</Text>
                        <View style={styles.daysRow}>
                            {ALL_DOWS.map((dow) => {
                                const isSelected = selectedDows.includes(dow);
                                return (
                                    <TouchableOpacity
                                        key={dow}
                                        style={[
                                            styles.dayChip,
                                            isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                                        ]}
                                        onPress={() => handleToggleDow(dow)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.dayChipText, isSelected && styles.dayChipTextSelected]}>
                                            {DOW_LABELS[dow].slice(0, 2)}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Timeline painter */}
                        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>
                            Defineix el rang horari
                        </Text>
                        <TimelinePainter
                            trams={trams}
                            onTramsChange={setTrams}
                        />

                        {/* Tram chips */}
                        {trams.length > 0 && (
                            <View style={styles.chipsRow}>
                                {trams.map((tram, i) => (
                                    <TimeRangeItem
                                        key={`${tram.iniciMin}-${tram.fiMin}`}
                                        tram={tram}
                                        onRemove={() => handleRemoveTram(i)}
                                    />
                                ))}
                            </View>
                        )}
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.btnCancel} onPress={handleClose} activeOpacity={0.7}>
                            <Text style={styles.btnCancelText}>Cancel·lar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.btnApply, { backgroundColor: theme.primary }, !canApply && styles.btnDisabled]}
                            onPress={handleApply}
                            disabled={!canApply}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.btnApplyText}>Aplicar</Text>
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
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modal: {
        width: '100%',
        maxWidth: 480,
        backgroundColor: HC.white,
        borderRadius: 16,
        ...cardShadow,
        shadowOpacity: 0.18,
        elevation: 10,
        maxHeight: '85%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: HC.border,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: HC.textPrimary,
    },
    scroll: {
        flexShrink: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 8,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: HC.textMuted,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    /* Day chips */
    daysRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    dayChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: HC.border,
        backgroundColor: HC.white,
    },
    dayChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: HC.textPrimary,
    },
    dayChipTextSelected: {
        color: HC.white,
    },

    /* Chips row */
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
    },

    /* Footer */
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: HC.border,
    },
    btnCancel: {
        paddingHorizontal: 20,
        paddingVertical: 11,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: HC.border,
    },
    btnCancelText: {
        fontSize: 14,
        fontWeight: '600',
        color: HC.textPrimary,
    },
    btnApply: {
        paddingHorizontal: 24,
        paddingVertical: 11,
        borderRadius: 10,
        minWidth: 120,
        alignItems: 'center',
    },
    btnApplyText: {
        fontSize: 14,
        fontWeight: '600',
        color: HC.white,
    },
    btnDisabled: {
        opacity: 0.45,
    },
});
