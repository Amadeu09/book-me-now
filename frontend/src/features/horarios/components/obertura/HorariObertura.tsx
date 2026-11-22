import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { tintPrimari } from '@/core/theme/tint';
import { useLanguage } from '@/core/i18n';
import { DiaObertura, type EstatDesat } from './DiaObertura';
import { useDesarDia, useHorariSetmanal, useTancaments, esFutur } from '../../hooks/useHoraris';
import { formatHores, horesTotals } from '../../utils/franges';

interface Props {
    onVeureTancaments: () => void;
}

export function HorariObertura({ onVeureTancaments }: Props) {
    const theme = useTheme();
    const { t } = useLanguage();
    const { width } = useWindowDimensions();
    const horari = useHorariSetmanal();
    const tancaments = useTancaments();
    const desarDia = useDesarDia();
    const [estat, setEstat] = useState<EstatDesat>('inactiu');

    const dies = [t('dayMonday'), t('dayTuesday'), t('dayWednesday'), t('dayThursday'), t('dayFriday'), t('daySaturday'), t('daySunday')];
    const trams = horari.data ?? [];
    const perDia = dies.map((_, dow) => trams.filter(tr => tr.dow === dow));
    const diesOberts = perDia.filter(d => d.length > 0).length;
    const hores = horesTotals(trams);
    const propers = (tancaments.data ?? []).filter(a => esFutur(a.fi)).length;
    const ambResumAlCostat = width >= 1100;

    const onDesar = useCallback(
        async (dow: number, franges: { iniciMin: number; fiMin: number }[]) => {
            await desarDia.mutateAsync({ dow, trams: franges });
        },
        [desarDia],
    );

    const indicador = estat === 'desant' ? (
        <View style={styles.estat}><ActivityIndicator size="small" color={HC.textMuted} /><Text style={styles.estatText}>{t('horDesant')}</Text></View>
    ) : estat === 'desat' ? (
        <View style={styles.estat}><Ionicons name="checkmark-circle" size={16} color={HC.statusGreenText} /><Text style={[styles.estatText, { color: HC.statusGreenText }]}>{t('horDesat')}</Text></View>
    ) : estat === 'error' ? (
        <View style={styles.estat}><Ionicons name="alert-circle" size={16} color={HC.statusRedText} /><Text style={[styles.estatText, { color: HC.statusRedText }]}>{t('horErrorDesar')}</Text></View>
    ) : (
        <Text style={styles.estatText}>{t('horAutoDesat')}</Text>
    );

    return (
        <View style={[styles.layout, ambResumAlCostat && styles.layoutRow]}>
            <View style={[styles.card, styles.principal]}>
                <View style={styles.cardHead}>
                    <Text style={styles.cardTitle} accessibilityRole="header">{t('horSetmanal')}</Text>
                    <View accessibilityLiveRegion="polite">{indicador}</View>
                </View>
                {horari.isLoading ? (
                    <ActivityIndicator color={theme.primary} style={styles.loading} />
                ) : horari.isError ? (
                    <Text style={styles.nota}>{t('horErrorDesar')}</Text>
                ) : (
                    dies.map((nom, dow) => (
                        <DiaObertura
                            key={dow}
                            nom={nom}
                            inicials={perDia[dow].map(tr => ({ iniciMin: tr.iniciMin, fiMin: tr.fiMin }))}
                            onDesar={f => onDesar(dow, f)}
                            onEstat={setEstat}
                            apilat={width < 600}
                        />
                    ))
                )}
            </View>

            <View style={[styles.lateral, ambResumAlCostat && styles.lateralAmple]}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{t('horResum')}</Text>
                    <View style={styles.dada}>
                        <Text style={styles.dadaLabel}>{t('horDiesOberts')}</Text>
                        <Text style={styles.dadaValor}>{t('horDeSet').replace('{n}', String(diesOberts))}</Text>
                    </View>
                    <View style={styles.dada}>
                        <Text style={styles.dadaLabel}>{t('horHoresSetmana')}</Text>
                        <Text style={styles.dadaValor}>{formatHores(hores)} h</Text>
                    </View>
                    <Pressable onPress={onVeureTancaments} accessibilityRole="link" style={[styles.dada, styles.dadaUltima]}>
                        <Text style={styles.dadaLabel}>{t('horPropersTancaments')}</Text>
                        <View style={styles.dadaLink}>
                            <Text style={[styles.dadaValor, { color: theme.primary }]}>{propers}</Text>
                            <Ionicons name="arrow-forward" size={16} color={theme.primary} />
                        </View>
                    </Pressable>
                </View>
                <View style={[styles.notaCaixa, { backgroundColor: tintPrimari(theme) }]}>
                    <Ionicons name="information-circle-outline" size={18} color={theme.primary} />
                    <Text style={styles.nota}>{t('horNotaObertura')}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    layout: { gap: 20 },
    layoutRow: { flexDirection: 'row', alignItems: 'flex-start' },
    card: { backgroundColor: HC.card, borderWidth: 1, borderColor: HC.border, borderRadius: 16, padding: 20, gap: 4 },
    principal: { flex: 1, minWidth: 0 },
    cardHead: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 },
    cardTitle: { fontSize: 17, fontWeight: '600', color: HC.textPrimary },
    estat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    estatText: { fontSize: 13, color: HC.textMuted },
    loading: { marginVertical: 32 },
    lateral: { gap: 16 },
    lateralAmple: { width: 320 },
    dada: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: HC.borderSoft },
    dadaUltima: { borderBottomWidth: 0 },
    dadaLabel: { fontSize: 14, color: HC.textSecondary },
    dadaValor: { fontSize: 16, fontWeight: '700', color: HC.textPrimary },
    dadaLink: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    notaCaixa: { flexDirection: 'row', gap: 10, borderRadius: 12, padding: 14 },
    nota: { flex: 1, fontSize: 13, lineHeight: 19, color: HC.textSecondary },
});
