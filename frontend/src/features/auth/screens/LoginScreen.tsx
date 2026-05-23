import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { setToken, setUser } from "@/utils/session";
import { login, forgotPassword } from "@/features/auth/services/auth.service";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { HC, cardShadow } from "@/features/home/constants/inicio.constants";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [secure, setSecure] = useState(true);

  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleForgotPassword = async () => {
    setForgotError(null);
    if (!forgotEmail.trim() || !forgotEmail.includes("@")) {
      setForgotError("Ingresa un email válido");
      return;
    }
    try {
      setForgotLoading(true);
      await forgotPassword(forgotEmail.trim().toLowerCase());
      setForgotSuccess(true);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "No se pudo enviar el correo.";
      setForgotError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotModal = () => {
    setForgotModalVisible(false);
    setForgotEmail("");
    setForgotError(null);
    setForgotSuccess(false);
  };

  const handleLogin = async () => {
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);

    let hasError = false;
    if (!email.trim()) { setEmailError("El email es obligatorio"); hasError = true; }
    else if (!email.includes("@")) { setEmailError("Ingresa un email válido"); hasError = true; }
    if (!password) { setPasswordError("La contraseña es obligatoria"); hasError = true; }
    if (hasError) return;

    try {
      setLoading(true);
      const response = await login({ email: email.trim().toLowerCase(), password });
      await setToken(response.token);
      await setUser(response.user);
      router.replace({ pathname: "/profile" } as any);
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 401 || status === 403 || status == 400 || status === 404) {
        setGeneralError("Email o contrasenya incorrectes. Comprova les teves credencials.");
      } else {
        const msg = error?.response?.data?.message || error?.message || "No s'ha pogut iniciar sessió.";
        setGeneralError(Array.isArray(msg) ? msg.join(", ") : msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.container}>

          <View style={styles.brandRow}>
            <View style={[styles.brandDot, { backgroundColor: HC.primary }]} />
            <Text style={[styles.brandText, { color: HC.primary }]}>BOOKMENOW</Text>
          </View>

          <View style={{ height: 18 }} />
          <Text style={styles.title}>Tu aplicación de reservas</Text>
          <Text style={styles.subtitle}>Gestiona tus reservas y clientes fácilmente</Text>
          <View style={{ height: 24 }} />

          <View style={styles.card}>
            {generalError ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={16} color={HC.red} />
                <Text style={styles.errorBannerText}>{generalError}</Text>
              </View>
            ) : null}

            {/* Email */}
            <Text style={styles.label}>Correo electrónico</Text>
            <View style={[styles.inputRow, emailError ? styles.inputRowError : null]}>
              <Ionicons name="mail-outline" size={18} color={HC.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                placeholder="tu@email.com"
                placeholderTextColor={HC.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
              />
            </View>
            {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}

            {/* Password */}
            <Text style={[styles.label, { marginTop: 14 }]}>Contraseña</Text>
            <View style={[styles.inputRow, passwordError ? styles.inputRowError : null]}>
              <Ionicons name="lock-closed-outline" size={18} color={HC.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                placeholder="••••••••"
                placeholderTextColor={HC.textMuted}
                secureTextEntry={secure}
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
                style={[styles.input, { flex: 1 }]}
              />
              <TouchableOpacity onPress={() => setSecure(s => !s)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name={secure ? "eye-outline" : "eye-off-outline"} size={18} color={HC.textMuted} />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}

            <TouchableOpacity
              onPress={() => setForgotModalVisible(true)}
              style={styles.forgotRow}
              activeOpacity={0.7}
            >
              <Ionicons name="key-outline" size={13} color={HC.primary} />
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <View style={{ height: 16 }} />

            <TouchableOpacity
              style={[styles.cta, { backgroundColor: HC.primary }, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color={HC.white} />
                : <Text style={styles.ctaText}>Iniciar sesión</Text>
              }
            </TouchableOpacity>

            <View style={styles.registerRow}>
              <Text style={styles.metaText}>¿No tienes cuenta? </Text>
              <TouchableOpacity onPress={() => router.push("/register")}>
                <Text style={[styles.linkText, { color: HC.primary }]}>Crear cuenta</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.footer}>© {new Date().getFullYear()} BookMeNow</Text>
        </View>
      </KeyboardAvoidingView>

      {/* Forgot Password Modal */}
      <Modal
        visible={forgotModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeForgotModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Recuperar contraseña</Text>
              <TouchableOpacity onPress={closeForgotModal} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={22} color={HC.textMuted} />
              </TouchableOpacity>
            </View>

            {forgotSuccess ? (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle-outline" size={20} color={HC.green} />
                <Text style={styles.successText}>
                  Si el correo existe, recibirás un enlace en breve. Revisa tu bandeja de entrada.
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.modalSubtitle}>
                  Escribe tu correo y te enviaremos un enlace para restablecer tu contraseña.
                </Text>

                {forgotError ? (
                  <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle-outline" size={16} color={HC.red} />
                    <Text style={styles.errorBannerText}>{forgotError}</Text>
                  </View>
                ) : null}

                <Text style={styles.label}>Correo electrónico</Text>
                <View style={[styles.inputRow, forgotError ? styles.inputRowError : null]}>
                  <Ionicons name="mail-outline" size={18} color={HC.textMuted} style={{ marginRight: 8 }} />
                  <TextInput
                    placeholder="tu@email.com"
                    placeholderTextColor={HC.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                    style={styles.input}
                    autoFocus
                  />
                </View>

                <View style={{ height: 16 }} />

                <TouchableOpacity
                  style={[styles.cta, { backgroundColor: HC.primary }, forgotLoading && { opacity: 0.7 }]}
                  onPress={handleForgotPassword}
                  disabled={forgotLoading}
                  activeOpacity={0.85}
                >
                  {forgotLoading
                    ? <ActivityIndicator color={HC.white} />
                    : <Text style={styles.ctaText}>Enviar enlace</Text>
                  }
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: HC.screenBg },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  brandRow: { flexDirection: "row", alignItems: "center" },
  brandDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  brandText: { letterSpacing: 3, fontWeight: "800", fontSize: 11 },
  title: { fontSize: 28, fontWeight: "800", color: HC.textPrimary, lineHeight: 34 },
  subtitle: { color: HC.textMuted, marginTop: 6, fontSize: 14 },

  card: {
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: HC.border,
    backgroundColor: HC.white,
    padding: 20,
    ...cardShadow,
  },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: HC.redLight,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: { color: HC.red, fontSize: 13, flex: 1 },

  label: { fontSize: 13, fontWeight: "600", color: HC.textSecondary, marginBottom: 6 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: HC.border,
    backgroundColor: HC.screenBg,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
  },
  inputRowError: { borderColor: HC.red },
  input: { color: HC.textPrimary, fontSize: 14, flex: 1 },
  fieldError: { color: HC.red, fontSize: 12, marginTop: 4 },

  cta: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  ctaText: { color: HC.white, fontWeight: "700", fontSize: 15 },

  forgotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-end",
    marginTop: 10,
    paddingVertical: 4,
  },
  forgotText: { color: HC.primary, fontSize: 13, fontWeight: "600" },

  registerRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 16 },
  metaText: { color: HC.textMuted, fontSize: 13 },
  linkText: { fontSize: 13, fontWeight: "700" },

  footer: { textAlign: "center", color: HC.textMuted, marginTop: 32, fontSize: 11 },

  modalOverlay: {
    flex: 1,
    backgroundColor: HC.modalOverlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: HC.white,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 420,
    ...cardShadow,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: { fontSize: 17, fontWeight: "700", color: HC.textPrimary },
  modalSubtitle: { color: HC.textMuted, fontSize: 13, marginBottom: 16, lineHeight: 20 },

  successBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: HC.greenLight,
    borderRadius: 10,
    padding: 14,
    marginTop: 4,
  },
  successText: { color: HC.green, fontSize: 13, flex: 1, lineHeight: 20 },
});
