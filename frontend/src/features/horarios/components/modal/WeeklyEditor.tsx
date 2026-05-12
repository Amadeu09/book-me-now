import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { DiaRotacio } from '../../types/jornades.types';
import { DayRow } from './DayRow';

/* ──────────────────────────────────────────
   WeeklyEditor – Renders all 7 DayRows
   for the active rotation
   ────────────────────────────────────────── */

interface WeeklyEditorProps {
    dies: DiaRotacio[];
    onUpdateDay: (dow: number, updated: DiaRotacio) => void;
    disabled?: boolean;
}

export const WeeklyEditor: React.FC<WeeklyEditorProps> = ({
    dies,
    onUpdateDay,
    disabled,
}) => (
    <View style={styles.container}>
        {dies.map((day) => (
            <DayRow
                key={day.dow}
                day={day}
                onUpdate={(updated) => onUpdateDay(day.dow, updated)}
                disabled={disabled}
            />
        ))}
    </View>
);

const styles = StyleSheet.create({
    container: {
        marginTop: 4,
    },
});
