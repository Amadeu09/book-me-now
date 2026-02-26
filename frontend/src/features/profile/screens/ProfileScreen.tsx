import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, useWindowDimensions } from 'react-native';

export default function Profile() {
    const { width } = useWindowDimensions();
    const isWeb = width > 768;

    return (
        <SafeAreaView style={styles.safe}>
            <View style={[styles.container, isWeb && styles.containerWeb]}>
                <Text style={styles.title}>Perfil</Text>
                <Text>Próximamente...</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#fff' },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 80
    },
    containerWeb: {
        paddingLeft: 224,
        paddingBottom: 24,
    },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
});
