import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { HC } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { tintPrimari } from '@/core/theme/tint';
import { useLanguage } from '@/core/i18n';
import { Boto } from '@/features/configuracio/components/Boto';
import { SetmanaBarres } from './SetmanaBarres';
import { formatHores } from '../../utils/franges';
import type { JornadaPlantillaResponse, DiaRotacio } from '../../types/jornades.types';

export const lletraSetmana = (i: number) => String.fromCharCode(65 + i);

export function horesRotacio(dies: DiaRotacio[]): number {
    return dies.reduce((s, d) => s + (d.esDescans ? 0 : d.trams.reduce((x, t) => x + t.fiMin - t.iniciMin, 0)), 0) / 60;
}

interface Props {
    plantilla: JornadaPlantillaResponse;
    persones: string[];
    onEditar: () => void;
    onEliminar: () => void;
    eliminant: boolean;
}

export function PlantillaDetall({ plantilla, persones, onEditar, onEliminar, eliminant }: Props) {
    const theme = useTheme();
    const { t } = useLanguage();
    const [rotacio, setRotacio] = useState(0);
    const rotacions = [...plantilla.rotacions].sort((a, b) => a.index - b.index);
    const actual = rotacions[Math.min(rotacio, rotacions.length - 1)];

    const usuaris = persones.length === 0
        ? t('horNingulaFa')
        : t('horLaFan').replace('{noms}', persones.length <= 2
            ? persones.join(', ')
            : t('horINMes').replace('{noms}', persones.slice(0, 2).join(', ')).replace('{n}', String(persones.length - 2)));

    return (
        <View style={styles.card}>
            <View style={styles.head}>
                <View style={styles.headText}>
                    <Text style={styles.nom} accessibilityRole="header">{plantilla.nom}</Text>
                    <Text style={styles.sub}>{usuaris}</Text>
                </View>
                <View style={styles.accions}>
                    <Boto label={t('delete')} variant="danger" onPress={onEliminar} loading={eliminant} />
                    <Boto label={t('edit')} onPress={onEditar} />
                </View>
            </View>

            {rotacions.length > 1 ? (
                <View style={styles.tabs} accessibilityRole="tablist">
                    {rotacions.map((r, i) => {
                        const sel = i === rotacio;
                        return (
                            <Pressable
                                key={r.index}
                                onPress={() => setRotacio(i)}
                                accessibilityRole="tab"
                                accessibilityState={{ selected: sel }}
                                style={[styles.tab, sel && { backgroundColor: tintPrimari(theme), borderColor: theme.primary }]}
                            >
                                <Text style={[styles.tabText, sel && { color: theme.primary }]}>
                                    {t('horSetmana').replace('{l}', lletraSetmana(i))}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            ) : null}

            {actual ? <SetmanaBarres dies={actual.dies} /> : null}

            <Text style={styles.total}>
                {rotacions
                    .map((r, i) => t('horTotalSetmana').replace('{l}', lletraSetmana(i)).replace('{h}', formatHores(horesRotacio(r.dies))))
                    .join(' · ')}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: HC.card, borderWidth: 1, borderColor: HC.border, borderRadius: 16, padding: 20, gap: 18 },
    head: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
    headText: { flexGrow: 1, flexShrink: 1, flexBasis: 220 },
    nom: { fontSize: 18, fontWeight: '600', color: HC.textPrimary },
    sub: { fontSize: 13, color: HC.textMuted, marginTop: 4 },
    accions: { flexDirection: 'row', gap: 8 },
    tabs: { flexDirection: 'row', gap: 8 },
    tab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: HC.border },
    tabText: { fontSize: 13, fontWeight: '600', color: HC.textSecondary },
    total: { fontSize: 13, color: HC.textMuted },
});
