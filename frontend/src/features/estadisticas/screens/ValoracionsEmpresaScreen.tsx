import React, { useEffect, useRef, useState } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView,
    Image, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/core/theme/ThemeProvider';
import { HC } from '@/features/home/constants/inicio.constants';
import { useLanguage } from '@/core/i18n';
import { getUser } from '@/utils/session';
import { radius } from '@/constants/theme';
import { useValoracionsEmpresa } from '../hooks/useValoracionsEmpresa';
import { useValoraciónsTreballador } from '../hooks/useValoraciónsTreballador';
import { ValoracioTypeSelector, ValoracioSelectorValue } from '../components/ValoracioTypeSelector';
import { getTreballadorsPaginats } from '@/features/horarios/services/treballadors.service';
import type { ValoracioItem } from '../types/estadisticas.types';
import type { TreballadorBackendItem } from '@/features/horarios/types/treballadors.types';

const LIMIT = 5;

// ── Subcomponents ─────────────────────────────────────────────────────────────

function StarRow({ puntuacio }: { puntuacio: number }) {
    const rating = Math.round(Number(puntuacio) * 2) / 2;
    return (
        <View style={{ flexDirection: 'row', gap: 2 }}>
            {Array.from({ length: 5 }).map((_, i) => {
                const name = i + 1 <= rating ? 'star' : i < rating ? 'star-half' : 'star-outline';
                return <Ionicons key={i} name={name as any} size={13} color="#F59E0B" />;
            })}
        </View>
    );
}

