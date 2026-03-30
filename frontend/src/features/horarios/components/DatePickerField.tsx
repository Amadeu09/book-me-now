import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC, cardShadow } from '../constants/horarios.constants';

const MONTH_NAMES = [
    'Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny',
    'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre',
];
const DAY_LABELS = ['Dl', 'Dm', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'];

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

/** Monday-first weekday offset: 0 = Mon … 6 = Sun */
function getFirstWeekday(year: number, month: number) {
    const d = new Date(year, month, 1).getDay();
    return d === 0 ? 6 : d - 1;
}

interface Props {
    value: string;           // 'YYYY-MM-DD' or ''
    onChange: (date: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function DatePickerField({ value, onChange, placeholder = 'Seleccionar data', disabled }: Props) {
    const today = new Date();

    const parsed = value
        ? (() => {
            const [y, m, d] = value.split('-').map(Number);
            return { year: y, month: m - 1, day: d };
        })()
        : null;

    const [open, setOpen] = useState(false);
    const [viewYear, setViewYear] = useState(parsed?.year ?? today.getFullYear());
    const [viewMonth, setViewMonth] = useState(parsed?.month ?? today.getMonth());

    const displayText = value
        ? new Date(value + 'T12:00:00').toLocaleDateString('ca-ES', {
            day: '2-digit', month: 'short', year: 'numeric',
          })
        : placeholder;

    /* Reset view to selected (or today) when opening */
    const handleOpen = () => {
        if (disabled) return;
        setViewYear(parsed?.year ?? today.getFullYear());
        setViewMonth(parsed?.month ?? today.getMonth());
        setOpen(true);
    };

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstOffset = getFirstWeekday(viewYear, viewMonth);
    const cells: (number | null)[] = [
        ...Array(firstOffset).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const selectDay = (day: number) => {
        const mm = String(viewMonth + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        onChange(`${viewYear}-${mm}-${dd}`);
        setOpen(false);
    };

    const isSelected = (day: number) =>
        !!parsed && parsed.year === viewYear && parsed.month === viewMonth && parsed.day === day;
    const isToday = (day: number) =>
        today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;

    return (
        <>
            {/* ── Trigger button ── */}
            <TouchableOpacity
                style={[styles.btn, disabled && styles.btnDisabled]}
                onPress={handleOpen}
                activeOpacity={0.7}
            >
                <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={value ? HC.primary : HC.textMuted}
                />
                <Text style={[styles.btnText, !value && styles.placeholder]} numberOfLines={1}>
                    {displayText}
                </Text>
                <Ionicons name="chevron-down" size={14} color={HC.textMuted} />
            </TouchableOpacity>

            {/* ── Floating calendar overlay ── */}
            <Modal
                visible={open}
                transparent
                animationType="fade"
                onRequestClose={() => setOpen(false)}
            >
                {/* Backdrop — tap outside to close */}
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={() => setOpen(false)}
                >
                    {/* Card — stop propagation so taps inside don't close */}
                    <TouchableOpacity activeOpacity={1} style={styles.card}>

                        {/* Navigation */}
                        <View style={styles.nav}>
                            <TouchableOpacity
                                onPress={prevMonth}
                                hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
                            >
                                <Ionicons name="chevron-back" size={20} color={HC.textPrimary} />
                            </TouchableOpacity>
                            <Text style={styles.navTitle}>
                                {MONTH_NAMES[viewMonth]} {viewYear}
                            </Text>
                            <TouchableOpacity
                                onPress={nextMonth}
                                hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
                            >
                                <Ionicons name="chevron-forward" size={20} color={HC.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        {/* 7-column grid */}
                        <View style={styles.grid}>
                            {/* Day-of-week headers */}
                            {DAY_LABELS.map(l => (
                                <View key={l} style={styles.cell}>
                                    <Text style={styles.dayLabel}>{l}</Text>
                                </View>
                            ))}

                            {/* Day cells */}
                            {cells.map((day, i) => (
                                <View key={i} style={styles.cell}>
                                    {day !== null && (
                                        <TouchableOpacity
                                            style={[
                                                styles.dayBtn,
                                                isSelected(day) && styles.daySelected,
                                                !isSelected(day) && isToday(day) && styles.dayToday,
                                            ]}
                                            onPress={() => selectDay(day)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[
                                                styles.dayText,
                                                isSelected(day) && styles.dayTextSelected,
                                                !isSelected(day) && isToday(day) && styles.dayTextToday,
                                            ]}>
                                                {day}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                        </View>

                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    /* ── Trigger button ── */
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: HC.border,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: HC.screenBg,
    },
    btnDisabled: {
        opacity: 0.5,
    },
    btnText: {
        flex: 1,
        fontSize: 14,
        color: HC.textPrimary,
    },
    placeholder: {
        color: HC.textMuted,
    },

    /* ── Overlay ── */
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        backgroundColor: HC.white,
        borderRadius: 16,
        padding: 16,
        width: '100%',
        maxWidth: 340,
        ...cardShadow,
        shadowOpacity: 0.18,
        elevation: 10,
    },

    /* Navigation */
    nav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    navTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: HC.textPrimary,
    },

    /* Grid */
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    cell: {
        width: `${100 / 7}%` as any,
        alignItems: 'center',
        marginBottom: 6,
    },
    dayLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: HC.textMuted,
        paddingVertical: 4,
    },
    dayBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    daySelected: {
        backgroundColor: HC.primary,
    },
    dayToday: {
        borderWidth: 1.5,
        borderColor: HC.primary,
    },
    dayText: {
        fontSize: 13,
        color: HC.textPrimary,
    },
    dayTextSelected: {
        color: HC.white,
        fontWeight: '700',
    },
    dayTextToday: {
        color: HC.primary,
        fontWeight: '700',
    },
});
