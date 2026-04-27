import React, { useState } from 'react';
import {
    View, Text, StyleSheet, useWindowDimensions,
    TouchableOpacity, ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC, cardShadow } from '../constants/horarios.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useHorariEmpresa } from '../hooks/useHorariEmpresa';
import { EditScheduleModal, minsToHHMM } from './modal/EditScheduleModal';

/* ── Constants ──────────────────────────── */

const DOW_SHORT   = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'];
const DOW_FULL    = ['Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte', 'Diumenge'];

/* ── GlobalScheduleCard ─────────────────── */

export const GlobalScheduleCard: React.FC = () => {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const theme = useTheme();
    const { trams, isLoading, isAdmin, empresaId, refetch } = useHorariEmpresa();

    const [editOpen, setEditOpen] = useState(false);

    const isWhiteCard = theme.isDefault || theme.isUserWhite;
    const onPrimary     = isWhiteCard ? '#0f172a' : theme.textOnPrimary;
    const onPrimaryFaint = isWhiteCard ? '#e2e8f0' : onPrimary + '33';
    const onPrimaryMuted = isWhiteCard ? '#6b7280' : onPrimary + 'aa';
    const cardBg        = isWhiteCard ? '#ffffff' : theme.primary;
    const primaryColor  = isWhiteCard ? theme.primary : theme.textOnPrimary;

    const tramsByDow = Array.from({ length: 7 }, (_, i) =>
        trams.filter(t => t.dow === i)
    );

    /* ── Desktop columns ── */
    const renderDesktop = () => (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.daysRow}>
                {tramsByDow.map((dayTrams, dow) => (
                    <View
                        key={dow}
                        style={[
                            styles.dayColumn,
                            dow < 6 && { borderRightWidth: 1, borderRightColor: onPrimaryFaint },
                        ]}
                    >
                        <Text style={[styles.dayLabel, { color: onPrimary }]}>{DOW_FULL[dow]}</Text>

                        {dayTrams.length === 0 ? (
                            <Text style={[styles.tancat, { color: onPrimaryMuted }]}>Tancat</Text>
                        ) : (
                            dayTrams.map(t => (
                                <View key={t.id} style={[styles.tramChip, { borderColor: onPrimaryFaint }]}>
                                    <Text style={[styles.tramText, { color: onPrimary }]}>
                                        {minsToHHMM(t.iniciMin)} – {minsToHHMM(t.fiMin)}
                                    </Text>
                                </View>
                            ))
                        )}
                    </View>
                ))}
            </View>
        </ScrollView>
    );

    /* ── Mobile rows ── */
    const renderMobile = () => (
        <View>
            {tramsByDow.map((dayTrams, dow) => (
                <View
                    key={dow}
                    style={[styles.mobileRow, dow < 6 && { borderBottomWidth: 1, borderBottomColor: onPrimaryFaint }]}
                >
                    <View style={[styles.mobileBadge, { backgroundColor: primaryColor + '22' }]}>
                        <Text style={[styles.mobileBadgeText, { color: primaryColor }]}>{DOW_SHORT[dow]}</Text>
                    </View>
                    <Text style={[styles.mobileDayName, { color: onPrimary }]}>{DOW_FULL[dow]}</Text>
                    <View style={styles.mobileChips}>
                        {dayTrams.length === 0 ? (
                            <Text style={[styles.tancat, { color: onPrimaryMuted }]}>Tancat</Text>
                        ) : (
                            dayTrams.map(t => (
                                <View key={t.id} style={[styles.tramChip, { borderColor: onPrimaryFaint }]}>
                                    <Text style={[styles.tramText, { color: onPrimary }]}>
                                        {minsToHHMM(t.iniciMin)} – {minsToHHMM(t.fiMin)}
                                    </Text>
                                </View>
                            ))
                        )}
                    </View>
                </View>
            ))}
        </View>
    );

    return (
        <View style={[styles.card, { backgroundColor: cardBg, borderWidth: isWhiteCard ? 1 : 0, borderColor: '#e2e8f0' }]}>
            {/* Header */}
            <View style={styles.topRow}>
                <View style={styles.titleBlock}>
                    <Text style={[styles.title, { color: onPrimary }]}>Horari Global d'Obertura</Text>
                    <Text style={[styles.subtitle, { color: onPrimaryMuted }]}>
                        Horari d'obertura de l'establiment
                    </Text>
                </View>
                <View style={styles.headerRight}>
                    {isLoading && <ActivityIndicator size="small" color={onPrimaryMuted} style={{ marginRight: 10 }} />}
                    {isAdmin && !isLoading && (
                        <TouchableOpacity
                            style={[styles.editBtn, { borderColor: onPrimaryFaint }]}
                            onPress={() => setEditOpen(true)}
                        >
                            <Ionicons name="pencil-outline" size={14} color={onPrimary} />
                            <Text style={[styles.editBtnText, { color: onPrimary }]}>Editar</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={[styles.divider, { borderTopColor: onPrimaryFaint }]} />

            {isDesktop ? renderDesktop() : renderMobile()}

            {/* Edit modal */}
            {isAdmin && empresaId !== null && (
                <EditScheduleModal
                    visible={editOpen}
                    trams={trams}
                    empresaId={empresaId}
                    onClose={() => setEditOpen(false)}
                    onSaved={refetch}
                />
            )}
        </View>
    );
};

/* ── Styles ─────────────────────────────── */

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 20,
        ...cardShadow,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    titleBlock: { flex: 1 },
    title: { fontSize: 17, fontWeight: '700', marginBottom: 2 },
    subtitle: { fontSize: 13 },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    editBtnText: { fontSize: 13, fontWeight: '600' },
    divider: {
        borderTopWidth: 1,
        marginTop: 14,
        marginBottom: 16,
    },

    /* Desktop columns */
    daysRow: { flexDirection: 'row' },
    dayColumn: {
        width: 152,
        paddingHorizontal: 10,
        paddingBottom: 4,
    },
    dayLabel: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.4,
        marginBottom: 10,
    },
    tancat: {
        fontSize: 12,
        fontStyle: 'italic',
        marginBottom: 4,
    },
    tramChip: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 5,
        marginBottom: 5,
        alignSelf: 'flex-start',
    },
    tramText: { fontSize: 12, fontWeight: '600' },

    /* Mobile rows */
    mobileRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 12,
        gap: 10,
    },
    mobileBadge: {
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    mobileBadgeText: { fontSize: 12, fontWeight: '800' },
    mobileDayName: {
        fontSize: 13,
        fontWeight: '700',
        paddingTop: 8,
        width: 80,
        flexShrink: 0,
    },
    mobileChips: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
        paddingTop: 6,
    },
});
