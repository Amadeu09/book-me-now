import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { HC, cardShadow } from '../constants/inicio.constants';
import { Ionicons } from '@expo/vector-icons';

export const LocalDataCard: React.FC = () => {
    return (
        <View style={styles.container}>
            {/* The absolute avatar overlaps the top border */}
            <View style={styles.avatarContainer}>
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' }}
                    style={styles.avatar}
                />
            </View>

            <View style={styles.cardHeader}>
                <View style={styles.iconCircle}>
                    <Ionicons name="business" size={22} color={HC.primary} />
                </View>
                <View style={styles.headerTitleBlock}>
                    <Text style={styles.title}>Mi Local</Text>
                </View>
                <TouchableOpacity style={styles.editBtn}>
                    <Ionicons name="pencil" size={16} color={HC.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.row}>
                    <Ionicons name="business-outline" size={20} color={HC.textMuted} />
                    <View style={styles.infoBlock}>
                        <Text style={styles.label}>Nombre de empresa</Text>
                        <Text style={styles.value}>Studio Belleza Elegance</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.row}>
                    <Ionicons name="location-outline" size={20} color={HC.textMuted} />
                    <View style={styles.infoBlock}>
                        <Text style={styles.label}>Ubicación</Text>
                        <Text style={styles.value}>Calle Mayor 12, Barcelona</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.row}>
                    <Ionicons name="color-palette-outline" size={20} color={HC.textMuted} />
                    <View style={styles.infoBlock}>
                        <Text style={styles.label}>Color Principal</Text>
                        <View style={styles.colorRow}>
                            <View style={[styles.colorDot, { backgroundColor: HC.primary }]} />
                            <Text style={styles.value}>Naranja Corporativo</Text>
                        </View>
                    </View>
                </View>

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: HC.white,
        borderRadius: 16,
        padding: 24,
        marginTop: 65,
        ...cardShadow,
        width: '100%',
        position: 'relative',
    },
    avatarContainer: {
        position: 'absolute',
        top: -80, // Half of height
        alignSelf: 'center',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: HC.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...cardShadow,
        elevation: 5,
    },
    avatar: {
        width: 180,
        height: 180,
        borderRadius: 90,
        borderWidth: 3,
        borderColor: HC.white,
    },
    cardHeader: {
        paddingTop: 35,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: HC.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    headerTitleBlock: {
        flex: 1,
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        color: HC.textPrimary,
    },
    editBtn: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: HC.primaryLight,
    },
    content: {
        marginTop: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 16,
    },
    infoBlock: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        color: HC.textMuted,
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    value: {
        fontSize: 15,
        fontWeight: '600',
        color: HC.textSecondary,
    },
    divider: {
        height: 1,
        backgroundColor: HC.borderSoft,
        marginLeft: 36,
    },
    colorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    colorDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
    }
});
