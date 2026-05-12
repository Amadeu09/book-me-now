import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { palette, spacing } from "@/constants/theme";
import type { AuthUser } from '@/features/auth/services/auth.service';

// Components
import { InicioHeader } from '../components/InicioHeader';
import { LocalDataCard } from '../components/LocalDataCard';
import { ScheduleCard } from '../components/ScheduleCard';
import { AbsenciesPendentsCard } from '../components/AbsenciesPendentsCard';

export default function Home() {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;

    const [user, setUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        AsyncStorage.getItem('user').then(u => setUser(u ? JSON.parse(u) : null));
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <InicioHeader />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.mainWrapper, isDesktop && styles.desktopWrapper]}>
                    <LocalDataCard />

                    <View style={[styles.blocksRow, !isDesktop && styles.blocksColumn]}>
                        <ScheduleCard />
                        {user?.rol === 'ADMIN_GENERAL' && <AbsenciesPendentsCard />}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: palette.background
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.xl,
        paddingBottom: 40,
    },
    mainWrapper: {
        width: '100%',
        alignSelf: 'center',
        gap: spacing.xl,
    },
    desktopWrapper: {
        maxWidth: 1000,
    },
    blocksRow: {
        flexDirection: 'row',
        gap: spacing.xl,
        alignItems: 'stretch',
    },
    blocksColumn: {
        flexDirection: 'column',
    }
});
