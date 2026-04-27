import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
  Alert,
} from "react-native";
import { signup } from "@/features/auth/services/auth.service";
import { uploadFotoUsuari, createTreballador } from "@/features/horarios/services/treballadors.service";
import { uploadFotoEmpresa } from "@/features/empresas/services/empresas.service";
import { createHorariTram } from "@/features/horarios/services/horari-empresa.service";
import { TramModal, minsToHHMM } from "@/features/horarios/components/modal/TramModal";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RegisterUser() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Trabajador asociado
  const [associarTreballador, setAssociarTreballador] = useState(false);
  const [nomTreballador, setNomTreballador] = useState("");
  const [diesVacances, setDiesVacances] = useState("30");

  // Horari empresa
  const [configHorari, setConfigHorari] = useState(false);
  const [horariTrams, setHorariTrams] = useState<{ dow: number; iniciMin: number; fiMin: number }[]>([]);
  const [tramModal, setTramModal] = useState<{ visible: boolean; dow: number } | null>(null);

  // Errores
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permiso requerido", "Necesitamos acceso a tu galería para subir una foto.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSignup = async () => {
    setEmailError(null);
    setPasswordError(null);
    setConfirmError(null);
    setGeneralError(null);

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
    if (associarTreballador && !nomTreballador.trim()) {
      localErrors.push("El nombre del trabajador es obligatorio");
      Alert.alert("Revisa los datos", "El nombre del trabajador es obligatorio");
      return;
    }
    if (localErrors.length) {
      Alert.alert("Revisa los datos", localErrors[0]);
      return;
    }

    const empresaData: Record<string, any> = {
      nom: params.nom as string,
      ubicacio: params.ubicacio as string,
      descripcio: (params.descripcio as string) || undefined,
    };
    if (params.tipo) empresaData.tipo = params.tipo as string;

    const userData = {
      email: email.trim().toLowerCase(),
      password,
      colorPrimari: (params.colorPrimari as string) || undefined,
    };

    try {
      setLoading(true);
      const response = await signup(empresaData as any, userData);

      await AsyncStorage.setItem("token", response.token);
      await AsyncStorage.setItem("user", JSON.stringify(response.user));

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
        await Promise.allSettled(
          horariTrams.map(t => createHorariTram(empresaId, t))
        );
      }

      router.replace({ pathname: "/home" } as any);
    } catch (error: unknown) {
      const apiMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "No se pudo completar el registro. Intenta nuevamente.";
      setGeneralError(apiMessage);
      Alert.alert("Error", apiMessage);
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
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>

          <View style={styles.brandRow}>
            <View style={styles.brandDot} />
            <Text style={styles.brandText}>BookMeNow</Text>
          </View>

          <View style={{ height: 18 }} />
          <Text style={styles.title}>Crea tu cuenta</Text>
          <Text style={styles.subtitle}>Paso 2 de 2</Text>
          <View style={{ height: 20 }} />

          {/* Avatar Picker */}
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={pickPhoto} style={styles.avatarTouch} activeOpacity={0.8}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person-outline" size={40} color="#9ca3af" />
                </View>
              )}
              <View style={styles.avatarBadge}>
                <Ionicons name="camera" size={14} color="#000" />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Foto de perfil (opcional)</Text>
          </View>

          <View style={{ height: 16 }} />

          <View style={styles.card}>
            {/* Email */}
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={18} color="#9ca3af" style={{ marginRight: 8 }} />
              <TextInput
                placeholder="Email"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
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
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                style={styles.input}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

            {/* Confirm Password */}
            <View style={[styles.inputRow, { marginTop: 12 }]}>
              <Ionicons name="lock-closed-outline" size={18} color="#9ca3af" style={{ marginRight: 8 }} />
              <TextInput
                placeholder="Confirmar contraseña"
                placeholderTextColor="#9ca3af"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="password"
                style={styles.input}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            {confirmError ? <Text style={styles.errorText}>{confirmError}</Text> : null}
          </View>

          {/* Toggle trabajador */}
          <View style={styles.toggleCard}>
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>¿Asociar un trabajador a este usuario?</Text>
                <Text style={styles.toggleSubLabel}>Crea también el perfil de trabajador vinculado</Text>
              </View>
              <Switch
                value={associarTreballador}
                onValueChange={setAssociarTreballador}
                trackColor={{ false: "#e5e7eb", true: "#6264A0" }}
                thumbColor="#fff"
              />
            </View>

            {associarTreballador && (
              <View style={styles.treballadorFields}>
                <View style={styles.inputRow}>
                  <Ionicons name="person-outline" size={18} color="#9ca3af" style={{ marginRight: 8 }} />
                  <TextInput
                    placeholder="Nombre completo del trabajador"
                    placeholderTextColor="#9ca3af"
                    value={nomTreballador}
                    onChangeText={setNomTreballador}
                    autoCapitalize="words"
                    style={styles.input}
                  />
                </View>

                <View style={[styles.inputRow, { marginTop: 12 }]}>
                  <Ionicons name="sunny-outline" size={18} color="#9ca3af" style={{ marginRight: 8 }} />
                  <TextInput
                    placeholder="Días de vacaciones anuales"
                    placeholderTextColor="#9ca3af"
                    value={diesVacances}
                    onChangeText={setDiesVacances}
                    keyboardType="number-pad"
                    style={styles.input}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Horari empresa */}
          <View style={[styles.toggleCard, { marginTop: 16 }]}>
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>Configurar horari d'obertura</Text>
                <Text style={styles.toggleSubLabel}>Opcional · Pots modificar-ho més tard</Text>
              </View>
              <Switch
                value={configHorari}
                onValueChange={setConfigHorari}
                trackColor={{ false: "#e5e7eb", true: "#6264A0" }}
                thumbColor="#fff"
              />
            </View>

            {configHorari && (
              <View style={{ marginTop: 16, gap: 2 }}>
                {(['Dilluns','Dimarts','Dimecres','Dijous','Divendres','Dissabte','Diumenge'] as const).map((label, dow) => {
                  const dayTrams = horariTrams.filter(t => t.dow === dow);
                  return (
                    <View key={dow} style={styles.horariDayRow}>
                      <View style={styles.horariDayLeft}>
                        <Text style={styles.horariDayLabel}>{label}</Text>
                        {dayTrams.length === 0 ? (
                          <Text style={styles.horariTancat}>Tancat</Text>
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
                                    <Ionicons name="close-circle" size={14} color="#9ca3af" />
                                  </TouchableOpacity>
                                </View>
                              );
                            })}
                          </View>
                        )}
                      </View>
                      <TouchableOpacity
                        onPress={() => setTramModal({ visible: true, dow })}
                        style={styles.horariAddBtn}
                      >
                        <Ionicons name="add" size={18} color="#6264A0" />
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

          <View style={{ alignItems: "center", marginTop: 14 }}>
            <Text style={styles.metaText}>
              ¿Ya tienes cuenta?{" "}
              <Text onPress={() => router.replace("/login")} style={styles.linkText}>
                Iniciar sesión
              </Text>
            </Text>
          </View>

          {generalError ? (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.errorText}>{generalError}</Text>
            </View>
          ) : null}

          <Text style={styles.footer}>© {new Date().getFullYear()} Book Me Now</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40, maxWidth: 1600, width: "100%", alignSelf: "center" },
  backButton: { position: "absolute", top: 0, left: 0, zIndex: 10, padding: 4 },

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

  toggleCard: {
    marginTop: 16,
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
  toggleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  toggleLabel: { fontSize: 14, fontWeight: "600", color: "#111827" },
  toggleSubLabel: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  treballadorFields: { marginTop: 16 },

  cta: { borderRadius: 14, overflow: "hidden", marginTop: 16 },
  ctaGradient: { paddingVertical: 14, alignItems: "center" },
  ctaText: { color: "#000", fontWeight: "900", fontSize: 14 },

  metaText: { color: "#6b7280", fontSize: 12 },
  linkText: { color: "#6264A0", fontWeight: "700" },
  footer: { textAlign: "center", color: "#9ca3af", marginTop: 26, fontSize: 11 },
  errorText: { color: "#ef4444", marginTop: 6, fontSize: 12 },

  horariDayRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  horariDayLeft: { flex: 1 },
  horariDayLabel: { fontSize: 13, fontWeight: "700", color: "#111827", marginBottom: 4 },
  horariTancat: { fontSize: 12, color: "#9ca3af", fontStyle: "italic" },
  horariChips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  horariChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  horariChipText: { fontSize: 12, fontWeight: "600", color: "#374151" },
  horariAddBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ede9fe",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  avatarContainer: { alignItems: "center" },
  avatarTouch: { width: 88, height: 88, borderRadius: 44 },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#ffe3aa",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarHint: { color: "#9ca3af", fontSize: 12, marginTop: 8 },
});
