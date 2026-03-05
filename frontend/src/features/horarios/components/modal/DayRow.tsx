import React, { useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { HC } from '../../constants/horarios.constants';
import {
    DOW_LABELS,
    type DiaRotacio,
    type Tram,
} from '../../types/jornades.types';
import { TimelinePainter } from './TimelinePainter';
import { TimeRangeItem } from './TimeRangeItem';

/* ──────────────────────────────────────────
   DayRow – Renders a single day inside a
   rotation: toggle descanso, interactive
   timeline painter, time range chips
   ────────────────────────────────────────── */

interface DayRowProps {
    day: DiaRotacio;
    onUpdate: (updated: DiaRotacio) => void;
    disabled?: boolean;
}

export const DayRow: React.FC<DayRowProps> = ({ day, onUpdate, disabled }) => {
    const isDescanso = day.esDescans;

    /* ── Toggle Descanso ────────────── */
    const handleToggleDescanso = useCallback(() => {
        onUpdate({
            ...day,
            esDescans: !day.esDescans,
            trams: !day.esDescans ? [] : day.trams,
        });
    }, [day, onUpdate]);

    /* ── Timeline painter callback ── */
    const handleTramsChange = useCallback((newTrams: Tram[]) => {
        onUpdate({ ...day, trams: newTrams });
    }, [day, onUpdate]);

    /* ── Remove single tram ────────── */
    const handleRemoveTram = useCallback((idx: number) => {
        onUpdate({ ...day, trams: day.trams.filter((_, i) => i !== idx) });
    }, [day, onUpdate]);

    return (
        <View style={[styles.row, isDescanso && styles.rowDescanso]}>
            {/* Day label + toggle */}
            <View style={styles.headerSection}>
                <Text style={[styles.dayLabel, isDescanso && styles.dayLabelDescanso]}>
                    {DOW_LABELS[day.dow]}
                </Text>

                <TouchableOpacity
                    style={[styles.toggle, isDescanso && styles.toggleActive]}
                    onPress={handleToggleDescanso}
                    disabled={disabled}
                    activeOpacity={0.7}
                >
                    <View style={[styles.toggleThumb, isDescanso && styles.toggleThumbActive]} />
                </TouchableOpacity>
                <Text style={styles.toggleText}>
                    {isDescanso ? 'Día de descanso' : 'Descanso'}
                </Text>
            </View>

            {/* Content: interactive timeline + chips */}
            {!isDescanso && (
                <View style={styles.content}>
                    {/* Interactive timeline painter */}
                    <TimelinePainter
                        trams={day.trams}
                        onTramsChange={handleTramsChange}
                        disabled={disabled}
                    />

                    {/* Time range chips (removable) */}
                    {day.trams.length > 0 && (
                        <View style={styles.chipsRow}>
                            {day.trams.map((tram, i) => (
                                <TimeRangeItem
                                    key={`${tram.iniciMin}-${tram.fiMin}`}
                                    tram={tram}
                                    onRemove={() => handleRemoveTram(i)}
                                    disabled={disabled}
                                />
                            ))}
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

/* ── Styles ────────────────────────────── */
const styles = StyleSheet.create({
    row: {
        paddingVertical: 16,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: HC.borderSoft,
    },
    rowDescanso: {
        opacity: 0.8,
    },

    /* Header: dayLabel + toggle */
    headerSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    dayLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: HC.textPrimary,
        minWidth: 90,
    },
    dayLabelDescanso: {
        fontStyle: 'italic',
        color: HC.primary,
    },

    /* Toggle */
    toggle: {
        width: 42,
        height: 24,
        borderRadius: 12,
        backgroundColor: HC.border,
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    toggleActive: {
        backgroundColor: HC.primary,
    },
    toggleThumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: HC.white,
    },
    toggleThumbActive: {
        alignSelf: 'flex-end',
    },
    toggleText: {
        fontSize: 13,
        color: HC.textMuted,
        fontWeight: '500',
    },

    /* Content area */
    content: {
        marginTop: 4,
    },

    /* Chips row */
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
});
