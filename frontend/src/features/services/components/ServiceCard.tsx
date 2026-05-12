import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/core/theme/ThemeProvider';
import { Servei } from "@/types/servei.types";

const CATEGORY_ICONS: Record<string, string> = {
    PERRUQUERIA: 'cut-outline',
    BARBERIA: 'man-outline',
    ESTETICA: 'sparkles-outline',
    SPA: 'leaf-outline',
    MASSATGES: 'hand-left-outline',
    FITNESS: 'barbell-outline',
    PILATES: 'body-outline',
    IOGA: 'leaf-outline',
    NUTRICIONISTA: 'nutrition-outline',
    FISIOTERAPIA: 'medkit-outline',
    DENTAL: 'happy-outline',
    VETERINARIA: 'paw-outline',
    ALTRES: 'grid-outline',
    OTROS: 'grid-outline',
};

function getCategoryIcon(categoria?: string | null): string {
    return CATEGORY_ICONS[categoria ?? ''] ?? 'grid-outline';
}

type Props = {
    service: Servei;
    onPress: (service: Servei) => void;
    isSelected?: boolean;
    style?: ViewStyle;
    imageHeight?: number;
};

export default function ServiceCard({ service, onPress, isSelected, style, imageHeight = 140 }: Props) {
    const theme = useTheme();

    return (
        <TouchableOpacity
            style={[
                styles.card,
                isSelected
                    ? { borderWidth: 2, borderColor: theme.primary }
                    : styles.cardDefault,
                style,
            ]}
            onPress={() => onPress(service)}
            activeOpacity={0.85}
        >
            {service.fotoUrl ? (
                <Image
                    source={{ uri: service.fotoUrl }}
                    style={[styles.thumb, { height: imageHeight }]}
                    resizeMode="cover"
                />
            ) : (
                <View
                    style={[
                        styles.thumbPlaceholder,
                        { height: imageHeight },
                        isSelected && { backgroundColor: theme.primary + '18' },
                    ]}
                >
                    <Ionicons name={getCategoryIcon(service.categoria) as any} size={32} color="#bbb" />
                </View>
            )}

            <View style={styles.body}>
                <Text style={styles.name} numberOfLines={2}>{service.nom}</Text>
                <View style={styles.pillRow}>
                    <View style={styles.pill}>
                        <Ionicons name="time-outline" size={12} color="#64748b" />
                        <Text style={styles.pillText}>{service.duradaMin} min</Text>
                    </View>
                    <View style={styles.pill}>
                        <Ionicons name="pricetag-outline" size={12} color="#64748b" />
                        <Text style={styles.pillText}>{Number(service.preu).toFixed(2)} €</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    cardDefault: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    thumb: {
        width: '100%',
        height: 140,
    },
    thumbPlaceholder: {
        width: '100%',
        height: 140,
        backgroundColor: '#f8f5f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    body: {
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    name: {
        fontSize: 15,
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: 8,
    },
    pillRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#f1f5f9',
        borderRadius: 20,
        paddingVertical: 3,
        paddingHorizontal: 8,
    },
    pillText: {
        fontSize: 12,
        color: '#64748b',
    },
});
