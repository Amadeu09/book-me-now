import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { setToken, setUser } from "@/utils/session";
import { signup } from "@/features/auth/services/auth.service";
import { uploadFotoUsuari, createTreballador } from "@/features/horarios/services/treballadors.service";
import { uploadFotoEmpresa } from "@/features/empresas/services/empresas.service";
import { createHorariTram } from "@/features/horarios/services/horari-empresa.service";
import { TramModal, minsToHHMM } from "@/features/horarios/components/modal/TramModal";
import { HC, cardShadow } from "@/features/home/constants/inicio.constants";

export default function RegisterUserScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [associarTreballador, setAssociarTreballador] = useState(false);
  const [nomTreballador, setNomTreballador] = useState("");
  const [diesVacances, setDiesVacances] = useState("30");

  const [configHorari, setConfigHorari] = useState(false);
  const [horariTrams, setHorariTrams] = useState<{ dow: number; iniciMin: number; fiMin: number }[]>([]);
  const [tramModal, setTramModal] = useState<{ visible: boolean; dow: number } | null>(null);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permiso requerido", "Necesitamos acceso a tu galería.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setPhotoUri(result.assets[0].uri);
  };

  const handleSignup = async () => {
    setEmailError(null);
    setPasswordError(null);
    setConfirmError(null);
    setGeneralError(null);

    let hasError = false;
    if (!email.trim()) { setEmailError("El email es obligatorio"); hasError = true; }
    else if (!email.includes("@")) { setEmailError("Ingresa un email válido"); hasError = true; }
    if (!password || password.length < 6) { setPasswordError("Mínimo 6 caracteres"); hasError = true; }
    if (password !== confirmPassword) { setConfirmError("Las contraseñas no coinciden"); hasError = true; }
    if (associarTreballador && !nomTreballador.trim()) {
      Alert.alert("Error", "El nombre del trabajador es obligatorio");
      return;
    }
    if (hasError) return;

    const empresaData: Record<string, any> = {
      nom: params.nom as string,
      ubicacio: params.ubicacio as string,
      descripcio: (params.descripcio as string) || undefined,
    };
    if (params.tipo) empresaData.tipo = params.tipo as string;
    if (params.diasAntesReserva) empresaData.diasAntesReserva = parseInt(params.diasAntesReserva as string, 10);

    const userData = {
      email: email.trim().toLowerCase(),
      password,
      colorPrimari: (params.colorPrimari as string) || undefined,
    };

    try {
      setLoading(true);
      const response = await signup(empresaData as any, userData);
      await setToken(response.token);
      await setUser(response.user);

      const empresaId = response.user.empresaId;
      const usuariId = parseInt(response.user.id, 10);
      const fotoEmpresaUri = params.fotoUri as string;

      await Promise.allSettled([
        photoUri ? uploadFotoUsuari(usuariId, photoUri) : Promise.resolve(),
        fotoEmpresaUri ? uploadFotoEmpresa(empresaId, fotoEmpresaUri) : Promise.resolve(),
      ]);

      if (associarTreballador && nomTreballador.trim()) {
        await createTreballador({
          nom: nomTreballador.trim(),
          idUsuari: usuariId,
          diesVacancesAnuals: parseInt(diesVacances, 10) || 30,
        });
      }

      if (horariTrams.length > 0) {
        await Promise.allSettled(horariTrams.map(t => createHorariTram(empresaId, t)));
      }

      router.replace({ pathname: "/home" } as any);
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "No se pudo completar el registro.";
      setGeneralError(msg ?? "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={HC.textPrimary} />
          </TouchableOpacity>

          <View style={styles.brandRow}>
            <View style={[styles.brandDot, { backgroundColor: HC.primary }]} />
            <Text style={[styles.brandText, { color: HC.primary }]}>BOOKMENOW</Text>
          </View>

          <View style={{ height: 18 }} />
          <Text style={styles.title}>Crea tu cuenta</Text>
          <Text style={styles.subtitle}>Paso 2 de 2</Text>
          <View style={{ height: 20 }} />

          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={pickPhoto} style={styles.avatarTouch} activeOpacity={0.8}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: HC.primaryLight }]}>
                  <Ionicons name="person-outline" size={36} color={HC.primary} />
                </View>
              )}
              <View style={[styles.avatarBadge, { backgroundColor: HC.primary }]}>
                <Ionicons name="camera" size={12} color={HC.white} />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Foto de perfil (opcional)</Text>
          </View>

          <View style={{ height: 16 }} />

          <View style={styles.card}>
            {generalError ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={16} color={HC.red} />
                <Text style={styles.errorBannerText}>{generalError}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Correo electrónico *</Text>
            <View style={[styles.inputRow, emailError ? styles.inputRowError : null]}>
              <Ionicons name="mail-outline" size={18} color={HC.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                placeholder="tu@email.com"
                placeholderTextColor={HC.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
              />
            </View>
            {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}

            <Text style={[styles.label, { marginTop: 14 }]}>Contraseña *</Text>
            <View style={[styles.inputRow, passwordError ? styles.inputRowError : null]}>
              <Ionicons name="lock-closed-outline" size={18} color={HC.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={HC.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                style={styles.input}
              />
              <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color={HC.textMuted} />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}

            <Text style={[styles.label, { marginTop: 14 }]}>Confirmar contraseña *</Text>
            <View style={[styles.inputRow, confirmError ? styles.inputRowError : null]}>
              <Ionicons name="lock-closed-outline" size={18} color={HC.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                placeholder="Repite la contraseña"
                placeholderTextColor={HC.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                style={styles.input}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={18} color={HC.textMuted} />
              </TouchableOpacity>
            </View>
            {confirmError ? <Text style={styles.fieldError}>{confirmError}</Text> : null}
          </View>

          {/* Toggle trabajador */}
          <View style={[styles.toggleCard, { marginTop: 16 }]}>
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>¿Asociar un trabajador a este usuario?</Text>
                <Text style={styles.toggleSubLabel}>Crea también el perfil de trabajador vinculado</Text>
              </View>
              <Switch
                value={associarTreballador}
                onValueChange={setAssociarTreballador}
                trackColor={{ false: HC.border, true: HC.primary }}
                thumbColor={HC.white}
              />
            </View>

            {associarTreballador && (
              <View style={{ marginTop: 16 }}>
                <Text style={styles.label}>Nombre del trabajador</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="person-outline" size={18} color={HC.textMuted} style={{ marginRight: 8 }} />
                  <TextInput
                    placeholder="Nombre completo"
                    placeholderTextColor={HC.textMuted}
                    value={nomTreballador}
                    onChangeText={setNomTreballador}
                    autoCapitalize="words"
                    style={styles.input}
                  />
                </View>
                <Text style={[styles.label, { marginTop: 12 }]}>Días de vacaciones anuales</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="sunny-outline" size={18} color={HC.textMuted} style={{ marginRight: 8 }} />
                  <TextInput
                    placeholder="30"
                    placeholderTextColor={HC.textMuted}
                    value={diesVacances}
                    onChangeText={setDiesVacances}
                    keyboardType="number-pad"
                    style={styles.input}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Toggle horari */}
          <View style={[styles.toggleCard, { marginTop: 12 }]}>
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>Configurar horario de apertura</Text>
                <Text style={styles.toggleSubLabel}>Opcional · Puedes modificarlo más tarde</Text>
              </View>
              <Switch
                value={configHorari}
                onValueChange={setConfigHorari}
                trackColor={{ false: HC.border, true: HC.primary }}
                thumbColor={HC.white}
              />
            </View>

            {configHorari && (
              <View style={{ marginTop: 16, gap: 2 }}>
                {(["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"] as const).map((label, dow) => {
                  const dayTrams = horariTrams.filter(t => t.dow === dow);
                  return (
                    <View key={dow} style={styles.horariDayRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.horariDayLabel}>{label}</Text>
                        {dayTrams.length === 0 ? (
                          <Text style={styles.horariTancat}>Cerrado</Text>
                        ) : (
                          <View style={styles.horariChips}>
                            {dayTrams.map((t, i) => {
                              const globalIdx = horariTrams.indexOf(t);
                              return (
                                <View key={i} style={styles.horariChip}>
                                  <Text style={styles.horariChipText}>
                                    {minsToHHMM(t.iniciMin)} – {minsToHHMM(t.fiMin)}
                                  </Text>
                                  <TouchableOpacity
                                    onPress={() => setHorariTrams(prev => prev.filter((_, idx) => idx !== globalIdx))}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                  >
                                    <Ionicons name="close-circle" size={14} color={HC.textMuted} />
                                  </TouchableOpacity>
                                </View>
                              );
                            })}
                          </View>
                        )}
                      </View>
                      <TouchableOpacity
                        onPress={() => setTramModal({ visible: true, dow })}
                        style={[styles.horariAddBtn, { backgroundColor: HC.primaryLight }]}
                      >
                        <Ionicons name="add" size={18} color={HC.primary} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {tramModal && (
            <TramModal
              visible={tramModal.visible}
              dow={tramModal.dow}
              onSave={async (iniciMin, fiMin) => {
                setHorariTrams(prev => [...prev, { dow: tramModal.dow, iniciMin, fiMin }]);
              }}
              onClose={() => setTramModal(null)}
            />
          )}

          <View style={{ height: 8 }} />

          <TouchableOpacity
            style={[styles.cta, { backgroundColor: HC.primary }, loading && { opacity: 0.7 }]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={HC.white} />
              : <Text style={styles.ctaText}>Crear cuenta</Text>
            }
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.metaText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.replace("/login")}>
              <Text style={[styles.linkText, { color: HC.primary }]}>Iniciar sesión</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>© {new Date().getFullYear()} BookMeNow</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: HC.screenBg },
  scrollContent: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40, maxWidth: 480, width: "100%", alignSelf: "center" },
  backButton: { position: "absolute", top: 0, left: 0, zIndex: 10, padding: 4 },

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
  toggleCard: {
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: HC.border,
    backgroundColor: HC.white,
    padding: 16,
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

  toggleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  toggleLabel: { fontSize: 14, fontWeight: "600", color: HC.textPrimary },
  toggleSubLabel: { fontSize: 12, color: HC.textMuted, marginTop: 2 },

  cta: { borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 16 },
  ctaText: { color: HC.white, fontWeight: "700", fontSize: 15 },

  loginRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 16 },
  metaText: { color: HC.textMuted, fontSize: 13 },
  linkText: { fontSize: 13, fontWeight: "700" },

  footer: { textAlign: "center", color: HC.textMuted, marginTop: 32, fontSize: 11 },

  avatarContainer: { alignItems: "center" },
  avatarTouch: { width: 88, height: 88, borderRadius: 44 },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  avatarPlaceholder: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center" },
  avatarBadge: {
    position: "absolute", bottom: 2, right: 2,
    width: 26, height: 26, borderRadius: 13,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: HC.white,
  },
  avatarHint: { color: HC.textMuted, fontSize: 12, marginTop: 8 },

  horariDayRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: HC.screenBg,
  },
  horariDayLabel: { fontSize: 13, fontWeight: "700", color: HC.textPrimary, marginBottom: 4 },
  horariTancat: { fontSize: 12, color: HC.textMuted, fontStyle: "italic" },
  horariChips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  horariChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: HC.screenBg, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: HC.border,
  },
  horariChipText: { fontSize: 12, fontWeight: "600", color: HC.textSecondary },
  horariAddBtn: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: "center", justifyContent: "center", marginLeft: 8,
  },
});
