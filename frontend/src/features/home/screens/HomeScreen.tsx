import React, { useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View, TouchableOpacity, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isWeb = width > 768;

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
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.container, isWeb && styles.containerWeb]}>
        <Text style={styles.title}>Home</Text>
        <Text style={styles.text}>Bienvenido 👋</Text>
        {user && (
          <Text style={styles.textSmall}>Usuario: {user.email} · Rol: {user.rol}</Text>
        )}
        {token && (
          <Text style={styles.textSmall}>Token: {token.slice(0, 12)}…</Text>
        )}
        <View style={{ height: 24 }} />
        <TouchableOpacity style={styles.button} onPress={logout}>
          <Text style={styles.buttonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 80
  },
  containerWeb: {
    paddingLeft: 224, // 200px sidebar + 24px padding
    paddingBottom: 24,
  },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  text: { fontSize: 16 },
  textSmall: { marginTop: 8, fontSize: 12, color: '#666' },
  button: { marginTop: 16, backgroundColor: '#111', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
  buttonText: { color: '#fff', fontWeight: '700' },
});
