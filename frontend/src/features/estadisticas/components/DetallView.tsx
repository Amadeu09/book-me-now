import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC, cardShadow } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';
import { radius } from '@/constants/theme';
import { useEstadisticasDetall } from '../hooks/useEstadisticasDetall';
import type { DetallServei, DetallTreballador } from '../types/estadisticas.types';

const MES_KEYS = ['mesGen', 'mesFeb', 'mesMar', 'mesAbr', 'mesMai', 'mesJun',
    'mesJul', 'mesAgo', 'mesSep', 'mesOct', 'mesNov', 'mesDes'] as const;

interface Props {
    onBack: () => void;
    isDesktop: boolean;
}

export function DetallView({ onBack, isDesktop }: Props) {
    const theme = useTheme();
    const { t } = useLanguage();
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [mes, setMes] = useState(now.getMonth() + 1);
    const { data, isLoading } = useEstadisticasDetall(year, mes);

    const isCurrentMonth = year === now.getFullYear() && mes === now.getMonth() + 1;

    const prevMonth = () => {
        if (mes === 1) { setMes(12); setYear(y => y - 1); }
        else setMes(m => m - 1);
    };
    const nextMonth = () => {
        if (mes === 12) { setMes(1); setYear(y => y + 1); }
        else setMes(m => m + 1);
    };

    return (
        <View style={dv.container}>
            {/* Nav row: back + month navigation */}
            <View style={dv.navRow}>
                <TouchableOpacity style={dv.backBtn} onPress={onBack} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={16} color={theme.primary} />
                    <Text style={[dv.backText, { color: theme.primary }]}>{t('back')}</Text>
                </TouchableOpacity>
                <View style={dv.monthNav}>
                    <TouchableOpacity onPress={prevMonth} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} activeOpacity={0.7}>
                        <Ionicons name="chevron-back" size={20} color={HC.textPrimary} />
                    </TouchableOpacity>
                    <Text style={dv.monthLabel}>{data?.mes ?? `${t(MES_KEYS[mes - 1])} ${year}`}</Text>
                    <TouchableOpacity onPress={nextMonth} disabled={isCurrentMonth} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} activeOpacity={0.7}>
                        <Ionicons name="chevron-forward" size={20} color={isCurrentMonth ? HC.textLight : HC.textPrimary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            {isLoading ? (
                <ActivityIndicator color={theme.primary} style={dv.loader} />
            ) : (
                <View style={[dv.row, !isDesktop && dv.col]}>
                    <ServeisCard serveis={data?.serveisDestacats ?? []} isDesktop={isDesktop} />
                    <TreballadorsCard treballadors={data?.treballadorsDestacats ?? []} isDesktop={isDesktop} />
                </View>
            )}
        </View>
    );
}

function ServeisCard({ serveis, isDesktop }: { serveis: DetallServei[]; isDesktop: boolean }) {
    const { t } = useLanguage();
    return (
        <View style={[dv.card, isDesktop && dv.flex1]}>
            <Text style={dv.cardTitle}>{t('detallFeaturedServices')}</Text>
            {isDesktop && (
                <View style={dv.tableHead}>
                    <Text style={[dv.th, dv.flex2]}>{t('detallColService')}</Text>
                    <Text style={[dv.th, dv.w90]}>{t('detallColReserves')}</Text>
                    <Text style={[dv.th, dv.w110]}>{t('detallColRevenue')}</Text>
                </View>
            )}
            {serveis.length === 0 ? (
                <Text style={dv.empty}>{t('detallNoReserves')}</Text>
            ) : serveis.map(sv => (
                isDesktop ? (
                    <View key={sv.id} style={dv.tableRow}>
                        <Text style={[dv.tdPrimary, dv.flex2]} numberOfLines={1}>{sv.nom}</Text>
                        <Text style={[dv.tdMuted, dv.w90]}>{sv.reserves}</Text>
                        <Text style={[dv.tdMuted, dv.w110]}>{sv.ingressos.toLocaleString('ca-ES')}€</Text>
                    </View>
                ) : (
                    <View key={sv.id} style={dv.mobileRow}>
                        <Text style={dv.tdPrimary} numberOfLines={1}>{sv.nom}</Text>
                        <Text style={dv.tdMuted}>{sv.reserves} {t('detallReservesUnit')} · {sv.ingressos.toLocaleString('ca-ES')}€</Text>
                    </View>
                )
            ))}
        </View>
    );
}

