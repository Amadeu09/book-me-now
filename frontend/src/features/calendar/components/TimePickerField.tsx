import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, Modal, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, radius, spacing } from '@/constants/theme';

const HOURS = Array.from({ length: 24 }, (_, i) => i);     // 00–23
const MINUTES = Array.from({ length: 60 }, (_, i) => i);   // 00–59

interface Props {
    value: string;  // 'HH:MM' or ''
    onChange: (time: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function TimePickerField({ value, onChange, placeholder = 'Seleccionar hora', disabled }: Props) {
    const [open, setOpen] = useState(false);
    const parsedHour = value ? parseInt(value.split(':')[0], 10) : null;
    const parsedMin = value ? parseInt(value.split(':')[1], 10) : null;

    const [selHour, setSelHour] = useState<number | null>(parsedHour);
    const [selMin, setSelMin] = useState<number | null>(parsedMin);

    const handleOpen = () => {
        if (disabled) return;
        setSelHour(parsedHour);
        setSelMin(parsedMin);
        setOpen(true);
    };

    const handleConfirm = () => {
        if (selHour === null || selMin === null) return;
        const hh = String(selHour).padStart(2, '0');
        const mm = String(selMin).padStart(2, '0');
        onChange(`${hh}:${mm}`);
        setOpen(false);
    };

    return (
        <>
            <TouchableOpacity
                style={[styles.btn, disabled && styles.btnDisabled]}
                onPress={handleOpen}
                activeOpacity={0.7}
            >
                <Ionicons name="time-outline" size={16} color={value ? palette.accent : palette.textMuted} />
                <Text style={[styles.btnText, !value && styles.placeholder]} numberOfLines={1}>
                    {value || placeholder}
                </Text>
                <Ionicons name="chevron-down" size={14} color={palette.textMuted} />
            </TouchableOpacity>

            <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setOpen(false)}>
                    <TouchableOpacity activeOpacity={1} style={styles.card}>
                        <Text style={styles.title}>Seleccionar hora</Text>

                        <View style={styles.columns}>
                            {/* Hours column */}
                            <View style={styles.column}>
                                <Text style={styles.colLabel}>Hora</Text>
                                <FlatList
                                    data={HOURS}
                                    keyExtractor={h => String(h)}
                                    style={styles.list}
                                    showsVerticalScrollIndicator={false}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={[styles.item, selHour === item && styles.itemSelected]}
                                            onPress={() => setSelHour(item)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[styles.itemText, selHour === item && styles.itemTextSelected]}>
                                                {String(item).padStart(2, '0')}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>

                            <Text style={styles.colon}>:</Text>

                            {/* Minutes column */}
                            <View style={styles.column}>
                                <Text style={styles.colLabel}>Min</Text>
                                <FlatList
                                    data={MINUTES}
                                    keyExtractor={m => String(m)}
                                    style={styles.list}
                                    showsVerticalScrollIndicator={false}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={[styles.item, selMin === item && styles.itemSelected]}
                                            onPress={() => setSelMin(item)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[styles.itemText, selMin === item && styles.itemTextSelected]}>
                                                {String(item).padStart(2, '0')}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>
                        </View>

                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.btnCancel} onPress={() => setOpen(false)} activeOpacity={0.7}>
                                <Text style={styles.btnCancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.btnOk, (selHour === null || selMin === null) && styles.btnOkDisabled]}
                                onPress={handleConfirm}
                                activeOpacity={0.8}
                                disabled={selHour === null || selMin === null}
                            >
                                <Text style={styles.btnOkText}>Confirmar</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: palette.border,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        backgroundColor: '#f8fafc',
    },
    btnDisabled: { opacity: 0.5 },
    btnText: { flex: 1, fontSize: 14, color: palette.textPrimary },
    placeholder: { color: palette.textMuted },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        width: '100%',
        maxWidth: 280,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        color: palette.textPrimary,
        textAlign: 'center',
        marginBottom: 12,
    },
    columns: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    column: { flex: 1, alignItems: 'center' },
    colLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: palette.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 6,
    },
    list: { height: 180 },
    item: {
        width: 56,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        marginBottom: 4,
    },
    itemSelected: { backgroundColor: palette.accent },
    itemText: { fontSize: 18, fontWeight: '500', color: palette.textPrimary },
    itemTextSelected: { color: '#fff', fontWeight: '700' },
    colon: {
        fontSize: 24,
        fontWeight: '700',
        color: palette.textPrimary,
        marginTop: 16,
        paddingHorizontal: 4,
    },
    footer: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 16,
    },
    btnCancel: {
        flex: 1,
        paddingVertical: 11,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: palette.border,
        alignItems: 'center',
    },
    btnCancelText: { fontSize: 14, fontWeight: '600', color: palette.textPrimary },
    btnOk: {
        flex: 1,
        paddingVertical: 11,
        borderRadius: 10,
        backgroundColor: palette.accent,
        alignItems: 'center',
    },
    btnOkDisabled: { opacity: 0.4 },
    btnOkText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
