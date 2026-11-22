import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, FlatList, Modal, ActivityIndicator, StyleSheet, useWindowDimensions } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { HC } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';
import { ScreenHeader, SCREEN_MAX_WIDTH } from '@/ui/components/ScreenHeader';
import { HeaderButton } from '@/ui/components/HeaderButton';
import { FloatingAddButton } from '@/features/horarios/components/FloatingAddButton';
import { CreateTrabajadorModal } from '@/features/horarios/components/modal/CreateTrabajadorModal';
import { EquipFiltres } from '../components/EquipFiltres';
import { EquipTaula } from '../components/EquipTaula';
import { EquipTargeta } from '../components/EquipTargeta';
import { EquipFitxa } from '../components/EquipFitxa';
import { CLAU_EQUIP, useEquip, usePlantillesEmpresa, useServeisEmpresa } from '../hooks/useEquip';
import type { FiltreEstat, MembreEquip } from '../types/equip.types';

/** A partir d'aquesta amplada la fitxa es mostra al costat de la taula. */
const AMPLADA_PANELL = 1100;

function normalitza(s: string) {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export default function EquipScreen() {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const ambPanell = width >= AMPLADA_PANELL;
    const theme = useTheme();
    const { t } = useLanguage();
    const qc = useQueryClient();

    const equip = useEquip();
    const plantilles = usePlantillesEmpresa();
    const serveis = useServeisEmpresa();

    const [cerca, setCerca] = useState('');
    const [filtre, setFiltre] = useState<FiltreEstat>('tots');
    const [seleccionatId, setSeleccionatId] = useState<number | null>(null);
    const [fitxaOberta, setFitxaOberta] = useState(false);
    const [nouVisible, setNouVisible] = useState(false);

    const membres = useMemo(() => equip.data ?? [], [equip.data]);
    const comptes = useMemo(() => ({
        tots: membres.length,
        actius: membres.filter(m => m.actiu).length,
        inactius: membres.filter(m => !m.actiu).length,
    }), [membres]);

    const visibles = useMemo(() => {
        const q = normalitza(cerca.trim());
        return membres.filter(m =>
            (filtre === 'tots' || (filtre === 'actius') === m.actiu) &&
            (!q || normalitza(m.nom).includes(q) || normalitza(m.Usuari?.email ?? '').includes(q)));
    }, [membres, cerca, filtre]);

    const idActiu = seleccionatId ?? (ambPanell ? visibles[0]?.id ?? null : null);
    const seleccionat: MembreEquip | undefined = membres.find(m => m.id === idActiu);
    const opcionsPlantilla = (plantilles.data ?? []).map(p => ({ id: p.id, nom: p.nom }));
    const textBuit = membres.length === 0 ? t('equipBuit') : t('equipCapResultat');

    const obre = (id: number) => { setSeleccionatId(id); setFitxaOberta(true); };
    const tancaFitxa = () => { setFitxaOberta(false); if (!ambPanell) setSeleccionatId(null); };
    const despresBaixa = () => { setSeleccionatId(null); setFitxaOberta(false); };

    const fitxa = seleccionat ? (
        <EquipFitxa
            key={`${seleccionat.id}-${seleccionat.updatedAt ?? ''}`}
            membre={seleccionat}
            plantilles={opcionsPlantilla}
            serveis={serveis.data ?? []}
            onTancar={ambPanell ? undefined : tancaFitxa}
            onBaixa={despresBaixa}
            enModal={!ambPanell}
        />
    ) : null;

    const contingut = equip.isLoading ? (
        <ActivityIndicator color={theme.primary} style={styles.loading} />
    ) : equip.isError ? (
        <Text style={styles.error}>{t('equipErrorCarregar')}</Text>
    ) : isDesktop ? (
        <View style={styles.columns}>
            <View style={styles.colTaula}>
                <EquipTaula membres={visibles} seleccionatId={ambPanell ? idActiu : null} onSelecciona={obre} textBuit={textBuit} />
            </View>
            {ambPanell ? (
                <View style={styles.colFitxa}>
                    {fitxa ?? <View style={styles.placeholder}><Text style={styles.placeholderText}>{t('equipSelecciona')}</Text></View>}
                </View>
            ) : null}
        </View>
    ) : (
        <FlatList
            data={visibles}
            keyExtractor={m => String(m.id)}
            renderItem={({ item }) => <EquipTargeta membre={item} onPress={() => obre(item.id)} />}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            ListEmptyComponent={<Text style={styles.error}>{textBuit}</Text>}
            scrollEnabled={false}
        />
    );

    return (
        <View style={[styles.safe, { backgroundColor: theme.background }]}>
            <ScreenHeader
                icon="people-outline"
                title={t('equipTitle')}
                subtitle={isDesktop ? t('equipSubtitle') : t('equipPersones').replace('{n}', String(comptes.tots)).replace('{a}', String(comptes.actius))}
                right={isDesktop ? <HeaderButton label={t('equipNou')} icon="person-add-outline" onPress={() => setNouVisible(true)} /> : undefined}
            />
            <ScrollView contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]}>
                <View style={styles.inner}>
                    <EquipFiltres cerca={cerca} onCerca={setCerca} filtre={filtre} onFiltre={setFiltre} comptes={comptes} ambSegments={isDesktop || comptes.inactius > 0} />
                    {contingut}
                </View>
            </ScrollView>

            {!isDesktop ? <FloatingAddButton onPress={() => setNouVisible(true)} /> : null}

            <Modal visible={!ambPanell && fitxaOberta && !!seleccionat} animationType="slide" transparent onRequestClose={tancaFitxa}>
                <View style={styles.modalFons}>
                    <View style={[styles.modalCaixa, isDesktop && styles.modalCaixaDesktop]}>{fitxa}</View>
                </View>
            </Modal>

            <CreateTrabajadorModal
                visible={nouVisible}
                onClose={() => setNouVisible(false)}
                onSuccess={() => qc.invalidateQueries({ queryKey: CLAU_EQUIP })}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1 },
    content: { padding: 16, paddingBottom: 100 },
    contentDesktop: { paddingHorizontal: 40, paddingTop: 28, paddingBottom: 40 },
    inner: { width: '100%', maxWidth: SCREEN_MAX_WIDTH, alignSelf: 'center', gap: 20 },
    columns: { flexDirection: 'row', gap: 24, alignItems: 'flex-start' },
    colTaula: { flex: 1, minWidth: 0 },
    colFitxa: { width: 420 },
    placeholder: {
        flex: 1, minHeight: 240, alignItems: 'center', justifyContent: 'center', padding: 24,
        borderWidth: 1, borderStyle: 'dashed', borderColor: HC.borderInput, borderRadius: 16,
    },
    placeholderText: { fontSize: 14, color: HC.textMuted, textAlign: 'center' },
    loading: { marginVertical: 40 },
    error: { padding: 24, textAlign: 'center', fontSize: 14, color: HC.textMuted },
    sep: { height: 10 },
    modalFons: { flex: 1, backgroundColor: HC.modalOverlay, justifyContent: 'flex-end', alignItems: 'center' },
    modalCaixa: { width: '100%', height: '92%', borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden' },
    modalCaixaDesktop: { maxWidth: 560, height: '86%', marginBottom: '4%', borderRadius: 16 },
});
