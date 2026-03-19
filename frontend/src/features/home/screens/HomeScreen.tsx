import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, useWindowDimensions, TouchableOpacity, Text, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { palette, spacing } from "@/constants/theme";

// Components
import { InicioHeader } from '../components/InicioHeader';
import { LocalDataCard } from '../components/LocalDataCard';
import { ScheduleCard } from '../components/ScheduleCard';
import { StatsCard } from '../components/StatsCard';

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const { width } = useWindowDimensions();

  // We align with the React.Native Frontend Agent Skills standards (isTablet = >= 768)
  const isDesktop = width >= 768;

  useEffect(() => {
    (async () => {
      const t = await AsyncStorage.getItem('token');
      const u = await AsyncStorage.getItem('user');
      setToken(t);
      setUser(u ? JSON.parse(u) : null);
    })();
  }, []);

  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <InicioHeader />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.mainWrapper, isDesktop && styles.desktopWrapper]}>
          <LocalDataCard />

          {/* The responsive blocks grid */}
          <View style={[styles.blocksRow, !isDesktop && styles.blocksColumn]}>
            <ScheduleCard />
            <StatsCard />
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB' // HC.screenBg equivalent
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 80,
  },
  mainWrapper: {
    width: '100%',
    alignSelf: 'center',
    gap: 24,
  },
  desktopWrapper: {

  },
  blocksRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    alignItems: 'stretch',
  },
  blocksColumn: {
    flexDirection: 'column',
  },
  logoutContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: palette.danger || '#ef4444',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700'
  }
});
