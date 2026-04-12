import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useQueryClient } from '@tanstack/react-query';
import { HC, cardShadow } from '@/features/home/constants/inicio.constants';
import { uploadMyFoto } from '../services/profile.service';
import { EditProfileModal } from './modal/EditProfileModal';
import { useTheme } from '@/core/theme/ThemeProvider';

const AVATAR_SIZE_MOBILE = 90;
const AVATAR_SIZE_DESKTOP = 110;

interface ProfileCardProps {
    nom: string;
    email: string;
    rol: string;
    fotoPerfil?: string | null;
    jornada?: string | null;
    treballador?: any;
    location?: string;
    usuariId?: number | null;
    isLoading?: boolean;
}

function getInitials(name: string): string {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function getRolLabel(rol: string): string {
    if (rol === 'ADMIN_GENERAL') return 'Administrador';
    if (rol === 'EMPLEAT') return 'Empleado';
    return rol;
}

/* ── Avatar with camera overlay ── */
function AvatarPicker({
    fotoPerfil,
    initials,
    size,
    onPick,
    uploading,
    primaryColor,
    primaryMidColor,
}: {
    fotoPerfil?: string | null;
    initials: string;
    size: number;
    onPick: () => void;
    uploading: boolean;
    primaryColor: string;
    primaryMidColor: string;
}) {
    return (
        <TouchableOpacity onPress={onPick} activeOpacity={0.85} disabled={uploading}>
            <View style={[avStyles.ring, { width: size + 6, height: size + 6, borderRadius: (size + 6) / 2 }]}>
                {fotoPerfil ? (
                    <Image source={{ uri: fotoPerfil }} style={{ width: size, height: size, borderRadius: size / 2 }} />
                ) : (
                    <View style={[avStyles.fallback, { width: size, height: size, borderRadius: size / 2, backgroundColor: primaryMidColor }]}>
                        <Text style={[avStyles.initials, { fontSize: size * 0.32, color: primaryColor }]}>{initials}</Text>
                    </View>
                )}
                <View style={[avStyles.cameraOverlay, { backgroundColor: primaryColor }]}>
                    {uploading
                        ? <ActivityIndicator color={HC.white} size="small" />
                        : <Ionicons name="camera" size={14} color={HC.white} />
                    }
                </View>
            </View>
        </TouchableOpacity>
    );
}

const avStyles = StyleSheet.create({
    ring: {
        backgroundColor: HC.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    fallback: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    initials: {
        fontWeight: '700',
    },
    cameraOverlay: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 26,
        height: 26,
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: HC.white,
    },
});

/* ── Shared info field ── */
function InfoField({ icon, label, value }: { icon: string; label: string; value: string }) {
    return (
        <View style={styles.infoField}>
            <Ionicons name={icon as any} size={18} color={HC.textMuted} />
            <View style={styles.fieldBlock}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{value}</Text>
            </View>
        </View>
    );
}

/* ── Main component ── */
export const ProfileCard: React.FC<ProfileCardProps> = ({
    nom,
    email,
    rol,
    fotoPerfil,
    jornada,
    treballador,
    location,
    usuariId,
    isLoading = false,
}) => {
    const [editVisible, setEditVisible] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [localPhoto, setLocalPhoto] = useState<string | null>(null);
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const queryClient = useQueryClient();
    const theme = useTheme();

    const handlePickPhoto = async () => {
        try {
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!perm.granted) {
                Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería.');
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });
            if (result.canceled || !result.assets?.[0]) return;

            const uri = result.assets[0].uri;
            setUploading(true);
            await uploadMyFoto(uri);
            setLocalPhoto(uri);
            queryClient.invalidateQueries({ queryKey: ['mi-treballador'] });
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || 'No se pudo subir la foto.');
        } finally {
            setUploading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.card, styles.loadingCard, { backgroundColor: theme.primaryLight, borderWidth: theme.softBorderWidth, borderColor: theme.softBorderColor }]}>
                <ActivityIndicator color={theme.primary} size="large" />
            </View>
        );
    }

    const initials = getInitials(nom || 'U');
    const roleLabel = getRolLabel(rol);
    const displayPhoto = localPhoto ?? fotoPerfil;

    const fields = [
        { icon: 'briefcase-outline', label: 'ESPECIALIDAD', value: roleLabel },
        { icon: 'mail-outline', label: 'EMAIL', value: email },
        ...(jornada ? [{ icon: 'time-outline', label: 'JORNADA ASIGNADA', value: jornada }] : []),
    ];

    /* ── Desktop horizontal layout ── */
    if (isDesktop) {
        return (
            <View style={[styles.card, { backgroundColor: theme.primaryLight, borderWidth: theme.softBorderWidth, borderColor: theme.softBorderColor }]}>
                <View style={styles.desktopRow}>
                    {/* Avatar */}
                    <AvatarPicker
                        fotoPerfil={displayPhoto}
                        initials={initials}
                        size={AVATAR_SIZE_DESKTOP}
                        onPick={handlePickPhoto}
                        uploading={uploading}
                        primaryColor={theme.primary}
                        primaryMidColor={theme.primaryMid}
                    />

                    {/* Content */}
                    <View style={styles.desktopContent}>
                        {/* Name row + button */}
                        <View style={styles.desktopNameRow}>
                            <View>
                                <Text style={styles.name}>{nom || 'Usuario'}</Text>
                                {!!location && (
                                    <View style={styles.locationRow}>
                                        <Ionicons name="location-outline" size={13} color={HC.textMuted} />
                                        <Text style={styles.locationText}>{location}</Text>
                                    </View>
                                )}
                            </View>

                            <TouchableOpacity
                                style={[styles.editBtn, { backgroundColor: theme.primary }]}
                                onPress={() => setEditVisible(true)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="key-outline" size={15} color={theme.textOnPrimary} />
                                <Text style={[styles.editBtnText, { color: theme.textOnPrimary }]}>Cambiar contraseña</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.desktopDivider} />

                        {/* Fields in column */}
                        <View style={styles.fieldsColumn}>
                            {fields.map((f, i) => (
                                <React.Fragment key={f.label}>
                                    <InfoField icon={f.icon} label={f.label} value={f.value} />
                                    {i < fields.length - 1 && <View style={styles.fieldDivider} />}
                                </React.Fragment>
                            ))}
                        </View>
                    </View>
                </View>

                <EditProfileModal visible={editVisible} onClose={() => setEditVisible(false)} />
            </View>
        );
    }

    /* ── Mobile vertical layout ── */
    return (
        <View style={[styles.card, { backgroundColor: theme.primaryLight, borderWidth: theme.softBorderWidth, borderColor: theme.softBorderColor }]}>
            <View style={styles.mobileAvatarWrapper}>
                <AvatarPicker
                    fotoPerfil={displayPhoto}
                    initials={initials}
                    size={AVATAR_SIZE_MOBILE}
                    onPick={handlePickPhoto}
                    uploading={uploading}
                    primaryColor={theme.primary}
                    primaryMidColor={theme.primaryMid}
                />
            </View>

            <Text style={styles.nameCentered}>{nom || 'Usuario'}</Text>

            {!!location && (
                <View style={[styles.locationRow, styles.locationCentered]}>
                    <Ionicons name="location-outline" size={14} color={HC.textMuted} />
                    <Text style={styles.locationText}>{location}</Text>
                </View>
            )}

            <View style={styles.mobileDivider} />

            <View style={styles.fieldsColumn}>
                {fields.map((f, i) => (
                    <React.Fragment key={f.label}>
                        <InfoField icon={f.icon} label={f.label} value={f.value} />
                        {i < fields.length - 1 && <View style={styles.fieldDivider} />}
                    </React.Fragment>
                ))}
            </View>

            <View style={styles.mobileDivider} />

            <TouchableOpacity
                style={[styles.editBtnWide, { backgroundColor: theme.primary }]}
                onPress={() => setEditVisible(true)}
                activeOpacity={0.8}
            >
                <Ionicons name="key-outline" size={16} color={theme.textOnPrimary} />
                <Text style={[styles.editBtnText, { color: theme.textOnPrimary }]}>Cambiar contraseña</Text>
            </TouchableOpacity>

            <EditProfileModal visible={editVisible} onClose={() => setEditVisible(false)} />
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: HC.white,
        borderRadius: 16,
        padding: 24,
        ...cardShadow,
    },
    loadingCard: {
        minHeight: 160,
        justifyContent: 'center',
        alignItems: 'center',
    },

    /* Desktop */
    desktopRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 28,
    },
    desktopContent: {
        flex: 1,
    },
    desktopNameRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 16,
    },
    desktopDivider: {
        height: 1,
        backgroundColor: HC.borderSoft,
        marginBottom: 16,
    },
    fieldsColumn: {
        gap: 0,
    },

    /* Mobile */
    mobileAvatarWrapper: {
        alignSelf: 'center',
        marginBottom: 12,
    },
    nameCentered: {
        fontSize: 20,
        fontWeight: '700',
        color: HC.textPrimary,
        textAlign: 'center',
        marginBottom: 4,
    },
    locationCentered: {
        justifyContent: 'center',
        marginBottom: 4,
    },
    mobileDivider: {
        height: 1,
        backgroundColor: HC.borderSoft,
        marginVertical: 12,
    },

    /* Shared */
    name: {
        fontSize: 20,
        fontWeight: '700',
        color: HC.textPrimary,
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        fontSize: 13,
        color: HC.textMuted,
    },
    infoField: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        gap: 14,
    },
    fieldBlock: {
        flex: 1,
    },
    label: {
        fontSize: 11,
        color: HC.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    value: {
        fontSize: 14,
        fontWeight: '600',
        color: HC.textSecondary,
    },
    fieldDivider: {
        height: 1,
        backgroundColor: HC.borderSoft,
        marginLeft: 32,
    },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        backgroundColor: HC.primary,
        borderRadius: 10,
        paddingVertical: 11,
        paddingHorizontal: 16,
    },
    editBtnWide: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: HC.primary,
        borderRadius: 10,
        paddingVertical: 13,
        width: '100%',
    },
    editBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: HC.white,
    },
});
