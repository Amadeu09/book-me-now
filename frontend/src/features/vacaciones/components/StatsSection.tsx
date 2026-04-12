import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC, cardShadow } from '@/features/home/constants/inicio.constants';
import type { AbsenciaTreballador, AbsenciaEmpresa } from '../types/vacaciones.types';
import { useTheme } from '@/core/theme/ThemeProvider';

/* ── Helpers ──────────────────────────────── */
function countDays(inici: string, fi: string): number {
    return Math.round((new Date(fi).getTime() - new Date(inici).getTime()) / 86_400_000) + 1;
}

function nextUpcoming(empresa: AbsenciaEmpresa[]): AbsenciaEmpresa | null {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return empresa
        .filter(a => new Date(a.inici) >= today)
        .sort((a, b) => new Date(a.inici).getTime() - new Date(b.inici).getTime())[0] ?? null;
}

function formatShortDate(iso: string): string {
    return new Date(iso).toLocaleDateString('ca-ES', {
        weekday: 'long', day: 'numeric', month: 'long',
    });
}

function daysUntil(inici: string): string {
    const diff = Math.ceil((new Date(inici).getTime() - Date.now()) / 86_400_000);
    if (diff <= 0) return 'Avui';
    if (diff === 1) return 'Demà';
    return `En ${diff} dies`;
}

/* ── Sub-cards ────────────────────────────── */
function BalanceCard({ vacancesUsed, diesVacancesAnuals, missatgeDies }: { vacancesUsed: number; diesVacancesAnuals: number; missatgeDies: string | null }) {
    const theme = useTheme();

    if (missatgeDies) {
        return (
            <View style={[styles.card, styles.balanceCard, styles.balanceCardEmpty, { backgroundColor: theme.primaryLight, borderWidth: theme.softBorderWidth, borderColor: theme.softBorderColor }]}>
                <Ionicons name="calendar-clear-outline" size={32} color={HC.textMuted} style={styles.emptyIcon} />
                <Text style={styles.emptyText}>{missatgeDies}</Text>
            </View>
        );
    }

    const pct = diesVacancesAnuals > 0 ? Math.min(100, (vacancesUsed / diesVacancesAnuals) * 100) : 0;
    const disponibles = Math.max(0, diesVacancesAnuals - vacancesUsed);

    return (
        <View style={[styles.card, styles.balanceCard, { backgroundColor: theme.primaryLight, borderWidth: theme.softBorderWidth, borderColor: theme.softBorderColor }]}>
            <Text style={styles.cardLabel}>VACANCES USADES</Text>
            <View style={styles.balanceRow}>
                <Text style={[styles.balanceBig, { color: theme.primary }]}>{vacancesUsed}</Text>
                <Text style={styles.balanceFraction}> / {diesVacancesAnuals} dies</Text>
            </View>
            <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { backgroundColor: theme.primary, width: pct + '%' as any }]} />
            </View>
            <View style={styles.balanceFooter}>
                <Text style={styles.footerLabel}>{Math.round(pct)}% CONSUMIT</Text>
                <Text style={styles.footerLabel}>{disponibles} DIES DISPONIBLES</Text>
            </View>
        </View>
    );
}

function AccumulatedCard({ vacancesUsed }: { vacancesUsed: number }) {
    const theme = useTheme();
    return (
        <View style={[styles.card, styles.miniCard, { backgroundColor: theme.primaryLight, borderWidth: theme.softBorderWidth, borderColor: theme.softBorderColor }]}>
            <View style={styles.miniRow}>
                <Ionicons name="airplane-outline" size={18} color={theme.primary} />
                <View style={styles.miniText}>
                    <Text style={styles.cardLabel}>DIES ACUMULATS</Text>
                    <Text style={styles.miniValue}>{vacancesUsed} dies</Text>
                </View>
            </View>
        </View>
    );
}

function HolidayCountCard({ count }: { count: number }) {
    const theme = useTheme();
    return (
        <View style={[styles.card, styles.miniCard, { backgroundColor: theme.primaryLight, borderWidth: theme.softBorderWidth, borderColor: theme.softBorderColor }]}>
            <View style={styles.miniRow}>
                <Ionicons name="calendar-outline" size={18} color={HC.textMuted} />
                <View style={styles.miniText}>
                    <Text style={styles.cardLabel}>PRÒXIMS FESTIUS</Text>
                    <Text style={styles.miniValue}>{count} dies</Text>
                </View>
            </View>
        </View>
    );
}

