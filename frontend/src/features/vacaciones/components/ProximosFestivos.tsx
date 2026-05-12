import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HC, cardShadow } from '@/features/home/constants/inicio.constants';
import type { AbsenciaEmpresa } from '../types/vacaciones.types';
import { useTheme } from '@/core/theme/ThemeProvider';

const MONTH_SHORT = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

function daysUntil(inici: string): string {
    const diff = Math.ceil((new Date(inici).getTime() - Date.now()) / 86_400_000);
    if (diff <= 0) return 'Hoy';
    if (diff === 1) return 'Mañana';
    return `En ${diff} días`;
}

type Props = { items: AbsenciaEmpresa[] };

export function ProximosFestivos({ items }: Props) {
    const theme = useTheme();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = items
        .filter(a => new Date(a.fi) >= today)
        .slice(0, 5);

    const isWhiteCard = theme.isDefault || theme.isUserWhite;
    const cardBg = isWhiteCard ? '#ffffff' : theme.primary;
    const titleColor = isWhiteCard ? HC.textPrimary : theme.textOnPrimary;
    const emptyColor = isWhiteCard ? HC.textMuted : (theme.textOnPrimary + 'aa');
    const nameColor = isWhiteCard ? HC.textPrimary : theme.textOnPrimary;
    const relColor = isWhiteCard ? HC.textMuted : (theme.textOnPrimary + 'aa');
    const borderItemColor = isWhiteCard ? HC.borderSoft : (theme.textOnPrimary + '22');
    const dateBg = isWhiteCard ? (theme.primary + '22') : (theme.textOnPrimary + '22');
    const dateColor = isWhiteCard ? theme.primary : theme.textOnPrimary;

    return (
        <View style={[styles.card, { backgroundColor: cardBg, borderWidth: isWhiteCard ? 1 : 0, borderColor: '#e2e8f0' }]}>
            <Text style={[styles.sectionTitle, { color: titleColor }]}>Próximos Festivos</Text>
            {upcoming.length === 0 ? (
                <Text style={[styles.empty, { color: emptyColor }]}>No hay festivos próximos.</Text>
            ) : (
                upcoming.map((h, i) => {
                    const d = new Date(h.inici);
                    return (
                        <View key={h.id} style={[styles.item, i < upcoming.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderItemColor }]}>
                            <View style={[styles.dateBox, { backgroundColor: dateBg }]}>
                                <Text style={[styles.dateDay, { color: dateColor }]}>{String(d.getDate()).padStart(2, '0')}</Text>
                                <Text style={[styles.dateMonth, { color: dateColor }]}>{MONTH_SHORT[d.getMonth()]}</Text>
                            </View>
                            <View style={styles.itemBody}>
                                <Text style={[styles.itemName, { color: nameColor }]} numberOfLines={1}>{h.titol}</Text>
                                <Text style={[styles.itemRelative, { color: relColor }]}>{daysUntil(h.inici)}</Text>
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
