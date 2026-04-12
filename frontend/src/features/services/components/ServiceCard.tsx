import React from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Servei } from "@/types/servei.types";
import { radius, spacing } from "@/constants/theme";
import { HC, cardShadow } from '@/features/home/constants/inicio.constants';
import { Button } from '@/ui/components/common';
import { useTheme } from '@/core/theme/ThemeProvider';

type Props = {
    service: Servei;
    onEdit?: (service: Servei) => void;
    onDelete?: (service: Servei) => void;
    style?: ViewStyle;
};

export default function ServiceCard({ service, onEdit, onDelete, style }: Props) {
    const theme = useTheme();
    return (
        <View style={[styles.card, style]}>
            {service.fotoUrl ? (
                <Image source={{ uri: service.fotoUrl }} style={styles.cardImage} resizeMode="cover" />
            ) : (
                <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                    <View style={[styles.placeholderIcon, { backgroundColor: theme.primaryMid }]}>
                        <Ionicons name="cut-outline" size={32} color={theme.primary} />
                    </View>
                </View>
            )}
            <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{service.nom}</Text>
                <Text style={styles.cardMeta}>{service.duradaMin} min · {Number(service.preu).toFixed(2)} €</Text>
                <View style={styles.cardActions}>
                    <Button variant="danger" label="Eliminar" onPress={() => onDelete?.(service)} />
                    <Button variant="ghost" label="Editar" onPress={() => onEdit?.(service)} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: HC.card,
        borderRadius: radius.lg,
        overflow: 'hidden',
        ...cardShadow,
    },
    cardImage: {
        width: '100%',
        aspectRatio: 16 / 9,
        minHeight: 140,
        backgroundColor: HC.borderSoft,
    },
    cardImagePlaceholder: {
        backgroundColor: HC.borderSoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderIcon: {
        width: 60,
        height: 60,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardBody: {
        padding: spacing.sm,
        gap: spacing.xs,
    },
    cardTitle: { fontSize: 14, fontWeight: '700', color: HC.textPrimary },
    cardMeta: { fontSize: 12, color: HC.textMuted },
    cardActions: {
        flexDirection: 'row',
        gap: spacing.xs,
        marginTop: spacing.xs,
    },
});
