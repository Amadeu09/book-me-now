import React, { useCallback } from 'react';
import {
    View,
    Text,
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
   rotation: interactive timeline painter +
   time range chips. When no range is set,
   shows "Dia de descans" as static text.
   ────────────────────────────────────────── */

interface DayRowProps {
    day: DiaRotacio;
    onUpdate: (updated: DiaRotacio) => void;
    disabled?: boolean;
}

export const DayRow: React.FC<DayRowProps> = ({ day, onUpdate, disabled }) => {
    const hasRange = day.trams.length > 0;

    /* ── Timeline painter callback ── */
    const handleTramsChange = useCallback((newTrams: Tram[]) => {
        onUpdate({ ...day, trams: newTrams, esDescans: newTrams.length === 0 });
    }, [day, onUpdate]);

    /* ── Remove single tram ────────── */
    const handleRemoveTram = useCallback((idx: number) => {
        const newTrams = day.trams.filter((_, i) => i !== idx);
        onUpdate({ ...day, trams: newTrams, esDescans: newTrams.length === 0 });
    }, [day, onUpdate]);

    return (
        <View style={styles.row}>
            {/* Day label + rest indicator */}
            <View style={styles.headerSection}>
                <Text style={styles.dayLabel}>
                    {DOW_LABELS[day.dow]}
                </Text>
                {!hasRange && (
                    <Text style={styles.restLabel}>Dia de descans</Text>
                )}
            </View>

            {/* Always-visible content: interactive timeline + chips */}
            <View style={styles.content}>
                <TimelinePainter
                    trams={day.trams}
                    onTramsChange={handleTramsChange}
                    disabled={disabled}
                />

                {hasRange && (
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

    /* Header: dayLabel + rest text */
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
    restLabel: {
        fontSize: 13,
        color: HC.textMuted,
        fontStyle: 'italic',
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
