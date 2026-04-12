import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    useWindowDimensions,
    StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HC } from '@/features/home/constants/inicio.constants';
import { spacing } from '@/constants/theme';
import { useTheme } from '@/core/theme/ThemeProvider';
import type { AuthUser } from '@/features/auth/services/auth.service';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileCard } from '../components/ProfileCard';
import { TodayAppointments } from '../components/TodayAppointments';
import { AssignedServices } from '../components/AssignedServices';
import { useMiTreballador, useTreballadorServeis, useTodayBookings } from '../hooks/useProfile';

export default function ProfileScreen() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const theme = useTheme();

    useEffect(() => {
        AsyncStorage.getItem('user').then((raw) => {
            if (raw) setUser(JSON.parse(raw));
        });
    }, []);

    const usuariId = user?.id ? parseInt(user.id, 10) : null;
    const empresaId = user?.empresaId ?? null;
    const { data: treballador, isLoading: loadingTreballador } = useMiTreballador(
        empresaId,
        usuariId,
    );

    const treballadorId = treballador?.id ?? null;

    const { data: serveis = [], isLoading: loadingServeis } = useTreballadorServeis(treballadorId);
    const { data: bookings = [], isLoading: loadingBookings } = useTodayBookings(treballadorId);

    const nom = treballador?.nom ?? user?.empresa?.nom ?? 'Usuario';
    const email = user?.email ?? '';
    const rol = user?.rol ?? '';
    const fotoPerfil = treballador?.Usuari?.fotoPerfil ?? null;
    const location = user?.empresa?.ubicacio;
    const jornada = treballador?.jornadesPlantillaAssignacions?.[0]?.plantilla?.nom ?? null;

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
            <StatusBar barStyle="dark-content" />
            <ProfileHeader />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[
                    styles.content,
                    isDesktop && styles.contentDesktop,
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile card — full width on both mobile and desktop */}
                <ProfileCard
                    nom={nom}
                    email={email}
                    rol={rol}
                    fotoPerfil={fotoPerfil}
                    jornada={jornada}
                    usuariId={usuariId}
                    treballador={treballador}
                    location={location}
                    isLoading={loadingTreballador}
                />

                {/* Appointments + Services — shown for any role if user has an associated worker */}
                {treballadorId && (
                    <View style={[styles.blocksRow, !isDesktop && styles.blocksColumn]}>
                        <TodayAppointments
                            bookings={bookings}
                            isLoading={loadingBookings}
                        />
                        <AssignedServices
                            services={serveis}
                            isLoading={loadingServeis}
                        />
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: HC.screenBg,
    },
    scroll: {
        flex: 1,
    },
    content: {
        paddingTop: 70,
        paddingHorizontal: 30,
        paddingBottom: 80,
        gap: 24,
        maxWidth: 1600,
        alignSelf: 'center',
        width: '100%',
    },
    contentDesktop: {
        paddingBottom: 40,
    },
    blocksRow: {
        flexDirection: 'row',
        gap: spacing.xl,
        alignItems: 'stretch',
    },
    blocksColumn: {
        flexDirection: 'column',
    },
});
