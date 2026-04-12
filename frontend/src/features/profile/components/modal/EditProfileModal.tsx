import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    useWindowDimensions,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC, cardShadow } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { changePassword } from '../../services/profile.service';

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ visible, onClose }) => {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const theme = useTheme();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const resetForm = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setShowCurrent(false);
        setShowNew(false);
        setShowConfirm(false);
    };

    const handleClose = () => {
        if (loading) return;
        resetForm();
        onClose();
    };

    const handleSave = async () => {
        setError('');

        if (!currentPassword.trim()) {
            setError('La contraseña actual es obligatoria.');
            return;
        }
        if (!newPassword.trim()) {
            setError('La nueva contraseña es obligatoria.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Las contraseñas nuevas no coinciden.');
            return;
        }
        if (newPassword.length < 8) {
            setError('La nueva contraseña debe tener al menos 8 caracteres.');
            return;
        }

        try {
            setLoading(true);
            await changePassword(currentPassword.trim(), newPassword.trim());
            Alert.alert('Éxito', 'Contraseña actualizada correctamente.');
            resetForm();
            onClose();
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                'No se pudo actualizar la contraseña.';
            setError(Array.isArray(msg) ? msg.join(', ') : msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
            <View style={styles.overlay}>
                <View style={[styles.modal, isDesktop && styles.modalDesktop]}>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Cambiar contraseña</Text>
                        <TouchableOpacity onPress={handleClose} disabled={loading}>
                            <Ionicons name="close" size={24} color={HC.textMuted} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {!!error && (
                            <View style={styles.errorBox}>
                                <Ionicons name="alert-circle-outline" size={16} color={HC.red} />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        {/* Contraseña actual */}
                        <View style={styles.fieldBlock}>
                            <Text style={styles.fieldLabel}>Contraseña actual</Text>
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={styles.inputFlex}
                                    placeholder="Introduce tu contraseña actual"
                                    placeholderTextColor={HC.textLight}
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    secureTextEntry={!showCurrent}
                                    autoCapitalize="none"
                                    editable={!loading}
                                />
                                <TouchableOpacity onPress={() => setShowCurrent((v) => !v)} style={styles.eyeBtn}>
                                    <Ionicons name={showCurrent ? 'eye-off-outline' : 'eye-outline'} size={20} color={HC.textMuted} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Nueva contraseña */}
                        <View style={styles.fieldBlock}>
                            <Text style={styles.fieldLabel}>Nueva contraseña</Text>
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={styles.inputFlex}
                                    placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número y 1 especial"
                                    placeholderTextColor={HC.textLight}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry={!showNew}
                                    autoCapitalize="none"
                                    editable={!loading}
                                />
                                <TouchableOpacity onPress={() => setShowNew((v) => !v)} style={styles.eyeBtn}>
                                    <Ionicons name={showNew ? 'eye-off-outline' : 'eye-outline'} size={20} color={HC.textMuted} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Confirmar nueva contraseña */}
                        <View style={styles.fieldBlock}>
                            <Text style={styles.fieldLabel}>Confirmar nueva contraseña</Text>
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={styles.inputFlex}
                                    placeholder="Repite la nueva contraseña"
                                    placeholderTextColor={HC.textLight}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirm}
                                    autoCapitalize="none"
                                    editable={!loading}
                                />
                                <TouchableOpacity onPress={() => setShowConfirm((v) => !v)} style={styles.eyeBtn}>
                                    <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color={HC.textMuted} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View style={[styles.footer, isDesktop && styles.footerDesktop]}>
                        <TouchableOpacity style={styles.btnCancel} onPress={handleClose} disabled={loading} activeOpacity={0.7}>
                            <Text style={styles.btnCancelText}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.btnSave, { backgroundColor: theme.primary }, loading && styles.btnDisabled]}
                            onPress={handleSave}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading
                                ? <ActivityIndicator color={HC.white} size="small" />
                                : <Text style={styles.btnSaveText}>Guardar</Text>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: HC.modalOverlay,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        width: '100%',
        height: '100%',
        backgroundColor: HC.white,
        flexDirection: 'column',
    },
    modalDesktop: {
        width: '90%',
        maxWidth: 480,
        height: 'auto',
        borderRadius: 16,
        ...cardShadow,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: HC.border,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: HC.textPrimary,
    },
    scrollView: { flexShrink: 1 },
    scrollContent: { padding: 24, gap: 4 },

    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: HC.redLight,
        padding: 12,
        borderRadius: 10,
        marginBottom: 8,
    },
    errorText: {
        flex: 1,
        fontSize: 13,
        color: HC.red,
        fontWeight: '500',
    },

    fieldBlock: { marginBottom: 16 },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: HC.textSecondary,
        marginBottom: 8,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: HC.borderInput,
        borderRadius: 10,
        backgroundColor: HC.inputBg,
        paddingHorizontal: 14,
    },
    inputFlex: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 15,
        color: HC.textPrimary,
    },
    eyeBtn: {
        paddingLeft: 8,
        paddingVertical: 12,
    },

    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: HC.border,
        backgroundColor: HC.white,
    },
    footerDesktop: {
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    btnCancel: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: HC.borderInput,
    },
    btnCancelText: {
        fontSize: 14,
        fontWeight: '600',
        color: HC.textSecondary,
    },
    btnSave: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: HC.primary,
        minWidth: 120,
        alignItems: 'center',
    },
    btnDisabled: { opacity: 0.6 },
    btnSaveText: {
        fontSize: 14,
        fontWeight: '600',
        color: HC.white,
    },
});
