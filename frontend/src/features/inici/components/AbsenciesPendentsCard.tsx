import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { HC } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';
import type { AbsenciaPendent, TipusAbsencia } from '@/features/home/services/absencies-pendents.service';
import { IniciCard } from './IniciCard';
import type { AbsenciaPropia } from '../services/inici.service';
import { rangAbsencia } from '../utils/dates';

type Accio = (id: number, estat: 'APROVADA' | 'REBUTJADA') => void;

const TIPUS_KEY: Record<TipusAbsencia, 'absVacances' | 'absMalaltia' | 'absPermis' | 'absAltre'> = {
    VACANCES: 'absVacances',
    MALALTIA: 'absMalaltia',
    PERMIS: 'absPermis',
    ALTRE: 'absAltre',
};

function useFormat() {
    const { t, lang } = useLanguage();
    const locale = lang === 'ca' ? 'ca-ES' : 'es-ES';
    return (inici: string, fi: string) =>
        rangAbsencia(inici, fi, locale, (n) => t('iniciDies').replace('{n}', String(n)));
}

/** Fila d'administrador: sol·licitud d'un treballador amb Aprovar / Rebutjar. */
function FilaAdmin({ item, onAccio, ocupat }: { item: AbsenciaPendent; onAccio: Accio; ocupat: boolean }) {
    const theme = useTheme();
    const { t } = useLanguage();
    const format = useFormat();
    return (
        <View style={styles.row}>
            <View style={styles.rowTop}>
                <Text style={styles.nom} numberOfLines={1}>{item.treballador.nom}</Text>
                <View style={styles.tipus}><Text style={styles.tipusText}>{t(TIPUS_KEY[item.tipus])}</Text></View>
            </View>
            <Text style={styles.dates}>{format(item.inici, item.fi)}</Text>
            {ocupat ? (
                <ActivityIndicator color={theme.primary} style={styles.loaderRow} />
            ) : (
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.btn, { backgroundColor: theme.primary }]}
                        onPress={() => onAccio(item.id, 'APROVADA')}
                        accessibilityRole="button"
                    >
                        <Text style={[styles.btnText, { color: theme.textOnPrimary }]}>{t('iniciAprovar')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => onAccio(item.id, 'REBUTJADA')} accessibilityRole="button">
                        <Text style={[styles.btnText, styles.btnSecondaryText]}>{t('iniciRebutjar')}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

/** Fila d'empleat: la seva sol·licitud, encara pendent. */
function FilaPropia({ item }: { item: AbsenciaPropia }) {
    const { t } = useLanguage();
    const format = useFormat();
    return (
        <View style={[styles.row, styles.rowInline]}>
            <View style={styles.body}>
                <Text style={styles.nom}>{t(TIPUS_KEY[item.tipus])}</Text>
                <Text style={styles.dates}>{format(item.inici, item.fi)}</Text>
            </View>
            <View style={styles.pendent}><Text style={styles.pendentText}>{t('iniciPendent')}</Text></View>
        </View>
    );
}

interface Props {
    esAdmin: boolean;
    pendents: AbsenciaPendent[];
    propies: AbsenciaPropia[];
    loading: boolean;
    onAccio: Accio;
    idOcupat: number | null;
}

export function AbsenciesPendentsCard({ esAdmin, pendents, propies, loading, onAccio, idOcupat }: Props) {
    const router = useRouter();
    const theme = useTheme();
    const { t } = useLanguage();
    const buit = esAdmin ? pendents.length === 0 : propies.length === 0;

    return (
        <IniciCard title={esAdmin ? t('iniciAbsenciesPendents') : t('iniciLesTevesAbsencies')}>
            {loading ? (
                <ActivityIndicator style={styles.loader} color={theme.primary} />
            ) : buit ? (
                <Text style={styles.empty}>{t('iniciCapAbsencia')}</Text>
            ) : esAdmin ? (
                pendents.map((a) => <FilaAdmin key={a.id} item={a} onAccio={onAccio} ocupat={idOcupat === a.id} />)
            ) : (
                propies.map((a) => <FilaPropia key={a.id} item={a} />)
            )}
            <TouchableOpacity onPress={() => router.push('/vacaciones')} accessibilityRole="link" style={styles.linkBtn}>
                <Text style={[styles.link, { color: theme.primary }]}>{t('iniciVeureTotes')}</Text>
            </TouchableOpacity>
        </IniciCard>
    );
}

const styles = StyleSheet.create({
    loader: { paddingVertical: 16 },
    loaderRow: { alignSelf: 'flex-start', paddingVertical: 8 },
    empty: { fontSize: 14, color: HC.textMuted, paddingVertical: 8 },
    row: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: HC.borderSoft, gap: 6 },
    rowInline: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
    body: { flex: 1, gap: 2 },
    nom: { fontSize: 14, fontWeight: '600', color: HC.textPrimary, flexShrink: 1 },
    dates: { fontSize: 13, color: HC.textMuted },
    tipus: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, backgroundColor: '#E0F2FE' },
    tipusText: { fontSize: 12, fontWeight: '600', color: '#075985' },
    pendent: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: HC.statusYellowBg },
    pendentText: { fontSize: 12, fontWeight: '600', color: '#92400E' },
    actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
    btn: { paddingHorizontal: 14, paddingVertical: 9, minHeight: 38, borderRadius: 10, justifyContent: 'center' },
    btnText: { fontSize: 13, fontWeight: '600' },
    btnSecondary: { backgroundColor: HC.card, borderWidth: 1, borderColor: HC.border },
    btnSecondaryText: { color: HC.textSecondary },
    linkBtn: { alignSelf: 'flex-start', marginTop: 10, paddingVertical: 6 },
    link: { fontSize: 14, fontWeight: '600' },
});
