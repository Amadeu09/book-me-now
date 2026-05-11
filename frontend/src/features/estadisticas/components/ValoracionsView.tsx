import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Image,
    TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/core/theme/ThemeProvider';
import { HC } from '@/features/home/constants/inicio.constants';
import { useLanguage } from '@/core/i18n';
import { getUser } from '@/utils/session';
import { radius } from '@/constants/theme';
import { useValoracionsEmpresa } from '../hooks/useValoracionsEmpresa';
import { useValoraciónsTreballador } from '../hooks/useValoraciónsTreballador';
import { ValoracioTypeSelector, ValoracioSelectorValue } from './ValoracioTypeSelector';
import { getTreballadorsPaginats } from '@/features/horarios/services/treballadors.service';
import type { ValoracioItem } from '../types/estadisticas.types';
import type { TreballadorBackendItem } from '@/features/horarios/types/treballadors.types';

const LIMIT = 5;

interface Props { onBack: () => void; isDesktop: boolean; }

// ── Subcomponents ─────────────────────────────────────────────────────────────

function StarRow({ puntuacio }: { puntuacio: number }) {
    const rating = Math.round(Number(puntuacio) * 2) / 2;
    return (
        <View style={{ flexDirection: 'row', gap: 3 }}>
            {Array.from({ length: 5 }).map((_, i) => {
                const name = i + 1 <= rating ? 'star' : i < rating ? 'star-half' : 'star-outline';
                return <Ionicons key={i} name={name as any} size={20} color="#F59E0B" />;
            })}
        </View>
    );
}

function ReviewCard({ item, style }: { item: ValoracioItem; style?: any }) {
    const theme = useTheme();
    const initial = (item.nomClient ?? 'C').charAt(0).toUpperCase();
    return (
        <View style={[s.reviewCard, { backgroundColor: HC.card }, style]}>
            <View style={s.reviewTop}>
                <View style={[s.avatar, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}>
                    <Text style={[s.avatarText, { color: theme.primary }]}>{initial}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={s.clientNom}>{item.nomClient ?? 'Client anònim'}</Text>
                    {item.servei && <Text style={s.serveiNom}>{item.servei.nom}</Text>}
                </View>
            </View>
            <StarRow puntuacio={item.puntuacio} />
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
                    <Text style={[s.entityImgLetter, { color: theme.textOnPrimary }]}>{nom.charAt(0).toUpperCase()}</Text>
                </View>
            }
            <View style={{ flex: 1 }}>
                <Text style={s.entityNom}>{nom}</Text>
                {mitjanaTotal != null
                    ? <View style={s.ratingRow}>
                        <Ionicons name="star" size={15} color="#F59E0B" />
                        <Text style={[s.ratingNum, { color: theme.primary }]}>{Number(mitjanaTotal).toFixed(1)}</Text>
                        <Text style={s.ratingCount}>({total} {t('valoracionsCount')})</Text>
                    </View>
                    : !isLoading && <Text style={s.noRating}>{t('statsNoRating')}</Text>
                }
            </View>
        </View>
    );
}

// ── Main view ────────────────────────────────────────────────────────────────

