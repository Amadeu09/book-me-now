import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { tintPrimari } from '@/core/theme/tint';
import { useLanguage } from '@/core/i18n';
import { avisar, confirmar, missatgeError } from '@/utils/dialegs';
import { Boto } from '@/features/configuracio/components/Boto';
import { AbsenciaEmpresaModal } from '../modal/AbsenciaEmpresaModal';
import { TancamentItem, useColorsTipus } from './TancamentItem';
import { esFutur, useDesarTancament, useEliminarTancament, useTancaments } from '../../hooks/useHoraris';
import type { AbsenciaEmpresa, CreateAbsenciaEmpresaDto } from '../../types/absencies-empresa.types';

type Vista = 'propers' | 'passats';

export function FestiusTab() {
    const theme = useTheme();
    const { t } = useLanguage();
    const { width } = useWindowDimensions();
    const tancaments = useTancaments();
    const desar = useDesarTancament();
    const eliminar = useEliminarTancament();
    const colors = useColorsTipus();
    const [vista, setVista] = useState<Vista>('propers');
    const [modal, setModal] = useState<{ visible: boolean; item: AbsenciaEmpresa | null }>({ visible: false, item: null });

    const tots = tancaments.data ?? [];
    const llista = vista === 'propers'
        ? tots.filter(a => esFutur(a.fi))
        : tots.filter(a => !esFutur(a.fi)).reverse();
    const enFila = width >= 1100;

    const onSubmit = async (dto: CreateAbsenciaEmpresaDto) => {
        const resultat = await desar.mutateAsync({ id: modal.item?.id, dto });
        const n = resultat.reservesAfectades ?? 0;
        if (n > 0) avisar(t('horAvisCitesTitol'), t('horAvisCites').replace('{n}', String(n)));
    };

    const onEliminar = async (item: AbsenciaEmpresa) => {
        const ok = await confirmar(t('delete'), t('horEliminarTancament').replace('{name}', item.titol), t('delete'), t('cancel'));
        if (!ok) return;
        try {
            await eliminar.mutateAsync(item.id);
        } catch (e) {
            avisar(t('error'), missatgeError(e, t('exceptionDeleteError')));
        }
    };

    const opcions: { clau: Vista; label: string }[] = [
        { clau: 'propers', label: t('horPropers') },
        { clau: 'passats', label: t('horPassats') },
    ];

    return (
        <View style={[styles.layout, enFila && styles.layoutRow]}>
            <View style={[styles.card, styles.principal]}>
                <View style={styles.head}>
                    <View style={styles.segments} accessibilityRole="tablist">
                        {opcions.map(o => {
                            const sel = vista === o.clau;
                            return (
                                <Pressable
                                    key={o.clau}
                                    onPress={() => setVista(o.clau)}
                                    accessibilityRole="tab"
                                    accessibilityState={{ selected: sel }}
                                    style={[styles.segment, sel && styles.segmentSel]}
                                >
                                    <Text style={[styles.segmentText, sel && { color: theme.primary }]}>{o.label}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                    <Boto label={t('horAfegirTancament')} variant="primary" onPress={() => setModal({ visible: true, item: null })} />
                </View>

                {tancaments.isLoading ? (
                    <ActivityIndicator color={theme.primary} style={styles.loading} />
                ) : llista.length === 0 ? (
                    <Text style={styles.buit}>{vista === 'propers' ? t('horCapTancamentFutur') : t('horCapTancamentPassat')}</Text>
                ) : (
                    llista.map(item => (
                        <TancamentItem
                            key={item.id}
                            item={item}
                            passat={vista === 'passats'}
                            onEditar={() => setModal({ visible: true, item })}
                            onEliminar={() => onEliminar(item)}
                        />
                    ))
                )}
            </View>

            <View style={[styles.lateral, enFila && styles.lateralAmple]}>
                <View style={[styles.notaCaixa, { backgroundColor: tintPrimari(theme) }]}>
                    <View style={styles.notaHead}>
                        <Ionicons name="information-circle-outline" size={18} color={theme.primary} />
                        <Text style={styles.notaTitol}>{t('horQuePassa')}</Text>
                    </View>
                    <Text style={styles.nota}>{t('horQuePassaText')}</Text>
                    <View style={styles.llegenda}>
                        {Object.values(colors).map(c => (
                            <View key={c.label} style={[styles.chip, { backgroundColor: c.bg }]}>
                                <Text style={[styles.chipText, { color: c.color }]}>{c.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>

            <AbsenciaEmpresaModal
                visible={modal.visible}
                initialData={modal.item}
                onClose={() => setModal({ visible: false, item: null })}
                onSubmit={onSubmit}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    layout: { gap: 20 },
    layoutRow: { flexDirection: 'row', alignItems: 'flex-start' },
    card: { backgroundColor: HC.card, borderWidth: 1, borderColor: HC.border, borderRadius: 16, padding: 20 },
    principal: { flex: 1, minWidth: 0 },
    head: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 6 },
    segments: { flexDirection: 'row', backgroundColor: HC.borderSoft, borderRadius: 10, padding: 3, gap: 2 },
    segment: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: 'transparent' },
    segmentSel: { backgroundColor: HC.card, borderColor: HC.border },
    segmentText: { fontSize: 13, fontWeight: '600', color: HC.textMuted },
    loading: { marginVertical: 32 },
    buit: { fontSize: 14, color: HC.textMuted, paddingVertical: 24, textAlign: 'center' },
    lateral: { gap: 16 },
    lateralAmple: { width: 320 },
    notaCaixa: { borderRadius: 16, padding: 18, gap: 10 },
    notaHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    notaTitol: { fontSize: 15, fontWeight: '600', color: HC.textPrimary },
    nota: { fontSize: 13, lineHeight: 19, color: HC.textSecondary },
    llegenda: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    chip: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
    chipText: { fontSize: 12, fontWeight: '600' },
});
