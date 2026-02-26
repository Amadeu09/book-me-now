import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { palette } from "@/constants/theme";

export default function Bookings() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Reservas</Text>
                <Text style={styles.subtitle}>Gestiona tus reservas</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
    title: { fontSize: 28, fontWeight: '800', color: palette.textPrimary, marginBottom: 8 },
    subtitle: { fontSize: 16, color: palette.textMuted },
});
