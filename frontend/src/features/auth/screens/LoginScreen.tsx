import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login } from "@/features/auth/services/auth.service";
import api from "@/core/api/api";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function NeoLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [secure, setSecure] = useState(true);

  const redirectToRegister = () => {
    router.push('/register');
  };

  const handlesLogin = async () => {
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);

    const localErrors: string[] = [];
    if (!email.trim()) {
      setEmailError("El email es obligatorio");
      localErrors.push("El email es obligatorio");
    } else if (!email.includes("@")) {
      setEmailError("Ingresa un email válido");
      localErrors.push("Ingresa un email válido");
    }
    if (!password) {
      setPasswordError("La contraseña es obligatoria");
      localErrors.push("La contraseña es obligatoria");
    }
    if (localErrors.length) {
      Alert.alert("Revisa los datos", localErrors[0]);
      return;
    }

    try {
      setLoading(true);
      const response = await login({ email: email.trim().toLowerCase(), password });
      await AsyncStorage.setItem("token", response.token);
      await AsyncStorage.setItem("user", JSON.stringify(response.user));
      router.replace({ pathname: "/profile" } as any);
    } catch (error: any) {
      const apiMessage =
        error?.response?.data?.message ||
        error?.message ||
        "No se pudo iniciar sesión. Verifica tus credenciales.";
      setGeneralError(apiMessage);
      Alert.alert("Error", apiMessage);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      const res = await api.get('/auth/me');
      Alert.alert('Conexión OK', `Status: ${res.status}`);
    } catch (err: any) {
      if (err.response) {
        Alert.alert('Conexión OK (con respuesta)', `Status: ${err.response.status}`);
      } else {
        Alert.alert('Fallo de red', err.message || 'Network error');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.brandRow}>
            <View style={styles.brandDot} />
            <Text style={styles.brandText}>BookMeNow</Text>
          </View>

          <View style={{ height: 18 }} />

          <Text style={styles.title}>Tu aplicación de reservas</Text>
          <Text style={styles.subtitle}>Maneja tus reservas y clientes fácilmente</Text>

          <View style={{ height: 24 }} />

          <View style={styles.card}>
            {/* Email */}
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={18} color="#9ca3af" style={{ marginRight: 8 }} />
              <TextInput
                placeholder="Email"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
              />
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            {/* Password */}
            <View style={[styles.inputRow, { marginTop: 12 }]}>
              <Ionicons name="lock-closed-outline" size={18} color="#9ca3af" style={{ marginRight: 8 }} />
              <TextInput
                placeholder="Contraseña"
                placeholderTextColor="#9ca3af"
                secureTextEntry={secure}
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
                style={[styles.input, { flex: 1 }]}
              />
              <TouchableOpacity onPress={() => setSecure(s => !s)} accessibilityRole="button">
                <Ionicons name={secure ? "eye-outline" : "eye-off-outline"} size={18} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

            {/* Forgot */}
            <TouchableOpacity style={{ alignSelf: "flex-end", marginTop: 10 }}>
              <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <View style={{ height: 16 }} />

            {/* CTA */}
            <TouchableOpacity activeOpacity={0.9} style={styles.cta} onPress={handlesLogin} disabled={loading}>
              <LinearGradient colors={["#ffffff", "#ffe3aa"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaGradient}>
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.ctaText}>Entrar</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={testConnection} style={{ marginTop: 10, alignSelf: 'center' }}>
              <Text style={styles.testBtnText}>Probar conexión</Text>
            </TouchableOpacity>

            {generalError ? (
              <View style={{ marginTop: 12 }}>
                <Text style={styles.errorText}>{generalError}</Text>
              </View>
            ) : null}

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerLabel}>o continúa con</Text>
              <View style={styles.divider} />
            </View>

            {/* Socials */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-apple" size={20} color="#111827" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-google" size={20} color="#111827" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-facebook" size={20} color="#111827" />
              </TouchableOpacity>
            </View>

            {/* Register */}
            <View style={{ alignItems: "center", marginTop: 14 }}>
              <Text style={styles.metaText}>¿No tienes cuenta? <Text onPress={redirectToRegister} style={styles.linkText}>Crear cuenta</Text></Text>
            </View>
          </View>

          <Text style={styles.footer}>© {new Date().getFullYear()} Book Me Now</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, paddingHorizontal: 20, justifyContent: "center", maxWidth: 1600, width: "100%", alignSelf: "center" },
  brandRow: { flexDirection: "row", alignItems: "center" },
  brandDot: { width: 10, height: 10, borderRadius: 10, backgroundColor: "#6264A0", marginRight: 8 },
  brandText: { letterSpacing: 4, color: "#6264A0", fontWeight: "700", fontSize: 12 },
  title: { fontSize: 32, fontWeight: "900", color: "#111827", lineHeight: 38 },
  subtitle: { color: "#6b7280", marginTop: 6 },

  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 14,
  },
  input: { color: "#111827", fontSize: 14, flex: 1 },

  cta: { borderRadius: 14, overflow: "hidden" },
  ctaGradient: { paddingVertical: 14, alignItems: "center" },
  ctaText: { color: "#000", fontWeight: "900", fontSize: 14 },

  dividerRow: { flexDirection: "row", alignItems: "center", marginTop: 16 },
  divider: { flex: 1, height: 1, backgroundColor: "#e5e7eb" },
  dividerLabel: { color: "#9ca3af", marginHorizontal: 10, fontSize: 12 },

  socialRow: { flexDirection: "row", gap: 10, justifyContent: "center", marginTop: 12 },
  socialBtn: {
    width: 46, height: 46, borderRadius: 12,
    borderWidth: 1, borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    alignItems: "center", justifyContent: "center",
  },

  metaText: { color: "#6b7280", fontSize: 12 },
  linkText: { color: "#6264A0", fontWeight: "700" },
  testBtnText: { color: "#9ca3af", fontSize: 12, fontWeight: '600' },
  footer: { textAlign: "center", color: "#9ca3af", marginTop: 26, fontSize: 11 },
  errorText: { color: "#ef4444", marginTop: 6, fontSize: 12 },
});
