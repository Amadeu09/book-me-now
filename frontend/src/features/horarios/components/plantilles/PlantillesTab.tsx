import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { HC } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { tintPrimari } from '@/core/theme/tint';
import { useLanguage } from '@/core/i18n';
import { avisar, confirmar, missatgeError } from '@/utils/dialegs';
import { CLAU_EQUIP, CLAU_PLANTILLES, useEquip, usePlantillesEmpresa } from '@/features/equip/hooks/useEquip';
import { deleteJornada } from '../../services/jornades.service';
import { CreateTemplateModal } from '../modal/CreateTemplateModal';
import { PlantillaDetall } from './PlantillaDetall';
import type { JornadaPlantillaResponse } from '../../types/jornades.types';

export function PlantillesTab() {
    const theme = useTheme();
    const { t } = useLanguage();
    const { width } = useWindowDimensions();
    const qc = useQueryClient();
    const plantilles = usePlantillesEmpresa();
    const equip = useEquip();
    const [seleccionadaId, setSeleccionadaId] = useState<number | null>(null);
    const [modal, setModal] = useState<{ visible: boolean; dades?: JornadaPlantillaResponse }>({ visible: false });

    const eliminar = useMutation({
        mutationFn: (id: number) => deleteJornada(id),
        onSuccess: () => {
            setSeleccionadaId(null);
            qc.invalidateQueries({ queryKey: CLAU_PLANTILLES });
        },
    });

    const llista = plantilles.data ?? [];
    const personesPer = useMemo(() => {
        const mapa = new Map<number, string[]>();
        for (const m of equip.data ?? []) {
            if (m.plantilla) mapa.set(m.plantilla.id, [...(mapa.get(m.plantilla.id) ?? []), m.nom]);
        }
        return mapa;
    }, [equip.data]);

    const seleccionada = llista.find(p => p.id === seleccionadaId) ?? llista[0];
    const enFila = width >= 1000;

    const descripcio = (p: JornadaPlantillaResponse) => {
        const n = p.rotacions.length;
        const setmanes = n === 1 ? t('horUnaSetmana') : t('horSetmanesRotacio').replace('{n}', String(n));
        const pers = personesPer.get(p.id)?.length ?? 0;
        const persones = pers === 0 ? t('horNingu') : pers === 1 ? t('horUnaPersona') : t('horNPersones').replace('{n}', String(pers));
        return `${setmanes} · ${persones}`;
    };

    const onEliminar = async (p: JornadaPlantillaResponse) => {
        const ok = await confirmar(t('horariosDeleteTemplateTitle'), t('horariosDeleteTemplateConfirm').replace('{name}', p.nom), t('delete'), t('cancel'));
        if (!ok) return;
        try {
            await eliminar.mutateAsync(p.id);
        } catch (e) {
            avisar(t('error'), missatgeError(e, t('horariosDeleteTemplateError')));
        }
    };

    const despresDesar = () => {
        qc.invalidateQueries({ queryKey: CLAU_PLANTILLES });
        qc.invalidateQueries({ queryKey: CLAU_EQUIP });
    };

    if (plantilles.isLoading) return <ActivityIndicator color={theme.primary} style={styles.loading} />;

    return (
        <View style={[styles.layout, enFila && styles.layoutRow]}>
            <View style={[styles.card, enFila && styles.llistaAmple]}>
                <View style={styles.head}>
                    <Text style={styles.titol} accessibilityRole="header">{t('horPlantilles')}</Text>
                    <Pressable onPress={() => setModal({ visible: true })} accessibilityRole="button" style={styles.nova}>
                        <Ionicons name="add" size={16} color={theme.primary} />
                        <Text style={[styles.novaText, { color: theme.primary }]}>{t('horNova')}</Text>
                    </Pressable>
                </View>
                {llista.length === 0 ? (
                    <Text style={styles.buit}>{t('horCapPlantilla')}</Text>
                ) : (
                    llista.map(p => {
                        const sel = p.id === seleccionada?.id;
                        return (
                            <Pressable
                                key={p.id}
                                onPress={() => setSeleccionadaId(p.id)}
                                accessibilityRole="button"
                                accessibilityState={{ selected: sel }}
                                style={[styles.item, sel && { backgroundColor: tintPrimari(theme), borderColor: theme.primary }]}
                            >
                                <View style={styles.itemText}>
                                    <Text style={styles.itemNom} numberOfLines={1}>{p.nom}</Text>
                                    <Text style={styles.itemSub} numberOfLines={1}>{descripcio(p)}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color={sel ? theme.primary : HC.textLight} />
                            </Pressable>
                        );
                    })
                )}
            </View>

            {seleccionada ? (
                <View style={styles.detall}>
                    <PlantillaDetall
                        key={seleccionada.id}
                        plantilla={seleccionada}
                        persones={personesPer.get(seleccionada.id) ?? []}
                        onEditar={() => setModal({ visible: true, dades: seleccionada })}
                        onEliminar={() => onEliminar(seleccionada)}
                        eliminant={eliminar.isPending}
                    />
                </View>
            ) : null}

            <CreateTemplateModal
                visible={modal.visible}
                initialData={modal.dades}
                onClose={() => setModal({ visible: false })}
                onSuccess={despresDesar}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    loading: { marginVertical: 40 },
    layout: { gap: 20 },
    layoutRow: { flexDirection: 'row', alignItems: 'flex-start' },
    card: { backgroundColor: HC.card, borderWidth: 1, borderColor: HC.border, borderRadius: 16, padding: 16, gap: 8 },
    llistaAmple: { width: 340 },
    head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4, marginBottom: 4 },
    titol: { fontSize: 17, fontWeight: '600', color: HC.textPrimary },
    nova: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 6 },
    novaText: { fontSize: 14, fontWeight: '600' },
    buit: { fontSize: 14, color: HC.textMuted, padding: 8, lineHeight: 20 },
    item: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        borderWidth: 1, borderColor: HC.borderSoft, borderRadius: 12, padding: 12,
    },
    itemText: { flex: 1, minWidth: 0 },
    itemNom: { fontSize: 15, fontWeight: '600', color: HC.textPrimary },
    itemSub: { fontSize: 13, color: HC.textMuted, marginTop: 2 },
    detall: { flex: 1, minWidth: 0 },
});
