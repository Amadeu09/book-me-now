import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View, ScrollView, StyleSheet, ActivityIndicator,
    Text, SafeAreaView, StatusBar, useWindowDimensions, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { VacacionesHeader } from '../components/VacacionesHeader';
import { StatsSection } from '../components/StatsSection';
import { AnnualCalendar } from '../components/AnnualCalendar';
import { ProximosFestivos } from '../components/ProximosFestivos';
import { SolicitudesRecientes } from '../components/SolicitudesRecientes';
import { CreateAbsenciaModal } from '../components/modal/CreateAbsenciaModal';
import { EditAbsenciaModal } from '../components/modal/EditAbsenciaModal';
import { AbsenciaLegend } from '../components/AbsenciaLegend';
import { useVacaciones, useWorkerCalendar, useDeleteAbsencia } from '../hooks/useVacaciones';
import { getUser } from '@/utils/session';
import { getTreballadorsLlista } from '../services/vacaciones.service';
import type { AbsenciaTreballador, TreballadorBasicVacances } from '../types/vacaciones.types';

const YEAR = new Date().getFullYear();

type WorkerFilterProps = {
    treballadors: TreballadorBasicVacances[];
    viewTreballadorId: number | null;
    workerLoading: boolean;
    theme: any;
    noPad?: boolean;
    onSelect: (id: number | null) => void;
};

