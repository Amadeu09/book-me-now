import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
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

const PALETAS = [
  { label: "Pizarra", value: "#5B7A96" },
  { label: "Índigo", value: "#6264A0" },
  { label: "Lavanda", value: "#7B5E9A" },
  { label: "Rosa", value: "#9E5A72" },
  { label: "Coral", value: "#B55E54" },
  { label: "Terracota", value: "#A86040" },
  { label: "Ocre", value: "#9B7030" },
  { label: "Oliva", value: "#6C7E4A" },
  { label: "Salvia", value: "#4A7E68" },
  { label: "Teal", value: "#3E7C7E" },
  { label: "Marino", value: "#3E587A" },
];

const TIPOS_NEGOCIO = [
  { label: "Peluquería", value: "PERRUQUERIA" },
  { label: "Barbería", value: "BARBERIA" },
  { label: "Estética", value: "ESTETICA" },
  { label: "Spa", value: "SPA" },
  { label: "Masajes", value: "MASSATGES" },
  { label: "Fitness", value: "FITNESS" },
  { label: "Pilates", value: "PILATES" },
  { label: "Yoga", value: "IOGA" },
  { label: "Nutricionista", value: "NUTRICIONISTA" },
  { label: "Fisioterapia", value: "FISIOTERAPIA" },
  { label: "Dental", value: "DENTAL" },
  { label: "Veterinaria", value: "VETERINARIA" },
  { label: "Otros", value: "OTROS" },
];

export default function Register() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [ubicacio, setUbicacio] = useState("");
  const [descripcio, setDescripcio] = useState("");
  const [colorPrimari, setColorPrimari] = useState(PALETAS[0].value);
  const [tipo, setTipo] = useState<string | null>(null);
  const [fotoUri, setFotoUri] = useState<string | null>(null);

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
    if (!result.canceled && result.assets[0]) {
      setFotoUri(result.assets[0].uri);
    }
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
        colorPrimari,
        tipo: tipo || "",
        fotoUri: fotoUri || "",
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
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>

          <View style={styles.brandRow}>
            <View style={styles.brandDot} />
            <Text style={styles.brandText}>BookMeNow</Text>
          </View>

          <View style={{ height: 18 }} />
          <Text style={styles.title}>Datos de tu empresa</Text>
          <Text style={styles.subtitle}>Paso 1 de 2</Text>
          <View style={{ height: 24 }} />

          <View style={styles.card}>
            {/* Nombre empresa */}
            <View style={styles.inputRow}>
              <Ionicons name="business-outline" size={18} color="#9ca3af" style={styles.icon} />
              <TextInput
                placeholder="Nombre de la empresa"
                placeholderTextColor="#9ca3af"
                value={nom}
                onChangeText={setNom}
                autoCapitalize="words"
                style={styles.input}
              />
            </View>

            {/* Ubicación */}
            <View style={[styles.inputRow, styles.mt12]}>
              <Ionicons name="location-outline" size={18} color="#9ca3af" style={styles.icon} />
              <TextInput
                placeholder="Ubicación (ciudad, dirección)"
                placeholderTextColor="#9ca3af"
                value={ubicacio}
                onChangeText={setUbicacio}
                autoCapitalize="words"
                style={styles.input}
              />
            </View>

            {/* Descripción */}
            <View style={[styles.inputRow, styles.mt12, { alignItems: "flex-start", minHeight: 80 }]}>
              <Ionicons name="document-text-outline" size={18} color="#9ca3af" style={[styles.icon, { marginTop: 2 }]} />
              <TextInput
                placeholder="Descripción de tu empresa (opcional)"
                placeholderTextColor="#9ca3af"
                value={descripcio}
                onChangeText={setDescripcio}
                multiline
                numberOfLines={3}
                style={[styles.input, { textAlignVertical: "top" }]}
              />
            </View>

            {/* Tipo de negocio */}
            <Text style={styles.sectionLabel}>Tipo de negocio</Text>
            <View style={styles.tipoGrid}>
              {TIPOS_NEGOCIO.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  onPress={() => setTipo(tipo === t.value ? null : t.value)}
                  style={[styles.tipoChip, tipo === t.value && styles.tipoChipSelected]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tipoChipText, tipo === t.value && styles.tipoChipTextSelected]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Foto de perfil */}
            <Text style={styles.sectionLabel}>Foto de perfil</Text>
            <View style={styles.imageRow}>
              <TouchableOpacity style={styles.photoBox} onPress={pickImage} activeOpacity={0.8}>
                {fotoUri ? (
                  <Image source={{ uri: fotoUri }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="camera-outline" size={22} color="#9ca3af" />
                  </View>
                )}
                <Text style={styles.photoLabel}>Foto de perfil</Text>
              </TouchableOpacity>
            </View>

            {/* Paleta de colores */}
            <Text style={styles.sectionLabel}>Color corporativo</Text>
            <View style={styles.paletaGrid}>
              {PALETAS.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  onPress={() => setColorPrimari(p.value)}
                  style={[styles.swatch, { backgroundColor: p.value }]}
                  activeOpacity={0.8}
                >
                  {colorPrimari === p.value && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.colorPreviewRow}>
              <View style={[styles.colorPreviewDot, { backgroundColor: colorPrimari }]} />
              <Text style={styles.colorPreviewText}>
                {PALETAS.find((p) => p.value === colorPrimari)?.label} · {colorPrimari}
              </Text>
            </View>

            <View style={{ height: 20 }} />

            {/* CTA */}
            <TouchableOpacity activeOpacity={0.9} style={styles.cta} onPress={handleContinue}>
              <LinearGradient colors={["#ffffff", "#ffe3aa"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaGradient}>
                <Text style={styles.ctaText}>Continuar</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={{ alignItems: "center", marginTop: 14 }}>
              <Text style={styles.metaText}>
                ¿Ya tienes cuenta?{" "}
                <Text onPress={() => router.back()} style={styles.linkText}>
                  Iniciar sesión
                </Text>
              </Text>
            </View>
          </View>

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
  mt12: { marginTop: 12 },
  icon: { marginRight: 8 },
  input: { color: "#111827", fontSize: 14, flex: 1 },

  sectionLabel: {
    color: "#6b7280",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 18,
    marginBottom: 10,
  },

  tipoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tipoChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  tipoChipSelected: {
    backgroundColor: "#6264A0",
    borderColor: "#6264A0",
  },
  tipoChipText: { fontSize: 13, color: "#374151", fontWeight: "500" },
  tipoChipTextSelected: { color: "#fff" },

  imageRow: { flexDirection: "row", gap: 12 },
  photoBox: { alignItems: "center", gap: 6 },
  photoPreview: { width: 72, height: 72, borderRadius: 36 },
  photoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  photoLabel: { color: "#9ca3af", fontSize: 11 },

  paletaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.08)",
  },
  colorPreviewRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  colorPreviewDot: { width: 12, height: 12, borderRadius: 6 },
  colorPreviewText: { color: "#6b7280", fontSize: 12 },

  cta: { borderRadius: 14, overflow: "hidden" },
  ctaGradient: { paddingVertical: 14, alignItems: "center" },
  ctaText: { color: "#000", fontWeight: "900", fontSize: 14 },

  metaText: { color: "#6b7280", fontSize: 12 },
  linkText: { color: "#6264A0", fontWeight: "700" },
  footer: { textAlign: "center", color: "#9ca3af", marginTop: 26, fontSize: 11 },
});
