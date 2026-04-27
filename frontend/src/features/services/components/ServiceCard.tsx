import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Servei } from "@/types/servei.types";

type Props = {
    service: Servei;
    onEdit?: (service: Servei) => void;
    onDelete?: (service: Servei) => void;
    onPress?: (service: Servei) => void;
    style?: ViewStyle;
};

export default function ServiceCard({ service, onEdit, onDelete, onPress, style }: Props) {
    return (
        <TouchableOpacity
            style={[styles.card, style]}
            onPress={() => onPress?.(service)}
            activeOpacity={onPress ? 0.75 : 1}
        >
            {service.fotoUrl ? (
                <Image source={{ uri: service.fotoUrl }} style={styles.cardImage} resizeMode="cover" />
            ) : (
                <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                    <View style={styles.placeholderIcon}>
                        <Ionicons name="cut-outline" size={28} color="#CCCCCC" />
                    </View>
                </View>
            )}
            <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>{service.nom}</Text>
                <Text style={styles.cardMeta}>{service.duradaMin} min · {Number(service.preu).toFixed(2)} €</Text>
                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={styles.actionBtnDanger}
                        onPress={() => onDelete?.(service)}
                        activeOpacity={0.75}
                    >
                        <Text style={styles.actionBtnDangerText}>Eliminar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => onEdit?.(service)}
                        activeOpacity={0.75}
                    >
                        <Text style={styles.actionBtnText}>Editar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EBEBEB',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },
    cardImage: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: '#F5F5F5',
    },
    cardImagePlaceholder: {
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#EEEEEE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardBody: {
        padding: 14,
        gap: 4,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111111',
    },
    cardMeta: {
        fontSize: 12,
        color: '#AAAAAA',
    },
    cardActions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 10,
    },
    actionBtn: {
        flex: 1,
        height: 36,
        borderRadius: 7,
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#111111',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionBtnText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#111111',
    },
    actionBtnDanger: {
        flex: 1,
        height: 36,
        borderRadius: 7,
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#E5352A',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionBtnDangerText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#E5352A',
    },
});
