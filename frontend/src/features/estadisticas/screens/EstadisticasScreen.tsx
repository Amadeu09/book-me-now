import React, { useState } from 'react';
import {
    View, Text, ScrollView, SafeAreaView, StyleSheet,
    useWindowDimensions, TextInput, ActivityIndicator, TouchableOpacity,
    Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';
import { PaginationRow } from '@/features/horarios/components/PaginationRow';
import { EstadisticasHeader } from '../components/EstadisticasHeader';
import { CreateClientModal } from '../components/modal/CreateClientModal';
import { ClientRow } from '../components/ClientRow';
import { MonthSegmentControl } from '../components/MonthSegmentControl';
import { DetallView } from '../components/DetallView';
import { ValoracionsView } from '../components/ValoracionsView';
import { useClientsEmpresa } from '../hooks/useClientsEmpresa';
import { useEstadisticasResum } from '../hooks/useEstadisticasResum';
import { deleteClient } from '../services/clients.service';
import { radius, spacing } from '@/constants/theme';
import type { ClientItem } from '../types/clients.types';

const MES_KEYS = ['mesGen', 'mesFeb', 'mesMar', 'mesAbr', 'mesMai', 'mesJun',
    'mesJul', 'mesAgo', 'mesSep', 'mesOct', 'mesNov', 'mesDes'] as const;
const abreviarMes = (key: string) => key.split(' ')[0].slice(0, 3);
const toChartArrays = (monthMap: Record<string, { total: number }>) => {
    const entries = Object.entries(monthMap);
    return { vals: entries.map(([, v]) => v.total), labels: entries.map(([k]) => abreviarMes(k)) };
};
function getMesLabel(n: number, t: ReturnType<typeof useLanguage>['t']): string {
    if (n === 12) return t('statsLastYear');
    if (n === 24) return t('statsLast2Years');
    return `${t('statsLastMonths')} ${n} ${t('statsMonthsUnit')}`;
}

// ── Bar chart ────────────────────────────────────────────────────────────────
function Bars({ vals, labels, color }: { vals: number[]; labels: string[]; color: string }) {
    const max = Math.max(...vals, 1);
    return (
        <View style={s.barsWrap}>
            {vals.map((v, i) => {
                const isLast = i === vals.length - 1;
                const barH = Math.max(4, Math.round((v / max) * 82));
                return (
                    <View key={i} style={s.barCol}>
                        <Text style={[s.barVal, { color: isLast ? color : HC.textLight, fontWeight: isLast ? '700' : '400' }]}>{v}</Text>
                        <View style={[s.bar, { height: barH, backgroundColor: isLast ? color : color + '44' }]} />
                        <Text style={s.barLabel}>{labels[i]}</Text>
                    </View>
                );
            })}
        </View>
    );
}

// ── Cards ─────────────────────────────────────────────────────────────────
function RatingCard({ valoracio, style, onSeeMore }: { valoracio: number | null; style?: any; onSeeMore: () => void }) {
    const theme = useTheme();
    const { t } = useLanguage();
    return (
        <View style={[s.card, style]}>
            <View style={s.cardTitleRow}>
                <Text style={s.cardTitle}>{t('statsRating')}</Text>
                <TouchableOpacity activeOpacity={0.7} onPress={onSeeMore}>
                    <Text style={[s.addLink, { color: theme.primary }]}>{t('statsRatingSeeMore')}</Text>
                </TouchableOpacity>
            </View>
            {valoracio === null ? (
                <Text style={[s.cardSub, { marginTop: 16, marginBottom: 8 }]}>{t('statsNoRating')}</Text>
            ) : (
                <View style={s.ratingRow}>
                    <Text style={[s.revNum, { color: theme.primary }]}>{Number(valoracio).toFixed(1)}</Text>
                    <Ionicons name="star" size={32} color="#F59E0B" />
                </View>
            )}
        </View>
    );
}

function RevenueCard({ mesActual, mesPassat, style }: { mesActual: number; mesPassat: number; style?: any }) {
    const theme = useTheme();
    const { t } = useLanguage();
    const now = new Date();
    const diff = Math.round((mesActual - mesPassat) * 100) / 100;
    const pct = mesPassat > 0 ? Math.round((diff / mesPassat) * 100) : 0;
    const mesNom = t(MES_KEYS[now.getMonth()]);
    return (
        <View style={[s.card, style]}>
            <Text style={s.cardTitle}>{t('statsRevenue')}</Text>
            <Text style={s.cardSub}>{t('statsEstimated')} — {mesNom} {now.getFullYear()}</Text>
            <Text style={[s.revNum, { color: theme.primary }]}>{mesActual.toLocaleString('ca-ES')}€</Text>
            <View style={s.deltaRow}>
                <Text style={[s.deltaUp, diff < 0 && { color: HC.red }]}>{diff >= 0 ? '+' : ''}{diff.toLocaleString('ca-ES')}€</Text>
                <Text style={[s.deltaPct, diff < 0 && { color: HC.red }]}>({diff >= 0 ? '+' : ''}{pct}%)</Text>
            </View>
            <Text style={s.prevLabel}>{t('statsPrevMonth')}: {mesPassat.toLocaleString('ca-ES')}€</Text>
        </View>
    );
}

function VisitsCard({ vals, labels, mesos, onMesosChange, isLoading, style }: {
    vals: number[]; labels: string[]; mesos: number; onMesosChange: (v: number) => void; isLoading: boolean; style?: any;
}) {
    const theme = useTheme();
    const { t } = useLanguage();
    const lastVal = vals[vals.length - 1] ?? 0;
    const lastLabel = labels[labels.length - 1] ?? '';
    return (
        <View style={[s.card, style]}>
            <View style={s.cardTitleRow}>
                <View>
                    <Text style={s.cardTitle}>{t('statsVisits')}</Text>
                    <Text style={s.cardSub}>{getMesLabel(mesos, t)} · {lastLabel}: {lastVal} {t('statsVisitsUnit')}</Text>
                </View>
                <MonthSegmentControl value={mesos} onChange={onMesosChange} />
            </View>
            {isLoading
                ? <ActivityIndicator color={theme.primary} style={s.chartLoader} />
                : <Bars vals={vals} labels={labels} color={theme.primary} />
            }
        </View>
    );
}

function NoShowsCard({ vals, labels, mesos, onMesosChange, noShowPct, isLoading, style }: {
    vals: number[]; labels: string[]; mesos: number; onMesosChange: (v: number) => void; noShowPct: number; isLoading: boolean; style?: any;
}) {
    const { t } = useLanguage();
    return (
        <View style={[s.card, style]}>
            <View style={s.cardTitleRow}>
                <View style={s.cardTitleLeft}>
                    <Text style={s.cardTitle}>{t('statsNoShows')}</Text>
                    <View style={s.noShowBadge}>
                        <Text style={s.noShowBadgeText}>{noShowPct}% {t('statsThisMonth')}</Text>
                    </View>
                </View>
                <MonthSegmentControl value={mesos} onChange={onMesosChange} />
            </View>
            <Text style={s.cardSub}>{getMesLabel(mesos, t)}</Text>
            {isLoading
                ? <ActivityIndicator color={HC.red} style={s.chartLoader} />
                : <Bars vals={vals} labels={labels} color={HC.red} />
            }
        </View>
    );
}

// ── Screen ───────────────────────────────────────────────────────────────────
export default function EstadisticasScreen() {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const theme = useTheme();
    const { t } = useLanguage();

    // Clients
    const [clientPage, setClientPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [showClientModal, setShowClientModal] = useState(false);
    const [clientToEdit, setClientToEdit] = useState<ClientItem | null>(null);
    const [orderByConc, setOrderByConc] = useState(false);
    const { data: clientsData, isLoading: clientsLoading, refetch: refetchClients } = useClientsEmpresa(1, orderByConc ? 'concurrencia' : 'nom');

    // Detall / Valoracions
    const [showDetall, setShowDetall] = useState(false);
    const [showValoracionsView, setShowValoracionsView] = useState(false);

    // Stats
    const [mesVisites, setMesVisites] = useState(6);
    const [mesNoShow, setMesNoShow] = useState(6);
    const { data: resumData, isLoading: resumLoading } = useEstadisticasResum(mesVisites, mesNoShow);

    const { vals: visitesVals, labels: visitesLabels } = toChartArrays(resumData?.reservesMes ?? {});
    const { vals: noShowsVals, labels: noShowsLabels } = toChartArrays(resumData?.noShowsMes ?? {});
    const noShowPct = (() => {
        const v = visitesVals[visitesVals.length - 1] ?? 0;
        const n = noShowsVals[noShowsVals.length - 1] ?? 0;
        return v + n > 0 ? Math.round((n / (v + n)) * 100) : 0;
    })();

    const openCreateModal = () => { setClientToEdit(null); setShowClientModal(true); };
    const openEditModal = (c: ClientItem) => { setClientToEdit(c); setShowClientModal(true); };
    const closeClientModal = () => { setShowClientModal(false); setClientToEdit(null); };

    const confirmDelete = (c: ClientItem) => {
        const doDelete = async () => {
            try {
                await deleteClient(c.id);
                refetchClients(clientPage);
            } catch (err: any) {
                const msg = err?.response?.data?.message || t('statsDeleteClientError');
                Platform.OS === 'web' ? window.alert(msg) : Alert.alert(t('error'), msg);
            }
        };
        if (Platform.OS === 'web') {
            if (window.confirm(`${t('statsDeleteClientConfirm')} "${c.nom}"?`)) doDelete();
        } else {
            Alert.alert(t('statsDeleteClientTitle'), `${t('statsDeleteClientConfirm')} "${c.nom}"?`, [
                { text: t('cancel'), style: 'cancel' },
                { text: t('delete'), style: 'destructive', onPress: doDelete },
            ]);
        }
    };

    const clients = clientsData?.data ?? [];
    const filtered = clients.filter((c: ClientItem) =>
        c.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.email ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    const totalClients = clientsData?.total ?? 0;
    const totalPages = clientsData?.totalPages ?? 1;

    const clientsCard = (
        <View style={[s.card, isDesktop && s.flex1]}>
            <View style={s.cardHeaderRow}>
                <Text style={s.cardTitle}>{t('statsClients')}</Text>
                <View style={s.searchBox}>
                    <Ionicons name="search-outline" size={16} color={HC.textLight} />
                    <TextInput
                        style={s.searchInput}
                        placeholder={t('statsSearchPh')}
                        placeholderTextColor={HC.textLight}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => { setOrderByConc(v => !v); setClientPage(1); setSearchQuery(''); }}
                    style={[s.sortBtn, orderByConc && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                >
                    <Ionicons name="swap-vertical-outline" size={14} color={orderByConc ? '#fff' : HC.textMuted} />
                    <Text style={[s.sortBtnText, orderByConc && { color: '#fff' }]}>{t('statsConcurrency')}</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7} onPress={openCreateModal}>
                    <Text style={[s.addLink, { color: theme.primary }]}>{t('statsAddClient')}</Text>
                </TouchableOpacity>
                <View style={[s.countBadge, { backgroundColor: theme.primaryLight }]}>
                    <Text style={[s.countBadgeText, { color: theme.primary }]}>{totalClients} {t('statsClientsLabel')}</Text>
                </View>
            </View>

            {isDesktop && (
                <View style={s.tableHead}>
                    <Text style={[s.th, { flex: 2 }]}>{t('statsColNom')}</Text>
                    <Text style={[s.th, { flex: 2 }]}>{t('statsColEmail')}</Text>
                    <Text style={[s.th, { flex: 1 }]}>{t('statsColTelefon')}</Text>
                    <Text style={[s.th, { flex: 1 }]}>{t('statsColVisites')}</Text>
                    <View style={{ width: 28 }} />
                </View>
            )}

            <View style={s.tableBody}>
                {clientsLoading ? (
                    <ActivityIndicator color={theme.primary} style={{ paddingVertical: 20 }} />
                ) : filtered.length === 0 ? (
                    <Text style={s.emptyText}>{t('statsNoResults')}</Text>
                ) : filtered.map((c: ClientItem) => (
                    <ClientRow key={c.id} client={c} isDesktop={isDesktop} onEdit={openEditModal} onDelete={confirmDelete} />
                ))}
            </View>

            <PaginationRow
                currentPage={clientPage}
                totalPages={totalPages}
                totalItems={totalClients}
                itemsPerPage={5}
                onPageChange={(p) => { setSearchQuery(''); setClientPage(p); refetchClients(p); }}
                labelTemplate={() => `${t('statsPageLabel')} ${clientPage} DE ${totalPages}`}
            />
        </View>
    );

    return (
        <SafeAreaView style={[s.safe, { backgroundColor: theme.background }]}>
            <EstadisticasHeader />
            <CreateClientModal
                visible={showClientModal}
                onClose={closeClientModal}
                onSuccess={() => { setClientPage(1); refetchClients(1); }}
                initialData={clientToEdit ?? undefined}
            />
            <ScrollView contentContainerStyle={[s.content, isDesktop && s.contentWeb]} showsVerticalScrollIndicator={false}>
                {isDesktop ? (
                    <>
                        {showDetall
                            ? <DetallView onBack={() => setShowDetall(false)} isDesktop={isDesktop} />
                            : showValoracionsView
                                ? <ValoracionsView onBack={() => setShowValoracionsView(false)} isDesktop={isDesktop} />
                                : <View style={s.row}>
                                    {clientsCard}
                                    <View style={[s.w280, s.col]}>
                                        <RevenueCard mesActual={resumData?.ingresosMes.mesActual ?? 0} mesPassat={resumData?.ingresosMes.mesPassat ?? 0} />
                                        <RatingCard valoracio={resumData?.valoracioMitjana ?? null} onSeeMore={() => setShowValoracionsView(true)} />
                                    </View>
                                </View>
                        }
                        {!showValoracionsView && (
                            <>
                                <View style={s.sectionHeader}>
                                    <Text style={s.sectionTitle}>{t('statsGeneralTitle')}</Text>
                                    <TouchableOpacity activeOpacity={0.7} onPress={() => setShowDetall(v => !v)}>
                                        <Text style={[s.sectionBtn, { color: theme.primary }]}>
                                            {showDetall ? t('statsHideMore') : t('statsShowMore')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={s.row}>
                                    <VisitsCard vals={visitesVals} labels={visitesLabels} mesos={mesVisites} onMesosChange={setMesVisites} isLoading={resumLoading} style={s.flex1} />
                                    <NoShowsCard vals={noShowsVals} labels={noShowsLabels} mesos={mesNoShow} onMesosChange={setMesNoShow} noShowPct={noShowPct} isLoading={resumLoading} style={s.flex1} />
                                </View>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        {showDetall
                            ? <DetallView onBack={() => setShowDetall(false)} isDesktop={isDesktop} />
                            : showValoracionsView
                                ? <ValoracionsView onBack={() => setShowValoracionsView(false)} isDesktop={isDesktop} />
                                : <>
                                    {clientsCard}
                                    <RevenueCard mesActual={resumData?.ingresosMes.mesActual ?? 0} mesPassat={resumData?.ingresosMes.mesPassat ?? 0} />
                                    <RatingCard valoracio={resumData?.valoracioMitjana ?? null} onSeeMore={() => setShowValoracionsView(true)} />
                                </>
                        }
                        {!showValoracionsView && (
                            <>
                                <View style={s.sectionHeader}>
                                    <Text style={s.sectionTitle}>{t('statsGeneralTitle')}</Text>
                                    <TouchableOpacity activeOpacity={0.7} onPress={() => setShowDetall(v => !v)}>
                                        <Text style={[s.sectionBtn, { color: theme.primary }]}>
                                            {showDetall ? t('statsHideMore') : t('statsShowMore')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <VisitsCard vals={visitesVals} labels={visitesLabels} mesos={mesVisites} onMesosChange={setMesVisites} isLoading={resumLoading} />
                                <NoShowsCard vals={noShowsVals} labels={noShowsLabels} mesos={mesNoShow} onMesosChange={setMesNoShow} noShowPct={noShowPct} isLoading={resumLoading} />
                            </>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    safe: { flex: 1 },
    content: { padding: spacing.gutter, gap: 16, paddingBottom: 32 },
    contentWeb: {
        paddingTop: 70,
        paddingHorizontal: 30,
        paddingBottom: 30,
        gap: 20,
        maxWidth: 1600,
        alignSelf: 'center',
        width: '100%'
    },
    row: { flexDirection: 'row', gap: 16 },
    flex1: { flex: 1 },
    w280: { width: 280 },

    card: {
        borderRadius: radius.lg,
        padding: 16,
        backgroundColor: HC.card,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },
    cardTitle: { fontSize: 16, fontWeight: '700', color: HC.textPrimary },
    cardSub: { fontSize: 12, color: HC.textMuted, marginTop: 2, marginBottom: 4 },
    cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
    cardTitleLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },

    cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' },
    searchBox: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderColor: HC.border, borderRadius: 10,
        paddingHorizontal: 10, paddingVertical: 7, gap: 6, minWidth: 140,
    },
    searchInput: { flex: 1, fontSize: 13, color: HC.textPrimary, outlineStyle: 'none' } as object,
    addLink: { fontSize: 14, fontWeight: '600' },
    sortBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        borderWidth: 1, borderColor: HC.border, borderRadius: 8,
        paddingHorizontal: 10, paddingVertical: 7,
    },
    sortBtnText: { fontSize: 13, fontWeight: '600', color: HC.textMuted },
    countBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
    countBadgeText: { fontSize: 13, fontWeight: '700' },

    tableHead: {
        flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 4,
        borderBottomWidth: 1, borderBottomColor: HC.border, marginBottom: 2,
    },
    th: { fontSize: 11, fontWeight: '700', color: HC.textMuted, letterSpacing: 0.5, textTransform: 'uppercase' },
    tableBody: { minHeight: 205 },
    emptyText: { fontSize: 13, color: HC.textMuted, textAlign: 'center', paddingVertical: 20 },

    col: { gap: 16 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, marginBottom: 6 },
    revNum: { fontSize: 38, fontWeight: '800', marginTop: 12, marginBottom: 6 },
    deltaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    deltaUp: { fontSize: 14, fontWeight: '700', color: HC.green },
    deltaPct: { fontSize: 13, color: HC.green },
    prevLabel: { fontSize: 12, color: HC.textMuted, marginTop: 2 },

    noShowBadge: { backgroundColor: HC.redLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
    noShowBadgeText: { fontSize: 11, fontWeight: '600', color: HC.red },

    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: HC.textPrimary },
    sectionBtn: { fontSize: 13, fontWeight: '600' },

    chartLoader: { paddingVertical: 20 },
    barsWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 122, marginTop: 12 },
    barCol: { flex: 1, alignItems: 'center', gap: 3 },
    barVal: { fontSize: 10 },
    bar: { width: '100%', borderRadius: 3 },
    barLabel: { fontSize: 10, color: HC.textMuted },
});