function NextHolidayCard({ next }: { next: AbsenciaEmpresa | null }) {
    const theme = useTheme();
    return (
        <View style={[styles.card, styles.darkCard, { backgroundColor: theme.primary }]}>
            <View style={[styles.holidayBadge, { backgroundColor: theme.textOnPrimary + '22' }]}>
                <Text style={[styles.holidayBadgeText, { color: theme.textOnPrimary }]}>PRÒXIM FESTIU</Text>
            </View>
            {next ? (
                <>
                    <Text style={[styles.holidayTitle, { color: theme.textOnPrimary }]} numberOfLines={2}>{next.titol}</Text>
                    <Text style={[styles.holidayDate, { color: theme.textOnPrimary + 'cc' }]}>{formatShortDate(next.inici)}</Text>
                    <View style={styles.holidayTag}>
                        <Ionicons name="time-outline" size={12} color={theme.textOnPrimary} />
                        <Text style={[styles.holidayTagText, { color: theme.textOnPrimary }]}>{daysUntil(next.inici)}</Text>
                    </View>
                </>
            ) : (
                <Text style={[styles.holidayDate, { color: theme.textOnPrimary + 'cc' }]}>Sense festius propers</Text>
            )}
        </View>
    );
}

/* ── Public component ─────────────────────── */
type Props = {
    isDesktop: boolean;
    treballador: AbsenciaTreballador[];
    empresa: AbsenciaEmpresa[];
    diesVacancesAnuals: number;
    missatgeDies: string | null;
};

export function StatsSection({ isDesktop, treballador, empresa, diesVacancesAnuals, missatgeDies }: Props) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const vacancesUsed = treballador
        .filter(a => a.tipus === 'VACANCES' && a.estat === 'APROVADA')
        .reduce((sum, a) => sum + countDays(a.inici, a.fi), 0);

    const upcomingCount = empresa.filter(a => new Date(a.fi) >= today).length;
    const next = nextUpcoming(empresa);

    const middleColumn = (
        <View style={styles.middleCol}>
            <AccumulatedCard vacancesUsed={vacancesUsed} />
            <HolidayCountCard count={upcomingCount} />
        </View>
    );

    if (isDesktop) {
        return (
            <View style={styles.desktopRow}>
                <BalanceCard vacancesUsed={vacancesUsed} diesVacancesAnuals={diesVacancesAnuals} missatgeDies={missatgeDies} />
                {middleColumn}
                <NextHolidayCard next={next} />
            </View>
        );
    }

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mobileScroll}
        >
            <BalanceCard vacancesUsed={vacancesUsed} diesVacancesAnuals={diesVacancesAnuals} missatgeDies={missatgeDies} />
            <AccumulatedCard vacancesUsed={vacancesUsed} />
            <HolidayCountCard count={upcomingCount} />
            <NextHolidayCard next={next} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    desktopRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 14,
        alignItems: 'stretch',
    },
    mobileScroll: {
        paddingHorizontal: 20,
        gap: 8,
        paddingBottom: 4,
        paddingTop: 4,
        marginBottom: 12,
    },
    middleCol: {
        flex: 1,
        gap: 8,
    },
    card: {
        backgroundColor: HC.card,
        borderRadius: 12,
        padding: 12,
        ...cardShadow,
    },
    balanceCard: {
        flex: 1.4,
    },
    balanceCardEmpty: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    emptyIcon: {
        marginBottom: 2,
    },
    emptyText: {
        fontSize: 11,
        color: HC.textMuted,
        textAlign: 'center',
        lineHeight: 16,
    },
    miniCard: {
        flex: 1,
        justifyContent: 'center',
        minWidth: 140,
    },
    darkCard: {
        flex: 1.4,
        backgroundColor: HC.textPrimary,
    },
    cardLabel: {
        fontSize: 9,
        fontWeight: '600',
        color: HC.textMuted,
        letterSpacing: 0.6,
        marginBottom: 2,
    },
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    balanceBig: {
        fontSize: 30,
        fontWeight: '700',
        color: HC.primary,
        lineHeight: 36,
    },
    balanceFraction: {
        fontSize: 13,
        color: HC.textMuted,
        fontWeight: '500',
    },
    progressTrack: {
        height: 5,
        backgroundColor: HC.borderSoft,
        borderRadius: 3,
        marginTop: 8,
        marginBottom: 6,
        overflow: 'hidden',
    },
    progressFill: {
        height: 5,
        backgroundColor: HC.primary,
        borderRadius: 3,
    },
    balanceFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    footerLabel: {
        fontSize: 8,
        color: HC.textMuted,
        fontWeight: '600',
        letterSpacing: 0.4,
    },
    miniRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    miniText: {
        flex: 1,
    },
    miniValue: {
        fontSize: 16,
        fontWeight: '700',
        color: HC.textPrimary,
        marginTop: 2,
    },
    holidayBadge: {
        alignSelf: 'flex-start',
        backgroundColor: HC.primary,
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginBottom: 6,
    },
    holidayBadgeText: {
        fontSize: 8,
        fontWeight: '700',
        color: HC.white,
        letterSpacing: 0.5,
    },
    holidayTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: HC.white,
        marginBottom: 4,
    },
    holidayDate: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.60)',
        marginBottom: 12,
    },
    holidayTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    holidayTagText: {
        fontSize: 12,
        color: HC.primary,
        fontWeight: '600',
    },
});
