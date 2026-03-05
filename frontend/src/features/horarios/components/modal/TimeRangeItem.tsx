import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { minutesToTime, type Tram } from '../../types/jornades.types';
import { HC } from '../../constants/horarios.constants';

interface TimeRangeItemProps {
    tram: Tram;
    onRemove: () => void;
    disabled?: boolean;
}

export const TimeRangeItem: React.FC<TimeRangeItemProps> = ({ tram, onRemove, disabled }) => (
    <View style={styles.chip}>
        <Text style={styles.chipText}>
            {minutesToTime(tram.iniciMin)} - {minutesToTime(tram.fiMin)}
        </Text>
        {!disabled && (
            <TouchableOpacity
                onPress={onRemove}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
                <Text style={styles.chipRemove}>×</Text>
            </TouchableOpacity>
        )}
    </View>
);

const styles = StyleSheet.create({
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: HC.white,
        borderWidth: 1,
        borderColor: HC.border,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        gap: 8,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
        color: HC.textPrimary,
    },
    chipRemove: {
        fontSize: 16,
        fontWeight: '700',
        color: HC.textMuted,
        lineHeight: 18,
    },
});
