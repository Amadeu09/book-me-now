import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LogoBookMeNow } from '@/ui/components/LogoBookMeNow';
import { missatgeError } from '@/utils/dialegs';
import { establirContrasenyaSuper } from '../services/superadmin.service';
import { SA, sa } from '../components/sa.estils';

const FORTA = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}/;

export default function SuperAdminContrasenyaScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [carregant, setCarregant] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fet, setFet] = useState(false);

  const desar = async () => {
    setError(null);
    if (!FORTA.test(p1)) return setError('Mínimo 12 caracteres, con mayúsculas, minúsculas y números.');
    if (p1 !== p2) return setError('Las contraseñas no coinciden.');
    setCarregant(true);
    try {
      await establirContrasenyaSuper(String(token ?? ''), p1);
      setFet(true);
    } catch (e) {
      setError(missatgeError(e, 'El enlace no es válido o ha caducado.'));
    } finally {
      setCarregant(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={[sa.card, styles.card]}>
        <LogoBookMeNow mida={40} />
        <Text style={styles.titol} accessibilityRole="header">Contraseña de administración</Text>
        {!token ? (
          <Text style={sa.error}>Falta el enlace. Abre el enlace que recibiste por email.</Text>
        ) : fet ? (
          <>
            <Text style={sa.text}>Contraseña guardada. Ya puedes entrar al panel.</Text>
            <Pressable onPress={() => router.replace('/superadmin')} style={sa.boto} accessibilityRole="button">
              <Text style={sa.botoText}>Ir al panel</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={sa.muted}>Mínimo 12 caracteres, con mayúsculas, minúsculas y números.</Text>
            <View style={styles.camp}>
              <Text style={sa.label} nativeID="c1">Nueva contraseña</Text>
              <TextInput accessibilityLabelledBy="c1" value={p1} onChangeText={setP1} secureTextEntry autoComplete="new-password" style={sa.input} />
            </View>
            <View style={styles.camp}>
              <Text style={sa.label} nativeID="c2">Repite la contraseña</Text>
              <TextInput accessibilityLabelledBy="c2" value={p2} onChangeText={setP2} secureTextEntry autoComplete="new-password" onSubmitEditing={desar} style={sa.input} />
            </View>
            {error ? <Text style={sa.error} accessibilityLiveRegion="polite">{error}</Text> : null}
            <Pressable onPress={desar} disabled={carregant} style={sa.boto} accessibilityRole="button">
              {carregant ? <ActivityIndicator color="#fff" /> : <Text style={sa.botoText}>Guardar contraseña</Text>}
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: SA.soft },
  card: { width: '100%', maxWidth: 420, padding: 28, gap: 14 },
  titol: { fontSize: 20, fontWeight: '800', color: SA.ink },
  camp: { gap: 6 },
});
