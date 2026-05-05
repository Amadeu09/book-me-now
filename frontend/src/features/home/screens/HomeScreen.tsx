import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, useWindowDimensions, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthUser } from '@/features/auth/services/auth.service';
import { HC } from '../constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';

function GreetingBlock({ nom }: { nom: string }) {
  const theme = useTheme();
  const { t, lang } = useLanguage();
  const firstName = nom.split(' ')[0];
  const h = new Date().getHours();
  const greeting = h < 12 ? t('greetingMorning') : h < 20 ? t('greetingAfternoon') : t('greetingEvening');
  const locale = lang === 'ca' ? 'ca-ES' : 'es-ES';
  const raw = new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
  const todayLabel = raw.charAt(0).toUpperCase() + raw.slice(1);
  return (
    <View style={greetStyles.wrapper}>
      <Text style={greetStyles.date}>{todayLabel}</Text>
      <Text style={[greetStyles.greeting, { color: theme.primary }]}>
        {greeting}, {firstName}
      </Text>
    </View>
  );
}

const greetStyles = StyleSheet.create({
  wrapper: {
    gap: 4,
  },
  date: {
    fontSize: 13,
    fontWeight: '500',
    color: HC.textMuted,
    letterSpacing: 0.2,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: HC.textPrimary,
  },
});

// Components
import { InicioHeader } from '../components/InicioHeader';
import { LocalDataCard } from '../components/LocalDataCard';
import { AbsenciesPendentsCard } from '../components/AbsenciesPendentsCard';

// Hooks
import { useEmpresa } from '@/features/empresas/hooks/useEmpresa';

export default function Home() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const { width } = useWindowDimensions();
  const theme = useTheme();

  const isDesktop = width >= 768;

  const { data: empresa } = useEmpresa(user?.empresaId);
  useEffect(() => {
    (async () => {
      const u = await AsyncStorage.getItem('user');
      setUser(u ? JSON.parse(u) : null);
    })();
  }, []);

  const { t } = useLanguage();
  const empresaData = empresa || user?.empresa;
  const nom = empresaData?.nom ?? user?.email ?? t('userFallback');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" />
      <InicioHeader />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.mainWrapper, isDesktop && styles.desktopWrapper]}>
          <GreetingBlock nom={nom} />
          <LocalDataCard empresa={empresaData} />

          {user?.rol === 'ADMIN_GENERAL' && <AbsenciesPendentsCard />}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingTop: 35,
    paddingBottom: 80,
    gap: 24,
    maxWidth: 1600,
    alignSelf: 'center',
    width: '100%',
  },
  mainWrapper: {
    width: '100%',
    alignSelf: 'center',
    gap: 24,
  },
  desktopWrapper: {},
});
