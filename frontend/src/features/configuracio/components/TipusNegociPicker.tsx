import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { HC } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';
import type { TranslationKeys } from '@/core/i18n/locales/ca';

/** Mateixos valors que l'enum BusinessType del backend. */
export const TIPUS_NEGOCI: { value: string; labelKey: TranslationKeys }[] = [
    { value: 'PERRUQUERIA', labelKey: 'btPerruqueria' },
    { value: 'BARBERIA', labelKey: 'btBarberia' },
    { value: 'ESTETICA', labelKey: 'btEstetica' },
    { value: 'SPA', labelKey: 'btSpa' },
    { value: 'MASSATGES', labelKey: 'btMassatges' },
    { value: 'NUTRICIONISTA', labelKey: 'btNutricionista' },
    { value: 'FISIOTERAPIA', labelKey: 'btFisioterapia' },
    { value: 'DENTAL', labelKey: 'btDental' },
    { value: 'VETERINARIA', labelKey: 'btVeterinaria' },
    { value: 'ALTRES', labelKey: 'btAltres' },
];

export function TipusNegociPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const theme = useTheme();
    const { t } = useLanguage();
    return (
        <View style={styles.field}>
            <Text style={styles.label}>{t('configTipusNegoci')}</Text>
            <View style={styles.chips} accessibilityRole="radiogroup">
                {TIPUS_NEGOCI.map((o) => {
                    const sel = o.value === value;
                    return (
                        <TouchableOpacity
                            key={o.value}
                            onPress={() => onChange(o.value)}
                            accessibilityRole="radio"
                            accessibilityState={{ checked: sel }}
                            style={[styles.chip, sel && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                        >
                            <Text style={[styles.chipText, sel && { color: theme.textOnPrimary, fontWeight: '600' }]}>{t(o.labelKey)}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    field: { gap: 6 },
    label: { fontSize: 13, fontWeight: '600', color: HC.textSecondary },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 12, paddingVertical: 8, minHeight: 36, borderRadius: 999, borderWidth: 1, borderColor: HC.border, backgroundColor: HC.card, justifyContent: 'center' },
    chipText: { fontSize: 13, color: HC.textSecondary },
});
