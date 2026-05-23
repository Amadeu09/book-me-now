import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { HC, cardShadow } from "@/features/home/constants/inicio.constants";

const TIPOS_NEGOCIO = [
  { label: "Peluquería", value: "PERRUQUERIA" },
  { label: "Barbería", value: "BARBERIA" },
  { label: "Estética", value: "ESTETICA" },
  { label: "Spa", value: "SPA" },
  { label: "Masajes", value: "MASSATGES" },
  { label: "Nutricionista", value: "NUTRICIONISTA" },
  { label: "Fisioterapia", value: "FISIOTERAPIA" },
  { label: "Pilates", value: "PILATES" },
  { label: "Fitness", value: "FITNESS" },
  { label: "Ioga", value: "IOGA" },
  { label: "Dental", value: "DENTAL" },
  { label: "Veterinaria", value: "VETERINARIA" },
  { label: "Otros", value: "OTROS" },
];

export default function RegisterScreen() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [ubicacio, setUbicacio] = useState("");
  const [descripcio, setDescripcio] = useState("");
  const [tipo, setTipo] = useState<string | null>(null);
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [diasAntesReserva, setDiasAntesReserva] = useState("14");

  const pickImage = async () => {
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
    if (!result.canceled && result.assets[0]) setFotoUri(result.assets[0].uri);
  };

  const handleContinue = () => {
    if (!nom.trim() || nom.trim().length < 2) {
      Alert.alert("Error", "El nombre de la empresa debe tener al menos 2 caracteres");
      return;
    }
    if (!ubicacio.trim() || ubicacio.trim().length < 2) {
      Alert.alert("Error", "La ubicación debe tener al menos 2 caracteres");
      return;
    }
    router.push({
      pathname: "/register-user",
      params: {
        nom: nom.trim(),
        ubicacio: ubicacio.trim(),
        descripcio: descripcio.trim(),
        tipo: tipo || "",
        fotoUri: fotoUri || "",
        diasAntesReserva: diasAntesReserva.trim() || "14",
      },
    });
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
          <Text style={styles.title}>Datos de tu empresa</Text>
          <Text style={styles.subtitle}>Paso 1 de 2</Text>
          <View style={{ height: 20 }} />

          <View style={styles.card}>
            <Text style={styles.label}>Nombre de la empresa *</Text>
            <View style={styles.inputRow}>
              <Ionicons name="business-outline" size={18} color={HC.textMuted} style={styles.icon} />
              <TextInput
                placeholder="Nombre de la empresa"
                placeholderTextColor={HC.textMuted}
                value={nom}
                onChangeText={setNom}
                autoCapitalize="words"
                style={styles.input}
              />
            </View>

            <Text style={[styles.label, { marginTop: 14 }]}>Ubicación *</Text>
            <View style={styles.inputRow}>
              <Ionicons name="location-outline" size={18} color={HC.textMuted} style={styles.icon} />
              <TextInput
                placeholder="Ciudad, dirección..."
                placeholderTextColor={HC.textMuted}
                value={ubicacio}
                onChangeText={setUbicacio}
                autoCapitalize="words"
                style={styles.input}
              />
            </View>

            <Text style={[styles.label, { marginTop: 14 }]}>Descripción</Text>
            <View style={[styles.inputRow, { alignItems: "flex-start", minHeight: 80 }]}>
              <Ionicons name="document-text-outline" size={18} color={HC.textMuted} style={[styles.icon, { marginTop: 2 }]} />
              <TextInput
                placeholder="Describe tu empresa (opcional)"
                placeholderTextColor={HC.textMuted}
                value={descripcio}
                onChangeText={setDescripcio}
                multiline
                numberOfLines={3}
                style={[styles.input, { textAlignVertical: "top" }]}
              />
            </View>

            <Text style={[styles.label, { marginTop: 14 }]}>Días de antelación para reservas</Text>
            <View style={styles.inputRow}>
              <Ionicons name="calendar-outline" size={18} color={HC.textMuted} style={styles.icon} />
              <TextInput
                placeholder="14"
                placeholderTextColor={HC.textMuted}
                value={diasAntesReserva}
                onChangeText={setDiasAntesReserva}
                keyboardType="number-pad"
                style={styles.input}
              />
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Tipo de negocio</Text>
            <View style={styles.tipoGrid}>
              {TIPOS_NEGOCIO.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  onPress={() => setTipo(tipo === t.value ? null : t.value)}
                  style={[styles.chip, tipo === t.value && { borderColor: HC.primary, backgroundColor: HC.primaryLight }]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, tipo === t.value && { color: HC.primary, fontWeight: "600" }]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Foto de perfil</Text>
            <TouchableOpacity style={styles.photoBox} onPress={pickImage} activeOpacity={0.8}>
              {fotoUri ? (
                <Image source={{ uri: fotoUri }} style={styles.photoPreview} />
              ) : (
                <View style={[styles.photoPlaceholder, { backgroundColor: HC.primaryLight }]}>
                  <Ionicons name="camera-outline" size={22} color={HC.primary} />
                </View>
              )}
              <Text style={styles.photoLabel}>{fotoUri ? "Cambiar foto" : "Añadir foto"}</Text>
            </TouchableOpacity>

            <View style={{ height: 20 }} />

            <TouchableOpacity
              style={[styles.cta, { backgroundColor: HC.primary }]}
              onPress={handleContinue}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaText}>Continuar</Text>
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.metaText}>¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={[styles.linkText, { color: HC.primary }]}>Iniciar sesión</Text>
              </TouchableOpacity>
            </View>
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

  label: { fontSize: 13, fontWeight: "600", color: HC.textSecondary, marginBottom: 6 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: HC.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 },
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
  icon: { marginRight: 8 },
  input: { color: HC.textPrimary, fontSize: 14, flex: 1 },

  tipoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: HC.border,
    backgroundColor: HC.white,
  },
  chipText: { fontSize: 13, color: HC.textSecondary },

  photoBox: { alignItems: "center", gap: 8, alignSelf: "flex-start" },
  photoPreview: { width: 72, height: 72, borderRadius: 36 },
  photoPlaceholder: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  photoLabel: { color: HC.textMuted, fontSize: 12 },

  cta: { borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  ctaText: { color: HC.white, fontWeight: "700", fontSize: 15 },

  loginRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 16 },
  metaText: { color: HC.textMuted, fontSize: 13 },
  linkText: { fontSize: 13, fontWeight: "700" },

  footer: { textAlign: "center", color: HC.textMuted, marginTop: 32, fontSize: 11 },
});
