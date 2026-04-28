import React, { useState } from 'react';
import {
    View, Text, ScrollView, SafeAreaView, StyleSheet,
    useWindowDimensions, TextInput, ActivityIndicator, TouchableOpacity,
    Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { PaginationRow } from '@/features/horarios/components/PaginationRow';
import { EstadisticasHeader } from '../components/EstadisticasHeader';
import { CreateClientModal } from '../components/modal/CreateClientModal';
import { ClientRow } from '../components/ClientRow';
import { MonthSegmentControl } from '../components/MonthSegmentControl';
import { DetallView } from '../components/DetallView';
import { useClientsEmpresa } from '../hooks/useClientsEmpresa';
import { useEstadisticasResum } from '../hooks/useEstadisticasResum';
import { deleteClient } from '../services/clients.service';
import { radius, spacing } from '@/constants/theme';
import type { ClientItem } from '../types/clients.types';

const MESOS_CA = ['Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny', 'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'];
const abreviarMes = (key: string) => key.split(' ')[0].slice(0, 3);
const toChartArrays = (monthMap: Record<string, { total: number }>) => {
    const entries = Object.entries(monthMap);
    return { vals: entries.map(([, v]) => v.total), labels: entries.map(([k]) => abreviarMes(k)) };
};
const mesLabel = (n: number) => n === 12 ? 'Últim any' : n === 24 ? 'Últims 2 anys' : `Últims ${n} mesos`;

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
function RevenueCard({ mesActual, mesPassat, style }: { mesActual: number; mesPassat: number; style?: any }) {
    const theme = useTheme();
    const now = new Date();
    const diff = Math.round((mesActual - mesPassat) * 100) / 100;
    const pct = mesPassat > 0 ? Math.round((diff / mesPassat) * 100) : 0;
    return (
        <View style={[s.card, style]}>
            <Text style={s.cardTitle}>Ingressos del Mes</Text>
            <Text style={s.cardSub}>Estimat — {MESOS_CA[now.getMonth()]} {now.getFullYear()}</Text>
            <Text style={[s.revNum, { color: theme.primary }]}>{mesActual.toLocaleString('ca-ES')}€</Text>
            <View style={s.deltaRow}>
                <Text style={[s.deltaUp, diff < 0 && { color: HC.red }]}>{diff >= 0 ? '+' : ''}{diff.toLocaleString('ca-ES')}€</Text>
                <Text style={[s.deltaPct, diff < 0 && { color: HC.red }]}>({diff >= 0 ? '+' : ''}{pct}%)</Text>
            </View>
            <Text style={s.prevLabel}>Mes anterior: {mesPassat.toLocaleString('ca-ES')}€</Text>
        </View>
    );
}

function VisitsCard({ vals, labels, mesos, onMesosChange, isLoading, style }: {
    vals: number[]; labels: string[]; mesos: number; onMesosChange: (v: number) => void; isLoading: boolean; style?: any;
}) {
    const theme = useTheme();
    const lastVal = vals[vals.length - 1] ?? 0;
    const lastLabel = labels[labels.length - 1] ?? '';
    return (
        <View style={[s.card, style]}>
            <View style={s.cardTitleRow}>
                <View>
                    <Text style={s.cardTitle}>Visites Mensuals</Text>
                    <Text style={s.cardSub}>{mesLabel(mesos)} · {lastLabel}: {lastVal} visites</Text>
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
    return (
        <View style={[s.card, style]}>
            <View style={s.cardTitleRow}>
                <View style={s.cardTitleLeft}>
                    <Text style={s.cardTitle}>No-Shows Mensuals</Text>
                    <View style={s.noShowBadge}>
                        <Text style={s.noShowBadgeText}>{noShowPct}% aquest mes</Text>
                    </View>
                </View>
                <MonthSegmentControl value={mesos} onChange={onMesosChange} />
            </View>
            <Text style={s.cardSub}>{mesLabel(mesos)}</Text>
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

    // Clients
    const [clientPage, setClientPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [showClientModal, setShowClientModal] = useState(false);
    const [clientToEdit, setClientToEdit] = useState<ClientItem | null>(null);
    const [orderByConc, setOrderByConc] = useState(false);
    const { data: clientsData, isLoading: clientsLoading, refetch: refetchClients } = useClientsEmpresa(1, orderByConc ? 'concurrencia' : 'nom');

    // Detall
    const [showDetall, setShowDetall] = useState(false);

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
                const msg = err?.response?.data?.message || 'No s\'ha pogut eliminar el client';
                Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
            }
        };
        if (Platform.OS === 'web') {
            if (window.confirm(`Segur que vols eliminar "${c.nom}"?`)) doDelete();
        } else {
            Alert.alert('Eliminar client', `Segur que vols eliminar "${c.nom}"?`, [
                { text: 'Cancel·lar', style: 'cancel' },
                { text: 'Eliminar', style: 'destructive', onPress: doDelete },
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
                <Text style={s.cardTitle}>Clients</Text>
                <View style={s.searchBox}>
                    <Ionicons name="search-outline" size={16} color={HC.textLight} />
                    <TextInput
                        style={s.searchInput}
                        placeholder="Buscar per nom o email..."
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
                    <Text style={[s.sortBtnText, orderByConc && { color: '#fff' }]}>Concurrència</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7} onPress={openCreateModal}>
                    <Text style={[s.addLink, { color: theme.primary }]}>+ Afegir client</Text>
                </TouchableOpacity>
                <View style={[s.countBadge, { backgroundColor: theme.primaryLight }]}>
                    <Text style={[s.countBadgeText, { color: theme.primary }]}>{totalClients} clients</Text>
                </View>
            </View>

            {isDesktop && (
                <View style={s.tableHead}>
                    <Text style={[s.th, { flex: 2 }]}>NOM</Text>
                    <Text style={[s.th, { flex: 2 }]}>EMAIL</Text>
                    <Text style={[s.th, { flex: 1 }]}>TELÈFON</Text>
                    <View style={{ width: 28 }} />
                </View>
            )}

            {clientsLoading ? (
                <ActivityIndicator color={theme.primary} style={{ paddingVertical: 20 }} />
            ) : filtered.length === 0 ? (
                <Text style={s.emptyText}>Sense resultats</Text>
            ) : filtered.map((c: ClientItem) => (
                <ClientRow key={c.id} client={c} isDesktop={isDesktop} onEdit={openEditModal} onDelete={confirmDelete} />
            ))}

            <PaginationRow
                currentPage={clientPage}
                totalPages={totalPages}
                totalItems={totalClients}
                itemsPerPage={5}
                onPageChange={(p) => { setSearchQuery(''); setClientPage(p); refetchClients(p); }}
                labelTemplate={() => `PÀGINA ${clientPage} DE ${totalPages}`}
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
                            : <View style={s.row}>
                                {clientsCard}
                                <RevenueCard mesActual={resumData?.ingresosMes.mesActual ?? 0} mesPassat={resumData?.ingresosMes.mesPassat ?? 0} style={s.w280} />
                            </View>
                        }
                        <View style={s.sectionHeader}>
                            <Text style={s.sectionTitle}>Estadístiques generals</Text>
                            <TouchableOpacity activeOpacity={0.7} onPress={() => setShowDetall(v => !v)}>
                                <Text style={[s.sectionBtn, { color: theme.primary }]}>
                                    {showDetall ? 'Amagar estadístiques' : 'Veure més estadístiques'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={s.row}>
                            <VisitsCard vals={visitesVals} labels={visitesLabels} mesos={mesVisites} onMesosChange={setMesVisites} isLoading={resumLoading} style={s.flex1} />
                            <NoShowsCard vals={noShowsVals} labels={noShowsLabels} mesos={mesNoShow} onMesosChange={setMesNoShow} noShowPct={noShowPct} isLoading={resumLoading} style={s.flex1} />
                        </View>
                    </>
                ) : (
                    <>
                        {showDetall
                            ? <DetallView onBack={() => setShowDetall(false)} isDesktop={isDesktop} />
                            : <>
                                {clientsCard}
                                <RevenueCard mesActual={resumData?.ingresosMes.mesActual ?? 0} mesPassat={resumData?.ingresosMes.mesPassat ?? 0} />
                            </>
                        }
                        <View style={s.sectionHeader}>
                            <Text style={s.sectionTitle}>Estadístiques generals</Text>
                            <TouchableOpacity activeOpacity={0.7} onPress={() => setShowDetall(v => !v)}>
                                <Text style={[s.sectionBtn, { color: theme.primary }]}>
                                    {showDetall ? 'Amagar estadístiques' : 'Veure més estadístiques'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <VisitsCard vals={visitesVals} labels={visitesLabels} mesos={mesVisites} onMesosChange={setMesVisites} isLoading={resumLoading} />
                        <NoShowsCard vals={noShowsVals} labels={noShowsLabels} mesos={mesNoShow} onMesosChange={setMesNoShow} noShowPct={noShowPct} isLoading={resumLoading} />
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
    contentWeb: { paddingHorizontal: spacing.gutterWeb, paddingTop: 24, paddingBottom: 40, gap: 20 },
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
    emptyText: { fontSize: 13, color: HC.textMuted, textAlign: 'center', paddingVertical: 20 },

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
