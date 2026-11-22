import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { HC } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';
import { IniciCard } from './IniciCard';
import { PeriodeSelector } from './PeriodeSelector';
import type { CitaInici } from '../services/inici.service';
import { diaCurt, horaCurta, type PeriodeCites } from '../utils/dates';

const MAX_FILES = 8;

interface CitesPendentsCardProps {
    title: string;
    cites: CitaInici[];
    loading: boolean;
    periode: PeriodeCites;
    onPeriode: (p: PeriodeCites) => void;
    mostrarTreballador: boolean;
}

function CitaRow({ cita, mostrarTreballador, mostrarDia }: { cita: CitaInici; mostrarTreballador: boolean; mostrarDia: boolean }) {
    const { t, lang } = useLanguage();
    const locale = lang === 'ca' ? 'ca-ES' : 'es-ES';
    const client = cita.client?.nom ?? cita.clientNom ?? t('clientFallback');
    const servei = cita.servei?.nom ?? t('serviceFallback');
    const durada = cita.servei?.duradaMin ? ` · ${cita.servei.duradaMin} min` : '';
    return (
        <View style={styles.row}>
            <View style={styles.hora}>
                <Text style={styles.horaText}>{horaCurta(cita.dataHora, locale)}</Text>
                {mostrarDia && <Text style={styles.dia}>{diaCurt(cita.dataHora, locale)}</Text>}
            </View>
            <View style={styles.body}>
                <Text style={styles.client} numberOfLines={1}>{client}</Text>
                <Text style={styles.servei} numberOfLines={1}>{servei}{durada}</Text>
            </View>
            {mostrarTreballador && cita.treballador?.nom ? (
                <View style={styles.worker}>
                    <Text style={styles.workerText} numberOfLines={1}>{cita.treballador.nom}</Text>
                </View>
            ) : null}
        </View>
    );
}

export function CitesPendentsCard({ title, cites, loading, periode, onPeriode, mostrarTreballador }: CitesPendentsCardProps) {
    const router = useRouter();
    const theme = useTheme();
    const { t } = useLanguage();
    const visibles = cites.slice(0, MAX_FILES);

    return (
        <IniciCard title={title} right={<PeriodeSelector value={periode} onChange={onPeriode} />}>
            {loading ? (
                <ActivityIndicator style={styles.loader} color={theme.primary} />
            ) : visibles.length === 0 ? (
                <Text style={styles.empty}>{t('iniciCapCitaPendent')}</Text>
            ) : (
                visibles.map((c) => (
                    <CitaRow key={c.id} cita={c} mostrarTreballador={mostrarTreballador} mostrarDia={periode === 'setmana'} />
                ))
            )}
            <TouchableOpacity onPress={() => router.push('/bookings')} accessibilityRole="link" style={styles.linkBtn}>
                <Text style={[styles.link, { color: theme.primary }]}>{t('iniciObrirAgenda')}</Text>
            </TouchableOpacity>
        </IniciCard>
    );
}

const styles = StyleSheet.create({
    loader: { paddingVertical: 24 },
    empty: { fontSize: 14, color: HC.textMuted, paddingVertical: 16 },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 11,
        borderTopWidth: 1,
        borderTopColor: HC.borderSoft,
    },
    hora: { width: 56 },
    horaText: { fontSize: 15, fontWeight: '700', color: HC.textPrimary },
    dia: { fontSize: 11, color: HC.textMuted, marginTop: 1, textTransform: 'capitalize' },
    body: { flex: 1, minWidth: 0, gap: 2 },
    client: { fontSize: 14, fontWeight: '600', color: HC.textPrimary },
    servei: { fontSize: 13, color: HC.textMuted },
    worker: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: '#F1F5F9', maxWidth: 120 },
    workerText: { fontSize: 12, color: HC.textSecondary },
    linkBtn: { alignSelf: 'flex-start', marginTop: 10, paddingVertical: 6 },
    link: { fontSize: 14, fontWeight: '600' },
});
