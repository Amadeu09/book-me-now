import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { AUTH } from "../constants/auth.constants";
import {
  Alert,
  Dimensions,
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

const { width } = Dimensions.get("window");

const PALETAS = [
  { label: "Naranja",  value: "#FF6A00" },
  { label: "Rojo",     value: "#E53E3E" },
  { label: "Azul",     value: "#3182CE" },
  { label: "Verde",    value: "#38A169" },
  { label: "Violeta",  value: "#805AD5" },
  { label: "Ámbar",    value: "#DD6B20" },
  { label: "Teal",     value: "#319795" },
  { label: "Rosa",     value: "#D53F8C" },
  { label: "Amarillo", value: "#D69E2E" },
  { label: "Oscuro",   value: "#2D3748" },
];

export default function Register() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [ubicacio, setUbicacio] = useState("");
  const [capacitat, setCapacitat] = useState("");
  const [descripcio, setDescripcio] = useState("");
  const [colorPrimari, setColorPrimari] = useState(PALETAS[0].value);
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [bannerUri, setBannerUri] = useState<string | null>(null);

  const pickImage = async (target: "foto" | "banner") => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permiso requerido", "Necesitamos acceso a tu galería.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: target === "foto",
      aspect: target === "foto" ? [1, 1] : undefined,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      if (target === "foto") setFotoUri(result.assets[0].uri);
      else setBannerUri(result.assets[0].uri);
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
        capacitat: capacitat.trim() || "",
        descripcio: descripcio.trim(),
        colorPrimari,
        fotoUri: fotoUri || "",
        bannerUri: bannerUri || "",
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[AUTH.bgDark, AUTH.bgMid1, AUTH.bgMid2, AUTH.bgDark]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.conicGlow} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.brandRow}>
            <View style={styles.brandDot} />
            <Text style={styles.brandText}>BOOK ME NOW</Text>
          </View>

          <View style={{ height: 18 }} />
          <Text style={styles.title}>Datos de tu empresa</Text>
          <Text style={styles.subtitle}>Paso 1 de 2</Text>
          <View style={{ height: 24 }} />

          <BlurView intensity={35} tint="dark" style={styles.card}>
            <View style={styles.cardInner}>

              {/* Nombre empresa */}
              <View style={styles.inputRow}>
                <Ionicons name="business-outline" size={18} color="rgba(255,255,255,0.8)" style={styles.icon} />
                <TextInput
                  placeholder="Nombre de la empresa"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={nom}
                  onChangeText={setNom}
                  autoCapitalize="words"
                  style={styles.input}
                />
              </View>

              {/* Ubicación */}
              <View style={[styles.inputRow, styles.mt12]}>
                <Ionicons name="location-outline" size={18} color="rgba(255,255,255,0.8)" style={styles.icon} />
                <TextInput
                  placeholder="Ubicación (ciudad, dirección)"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={ubicacio}
                  onChangeText={setUbicacio}
                  autoCapitalize="words"
                  style={styles.input}
                />
              </View>

              {/* Capacidad */}
              <View style={[styles.inputRow, styles.mt12]}>
                <Ionicons name="people-outline" size={18} color="rgba(255,255,255,0.8)" style={styles.icon} />
                <TextInput
                  placeholder="Capacidad (opcional)"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={capacitat}
                  onChangeText={setCapacitat}
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>

              {/* Descripción */}
              <View style={[styles.inputRow, styles.mt12, { alignItems: "flex-start", minHeight: 80 }]}>
                <Ionicons name="document-text-outline" size={18} color="rgba(255,255,255,0.8)" style={[styles.icon, { marginTop: 2 }]} />
                <TextInput
                  placeholder="Descripción de tu empresa (opcional)"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={descripcio}
                  onChangeText={setDescripcio}
                  multiline
                  numberOfLines={3}
                  style={[styles.input, { textAlignVertical: "top" }]}
                />
              </View>

              {/* Imágenes: foto + banner */}
              <Text style={styles.sectionLabel}>Imágenes</Text>
              <View style={styles.imageRow}>
                {/* Foto de perfil */}
                <TouchableOpacity style={styles.photoBox} onPress={() => pickImage("foto")} activeOpacity={0.8}>
                  {fotoUri ? (
                    <Image source={{ uri: fotoUri }} style={styles.photoPreview} />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Ionicons name="camera-outline" size={22} color="rgba(255,255,255,0.5)" />
                    </View>
                  )}
                  <Text style={styles.photoLabel}>Foto de perfil</Text>
                </TouchableOpacity>

                {/* Banner */}
                <TouchableOpacity style={styles.bannerBox} onPress={() => pickImage("banner")} activeOpacity={0.8}>
                  {bannerUri ? (
                    <Image source={{ uri: bannerUri }} style={styles.bannerPreview} />
                  ) : (
                    <View style={styles.bannerPlaceholder}>
                      <Ionicons name="image-outline" size={22} color="rgba(255,255,255,0.5)" />
                    </View>
                  )}
                  <Text style={styles.photoLabel}>Banner</Text>
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
                <LinearGradient colors={[AUTH.ctaGradientStart, AUTH.ctaGradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaGradient}>
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
          </BlurView>

          <Text style={styles.footer}>© {new Date().getFullYear()} Book Me Now</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: AUTH.bgDark },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },
  backButton: { position: "absolute", top: 0, left: 0, zIndex: 10, padding: 4 },
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
  mt12: { marginTop: 12 },
  icon: { marginRight: 8 },
  input: { color: "#fff", fontSize: 14, flex: 1 },

  sectionLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 18,
    marginBottom: 10,
  },

  imageRow: { flexDirection: "row", gap: 12 },

  photoBox: { alignItems: "center", gap: 6 },
  photoPreview: { width: 72, height: 72, borderRadius: 36 },
  photoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  photoLabel: { color: "rgba(255,255,255,0.5)", fontSize: 11 },

  bannerBox: { flex: 1, alignItems: "center", gap: 6 },
  bannerPreview: { width: "100%", height: 72, borderRadius: 10 },
  bannerPlaceholder: {
    width: "100%",
    height: 72,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  paletaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.15)",
  },
  colorPreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  colorPreviewDot: { width: 12, height: 12, borderRadius: 6 },
  colorPreviewText: { color: "rgba(255,255,255,0.6)", fontSize: 12 },

  cta: { borderRadius: 14, overflow: "hidden" },
  ctaGradient: { paddingVertical: 14, alignItems: "center" },
  ctaText: { color: "#000", fontWeight: "900", fontSize: 14 },

  metaText: { color: "rgba(255,255,255,0.7)", fontSize: 12 },
  linkText: { color: AUTH.linkLight, fontWeight: "700" },
  footer: { textAlign: "center", color: "rgba(255,255,255,0.45)", marginTop: 26, fontSize: 11 },

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
});
