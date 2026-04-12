import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HC, cardShadow } from '@/features/home/constants/inicio.constants';
import type { AbsenciaEmpresa } from '../types/vacaciones.types';
import { useTheme } from '@/core/theme/ThemeProvider';

const MONTH_SHORT = ['GEN','FEB','MAR','ABR','MAI','JUN','JUL','AGO','SET','OCT','NOV','DES'];

function daysUntil(inici: string): string {
    const diff = Math.ceil((new Date(inici).getTime() - Date.now()) / 86_400_000);
    if (diff <= 0) return 'Avui';
    if (diff === 1) return 'Demà';
    return `En ${diff} dies`;
}

type Props = { items: AbsenciaEmpresa[] };

export function ProximosFestivos({ items }: Props) {
    const theme = useTheme();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = items
        .filter(a => new Date(a.fi) >= today)
        .slice(0, 5);

    return (
        <View style={[styles.card, { backgroundColor: theme.primaryLight, borderWidth: theme.softBorderWidth, borderColor: theme.softBorderColor }]}>
            <Text style={styles.sectionTitle}>Pròxims Festius</Text>
            {upcoming.length === 0 ? (
                <Text style={styles.empty}>No hi ha festius propers.</Text>
            ) : (
                upcoming.map((h, i) => {
                    const d = new Date(h.inici);
                    return (
                        <View key={h.id} style={[styles.item, i < upcoming.length - 1 && styles.itemBorder]}>
                            <View style={[styles.dateBox, { backgroundColor: theme.primary + '22' }]}>
                                <Text style={[styles.dateDay, { color: theme.primary }]}>{String(d.getDate()).padStart(2, '0')}</Text>
                                <Text style={[styles.dateMonth, { color: theme.primary }]}>{MONTH_SHORT[d.getMonth()]}</Text>
                            </View>
                            <View style={styles.itemBody}>
                                <Text style={styles.itemName} numberOfLines={1}>{h.titol}</Text>
                                <Text style={styles.itemRelative}>{daysUntil(h.inici)}</Text>
                            </View>
                        </View>
                    );
                })
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: HC.card,
        borderRadius: 14,
        padding: 18,
        ...cardShadow,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: HC.textPrimary,
        marginBottom: 14,
    },
    empty: {
        fontSize: 13,
        color: HC.textMuted,
        fontStyle: 'italic',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 10,
    },
    itemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: HC.borderSoft,
    },
    dateBox: {
        width: 38,
        height: 38,
        borderRadius: 8,
        backgroundColor: HC.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateDay: {
        fontSize: 15,
        fontWeight: '700',
        color: HC.primary,
        lineHeight: 17,
    },
    dateMonth: {
        fontSize: 8,
        fontWeight: '600',
        color: HC.primary,
        letterSpacing: 0.3,
    },
    itemBody: {
        flex: 1,
    },
    itemName: {
        fontSize: 13,
        fontWeight: '600',
        color: HC.textPrimary,
    },
    itemRelative: {
        fontSize: 11,
        color: HC.textMuted,
        marginTop: 1,
    },
});
