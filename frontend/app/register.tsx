import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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
  Alert,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function Register() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [ubicacio, setUbicacio] = useState("");
  const [capacitat, setCapacitat] = useState("");

  const handleContinue = () => {
    // Validación básica
    if (!nom.trim() || nom.trim().length < 2) {
      Alert.alert("Error", "El nombre de la empresa debe tener al menos 2 caracteres");
      return;
    }
    if (!ubicacio.trim() || ubicacio.trim().length < 2) {
      Alert.alert("Error", "La ubicación debe tener al menos 2 caracteres");
      return;
    }

    const empresaData = {
      nom: nom.trim(),
      ubicacio: ubicacio.trim(),
      capacitat: capacitat.trim() ? parseInt(capacitat.trim(), 10) : undefined,
    };

    // Navegar a la pantalla de usuario con los datos de empresa
    router.push({
      pathname: "/register-user",
      params: empresaData as any,
    });
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

          <Text style={styles.title}>Datos de tu empresa</Text>
          <Text style={styles.subtitle}>Paso 1 de 2</Text>

          <View style={{ height: 24 }} />

          <BlurView intensity={35} tint="dark" style={styles.card}>
            <View style={styles.cardInner}>
              {/* Nombre empresa */}
              <View style={styles.inputRow}>
                <Ionicons name="business-outline" size={18} color="rgba(255,255,255,0.8)" style={{ marginRight: 8 }} />
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
              <View style={[styles.inputRow, { marginTop: 12 }]}>
                <Ionicons name="location-outline" size={18} color="rgba(255,255,255,0.8)" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Ubicación (ciudad, dirección)"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={ubicacio}
                  onChangeText={setUbicacio}
                  autoCapitalize="words"
                  style={styles.input}
                />
              </View>

              {/* Capacidad (opcional) */}
              <View style={[styles.inputRow, { marginTop: 12 }]}>
                <Ionicons name="people-outline" size={18} color="rgba(255,255,255,0.8)" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Capacidad (opcional)"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={capacitat}
                  onChangeText={setCapacitat}
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>

              <View style={{ height: 20 }} />

              {/* CTA */}
              <TouchableOpacity activeOpacity={0.9} style={styles.cta} onPress={handleContinue}>
                <LinearGradient colors={["#ffffff", "#ffe3aa"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaGradient}>
                  <Text style={styles.ctaText}>Continuar</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Login link */}
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