function ReviewCard({ item }: { item: ValoracioItem }) {
    const theme = useTheme();
    const initial = (item.nomClient ?? 'C').charAt(0).toUpperCase();
    return (
        <View style={[s.reviewCard, { backgroundColor: HC.card }]}>
            <View style={s.reviewTop}>
                <View style={[s.avatar, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}>
                    <Text style={[s.avatarText, { color: theme.primary }]}>{initial}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={s.clientNom}>{item.nomClient ?? 'Client anònim'}</Text>
                    {item.servei && <Text style={s.serveiNom}>{item.servei.nom}</Text>}
                </View>
                <StarRow puntuacio={item.puntuacio} />
            </View>
            {item.comentari ? <Text style={s.comentari}>{item.comentari}</Text> : null}
        </View>
    );
}

function EntityCard({
    fotoPerfil, nom, mitjanaTotal, total, isLoading,
}: { fotoPerfil?: string; nom: string; mitjanaTotal: number | null; total: number; isLoading: boolean }) {
    const theme = useTheme();
    const { t } = useLanguage();
    return (
        <View style={[s.entityCard, { backgroundColor: theme.primaryLight, borderColor: theme.primary, borderWidth: 0.5 }]}>
            {fotoPerfil
                ? <Image source={{ uri: fotoPerfil }} style={s.entityImg} />
                : <View style={[s.entityImgFallback, { backgroundColor: theme.primary }]}>
                    <Text style={[s.entityImgLetter, { color: theme.textOnPrimary }]}>
                        {nom.charAt(0).toUpperCase()}
                    </Text>
                </View>
            }
            <View style={{ flex: 1 }}>
                <Text style={s.entityNom}>{nom}</Text>
                {mitjanaTotal != null
                    ? <View style={s.ratingRow}>
                        <Ionicons name="star" size={16} color="#F59E0B" />
                        <Text style={[s.ratingNum, { color: theme.primary }]}>{Number(mitjanaTotal).toFixed(1)}</Text>
                        <Text style={s.ratingCount}>({total} {t('valoracionsCount')})</Text>
                    </View>
                    : !isLoading && <Text style={s.noRating}>{t('statsNoRating')}</Text>
                }
            </View>
        </View>
    );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ValoracionsEmpresaScreen() {
    const router = useRouter();
    const theme = useTheme();
    const { t } = useLanguage();
    const scrollRef = useRef<ScrollView>(null);

    const [selector, setSelector] = useState<ValoracioSelectorValue>('empresa');
    const [page, setPage] = useState(1);
    const [empresaInfo, setEmpresaInfo] = useState<{ nom: string; fotoPerfil?: string } | null>(null);
    const [workers, setWorkers] = useState<TreballadorBackendItem[]>([]);
    const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);

    const empresaHook = useValoracionsEmpresa(selector === 'empresa' ? page : 1, LIMIT);
    const treballadorHook = useValoraciónsTreballador(
        selector === 'treballadors' ? selectedWorkerId : null,
        selector === 'treballadors' ? page : 1,
        LIMIT,
    );

    useEffect(() => {
        getUser().then(u => {
            if (u?.empresa) setEmpresaInfo({ nom: u.empresa.nom, fotoPerfil: u.empresa.fotoPerfil });
        });
        getTreballadorsPaginats(1, 100).then(res => {
            const list: TreballadorBackendItem[] = res.data ?? [];
            setWorkers(list);
            if (list.length > 0) setSelectedWorkerId(list[0].id);
        }).catch(() => {});
    }, []);

    const handleSelectorChange = (v: ValoracioSelectorValue) => {
        setSelector(v);
        setPage(1);
        scrollRef.current?.scrollTo({ y: 0, animated: true });
    };

    const handleWorkerSelect = (id: number) => {
        setSelectedWorkerId(id);
        setPage(1);
        scrollRef.current?.scrollTo({ y: 0, animated: true });
    };

    const goPage = (next: number) => {
        setPage(next);
        scrollRef.current?.scrollTo({ y: 0, animated: true });
    };

    const activeData = selector === 'empresa' ? empresaHook.data : treballadorHook.data;
    const activeLoading = selector === 'empresa' ? empresaHook.isLoading : treballadorHook.isLoading;
    const selectedWorker = workers.find(w => w.id === selectedWorkerId);

    return (
        <SafeAreaView style={[s.safe, { backgroundColor: theme.background }]}>
            <ScrollView ref={scrollRef} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

                {/* TopBar */}
                <View style={s.topBar}>
                    <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
                        <Ionicons name="chevron-back" size={24} color={theme.primary} />
                    </TouchableOpacity>
                    <Text style={s.topTitle}>{t('valoracionsTitle')}</Text>
                </View>

                {/* Selector */}
                <View style={s.selectorWrap}>
                    <ValoracioTypeSelector value={selector} onChange={handleSelectorChange} />
                </View>

                {/* Entity block — empresa */}
                {selector === 'empresa' && empresaInfo && (
                    <EntityCard
                        fotoPerfil={empresaInfo.fotoPerfil}
                        nom={empresaInfo.nom}
                        mitjanaTotal={empresaHook.data?.mitjanaTotal ?? null}
                        total={empresaHook.data?.total ?? 0}
                        isLoading={empresaHook.isLoading}
                    />
                )}

                {/* Entity block — treballadors */}
                {selector === 'treballadors' && (
                    <>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={s.pillsScroll}
                            contentContainerStyle={s.pillsContent}
                        >
                            {workers.map(w => (
                                <TouchableOpacity
                                    key={w.id}
                                    style={[s.pill, selectedWorkerId === w.id && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                                    onPress={() => handleWorkerSelect(w.id)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[s.pillText, selectedWorkerId === w.id && { color: theme.textOnPrimary }]}>
                                        {w.nom}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        {selectedWorker && (
                            <EntityCard
                                fotoPerfil={selectedWorker.Usuari?.fotoPerfil ?? undefined}
                                nom={selectedWorker.nom}
                                mitjanaTotal={treballadorHook.data?.mitjanaTotal ?? null}
                                total={treballadorHook.data?.total ?? 0}
                                isLoading={treballadorHook.isLoading}
                            />
                        )}
                    </>
                )}

                {/* Reviews */}
                {activeLoading
                    ? <ActivityIndicator color={theme.primary} style={s.loader} />
                    : activeData?.data.length === 0
                        ? <Text style={s.empty}>{t('valoracionsEmpty')}</Text>
                        : activeData?.data.map(item => <ReviewCard key={item.id} item={item} />)
                }

                {/* Pagination */}
                {activeData && activeData.totalPages > 1 && (
                    <View style={s.pagination}>
                        <TouchableOpacity
                            style={[s.pageBtn, page <= 1 && s.pageBtnDisabled]}
                            onPress={() => goPage(page - 1)}
                            disabled={page <= 1}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="chevron-back" size={18} color={page <= 1 ? HC.textMuted : theme.primary} />
                        </TouchableOpacity>
                        <Text style={s.pageText}>{t('statsPageLabel')} {page} / {activeData.totalPages}</Text>
                        <TouchableOpacity
                            style={[s.pageBtn, page >= activeData.totalPages && s.pageBtnDisabled]}
                            onPress={() => goPage(page + 1)}
                            disabled={page >= activeData.totalPages}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="chevron-forward" size={18} color={page >= activeData.totalPages ? HC.textMuted : theme.primary} />
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    safe: { flex: 1 },
    content: { padding: 16, paddingBottom: 32, gap: 12 },
    topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    backBtn: { marginRight: 8, padding: 4 },
    topTitle: { fontSize: 18, fontWeight: '700', color: HC.textPrimary },
    selectorWrap: { alignItems: 'flex-start' },
    entityCard: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        padding: 16, borderRadius: radius.lg,
    },
    entityImg: { width: 60, height: 60, borderRadius: 30 },
    entityImgFallback: {
        width: 60, height: 60, borderRadius: 30,
        alignItems: 'center', justifyContent: 'center',
    },
    entityImgLetter: { fontSize: 24, fontWeight: '700' },
    entityNom: { fontSize: 17, fontWeight: '700', color: HC.textPrimary, marginBottom: 4 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    ratingNum: { fontSize: 16, fontWeight: '700' },
    ratingCount: { fontSize: 13, color: HC.textMuted },
    noRating: { fontSize: 13, color: HC.textMuted },
    pillsScroll: { flexGrow: 0 },
    pillsContent: { gap: 8, paddingVertical: 4 },
    pill: {
        paddingVertical: 6, paddingHorizontal: 14,
        borderRadius: 999, borderWidth: 1,
        borderColor: HC.textLight, backgroundColor: HC.card,
    },
    pillText: { fontSize: 13, fontWeight: '500', color: HC.textPrimary },
    loader: { marginTop: 32 },
    empty: { textAlign: 'center', color: HC.textMuted, marginTop: 32, fontSize: 14 },
    reviewCard: {
        borderRadius: radius.md, padding: 14,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
        gap: 8,
    },
    reviewTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    avatar: {
        width: 38, height: 38, borderRadius: 19,
        alignItems: 'center', justifyContent: 'center', borderWidth: 0.5,
    },
    avatarText: { fontSize: 16, fontWeight: '700' },
    clientNom: { fontSize: 14, fontWeight: '600', color: HC.textPrimary },
    serveiNom: { fontSize: 12, color: HC.textMuted },
    comentari: { fontSize: 13, color: HC.textSecondary, lineHeight: 19 },
    pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 8 },
    pageBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: HC.card, alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 1,
    },
    pageBtnDisabled: { opacity: 0.35 },
    pageText: { fontSize: 13, fontWeight: '600', color: HC.textPrimary },
});
