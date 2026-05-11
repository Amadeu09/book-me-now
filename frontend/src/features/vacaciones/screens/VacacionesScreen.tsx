import React, { useState, useMemo, useCallback, useRef } from 'react';
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
import { AbsenciaLegend } from '../components/AbsenciaLegend';
import { useVacaciones } from '../hooks/useVacaciones';

const YEAR = new Date().getFullYear();

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

    const calendarProps = {
        year: YEAR,
        holidayDates,
        absenciaDates,
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
                            <AnnualCalendar numCols={4} {...calendarProps} />
                        </View>
                        <View style={styles.desktopSidebar}>
                            <ProximosFestivos items={data.empresa} />
                            <SolicitudesRecientes items={data.treballador} />
                            <AbsenciaLegend />
                        </View>
                    </View>
                ) : (
                    <>
                        <StatsSection {...statsProps} />
                        <View style={styles.mobileCalendar}>
                            <AnnualCalendar numCols={2} {...calendarProps} />
                        </View>
                        <View style={styles.mobileSections}>
                            <ProximosFestivos items={data.empresa} />
                            <SolicitudesRecientes items={data.treballador} />
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
                onSuccess={refetch}
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
