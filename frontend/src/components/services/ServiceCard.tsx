import React from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Servei } from '@/types/servei.types';
import { palette, radius, shadow, spacing } from '@/styles/theme';
import { Button } from '@/components/common';

type Props = {
    service: Servei;
    onEdit?: (service: Servei) => void;
    onDelete?: (service: Servei) => void;
    style?: ViewStyle;
};

export default function ServiceCard({ service, onEdit, onDelete, style }: Props) {
    const imageUri = `https://picsum.photos/seed/servei-${service.id}/600/400`;

    return (
        <View style={[styles.card, style]}>
            <Image source={{ uri: imageUri }} style={styles.cardImage} resizeMode="cover" />
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
        backgroundColor: palette.background,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: palette.border,
        overflow: 'hidden',
        ...shadow.card,
    },
    cardImage: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: palette.borderSoft,
    },
    cardBody: {
        padding: spacing.sm,
        gap: spacing.xs,
    },
    cardTitle: { fontSize: 14, fontWeight: '700', color: palette.textPrimary },
    cardMeta: { fontSize: 12, color: palette.textMuted },
    cardActions: {
        flexDirection: 'row',
        gap: spacing.xs,
        marginTop: spacing.xs,
    },
});
