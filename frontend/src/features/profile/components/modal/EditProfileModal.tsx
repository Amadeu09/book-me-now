import React, { useState, useEffect } from 'react';
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
import { useLanguage } from '@/core/i18n';
import { changePassword, updateMyColor, updateMyIdioma } from '../../services/profile.service';
import { getUser, patchStoredUser } from '@/utils/session';

const PALETAS = [
    { label: 'Blanco', value: '#FFFFFF' },
    { label: 'Pizarra', value: '#5B7A96' },
    { label: 'Índigo', value: '#6264A0' },
    { label: 'Lavanda', value: '#7B5E9A' },
    { label: 'Rosa', value: '#9E5A72' },
    { label: 'Coral', value: '#B55E54' },
    { label: 'Terracota', value: '#A86040' },
    { label: 'Ocre', value: '#9B7030' },
    { label: 'Oliva', value: '#6C7E4A' },
    { label: 'Salvia', value: '#4A7E68' },
    { label: 'Teal', value: '#3E7C7E' },
    { label: 'Marino', value: '#3E587A' },
    { label: 'Negro', value: '#000000ff' },
    { label: 'Defecto', value: 'default' },
];

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ visible, onClose }) => {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const theme = useTheme();
    const { lang, setLang, t } = useLanguage();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [colorPrimari, setColorPrimari] = useState('default');
    const [selectedLang, setSelectedLang] = useState<'ca' | 'es'>(lang);

    useEffect(() => {
        if (visible) {
            setSelectedLang(lang);
            getUser().then(user => {
                setColorPrimari(user?.colorPrimari || 'default');
                if (user?.idioma === 'ca' || user?.idioma === 'es') {
                    setSelectedLang(user.idioma);
                }
            });
        }
    }, [visible]);

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

        const hasPasswordChange = currentPassword.trim() || newPassword.trim() || confirmPassword.trim();

        if (hasPasswordChange) {
            if (!currentPassword.trim()) {
                setError(t('currentPasswordRequired'));
                return;
            }
            if (!newPassword.trim()) {
                setError(t('newPasswordRequired'));
                return;
            }
            if (newPassword !== confirmPassword) {
                setError(t('passwordMismatch'));
                return;
            }
            if (newPassword.length < 8) {
                setError(t('passwordTooShort'));
                return;
            }
        }

        try {
            setLoading(true);
            const newColor = colorPrimari === 'default' ? null : colorPrimari;

            await Promise.all([
                hasPasswordChange ? changePassword(currentPassword.trim(), newPassword.trim()) : Promise.resolve(),
                updateMyColor(newColor),
                updateMyIdioma(selectedLang),
            ]);

            await patchStoredUser({ colorPrimari: newColor ?? undefined, idioma: selectedLang });
            theme.setPrimaryColor(newColor);
            setLang(selectedLang);

            Alert.alert(t('success'), t('profileUpdated'));
            resetForm();
            onClose();
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                t('profileUpdateError');
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
                        <Text style={styles.headerTitle}>{t('editProfile')}</Text>
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

                        {/* Color */}
                        <View style={styles.fieldBlock}>
                            <Text style={styles.fieldLabel}>{t('appColor')}</Text>
                            <View style={styles.paletaGrid}>
                                {PALETAS.map((p) => {
                                    const isDefault = p.value === 'default';
                                    const isSelected = colorPrimari === p.value;
                                    return (
                                        <TouchableOpacity
                                            key={p.value}
                                            style={[
                                                styles.swatch,
                                                isDefault ? styles.swatchDefault : { backgroundColor: p.value },
                                                isSelected && styles.swatchSelected,
                                            ]}
                                            onPress={() => setColorPrimari(p.value)}
                                            disabled={loading}
                                            activeOpacity={0.8}
                                        >
                                            {isDefault
                                                ? <Ionicons name="ban-outline" size={18} color={isSelected ? HC.textPrimary : HC.textMuted} />
                                                : isSelected && (
                                                    <Ionicons name="checkmark" size={16} color={p.value === '#FFFFFF' ? '#000' : '#fff'} />
                                                )
                                            }
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                            <View style={styles.colorPreviewRow}>
                                {colorPrimari !== 'default' && (
                                    <View style={[styles.colorPreviewDot, { backgroundColor: colorPrimari }]} />
                                )}
                                <Text style={styles.colorPreviewText}>
                                    {colorPrimari === 'default'
                                        ? t('colorDefault')
                                        : `${PALETAS.find(p => p.value === colorPrimari)?.label} · ${colorPrimari}`
                                    }
                                </Text>
                            </View>
                        </View>

                        {/* Idioma */}
                        <View style={styles.fieldBlock}>
                            <Text style={styles.fieldLabel}>{t('language')}</Text>
                            <View style={styles.langRow}>
                                {(['ca', 'es'] as const).map((l) => (
                                    <TouchableOpacity
                                        key={l}
                                        style={[
                                            styles.langBtn,
                                            selectedLang === l && { backgroundColor: theme.primary, borderColor: theme.primary },
                                        ]}
                                        onPress={() => setSelectedLang(l)}
                                        disabled={loading}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[styles.langBtnText, selectedLang === l && { color: theme.textOnPrimary }]}>
                                            {l === 'ca' ? t('langCa') : t('langEs')}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Contraseña actual */}
                        <View style={styles.fieldBlock}>
                            <Text style={styles.fieldLabel}>{t('currentPassword')}</Text>
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={styles.inputFlex}
                                    placeholder={t('currentPasswordPh')}
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
                            <Text style={styles.fieldLabel}>{t('newPassword')}</Text>
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={styles.inputFlex}
                                    placeholder={t('newPasswordPh')}
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
                            <Text style={styles.fieldLabel}>{t('confirmNewPassword')}</Text>
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={styles.inputFlex}
                                    placeholder={t('confirmPasswordPh')}
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
                            <Text style={styles.btnCancelText}>{t('cancel')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.btnSave, { backgroundColor: theme.primary }, loading && styles.btnDisabled]}
                            onPress={handleSave}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading
                                ? <ActivityIndicator color={HC.white} size="small" />
                                : <Text style={styles.btnSaveText}>{t('save')}</Text>
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

    paletaGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    swatch: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    swatchDefault: {
        backgroundColor: '#f1f5f9',
    },
    swatchSelected: {
        borderColor: HC.textPrimary,
    },
    langRow: {
        flexDirection: 'row',
        gap: 10,
    },
    langBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: HC.borderInput,
        alignItems: 'center',
        backgroundColor: HC.inputBg,
    },
    langBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: HC.textSecondary,
    },
    colorPreviewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
    },
    colorPreviewDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
    },
    colorPreviewText: {
        fontSize: 13,
        color: HC.textMuted,
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
