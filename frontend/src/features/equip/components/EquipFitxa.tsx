import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC } from '@/features/home/constants/inicio.constants';
import { useLanguage } from '@/core/i18n';
import { Boto } from '@/features/configuracio/components/Boto';
import { Field } from '@/features/configuracio/components/Field';
import { DatePickerField } from '@/features/horarios/components/DatePickerField';
import { avisar, confirmar, missatgeError } from '@/utils/dialegs';
import { EquipAvatar } from './EquipAvatar';
import { OpcioChip } from './OpcioChip';
import { useDesarMembre, useDonarDeBaixa } from '../hooks/useEquip';
import type { MembreEquip, OpcioSimple } from '../types/equip.types';

interface Props {
    membre: MembreEquip;
    plantilles: OpcioSimple[];
    serveis: OpcioSimple[];
    onTancar?: () => void;
    onBaixa?: () => void;
    /** Dins d'un modal la fitxa ocupa tot l'espai i el cos fa scroll. */
    enModal?: boolean;
}

const avui = () => new Date().toISOString().split('T')[0];

/** Fitxa editable d'una persona de l'equip. Es munta amb key={membre.id}. */
export function EquipFitxa({ membre, plantilles, serveis, onTancar, onBaixa, enModal }: Props) {
    const { t } = useLanguage();
    // Al panell lateral la fitxa creix amb el contingut; al modal fa scroll
    const Cos = (enModal ? ScrollView : View) as React.ComponentType<React.PropsWithChildren<object>>;
    const desar = useDesarMembre();
    const baixa = useDonarDeBaixa();

    const inicial = useMemo(() => ({
        plantillaId: membre.plantilla?.id ?? null,
        dataInici: membre.dataIniciRotacio ? membre.dataIniciRotacio.split('T')[0] : '',
        serveisIds: (membre.serveis ?? []).map(s => s.serveiId).sort((a, b) => a - b),
        dies: String(membre.diesVacancesAnuals ?? 0),
    }), [membre]);

    const [plantillaId, setPlantillaId] = useState<number | null>(inicial.plantillaId);
    const [dataInici, setDataInici] = useState(inicial.dataInici);
    const [serveisIds, setServeisIds] = useState<number[]>(inicial.serveisIds);
    const [dies, setDies] = useState(inicial.dies);

    const diesNum = Number(dies);
    const diesValids = /^\d{1,3}$/.test(dies) && diesNum <= 365;
    const canviat =
        plantillaId !== inicial.plantillaId ||
        (plantillaId !== null && dataInici !== inicial.dataInici) ||
        [...serveisIds].sort((a, b) => a - b).join(',') !== inicial.serveisIds.join(',') ||
        dies !== inicial.dies;
    const esAdmin = membre.Usuari?.rol === 'ADMIN_GENERAL';

    const commutaServei = (id: number) =>
        setServeisIds(prev => (prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]));

    const onDesar = async () => {
        if (!diesValids) return;
        try {
            await desar.mutateAsync({
                id: membre.id,
                canvis: {
                    plantillaId,
                    dataIniciRotacio: plantillaId !== null ? dataInici || avui() : undefined,
                    serveisIds,
                    diesVacancesAnuals: diesNum,
                },
            });
            avisar(t('success'), t('equipDesat'));
        } catch (e) {
            avisar(t('error'), missatgeError(e, t('equipErrorDesar')));
        }
    };

    const onDonarDeBaixa = async () => {
        const ok = await confirmar(t('equipDonarBaixa'), t('equipBaixaConfirm').replace('{name}', membre.nom), t('equipDonarBaixa'), t('cancel'));
        if (!ok) return;
        try {
            await baixa.mutateAsync(membre.id);
            onBaixa?.();
        } catch (e) {
            avisar(t('error'), missatgeError(e, t('horariosDeleteWorkerError')));
        }
    };

    return (
        <View style={[styles.card, enModal && styles.omple]}>
            <View style={styles.header}>
                <EquipAvatar nom={membre.nom} foto={membre.Usuari?.fotoPerfil} mida={48} />
                <View style={styles.headerText}>
                    <Text style={styles.nom} numberOfLines={1} accessibilityRole="header">{membre.nom}</Text>
                    <Text style={styles.sub} numberOfLines={1}>
                        {membre.Usuari?.email} · {esAdmin ? t('equipAdmin') : t('equipEmpleat')}
                    </Text>
                </View>
                {onTancar ? (
                    <Pressable onPress={onTancar} accessibilityRole="button" accessibilityLabel={t('equipTancar')} hitSlop={10} style={styles.tancar}>
                        <Ionicons name="close" size={20} color={HC.textMuted} />
                    </Pressable>
                ) : null}
            </View>

            <Cos {...(enModal ? { style: styles.omple, contentContainerStyle: styles.body } : { style: styles.body })}>
                <View style={styles.seccio}>
                    <Text style={styles.label}>{t('equipColPlantilla')}</Text>
                    <View style={styles.chips} accessibilityRole="radiogroup">
                        {plantilles.map(p => (
                            <OpcioChip key={p.id} tipus="radio" label={p.nom} actiu={plantillaId === p.id} onPress={() => setPlantillaId(p.id)} />
                        ))}
                        <OpcioChip tipus="radio" label={t('equipSensePlantilla')} actiu={plantillaId === null} onPress={() => setPlantillaId(null)} />
                    </View>
                </View>

                {plantillaId !== null ? (
                    <View style={styles.seccio}>
                        <Text style={styles.label}>{t('equipIniciRotacio')}</Text>
                        <DatePickerField value={dataInici} onChange={setDataInici} placeholder={avui()} />
                        <Text style={styles.help}>{t('equipIniciRotacioAjuda')}</Text>
                    </View>
                ) : null}

                <View style={styles.seccio}>
                    <Text style={styles.label}>{t('equipServeisPot')}</Text>
                    {serveis.length === 0 ? (
                        <Text style={styles.help}>{t('equipCapServei')}</Text>
                    ) : (
                        <View style={styles.chips}>
                            {serveis.map(s => (
                                <OpcioChip key={s.id} label={s.nom} actiu={serveisIds.includes(s.id)} onPress={() => commutaServei(s.id)} />
                            ))}
                        </View>
                    )}
                </View>

                <View style={styles.diesField}>
                    <Field
                        label={t('equipDiesAny')}
                        value={dies}
                        onChangeText={v => setDies(v.replace(/[^\d]/g, ''))}
                        keyboardType="number-pad"
                        maxLength={3}
                        error={diesValids ? undefined : t('equipDiesInvalids')}
                        help={t('equipDiesVac').replace('{usats}', String(membre.diesVacancesUsats ?? 0)).replace('{total}', String(membre.diesVacancesAnuals))}
                    />
                </View>
            </Cos>

            <View style={styles.footer}>
                {!esAdmin ? (
                    <Boto label={t('equipDonarBaixa')} variant="danger" onPress={onDonarDeBaixa} loading={baixa.isPending} />
                ) : <View />}
                <Boto label={t('equipDesar')} variant="primary" onPress={onDesar} loading={desar.isPending} disabled={!canviat || !diesValids} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: HC.card, borderWidth: 1, borderColor: HC.border, borderRadius: 16, overflow: 'hidden' },
    omple: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20, borderBottomWidth: 1, borderBottomColor: HC.borderSoft },
    headerText: { flex: 1, minWidth: 0 },
    nom: { fontSize: 17, fontWeight: '600', color: HC.textPrimary },
    sub: { fontSize: 13, color: HC.textMuted, marginTop: 2 },
    tancar: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18 },
    body: { padding: 20, gap: 22 },
    seccio: { gap: 8 },
    label: { fontSize: 13, fontWeight: '600', color: HC.textSecondary },
    help: { fontSize: 12, color: HC.textMuted },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    diesField: { maxWidth: 260, flexDirection: 'row' },
    footer: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12,
        padding: 16, borderTopWidth: 1, borderTopColor: HC.borderSoft,
    },
});
