import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { tintPrimari } from '@/core/theme/tint';
import { useLanguage } from '@/core/i18n';
import type { AbsenciaEmpresa, TipusAbsenciaEmpresa } from '../../types/absencies-empresa.types';

export function useColorsTipus(): Record<TipusAbsenciaEmpresa, { label: string; color: string; bg: string }> {
    const theme = useTheme();
    const { t } = useLanguage();
    return {
        FESTA_LOCAL: { label: t('tipusFiestaLocal'), color: theme.primary, bg: tintPrimari(theme) },
        FESTA_ESTATAL: { label: t('tipusFiestaEstatal'), color: '#2563EB', bg: '#EFF6FF' },
        PONT: { label: t('tipusPuente'), color: HC.statusYellowText, bg: HC.statusYellowBg },
        ALTRE: { label: t('absAltre'), color: HC.textSecondary, bg: HC.borderSoft },
    };
}

interface Props {
    item: AbsenciaEmpresa;
    passat: boolean;
    onEditar: () => void;
    onEliminar: () => void;
}

export function TancamentItem({ item, passat, onEditar, onEliminar }: Props) {
    const { t, lang } = useLanguage();
    const locale = lang === 'ca' ? 'ca-ES' : 'es-ES';
    const tipus = useColorsTipus()[item.tipus];
    const inici = new Date(item.inici);
    const fi = new Date(item.fi);
    const unDia = inici.toDateString() === fi.toDateString();
    const dataLlarga = (d: Date) => d.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
    const diaSetmana = (d: Date) => d.toLocaleDateString(locale, { weekday: unDia ? 'long' : 'short' });
    const titolData = unDia ? dataLlarga(inici) : `${inici.getDate()} – ${dataLlarga(fi)}`;
    const subData = unDia ? diaSetmana(inici) : `${diaSetmana(inici)} – ${diaSetmana(fi)}`;
    const reserves = item.reservesAfectades ?? 0;

    return (
        <View style={[styles.row, passat && styles.passat]}>
            <View style={styles.data}>
                <Text style={styles.dataTitol}>{titolData}</Text>
                <Text style={styles.dataSub}>{subData}</Text>
            </View>
            <View style={styles.body}>
                <Text style={styles.titol} numberOfLines={2}>{item.titol}</Text>
                <View style={styles.chips}>
                    <View style={[styles.chip, { backgroundColor: tipus.bg }]}>
                        <Text style={[styles.chipText, { color: tipus.color }]}>{tipus.label}</Text>
                    </View>
                    {!passat && reserves > 0 ? (
                        <View style={[styles.chip, styles.avis]}>
                            <Ionicons name="warning-outline" size={12} color={HC.statusRedText} />
                            <Text style={[styles.chipText, { color: HC.statusRedText }]}>
                                {reserves === 1 ? t('horUnaCitaAfectada') : t('horCitesAfectades').replace('{n}', String(reserves))}
                            </Text>
                        </View>
                    ) : null}
                </View>
            </View>
            <View style={styles.accions}>
                <Pressable onPress={onEditar} hitSlop={8} accessibilityRole="button" accessibilityLabel={`${t('edit')} ${item.titol}`} style={styles.accio}>
                    <Ionicons name="pencil-outline" size={17} color={HC.textMuted} />
                </Pressable>
                <Pressable onPress={onEliminar} hitSlop={8} accessibilityRole="button" accessibilityLabel={`${t('delete')} ${item.titol}`} style={styles.accio}>
                    <Ionicons name="trash-outline" size={17} color={HC.red} />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 14,
        paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: HC.borderSoft,
    },
    passat: { opacity: 0.6 },
    data: { width: 180 },
    dataTitol: { fontSize: 15, fontWeight: '700', color: HC.textPrimary },
    dataSub: { fontSize: 12, color: HC.textMuted, marginTop: 2, textTransform: 'capitalize' },
    body: { flex: 1, minWidth: 160, gap: 6 },
    titol: { fontSize: 14, fontWeight: '600', color: HC.textSecondary },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    chip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
    chipText: { fontSize: 12, fontWeight: '600' },
    avis: { backgroundColor: HC.statusRedBg },
    accions: { flexDirection: 'row', gap: 4 },
    accio: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
});
