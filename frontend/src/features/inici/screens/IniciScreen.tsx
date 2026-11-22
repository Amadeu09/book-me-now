import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, useWindowDimensions, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';
import { useTreballadorServeis } from '@/features/profile/hooks/useProfile';
import { useAbsenciesPendents, useUpdateEstatAbsencia } from '@/features/home/hooks/useAbsenciesPendents';
import { useUsuariActual } from '../hooks/useUsuariActual';
import { useCitesPendents, useMevesAbsenciesPendents } from '../hooks/useInici';
import { IniciHeader } from '../components/IniciHeader';
import { StatTile } from '../components/StatTile';
import { CitesPendentsCard } from '../components/CitesPendentsCard';
import { AbsenciesPendentsCard } from '../components/AbsenciesPendentsCard';
import { ServeisAssignatsCard } from '../components/ServeisAssignatsCard';
import { horaCurta, type PeriodeCites } from '../utils/dates';
import { SCREEN_MAX_WIDTH } from '@/ui/components/ScreenHeader';

/**
 * Inici: només el que cal veure d'un cop d'ull —
 * cites pendents, absències pendents i serveis assignats.
 */
export default function IniciScreen() {
    const router = useRouter();
    const theme = useTheme();
    const { t, lang } = useLanguage();
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const [periode, setPeriode] = useState<PeriodeCites>('avui');

    const { user, esAdmin, treballador, treballadorId, carregantTreballador } = useUsuariActual();

    const cites = useCitesPendents(periode, esAdmin, treballadorId);
    const citesAvui = useCitesPendents('avui', esAdmin, treballadorId);
    const serveis = useTreballadorServeis(treballadorId);
    const absenciesAdmin = useAbsenciesPendents(1, esAdmin);
    const absenciesPropies = useMevesAbsenciesPendents(!!user && !esAdmin);
    const { mutate: canviarEstat, variables: accioEnCurs, isPending } = useUpdateEstatAbsencia();

    const nom = treballador?.nom ?? user?.nom ?? user?.email?.split('@')[0] ?? t('userFallback');
    const fotoPerfil = treballador?.Usuari?.fotoPerfil ?? user?.fotoPerfil ?? null;
    const mostrarServeis = !esAdmin || treballadorId !== null;

    const totalAvui = citesAvui.data?.length ?? 0;
    const propera = citesAvui.data?.[0];
    const totalAbsencies = esAdmin ? absenciesAdmin.data?.total ?? 0 : absenciesPropies.data?.length ?? 0;
    const totalServeis = (serveis.data ?? []).filter((s) => s.actiu !== false).length;

    const citesCard = (
        <CitesPendentsCard
            title={esAdmin ? t('iniciCitesPendents') : t('iniciLesTevesCites')}
            cites={cites.data ?? []}
            loading={cites.isLoading || (!esAdmin && carregantTreballador)}
            periode={periode}
            onPeriode={setPeriode}
            mostrarTreballador={esAdmin}
        />
    );
    const absenciesCard = (
        <AbsenciesPendentsCard
            esAdmin={esAdmin}
            pendents={absenciesAdmin.data?.data ?? []}
            propies={absenciesPropies.data ?? []}
            loading={esAdmin ? absenciesAdmin.isLoading : absenciesPropies.isLoading}
            onAccio={(id, estat) => canviarEstat({ id, estat })}
            idOcupat={isPending ? accioEnCurs?.id ?? null : null}
        />
    );
    const serveisCard = mostrarServeis ? (
        <ServeisAssignatsCard serveis={serveis.data ?? []} loading={serveis.isLoading || carregantTreballador} />
    ) : null;

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
            <StatusBar barStyle="dark-content" />
            <IniciHeader nom={nom} empresa={user?.empresa?.nom} fotoPerfil={fotoPerfil} isDesktop={isDesktop} />
            <ScrollView contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]}>
                <View style={styles.inner}>

                    {isDesktop && (
                        <View style={styles.tiles}>
                            <StatTile
                                label={t('iniciCitesPendentsAvui')}
                                value={totalAvui}
                                detail={propera ? t('iniciPropera').replace('{hora}', horaCurta(propera.dataHora, lang === 'ca' ? 'ca-ES' : 'es-ES')) : t('iniciCapCitaPendent')}
                                onPress={() => setPeriode('avui')}
                            />
                            {mostrarServeis && (
                                <StatTile label={t('iniciServeisAssignats')} value={totalServeis} detail={t('iniciServeisSub')} />
                            )}
                            <StatTile
                                label={esAdmin ? t('iniciAbsenciesPendents') : t('iniciLesTevesAbsencies')}
                                value={totalAbsencies}
                                detail={esAdmin ? t('iniciAbsenciesSub') : t('iniciPendent')}
                                warning={totalAbsencies > 0}
                                onPress={() => router.push('/vacaciones')}
                            />
                        </View>
                    )}

                    {isDesktop ? (
                        <View style={styles.columns}>
                            <View style={styles.colMain}>{citesCard}</View>
                            <View style={styles.colSide}>
                                {absenciesCard}
                                {serveisCard}
                            </View>
                        </View>
                    ) : (
                        <>
                            {citesCard}
                            {absenciesCard}
                            {serveisCard}
                        </>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1 },
    content: { padding: 16, paddingBottom: 32 },
    contentDesktop: { paddingHorizontal: 40, paddingTop: 28, paddingBottom: 40 },
    inner: { width: '100%', maxWidth: SCREEN_MAX_WIDTH, alignSelf: 'center', gap: 24 },
    tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    columns: { flexDirection: 'row', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' },
    colMain: { flexGrow: 5, flexShrink: 1, flexBasis: 520, minWidth: 0 },
    colSide: { flexGrow: 3, flexShrink: 1, flexBasis: 340, minWidth: 0, gap: 24 },
});
