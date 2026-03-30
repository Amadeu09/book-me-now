// React Native / Expo — Login Neo‑Coast (TypeScript)
// Estilo consistente con la landing: neon + glass + gradientes animados
// Dependencias sugeridas (Expo):
//   expo install expo-linear-gradient expo-blur
//   (opcional) npm i zod react-hook-form
// Archivo: src/screens/NeoLogin.tsx

import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login } from "@/features/auth/services/auth.service";
import api from "@/core/api/api";
import { AUTH } from "../constants/auth.constants";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
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

const { width, height } = Dimensions.get("window");

export default function NeoLogin() {
  const router = useRouter();
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const float3 = useRef(new Animated.Value(0)).current;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const redirectToRegister = () => {
    router.push('/register');
  };

  const handlesLogin = async () => {
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);

    // Validación
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
      console.log("✅ Login exitoso:", { token: response.token.slice(0, 20), user: response.user });
      
      // Persistir credenciales
      await AsyncStorage.setItem("token", response.token);
      await AsyncStorage.setItem("user", JSON.stringify(response.user));
      console.log("✅ Token y user guardados en AsyncStorage");
      
      // Navegar al home
      router.replace({ pathname: "/home" } as any);
      console.log("✅ Navegación ejecutada hacia /home");
    } catch (error: any) {
      console.error("Error en login:", error);
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

  // Test sencillo de reachability: hace GET /auth/me (espera 401 si hay conexión)
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

  useEffect(() => {
    const loop = (val: Animated.Value, delay = 0) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: 1, duration: 5000, delay, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 5000, useNativeDriver: true }),
        ])
      ).start();
    };
    loop(float1);
    loop(float2, 800);
    loop(float3, 1600);
  }, [float1, float2, float3]);

  const translateY1 = float1.interpolate({ inputRange: [0, 1], outputRange: [0, -20] });
  const translateY2 = float2.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
  const translateY3 = float3.interpolate({ inputRange: [0, 1], outputRange: [0, -24] });

  const [secure, setSecure] = React.useState(true);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[AUTH.bgDark, AUTH.bgMid1, AUTH.bgMid2, AUTH.bgDark]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Capa de brillo cónico como en la landing */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.conicGlow} />
        <View style={styles.vignette} />
      </View>

      {/* Blobs flotantes */}
      <Animated.View style={[styles.blob, styles.blobA, { transform: [{ translateY: translateY1 }] }]} />
      <Animated.View style={[styles.blob, styles.blobB, { transform: [{ translateY: translateY2 }] }]} />
      <Animated.View style={[styles.blob, styles.blobC, { transform: [{ translateY: translateY3 }] }]} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* Header minimal */}
          <View style={styles.brandRow}>
            <View style={styles.brandDot} />
            <Text style={styles.brandText}>BOOK ME NOW</Text>
          </View>

          <View style={{ height: 18 }} />

          <Text style={styles.title}>Tu aplicación de reservas</Text>
          <Text style={styles.subtitle}>Maneja tus reservas y clientes fácilmente</Text>

          <View style={{ height: 24 }} />

          <BlurView intensity={35} tint="dark" style={styles.card}>
            <View style={styles.cardInner}>
              {/* Email */}
              <View style={styles.inputRow}>
                <Ionicons name="mail-outline" size={18} color="rgba(255,255,255,0.8)" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Email"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                />
              </View>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

              {/* Password */}
              <View style={[styles.inputRow, { marginTop: 12 }] }>
                <Ionicons name="lock-closed-outline" size={18} color="rgba(255,255,255,0.8)" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Contraseña"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  secureTextEntry={secure}
                  autoCapitalize="none"
                  value={password}
                  onChangeText={setPassword}
                  style={[styles.input, { flex: 1 }]}
                />
                <TouchableOpacity onPress={() => setSecure(s => !s)} accessibilityRole="button">
                  <Ionicons name={secure ? "eye-outline" : "eye-off-outline"} size={18} color="rgba(255,255,255,0.8)" />
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
                <LinearGradient colors={[AUTH.ctaGradientStart, AUTH.ctaGradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaGradient}>
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
                  <Ionicons name="logo-apple" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialBtn}>
                  <Ionicons name="logo-google" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialBtn}>
                  <Ionicons name="logo-facebook" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Register */}
              <View style={{ alignItems: "center", marginTop: 14 }}>
                <Text style={styles.metaText}>¿No tienes cuenta? <Text onPress={redirectToRegister} style={styles.linkText}>Crear cuenta</Text></Text>
              </View>
            </View>
          </BlurView>

          {/* Footer */}
          <Text style={styles.footer}>© {new Date().getFullYear()} Neo‑Coast — Login estilizado (no oficial).</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AUTH.bgDark },
  container: { flex: 1, paddingHorizontal: 20, justifyContent: "center" },
  brandRow: { flexDirection: "row", alignItems: "center" },
  brandDot: { width: 10, height: 10, borderRadius: 10, backgroundColor: AUTH.blobPink, marginRight: 8 },
  brandText: { letterSpacing: 4, color: "#fff", fontWeight: "700", fontSize: 12, opacity: 0.9 },
  title: { fontSize: 36, fontWeight: "900", color: "#fff", lineHeight: 40 },
  subtitle: { color: "rgba(255,255,255,0.65)", marginTop: 6 },

  card: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  cardInner: { padding: 16 },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 14,
  },
  input: { color: "#fff", fontSize: 14, flex: 1 },

  cta: { borderRadius: 14, overflow: "hidden" },
  ctaGradient: { paddingVertical: 14, alignItems: "center" },
  ctaText: { color: "#000", fontWeight: "900", fontSize: 14 },

  dividerRow: { flexDirection: "row", alignItems: "center", marginTop: 16 },
  divider: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.12)" },
  dividerLabel: { color: "rgba(255,255,255,0.6)", marginHorizontal: 10, fontSize: 12 },

  socialRow: { flexDirection: "row", gap: 10, justifyContent: "center", marginTop: 12 },
  socialBtn: {
    width: 46, height: 46, borderRadius: 12,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center", justifyContent: "center",
  },

  metaText: { color: "rgba(255,255,255,0.7)", fontSize: 12 },
  linkText: { color: AUTH.linkLight, fontWeight: "700" },
  testBtnText: { color: AUTH.testBtn, fontSize: 12, fontWeight: '600' },
  footer: { textAlign: "center", color: "rgba(255,255,255,0.45)", marginTop: 26, fontSize: 11 },

  errorText: { color: AUTH.errorLight, marginTop: 6, fontSize: 12 },

  // Fondos y brillos
  conicGlow: {
    position: "absolute",
    width: width * 1.8,
    height: width * 1.8,
    top: -width * 0.6,
    right: -width * 0.7,
    borderRadius: width * 1.8,
    opacity: 0.22,
    backgroundColor: "transparent",
    shadowColor: AUTH.glowPink,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 100,
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  blob: {
    position: "absolute",
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.8,
    opacity: 0.12,
  },
  blobA: { backgroundColor: AUTH.blobPink, top: height * 0.1, left: -width * 0.2 },
  blobB: { backgroundColor: AUTH.blobYellow, top: height * 0.5, right: -width * 0.3 },
  blobC: { backgroundColor: AUTH.blobCyan, top: -width * 0.2, right: -width * 0.15 },
});

// USO con Expo Router o React Navigation
// ---------------------------------------
// import NeoLogin from "./src/screens/NeoLogin";
// export default function App(){ return <NeoLogin/> }
