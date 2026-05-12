import React, { useState, useEffect } from 'react';
import {
    Modal, View, Text, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC } from '../../constants/horarios.constants';
import { useLanguage } from '@/core/i18n';

export const minsToHHMM = (mins: number) => {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
};

export const HHMMToMins = (s: string): number | null => {
    const parts = s.trim().split(':');
    if (parts.length !== 2) return null;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
    return h * 60 + m;
};

interface TramModalProps {
    visible: boolean;
    dow: number;
    initialInici?: number;
    initialFi?: number;
    onSave: (iniciMin: number, fiMin: number) => Promise<void>;
    onClose: () => void;
}

export const TramModal: React.FC<TramModalProps> = ({
    visible, dow, initialInici, initialFi, onSave, onClose,
}) => {
    const { t } = useLanguage();
    const isEditing = initialInici !== undefined && initialFi !== undefined;

    const DOW_LABELS_FULL = [
        t('dayMonday'), t('dayTuesday'), t('dayWednesday'), t('dayThursday'),
        t('dayFriday'), t('daySaturday'), t('daySunday'),
    ];

    const [inici, setInici] = useState(isEditing ? minsToHHMM(initialInici!) : '09:00');
    const [fi, setFi] = useState(isEditing ? minsToHHMM(initialFi!) : '18:00');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (visible) {
            setInici(initialInici !== undefined ? minsToHHMM(initialInici) : '09:00');
            setFi(initialFi !== undefined ? minsToHHMM(initialFi) : '18:00');
            setError('');
            setSaving(false);
        }
    }, [visible, initialInici, initialFi]);

    const handleSave = async () => {
        const iniciMin = HHMMToMins(inici);
        const fiMin = HHMMToMins(fi);
        if (iniciMin === null || fiMin === null) {
            setError(t('editScheduleFormatError'));
            return;
        }
        if (iniciMin >= fiMin) {
            setError(t('editScheduleStartBeforeEnd'));
            return;
        }
        setSaving(true);
        try {
            await onSave(iniciMin, fiMin);
            onClose();
        } catch {
            setError(t('editScheduleSaveError'));
            setSaving(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.overlay}
            >
                <View style={styles.sheet}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>
                                {isEditing ? t('tramModalTitleEdit') : t('tramModalTitleAdd')}
                            </Text>
                            <Text style={styles.subtitle}>{DOW_LABELS_FULL[dow]}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={20} color={HC.textMuted} />
                        </TouchableOpacity>
                    </View>

                    {/* Time inputs */}
                    <View style={styles.row}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('tramInici')}</Text>
                            <TextInput
                                style={styles.input}
                                value={inici}
                                onChangeText={v => { setInici(v); setError(''); }}
                                placeholder="09:00"
                                placeholderTextColor={HC.textLight}
                                keyboardType="numbers-and-punctuation"
                                maxLength={5}
                                selectTextOnFocus
                            />
                        </View>

                        <View style={styles.sepContainer}>
                            <Text style={styles.sep}>–</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('tramFi')}</Text>
                            <TextInput
                                style={styles.input}
                                value={fi}
                                onChangeText={v => { setFi(v); setError(''); }}
                                placeholder="18:00"
                                placeholderTextColor={HC.textLight}
                                keyboardType="numbers-and-punctuation"
                                maxLength={5}
                                selectTextOnFocus
                            />
                        </View>
                    </View>

                    <Text style={styles.hint}>{t('tramFormatHint')}</Text>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    {/* Actions */}
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            {saving
                                ? <ActivityIndicator size="small" color="#fff" />
                                : <Text style={styles.saveBtnText}>{t('save')}</Text>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    sheet: {
        width: '100%',
        maxWidth: 380,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: HC.textPrimary,
    },
    subtitle: {
        fontSize: 13,
        color: HC.textMuted,
        marginTop: 2,
    },
    closeBtn: {
        padding: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
    },
    inputGroup: {
        flex: 1,
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        color: HC.textMuted,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: HC.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 20,
        fontWeight: '700',
        color: HC.textPrimary,
        textAlign: 'center',
        backgroundColor: HC.borderSoft,
    },
    sepContainer: {
        paddingBottom: 12,
    },
    sep: {
        fontSize: 20,
        color: HC.textMuted,
        fontWeight: '600',
    },
    hint: {
        fontSize: 11,
        color: HC.textLight,
        textAlign: 'center',
        marginTop: 8,
    },
    errorText: {
        color: HC.red,
        fontSize: 13,
        textAlign: 'center',
        marginTop: 10,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    cancelBtn: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 13,
        alignItems: 'center',
        backgroundColor: HC.borderSoft,
        borderWidth: 1,
        borderColor: HC.border,
    },
    cancelBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: HC.textMuted,
    },
    saveBtn: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 13,
        alignItems: 'center',
        backgroundColor: HC.primary,
    },
    saveBtnDisabled: {
        opacity: 0.6,
    },
    saveBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },
});
