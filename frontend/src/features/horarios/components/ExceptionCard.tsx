import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC, cardShadow, MOCK_HOLIDAYS, type HolidayTag } from '../constants/horarios.constants';

/* ──────────────────────────────────────────
   Mobile: dashed CTA card
   ────────────────────────────────────────── */
export const ExceptionCardMobile: React.FC<{ onPress?: () => void }> = ({ onPress }) => (
    <TouchableOpacity style={styles.mobileCard} onPress={onPress} activeOpacity={0.7}>
        <Ionicons name="calendar-outline" size={32} color={HC.primary} style={{ marginBottom: 8 }} />
        <Text style={styles.mobileText}>Añadir Excepción o Festivo</Text>
    </TouchableOpacity>
);

/* ──────────────────────────────────────────
   Desktop: section with date input + tags
   ────────────────────────────────────────── */
interface ExceptionSectionDesktopProps {
    holidays?: HolidayTag[];
    onRemoveHoliday?: (id: string) => void;
    onAddDate?: () => void;
}

export const ExceptionSectionDesktop: React.FC<ExceptionSectionDesktopProps> = ({
    holidays = MOCK_HOLIDAYS,
    onRemoveHoliday,
    onAddDate,
}) => (
    <View style={styles.desktopContainer}>
        {/* Header */}
        <View style={styles.desktopHeader}>
            <View style={styles.desktopHeaderLeft}>
                <Ionicons name="calendar" size={18} color={HC.red} />
                <Text style={styles.desktopTitle}>Excepciones & Festivos</Text>
            </View>
        </View>

        {/* Date input placeholder */}
        <TouchableOpacity style={styles.dateInput} onPress={onAddDate} activeOpacity={0.7}>
            <Text style={styles.dateInputText}>mm/dd/yyyy</Text>
            <Ionicons name="calendar-outline" size={18} color={HC.textMuted} />
        </TouchableOpacity>

        {/* Holiday tags */}
        <View style={styles.tagsRow}>
            {holidays.map((h) => (
                <View key={h.id} style={styles.tag}>
                    <Text style={styles.tagText}>{h.label}</Text>
                    <TouchableOpacity onPress={() => onRemoveHoliday?.(h.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={styles.tagRemove}>×</Text>
                    </TouchableOpacity>
                </View>
            ))}
        </View>
    </View>
);

const styles = StyleSheet.create({
    /* ── Mobile ──────────────────────── */
    mobileCard: {
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 24,
        borderWidth: 2,
        borderColor: HC.primary,
        borderStyle: 'dashed',
        borderRadius: 16,
        backgroundColor: HC.primaryLight,
        paddingVertical: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mobileText: {
        fontSize: 15,
        fontWeight: '600',
        color: HC.primary,
    },

    /* ── Desktop ─────────────────────── */
    desktopContainer: {
        backgroundColor: HC.white,
        borderRadius: 14,
        padding: 20,
        ...cardShadow,
    },
    desktopHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    desktopHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    desktopTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: HC.textPrimary,
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: HC.border,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 14,
    },
    dateInputText: {
        fontSize: 14,
        color: HC.textLight,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: HC.primaryLight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    tagText: {
        fontSize: 13,
        fontWeight: '600',
        color: HC.primary,
    },
    tagRemove: {
        fontSize: 16,
        fontWeight: '700',
        color: HC.primary,
        lineHeight: 18,
    },
});
