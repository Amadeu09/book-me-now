import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert, useWindowDimensions, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HC, cardShadow } from '../constants/inicio.constants';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useQueryClient } from '@tanstack/react-query';

import type { AuthUser } from '@/features/auth/services/auth.service';
import { EditEmpresaModal } from '@/features/empresas/components/modal/EditEmpresaModal';
import { uploadFotoEmpresa, uploadBannerEmpresa } from '@/features/empresas/services/empresas.service';

const BANNER_HEIGHT = 200;
const AVATAR_SIZE = 100;

const PALETAS = [
    { label: 'Blanco',   value: '#FFFFFF' },
    { label: 'Naranja',  value: '#FF6A00' },
    { label: 'Rojo',     value: '#E53E3E' },
    { label: 'Azul',     value: '#3182CE' },
    { label: 'Verde',    value: '#38A169' },
    { label: 'Violeta',  value: '#805AD5' },
    { label: 'Ámbar',    value: '#DD6B20' },
    { label: 'Teal',     value: '#319795' },
    { label: 'Rosa',     value: '#D53F8C' },
    { label: 'Amarillo', value: '#D69E2E' },
    { label: 'Oscuro',   value: '#2D3748' },
];

interface LocalDataCardProps {
    empresa?: AuthUser['empresa'];
}

export const LocalDataCard: React.FC<LocalDataCardProps> = ({ empresa }) => {
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);
    const queryClient = useQueryClient();
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;

    const handlePickImage = async () => {
        if (!empresa?.id) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setIsUploadingPhoto(true);
                await uploadFotoEmpresa(empresa.id, result.assets[0].uri);
                queryClient.invalidateQueries({ queryKey: ['empresa', empresa.id] });
                Alert.alert('Éxito', 'Foto actualizada correctamente');
            }
        } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message || 'No se ha podido subir la imagen. Inténtalo de nuevo.');
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    const handlePickBanner = async () => {
        if (!empresa?.id) return;
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
                setIsUploadingBanner(true);
                await uploadBannerEmpresa(empresa.id, result.assets[0].uri);
                queryClient.invalidateQueries({ queryKey: ['empresa', empresa.id] });
                Alert.alert('Éxito', 'Banner actualizado correctamente');
            }
        } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message || 'No se ha podido subir el banner. Inténtalo de nuevo.');
        } finally {
            setIsUploadingBanner(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Banner — avatar lives inside here */}
            <View style={styles.bannerWrapper}>
                {empresa?.bannerUrl ? (
                    <ImageBackground
                        source={{ uri: empresa.bannerUrl }}
                        style={styles.banner}
                        resizeMode="cover"
                    />
                ) : (
                    <LinearGradient
                        colors={['#FF6A00', '#FF9A40', '#FFB347']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.banner}
                    />
                )}

                {/* Avatar: centered on mobile, left on desktop */}
                <View style={[styles.avatarAnchor, isDesktop ? styles.avatarAnchorLeft : styles.avatarAnchorCenter]}>
                    <View style={styles.avatarRing}>
                        <TouchableOpacity onPress={handlePickImage} disabled={isUploadingPhoto} activeOpacity={0.8}>
                            <Image
                                source={{ uri: empresa?.fotoPerfil || 'https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' }}
                                style={styles.avatar}
                            />
                            {isUploadingPhoto ? (
                                <View style={styles.avatarOverlay}>
                                    <ActivityIndicator color={HC.white} size="small" />
                                </View>
                            ) : (
                                <View style={[styles.avatarOverlay, { backgroundColor: 'rgba(0,0,0,0.2)' }]}>
                                    <Ionicons name="camera" size={16} color={HC.white} />
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Banner camera button */}
                <TouchableOpacity
                    style={styles.bannerCameraBtn}
                    onPress={handlePickBanner}
                    disabled={isUploadingBanner}
                    activeOpacity={0.7}
                >
                    {isUploadingBanner
                        ? <ActivityIndicator size="small" color={HC.white} />
                        : <Ionicons name="camera" size={18} color={HC.white} />
                    }
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Nombre empresa + edit button on the right */}
                <View style={styles.row}>
                    <View style={styles.infoBlock}>
                        <Text style={styles.label}>Nombre de empresa</Text>
                        <Text style={styles.value}>{empresa?.nom || 'Sin nombre'}</Text>
                    </View>
                    <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditModalVisible(true)}>
                        <Ionicons name="pencil" size={16} color={HC.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                <View style={styles.row}>
                    <Ionicons name="location-outline" size={20} color={HC.textMuted} />
                    <View style={styles.infoBlock}>
                        <Text style={styles.label}>Ubicación</Text>
                        <Text style={styles.value}>{empresa?.ubicacio || 'Sin ubicación'}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.row}>
                    <Ionicons name="color-palette-outline" size={20} color={HC.textMuted} />
                    <View style={styles.infoBlock}>
                        <Text style={styles.label}>Color Principal</Text>
                        <View style={styles.colorRow}>
                            <View style={[styles.colorDot, { backgroundColor: empresa?.colorPrimari || HC.primary }]} />
                            <Text style={styles.value}>
                                {PALETAS.find(p => p.value === empresa?.colorPrimari)?.label || 'Naranja'}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            <EditEmpresaModal
                visible={isEditModalVisible}
                initialData={empresa}
                onClose={() => setIsEditModalVisible(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: HC.white,
        borderRadius: 16,
        ...cardShadow,
        width: '100%',
        overflow: 'hidden',
    },
    bannerWrapper: {
        height: BANNER_HEIGHT,
        width: '100%',
    },
    banner: {
        ...StyleSheet.absoluteFillObject,
    },
    // Full-width absolute row — used to center the avatar on mobile
    avatarAnchorCenter: {
        position: 'absolute',
        bottom: 16,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    // Left-pinned absolute anchor — used on desktop
    avatarAnchorLeft: {
        position: 'absolute',
        bottom: 16,
        left: 20,
    },
    // Needed so TypeScript doesn't complain about missing base style
    avatarAnchor: {},
    avatarRing: {
        width: AVATAR_SIZE + 6,
        height: AVATAR_SIZE + 6,
        borderRadius: (AVATAR_SIZE + 6) / 2,
        backgroundColor: HC.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
    },
    avatar: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
    },
    avatarOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: AVATAR_SIZE / 2,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bannerCameraBtn: {
        position: 'absolute',
        bottom: 10,
        right: 12,
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
    },
    content: {
        paddingHorizontal: 24,
        paddingBottom: 20,
        paddingTop: 14,
    },
    editBtn: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: HC.primaryLight,
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
    },
});
