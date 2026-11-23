import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { HC } from '@/features/home/constants/inicio.constants';
import { LogoBookMeNow } from '@/ui/components/LogoBookMeNow';

/** Es mostra quan algú entra al registre sense una invitació vàlida. */
export function RegistreNomesInvitacio({ invalida }: { invalida: boolean }) {
  const router = useRouter();
  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <LogoBookMeNow mida={44} />
        <View style={styles.icona}>
          <Ionicons name={invalida ? 'alert-circle-outline' : 'mail-unread-outline'} size={26} color={HC.primary} />
        </View>
        <Text style={styles.titol} accessibilityRole="header">
          {invalida ? 'Esta invitación ya no es válida' : 'El registro es solo con invitación'}
        </Text>
        <Text style={styles.text}>
          {invalida
            ? 'El enlace ha caducado, ya se ha usado o se ha anulado. Pide uno nuevo a BookMeNow.'
            : 'Para dar de alta tu negocio necesitas el enlace de invitación que te enviamos desde BookMeNow.'}
        </Text>
        <TouchableOpacity onPress={() => router.replace('/login')} style={styles.boto} accessibilityRole="button">
          <Text style={styles.botoText}>Ir a iniciar sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: HC.screenBg },
  card: { width: '100%', maxWidth: 440, backgroundColor: HC.card, borderRadius: 20, borderWidth: 1, borderColor: HC.border, padding: 28, alignItems: 'center', gap: 14 },
  icona: { width: 52, height: 52, borderRadius: 26, backgroundColor: HC.primaryLight, alignItems: 'center', justifyContent: 'center' },
  titol: { fontSize: 20, fontWeight: '800', color: HC.textPrimary, textAlign: 'center' },
  text: { fontSize: 14, lineHeight: 21, color: HC.textMuted, textAlign: 'center' },
  boto: { marginTop: 6, minHeight: 46, paddingHorizontal: 22, borderRadius: 12, backgroundColor: HC.primary, alignItems: 'center', justifyContent: 'center' },
  botoText: { color: HC.white, fontWeight: '700', fontSize: 15 },
});