function WorkerFilter({ treballadors, viewTreballadorId, workerLoading, theme, noPad, onSelect }: WorkerFilterProps) {
    return (
        <View style={[filterStyles.container, noPad && { paddingHorizontal: 0 }]}>
            <View style={filterStyles.row}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={filterStyles.chips}>
                    {treballadors.map(t => {
                        const isSel = viewTreballadorId === t.id;
                        return (
                            <TouchableOpacity
                                key={t.id}
                                style={[filterStyles.chip, isSel && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                                onPress={() => onSelect(t.id)}
                                activeOpacity={0.7}
                            >
                                <View style={[filterStyles.avatar, isSel && { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                                    <Text style={filterStyles.avatarText}>{t.nom.charAt(0).toUpperCase()}</Text>
                                </View>
                                <Text style={[filterStyles.chipText, isSel && filterStyles.chipTextActive]} numberOfLines={1}>{t.nom}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
                {workerLoading && <ActivityIndicator size="small" color={theme.primary} style={{ marginLeft: 8 }} />}
            </View>
        </View>
    );
}

const filterStyles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    chips: {
        flexDirection: 'row',
        gap: 8,
        paddingVertical: 4,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: HC.border,
        backgroundColor: HC.white,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
        color: HC.textSecondary,
        maxWidth: 100,
    },
    chipTextActive: {
        color: '#fff',
    },
    avatar: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#fff',
    },
});

function countDays(inici: string, fi: string): number {
    return Math.round((new Date(fi).getTime() - new Date(inici).getTime()) / 86_400_000) + 1;
}

function fmtShort(d: string): string {
    const [, m, day] = d.split('-');
    return `${parseInt(day)}/${parseInt(m)}`;
}

export default function VacacionesScreen() {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const theme = useTheme();

    const { data, isLoading, error, holidayDates, absenciaDates, refetch } = useVacaciones(YEAR);

    const [isAdmin, setIsAdmin] = useState(false);
    const [treballadors, setTreballadors] = useState<TreballadorBasicVacances[]>([]);
    const [viewTreballadorId, setViewTreballadorId] = useState<number | null>(null);

    useEffect(() => {
        getUser().then(u => {
            if (u?.rol === 'ADMIN_GENERAL') {
                setIsAdmin(true);
                getTreballadorsLlista().then(list => {
                    setTreballadors(list);
                    if (list.length > 0) setViewTreballadorId(list[0].id);
                }).catch(() => {});
            }
        });
    }, []);

    const { absenciaDates: workerAbsenciaDates, data: workerData, isLoading: workerLoading, refetch: workerRefetch } = useWorkerCalendar(viewTreballadorId, YEAR);

    const { mutateAsync: deleteAbs } = useDeleteAbsencia();
    const [editingAbsencia, setEditingAbsencia] = useState<AbsenciaTreballador | null>(null);

    const handleDelete = async (id: number): Promise<void> => {
        await deleteAbs(id);
        refetch();
        if (viewTreballadorId) workerRefetch();
    };

    const _isFirstFocus = useRef(true);
    useFocusEffect(useCallback(() => {
        if (_isFirstFocus.current) { _isFirstFocus.current = false; return; }
        refetch();
    }, [refetch]));

    const [modalVisible, setModalVisible] = useState(false);
    const [modalInici, setModalInici] = useState('');
    const [modalFi, setModalFi] = useState('');

    const [selStart, setSelStart] = useState<string | null>(null);
    const [selEnd, setSelEnd] = useState<string | null>(null);

    const vacancesUsed = useMemo(
        () => data.treballador
            .filter(a => a.tipus === 'VACANCES' && a.estat === 'APROVADA')
            .reduce((sum, a) => sum + countDays(a.inici, a.fi), 0),
        [data.treballador],
    );

    const handleDayPress = (dateStr: string) => {
        if (selStart === null) {
            setSelStart(dateStr);
            setSelEnd(null);
        } else if (selEnd === null) {
            if (dateStr === selStart) {
                setSelStart(null);
            } else if (dateStr < selStart) {
                setSelEnd(selStart);
                setSelStart(dateStr);
            } else {
                setSelEnd(dateStr);
            }
        } else {
            setSelStart(dateStr);
            setSelEnd(null);
        }
    };

    const clearSelection = () => {
        setSelStart(null);
        setSelEnd(null);
    };

    const handleConfirm = () => {
        if (!selStart) return;
        setModalInici(selStart);
        setModalFi(selEnd ?? selStart);
        setModalVisible(true);
        clearSelection();
    };

    const effectiveEnd = selEnd ?? selStart;
    const daysCount = selStart && effectiveEnd ? countDays(selStart, effectiveEnd) : 0;

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <VacacionesHeader />
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <VacacionesHeader />
                <View style={styles.center}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    const activeAbsenciaDates = workerAbsenciaDates ?? absenciaDates;

    const calendarProps = {
        year: YEAR,
        holidayDates,
        absenciaDates: activeAbsenciaDates,
        selStart,
        selEnd,
        onDayPress: handleDayPress,
    };

    const statsProps = {
        isDesktop,
        treballador: data.treballador,
        empresa: data.empresa,
        diesVacancesAnuals: data.diesVacancesAnuals,
        missatgeDies: data.missatgeDies,
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle="dark-content" />
            <VacacionesHeader />
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[
                    styles.scrollContent,
                    isDesktop && styles.scrollContentDesktop,
                    selStart !== null && styles.scrollContentWithBar,
                ]}
                showsVerticalScrollIndicator={false}
            >
                {isDesktop ? (
                    <View style={styles.desktopLayout}>
                        <View style={styles.desktopMain}>
                            <StatsSection {...statsProps} />
                            {isAdmin && treballadors.length > 0 && (
                                <WorkerFilter
                                    treballadors={treballadors}
                                    viewTreballadorId={viewTreballadorId}
                                    workerLoading={workerLoading}
                                    theme={theme}
                                    noPad
                                    onSelect={id => { setViewTreballadorId(id); setSelStart(null); setSelEnd(null); }}
                                />
                            )}
                            <AnnualCalendar numCols={4} {...calendarProps} />
                        </View>
                        <View style={styles.desktopSidebar}>
                            <ProximosFestivos items={data.empresa} />
                            <SolicitudesRecientes
                                items={viewTreballadorId ? (workerData?.treballador ?? []) : data.treballador}
                                isAdmin={isAdmin}
                                onDelete={isAdmin ? handleDelete : undefined}
                                onEdit={isAdmin ? setEditingAbsencia : undefined}
                            />
                            <AbsenciaLegend />
                        </View>
                    </View>
                ) : (
                    <>
                        <StatsSection {...statsProps} />
                        {isAdmin && treballadors.length > 0 && (
                            <WorkerFilter
                                treballadors={treballadors}
                                viewTreballadorId={viewTreballadorId}
                                workerLoading={workerLoading}
                                theme={theme}
                                onSelect={id => { setViewTreballadorId(id); setSelStart(null); setSelEnd(null); }}
                            />
                        )}
                        <View style={styles.mobileCalendar}>
                            <AnnualCalendar numCols={2} {...calendarProps} />
                        </View>
                        <View style={styles.mobileSections}>
                            <ProximosFestivos items={data.empresa} />
                            <SolicitudesRecientes
                                items={viewTreballadorId ? (workerData?.treballador ?? []) : data.treballador}
                                isAdmin={isAdmin}
                                onDelete={isAdmin ? handleDelete : undefined}
                                onEdit={isAdmin ? setEditingAbsencia : undefined}
                            />
                            <AbsenciaLegend />
                        </View>
                    </>
                )}
            </ScrollView>

            {selStart !== null && (
                <View style={[styles.actionBar, { borderColor: theme.primary, shadowColor: theme.primary }]}>
                    <View style={styles.actionInfo}>
                        <Ionicons name="calendar-outline" size={16} color={theme.primary} />
                        <Text style={styles.actionText}>
                            {selEnd
                                ? `${fmtShort(selStart)} → ${fmtShort(selEnd)}  ·  ${daysCount} dies`
                                : `${fmtShort(selStart)}  ·  1 dia`}
                        </Text>
                    </View>
                    <View style={styles.actionBtns}>
                        <TouchableOpacity style={styles.btnCancel} onPress={clearSelection} activeOpacity={0.7}>
                            <Ionicons name="close" size={20} color={HC.red} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btnConfirm, { backgroundColor: theme.primary }]} onPress={handleConfirm} activeOpacity={0.8}>
                            <Ionicons name="checkmark" size={20} color={HC.white} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <CreateAbsenciaModal
                visible={modalVisible}
                inici={modalInici}
                fi={modalFi}
                diesVacancesAnuals={data.diesVacancesAnuals}
                vacancesUsed={vacancesUsed}
                onClose={() => setModalVisible(false)}
                onSuccess={() => { refetch(); if (viewTreballadorId) workerRefetch(); }}
                isAdmin={isAdmin}
                treballadors={treballadors}
                initialTreballadorId={viewTreballadorId}
            />

            <EditAbsenciaModal
                visible={editingAbsencia !== null}
                absencia={editingAbsencia}
                onClose={() => setEditingAbsencia(null)}
                onSuccess={() => {
                    refetch();
                    if (viewTreballadorId) workerRefetch();
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: HC.screenBg,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 20,
        paddingBottom: 40,
    },
    scrollContentDesktop: {
        paddingHorizontal: 48,
        paddingTop: 24,
    },
    scrollContentWithBar: {
        paddingBottom: 100,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        fontSize: 14,
        color: HC.red,
    },
    desktopLayout: {
        flexDirection: 'row',
        gap: 24,
        alignItems: 'flex-start',
    },
    desktopMain: {
        flex: 1,
        gap: 24,
    },
    desktopSidebar: {
        width: 280,
        gap: 16,
    },
    mobileCalendar: {
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    mobileSections: {
        paddingHorizontal: 16,
        gap: 16,
    },
    actionBar: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: HC.card,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1.5,
        borderColor: HC.primary,
        shadowColor: HC.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 8,
    },
    actionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: HC.textPrimary,
    },
    actionBtns: {
        flexDirection: 'row',
        gap: 8,
    },
    btnCancel: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FEF2F2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnConfirm: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: HC.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
