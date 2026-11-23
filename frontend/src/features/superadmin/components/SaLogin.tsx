import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { LogoBookMeNow } from '@/ui/components/LogoBookMeNow';
import { missatgeError } from '@/utils/dialegs';
import { loginSuper, recuperarSuper } from '../services/superadmin.service';
import { SA, sa } from './sa.estils';

export function SaLogin({ onEntrat }: { onEntrat: () => void }) {
  const [mode, setMode] = useState<'login' | 'recuperar'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [carregant, setCarregant] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviat, setEnviat] = useState(false);

  const entrar = async () => {
    setError(null);
    setCarregant(true);
    try {
      await loginSuper(email.trim(), password);
      onEntrat();
    } catch (e) {
      const estat = (e as { response?: { status?: number } }).response?.status;
      setError(estat === 429 ? 'Demasiados intentos. Espera unos minutos.' : missatgeError(e, 'No se ha podido entrar.'));
    } finally {
      setCarregant(false);
    }
  };

  const recuperar = async () => {
    setCarregant(true);
    await recuperarSuper(email.trim()).catch(() => undefined);
    setCarregant(false);
    setEnviat(true);
  };

  return (
    <View style={styles.wrap}>
      <View style={[sa.card, styles.card]}>
        <View style={styles.head}>
          <LogoBookMeNow mida={40} />
          <View>
            <Text style={styles.titol} accessibilityRole="header">Administración</Text>
            <Text style={sa.muted}>Acceso restringido</Text>
          </View>
        </View>

        <View style={styles.camp}>
          <Text style={sa.label} nativeID="sa-email">Email</Text>
          <TextInput accessibilityLabelledBy="sa-email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" style={sa.input} />
        </View>

        {mode === 'login' ? (
          <>
            <View style={styles.camp}>
              <Text style={sa.label} nativeID="sa-pass">Contraseña</Text>
              <TextInput accessibilityLabelledBy="sa-pass" value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" onSubmitEditing={entrar} style={sa.input} />
            </View>
            {error ? <Text style={sa.error} accessibilityLiveRegion="polite">{error}</Text> : null}
            <Pressable onPress={entrar} disabled={carregant || !email || !password} style={[sa.boto, (carregant || !email || !password) && { opacity: 0.6 }]} accessibilityRole="button">
              {carregant ? <ActivityIndicator color="#fff" /> : <Text style={sa.botoText}>Entrar</Text>}
            </Pressable>
            <Pressable onPress={() => { setMode('recuperar'); setError(null); }} accessibilityRole="button" style={styles.link}>
              <Text style={styles.linkText}>He olvidado la contraseña</Text>
            </Pressable>
          </>
        ) : enviat ? (
          <>
            <Text style={sa.text}>Si el email corresponde a una cuenta de administración, te hemos enviado un enlace. Caduca en 1 hora.</Text>
            <Pressable onPress={() => { setMode('login'); setEnviat(false); }} style={sa.botoSec} accessibilityRole="button">
              <Text style={sa.botoSecText}>Volver</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable onPress={recuperar} disabled={carregant || !email} style={[sa.boto, (carregant || !email) && { opacity: 0.6 }]} accessibilityRole="button">
              {carregant ? <ActivityIndicator color="#fff" /> : <Text style={sa.botoText}>Enviar enlace</Text>}
            </Pressable>
            <Pressable onPress={() => setMode('login')} accessibilityRole="button" style={styles.link}>
              <Text style={styles.linkText}>Volver</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: SA.soft },
  card: { width: '100%', maxWidth: 400, padding: 28, gap: 16 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
  titol: { fontSize: 20, fontWeight: '800', color: SA.ink },
  camp: { gap: 6 },
  link: { alignSelf: 'center', minHeight: 40, justifyContent: 'center' },
  linkText: { color: SA.brand, fontWeight: '600', fontSize: 13 },
});
