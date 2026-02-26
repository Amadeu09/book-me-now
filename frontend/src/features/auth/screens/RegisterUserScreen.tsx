import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
  Alert,
} from "react-native";
import { signup } from "@/features/auth/services/auth.service";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

export default function RegisterUser() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleSignup = async () => {
    setEmailError(null);
    setPasswordError(null);
    setConfirmError(null);
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
    if (!password || password.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      localErrors.push("La contraseña debe tener al menos 6 caracteres");
    }
    if (password !== confirmPassword) {
      setConfirmError("Las contraseñas no coinciden");
      localErrors.push("Las contraseñas no coinciden");
    }
    if (localErrors.length) {
      Alert.alert("Revisa los datos", localErrors[0]);
      return;
    }

    // Preparar datos
    const empresaData = {
      nom: params.nom as string,
      ubicacio: params.ubicacio as string,
      capacitat: params.capacitat ? parseInt(params.capacitat as string, 10) : undefined,
    };

    const userData = {
      email: email.trim().toLowerCase(),
      password,
    };

    try {
      setLoading(true);
      const response = await signup(empresaData, userData);
      console.log('✅ Signup exitoso:', { token: response.token.slice(0, 20), user: response.user });
      
      // Persistir credenciales
      await AsyncStorage.setItem("token", response.token);
      await AsyncStorage.setItem("user", JSON.stringify(response.user));
      console.log('✅ Token y user guardados en AsyncStorage');
      
      // Navegar directamente a home
      router.replace({ pathname: "/home" } as any);
      console.log('✅ Navegación ejecutada hacia /home');
    } catch (error: any) {
      console.error("Error en signup:", error);
      const apiMessage =
        error?.response?.data?.message ||
        error?.message ||
        "No se pudo completar el registro. Intenta nuevamente.";
      setGeneralError(apiMessage);
      Alert.alert("Error", apiMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#0b0b10", "#1b1220", "#10202a", "#0b0b10"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.conicGlow} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* Header */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.brandRow}>
            <View style={styles.brandDot} />
            <Text style={styles.brandText}>BOOK ME NOW</Text>
          </View>

          <View style={{ height: 18 }} />

          <Text style={styles.title}>Crea tu cuenta</Text>
          <Text style={styles.subtitle}>Paso 2 de 2</Text>

          <View style={{ height: 24 }} />

          <BlurView intensity={35} tint="dark" style={styles.card}>
            <View style={styles.cardInner}>
              {/* Email */}
              <View style={styles.inputRow}>
                <Ionicons name="mail-outline" size={18} color="rgba(255,255,255,0.8)" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Email"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  style={styles.input}
                />
              </View>

              {/* Password */}
              <View style={[styles.inputRow, { marginTop: 12 }]}>
                <Ionicons name="lock-closed-outline" size={18} color="rgba(255,255,255,0.8)" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Contraseña"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  style={styles.input}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              </View>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

              {/* Confirm Password */}
              <View style={[styles.inputRow, { marginTop: 12 }]}>
                <Ionicons name="lock-closed-outline" size={18} color="rgba(255,255,255,0.8)" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Confirmar contraseña"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  style={styles.input}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={18} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

              <View style={{ height: 20 }} />

              {/* CTA */}
              <TouchableOpacity activeOpacity={0.9} style={styles.cta} onPress={handleSignup} disabled={loading}>
                <LinearGradient colors={["#ffffff", "#ffe3aa"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaGradient}>
                  {loading ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <Text style={styles.ctaText}>Crear cuenta</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Login link */}
              <View style={{ alignItems: "center", marginTop: 14 }}>
                <Text style={styles.metaText}>
                  ¿Ya tienes cuenta?{" "}
                  <Text onPress={() => router.replace("/login")} style={styles.linkText}>
                    Iniciar sesión
                  </Text>
                </Text>
              </View>
              {confirmError ? <Text style={styles.errorText}>{confirmError}</Text> : null}

              {generalError ? (
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.errorText}>{generalError}</Text>
                </View>
              ) : null}
            </View>
          </BlurView>

          <Text style={styles.footer}>© {new Date().getFullYear()} Book Me Now</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0b0b10" },
  container: { flex: 1, paddingHorizontal: 20, justifyContent: "center" },
  backButton: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  brandRow: { flexDirection: "row", alignItems: "center" },
  brandDot: { width: 10, height: 10, borderRadius: 10, backgroundColor: "#f472b6", marginRight: 8 },
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

  metaText: { color: "rgba(255,255,255,0.7)", fontSize: 12 },
  linkText: { color: "#fbcfe8", fontWeight: "700" },
  footer: { textAlign: "center", color: "rgba(255,255,255,0.45)", marginTop: 26, fontSize: 11 },

  errorText: { color: "#fecaca", marginTop: 6, fontSize: 12 },

  conicGlow: {
    position: "absolute",
    width: width * 1.8,
    height: width * 1.8,
    top: -width * 0.6,
    right: -width * 0.7,
    borderRadius: width * 1.8,
    opacity: 0.22,
    backgroundColor: "transparent",
    shadowColor: "#ff7ae6",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 100,
  },
});
