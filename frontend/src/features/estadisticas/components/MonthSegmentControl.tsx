import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { radius } from '@/constants/theme';
import { HC } from '@/features/home/constants/inicio.constants';

const OPTIONS = [
    { label: '6M', value: 6 },
    { label: '1A', value: 12 },
    { label: '2A', value: 24 },
] as const;

interface Props {
    value: number;
    onChange: (v: number) => void;
}

export function MonthSegmentControl({ value, onChange }: Props) {
    return (
        <View style={m.control}>
            {OPTIONS.map(opt => (
                <TouchableOpacity
                    key={opt.value}
                    style={[m.btn, value === opt.value && m.btnActive]}
                    onPress={() => onChange(opt.value)}
                    activeOpacity={0.7}
                >
                    <Text style={[m.text, value === opt.value && m.textActive]}>{opt.label}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const m = StyleSheet.create({
    control: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        borderRadius: radius.md,
        padding: 3,
    },
    btn: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: radius.sm,
    },
    btnActive: {
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    text: {
        fontSize: 12,
        fontWeight: '500',
        color: HC.textMuted,
    },
    textActive: {
        color: HC.textPrimary,
        fontWeight: '600',
    },
});