export function ValoracionsView({ onBack, isDesktop }: Props) {
    const theme = useTheme();
    const { t } = useLanguage();

    const [selector, setSelector] = useState<ValoracioSelectorValue>('empresa');
    const [page, setPage] = useState(1);
    const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);
    const [workers, setWorkers] = useState<TreballadorBackendItem[]>([]);
    const [empresaInfo, setEmpresaInfo] = useState<{ nom: string; fotoPerfil?: string } | null>(null);

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

    const handleSelectorChange = (v: ValoracioSelectorValue) => { setSelector(v); setPage(1); };
    const handleWorkerSelect = (id: number) => { setSelectedWorkerId(id); setPage(1); };

    const activeData = selector === 'empresa' ? empresaHook.data : treballadorHook.data;
    const activeLoading = selector === 'empresa' ? empresaHook.isLoading : treballadorHook.isLoading;
    const selectedWorker = workers.find(w => w.id === selectedWorkerId);

    return (
        <View style={s.container}>
            {/* Back */}
            <View style={s.navRow}>
                <TouchableOpacity style={s.backBtn} onPress={onBack} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={16} color={theme.primary} />
                    <Text style={[s.backText, { color: theme.primary }]}>{t('back')}</Text>
                </TouchableOpacity>
                <Text style={s.title}>{t('valoracionsTitle')}</Text>
            </View>

            {/* Selector */}
            <View style={s.selectorWrap}>
                <ValoracioTypeSelector value={selector} onChange={handleSelectorChange} />
            </View>

            {/* Entity block */}
            {selector === 'empresa' && empresaInfo && (
                <EntityCard
                    fotoPerfil={empresaInfo.fotoPerfil}
                    nom={empresaInfo.nom}
                    mitjanaTotal={empresaHook.data?.mitjanaTotal ?? null}
                    total={empresaHook.data?.total ?? 0}
                    isLoading={empresaHook.isLoading}
                />
            )}

            {selector === 'treballadors' && (
                <>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.pillsScroll} contentContainerStyle={s.pillsContent}>
                        {workers.map(w => (
                            <TouchableOpacity
                                key={w.id}
                                style={[s.pill, selectedWorkerId === w.id && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                                onPress={() => handleWorkerSelect(w.id)}
                                activeOpacity={0.7}
                            >
                                <Text style={[s.pillText, selectedWorkerId === w.id && { color: theme.textOnPrimary }]}>{w.nom}</Text>
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
                    : <View style={[s.reviewsGrid, isDesktop ? s.reviewsGridDesktop : undefined]}>
                        {activeData?.data.map(item => (
                            <ReviewCard key={item.id} item={item} style={isDesktop ? s.reviewCardDesktop : undefined} />
                        ))}
                    </View>
            }

            {/* Pagination */}
            {activeData && activeData.totalPages > 1 && (
                <View style={s.pagination}>
                    <TouchableOpacity style={[s.pageBtn, page <= 1 && s.pageBtnDisabled]} onPress={() => setPage(p => p - 1)} disabled={page <= 1} activeOpacity={0.7}>
                        <Ionicons name="chevron-back" size={18} color={page <= 1 ? HC.textMuted : theme.primary} />
                    </TouchableOpacity>
                    <Text style={s.pageText}>{t('statsPageLabel')} {page} / {activeData.totalPages}</Text>
                    <TouchableOpacity style={[s.pageBtn, page >= activeData.totalPages && s.pageBtnDisabled]} onPress={() => setPage(p => p + 1)} disabled={page >= activeData.totalPages} activeOpacity={0.7}>
                        <Ionicons name="chevron-forward" size={18} color={page >= activeData.totalPages ? HC.textMuted : theme.primary} />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    container: { gap: 12 },
    navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    backText: { fontSize: 14, fontWeight: '500' },
    title: { fontSize: 16, fontWeight: '700', color: HC.textPrimary },
    selectorWrap: { alignItems: 'flex-start' },
    entityCard: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        padding: 14, borderRadius: radius.lg,
    },
    entityImg: { width: 52, height: 52, borderRadius: 26 },
    entityImgFallback: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
    entityImgLetter: { fontSize: 20, fontWeight: '700' },
    entityNom: { fontSize: 15, fontWeight: '700', color: HC.textPrimary, marginBottom: 4 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    ratingNum: { fontSize: 15, fontWeight: '700' },
    ratingCount: { fontSize: 12, color: HC.textMuted },
    noRating: { fontSize: 12, color: HC.textMuted },
    pillsScroll: { flexGrow: 0 },
    pillsContent: { gap: 8, paddingVertical: 4 },
    pill: {
        paddingVertical: 6, paddingHorizontal: 14, borderRadius: radius.full ?? 999,
        borderWidth: 1, borderColor: HC.textLight, backgroundColor: HC.card,
    },
    pillText: { fontSize: 13, fontWeight: '500', color: HC.textPrimary },
    loader: { marginTop: 24 },
    empty: { textAlign: 'center', color: HC.textMuted, marginTop: 24, fontSize: 14 },
    reviewsGrid: { gap: 14 },
    reviewsGridDesktop: { flexDirection: 'row', flexWrap: 'wrap' },
    reviewCard: {
        borderRadius: radius.lg, padding: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07, shadowRadius: 8, elevation: 3, gap: 12,
    },
    reviewCardDesktop: { flex: 1, minWidth: 300 },
    reviewTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5 },
    avatarText: { fontSize: 18, fontWeight: '700' },
    clientNom: { fontSize: 15, fontWeight: '700', color: HC.textPrimary },
    serveiNom: { fontSize: 12, color: HC.textMuted, marginTop: 2 },
    comentari: { fontSize: 14, color: HC.textSecondary, lineHeight: 21 },
    pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 4 },
    pageBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: HC.card, alignItems: 'center', justifyContent: 'center', elevation: 1 },
    pageBtnDisabled: { opacity: 0.35 },
    pageText: { fontSize: 13, fontWeight: '600', color: HC.textPrimary },
});
