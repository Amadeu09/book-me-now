import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { radius } from '@/constants/theme';
import { HC } from '@/features/home/constants/inicio.constants';
import { useLanguage } from '@/core/i18n';

export type ValoracioSelectorValue = 'empresa' | 'treballadors';

interface Props {
    value: ValoracioSelectorValue;
    onChange: (v: ValoracioSelectorValue) => void;
}

export function ValoracioTypeSelector({ value, onChange }: Props) {
    const { t } = useLanguage();
    const OPTIONS: { label: string; value: ValoracioSelectorValue }[] = [
        { label: t('valoracionsEmpresa'), value: 'empresa' },
        { label: t('valoraciónsTreballadors'), value: 'treballadors' },
    ];

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
        alignSelf: 'flex-start',
    },
    btn: {
        paddingVertical: 6,
        paddingHorizontal: 14,
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
        fontSize: 13,
        fontWeight: '500',
        color: HC.textMuted,
    },
    textActive: {
        color: HC.textPrimary,
        fontWeight: '600',
    },
});