function TreballadorsCard({ treballadors, isDesktop }: { treballadors: DetallTreballador[]; isDesktop: boolean }) {
    const { t } = useLanguage();
    return (
        <View style={[dv.card, isDesktop && dv.flex1]}>
            <Text style={dv.cardTitle}>{t('detallFeaturedWorkers')}</Text>
            {isDesktop && (
                <View style={dv.tableHead}>
                    <Text style={[dv.th, dv.flex2]}>{t('detallColWorker')}</Text>
                    <Text style={[dv.th, dv.w90]}>{t('detallColReserves')}</Text>
                    <Text style={[dv.th, dv.w110]}>{t('detallColRevenue')}</Text>
                    <Text style={[dv.th, dv.w90]}>{t('detallColNoShows')}</Text>
                </View>
            )}
            {treballadors.length === 0 ? (
                <Text style={dv.empty}>{t('detallNoReserves')}</Text>
            ) : treballadors.map(tr => (
                isDesktop ? (
                    <View key={tr.id} style={dv.tableRow}>
                        <Text style={[dv.tdPrimary, dv.flex2]} numberOfLines={1}>{tr.nom}</Text>
                        <Text style={[dv.tdMuted, dv.w90]}>{tr.reserves}</Text>
                        <Text style={[dv.tdMuted, dv.w110]}>{tr.ingressos.toLocaleString('ca-ES')}€</Text>
                        <Text style={[dv.tdMuted, dv.w90]}>{tr.noShows}</Text>
                    </View>
                ) : (
                    <View key={tr.id} style={dv.mobileRow}>
                        <Text style={dv.tdPrimary} numberOfLines={1}>{tr.nom}</Text>
                        <Text style={dv.tdMuted}>{tr.reserves} {t('detallReservesUnit')} · {tr.ingressos.toLocaleString('ca-ES')}€ · {tr.noShows} {t('detallNoShowsUnit')}</Text>
                    </View>
                )
            ))}
        </View>
    );
}

const dv = StyleSheet.create({
    container: { gap: 16 },
    navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    backText: { fontSize: 14, fontWeight: '600' },
    monthNav: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    monthLabel: { fontSize: 15, fontWeight: '700', color: HC.textPrimary, minWidth: 120, textAlign: 'center' },

    loader: { paddingVertical: 32 },
    row: { flexDirection: 'row', gap: 16 },
    col: { flexDirection: 'column' },
    flex1: { flex: 1 },

    card: {
        borderRadius: radius.lg,
        padding: 16,
        backgroundColor: HC.card,
        ...cardShadow,
        elevation: 2,
    },
    cardTitle: { fontSize: 16, fontWeight: '700', color: HC.textPrimary, marginBottom: 12 },

    tableHead: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: HC.border,
        marginBottom: 2,
    },
    th: { fontSize: 11, fontWeight: '700', color: HC.textMuted, letterSpacing: 0.5, textTransform: 'uppercase' },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: HC.borderSoft,
    },
    mobileRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: HC.borderSoft },
    tdPrimary: { fontSize: 14, fontWeight: '600', color: HC.textPrimary },
    tdMuted: { fontSize: 13, color: HC.textMuted, marginTop: 1 },
    empty: { fontSize: 13, color: HC.textMuted, textAlign: 'center', paddingVertical: 20 },

    w90: { width: 90 },
    w110: { width: 110 },
});
