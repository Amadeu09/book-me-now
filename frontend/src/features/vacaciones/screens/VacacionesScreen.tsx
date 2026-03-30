import React, { useState, useMemo } from 'react';
import {
    View, ScrollView, StyleSheet, ActivityIndicator,
    Text, SafeAreaView, StatusBar, useWindowDimensions,
} from 'react-native';
import { HC } from '@/features/home/constants/inicio.constants';
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

export default function VacacionesScreen() {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;

    const { data, isLoading, error, holidayDates, absenciaDates, refetch } = useVacaciones(YEAR);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalInici, setModalInici] = useState('');
    const [modalFi, setModalFi] = useState('');

    const vacancesUsed = useMemo(
        () => data.treballador
            .filter(a => a.tipus === 'VACANCES')
            .reduce((sum, a) => sum + countDays(a.inici, a.fi), 0),
        [data.treballador],
    );

    const handleRequestCreate = (inici: string, fi: string) => {
        setModalInici(inici);
        setModalFi(fi);
        setModalVisible(true);
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <VacacionesHeader />
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={HC.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
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
        onRequestCreate: handleRequestCreate,
    };

    const statsProps = {
        isDesktop,
        treballador: data.treballador,
        empresa: data.empresa,
        diesVacancesAnuals: data.diesVacancesAnuals,
        missatgeDies: data.missatgeDies,
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <VacacionesHeader />
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[styles.scrollContent, isDesktop && styles.scrollContentDesktop]}
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
});
