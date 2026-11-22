import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HC } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';
import type { DiaRotacio } from '../../types/jornades.types';

/** Hora curta per a les etiquetes: 540 → "09", 570 → "09:30". */
function horaCurta(min: number) {
    const h = String(Math.floor(min / 60)).padStart(2, '0');
    const m = min % 60;
    return m ? `${h}:${String(m).padStart(2, '0')}` : h;
}

/** Rang de l'eix horitzontal: arrodonit a hores parells, mínim 8 h – 20 h. */
export function rangEix(dies: DiaRotacio[]): [number, number] {
    const trams = dies.flatMap(d => (d.esDescans ? [] : d.trams));
    const min = Math.min(480, ...trams.map(t => t.iniciMin));
    const max = Math.max(1200, ...trams.map(t => t.fiMin));
    return [Math.floor(min / 120) * 120, Math.ceil(max / 120) * 120];
}

/** Vista setmanal d'una rotació de plantilla, amb una barra per franja. */
export function SetmanaBarres({ dies }: { dies: DiaRotacio[] }) {
    const theme = useTheme();
    const { t } = useLanguage();
    const curts = [t('dayShortMonday'), t('dayShortTuesday'), t('dayShortWednesday'), t('dayShortThursday'), t('dayShortFriday'), t('dayShortSaturday'), t('dayShortSunday')];
    const [ini, fi] = rangEix(dies);
    const span = fi - ini;
    const marques: number[] = [];
    for (let m = ini; m <= fi; m += 120) marques.push(m);
    const pct = (min: number) => `${((min - ini) / span) * 100}%` as const;

    return (
        <View style={styles.wrap}>
            <View style={styles.eixRow}>
                <View style={styles.diaCol} />
                <View style={styles.eix}>
                    {marques.map(m => (
                        <Text key={m} style={[styles.marca, { left: pct(m) }]}>{`${Math.floor(m / 60)}h`}</Text>
                    ))}
                </View>
            </View>
            {[1, 2, 3, 4, 5, 6, 7].map(dow => {
                const dia = dies.find(d => d.dow === dow);
                const descans = !dia || dia.esDescans || dia.trams.length === 0;
                const resum = descans ? t('horDescans') : dia.trams.map(tr => `${horaCurta(tr.iniciMin)}–${horaCurta(tr.fiMin)}h`).join(' · ');
                return (
                    <View key={dow} style={styles.fila} accessible accessibilityLabel={`${curts[dow - 1]}: ${resum}`}>
                        <Text style={styles.diaCol}>{curts[dow - 1]}</Text>
                        <View style={styles.pista}>
                            {marques.map(m => <View key={m} style={[styles.guia, { left: pct(m) }]} />)}
                            {!descans && dia.trams.map((tr, i) => (
                                <View
                                    key={i}
                                    style={[styles.barra, { left: pct(tr.iniciMin), width: `${((tr.fiMin - tr.iniciMin) / span) * 100}%`, backgroundColor: theme.primary }]}
                                >
                                    <Text style={[styles.barraText, { color: theme.textOnPrimary }]} numberOfLines={1}>
                                        {`${horaCurta(tr.iniciMin)}–${horaCurta(tr.fiMin)}h`}
                                    </Text>
                                </View>
                            ))}
                            {descans ? <Text style={styles.descans}>{t('horDescans')}</Text> : null}
                        </View>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { gap: 6 },
    eixRow: { flexDirection: 'row', height: 18 },
    eix: { flex: 1, position: 'relative' },
    marca: { position: 'absolute', fontSize: 11, color: HC.textLight, transform: [{ translateX: -8 }] },
    fila: { flexDirection: 'row', alignItems: 'center', height: 34 },
    diaCol: { width: 36, fontSize: 13, fontWeight: '600', color: HC.textSecondary },
    pista: { flex: 1, height: 28, position: 'relative', backgroundColor: HC.inputBg, borderRadius: 8, justifyContent: 'center' },
    guia: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: HC.border },
    barra: { position: 'absolute', top: 3, bottom: 3, borderRadius: 6, justifyContent: 'center', paddingHorizontal: 8, overflow: 'hidden' },
    barraText: { fontSize: 11, fontWeight: '700' },
    descans: { paddingLeft: 10, fontSize: 12, fontStyle: 'italic', color: HC.textMuted },
});
