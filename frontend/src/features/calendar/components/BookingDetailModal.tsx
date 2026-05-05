import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';
import { updateReservaEstat, deleteReserva } from '../services/calendarApi';
import type { CalendarEvent } from './types';

const ESTAT_COLORS: Record<string, string> = {
    PENDENT:    '#F59E0B',
    CONFIRMADA: '#22C55E',
    CANCELLADA: '#EF4444',
    FINALITZADA:'#6B7280',
    NO_SHOW:    '#F97316',
};

const TERMINAL_STATS = ['CANCELLADA', 'FINALITZADA', 'NO_SHOW'];

interface Props {
    visible: boolean;
    event: CalendarEvent | null;
    onClose: () => void;
    onStatusChanged: () => void;
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
    if (!value) return null;
    return (
        <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
                <Ionicons name={icon as any} size={15} color={HC.textMuted} />
            </View>
            <View style={styles.infoText}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </View>
        </View>
    );
}

export function BookingDetailModal({ visible, event, onClose, onStatusChanged }: Props) {
    const theme = useTheme();
    const { t, lang } = useLanguage();
    const locale = lang === 'ca' ? 'ca-ES' : 'es-ES';

    const ESTAT_LABELS: Record<string, string> = {
        PENDENT:     t('bookingPendent'),
        CONFIRMADA:  t('bookingConfirmada'),
        CANCELLADA:  t('bookingCancellada'),
        FINALITZADA: t('bookingFinalitzada'),
        NO_SHOW:     t('bookingNoShow'),
    };

    const [loading, setLoading] = useState<'CANCELLADA' | 'NO_SHOW' | null>(null);
    const [confirming, setConfirming] = useState<'CANCELLADA' | 'NO_SHOW' | null>(null);
    const [localEstat, setLocalEstat] = useState<string | null>(null);

    useEffect(() => {
        if (visible) {
            setLocalEstat(null);
            setConfirming(null);
            setLoading(null);
        }
    }, [visible, event]);

    if (!event?.rawReserva) return null;

    const r = event.rawReserva;
    const estat = localEstat ?? r.estat;
    const isTerminal = TERMINAL_STATS.includes(estat);

    const date = new Date(r.dataHora);
    const TZ = 'Europe/Madrid';
    const dateStr = date.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ });
    const timeStr = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZone: TZ });

    const clientNom   = r.clientNom || r.client?.nom || '—';
    const clientEmail = r.clientEmail || r.client?.email || '';
    const clientTel   = r.client?.telefon || '';
    const worker      = r.treballador?.nom || '';
    const servei      = r.servei?.nom || event.title;
    const durMin      = r.servei?.duradaMin;
    const preu        = r.servei?.preu;
    const obs         = r.observacions || '';

    async function confirmAction() {
        if (!confirming) return;
        const accio = confirming;
        setLoading(accio);
        setConfirming(null);
        try {
            if (accio === 'CANCELLADA') {
                await deleteReserva(r.id);
                onStatusChanged();
                onClose();
            } else {
                await updateReservaEstat(r.id, accio);
                setLocalEstat(accio);
                onStatusChanged();
            }
        } catch {
            // no-op: deixem l'estat com estava
        } finally {
            setLoading(null);
        }
    }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.card}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.headerService} numberOfLines={1}>{servei}</Text>
                            <View style={[styles.estatBadge, { backgroundColor: ESTAT_COLORS[estat] + '22', borderColor: ESTAT_COLORS[estat] + '55' }]}>
                                <View style={[styles.estatDot, { backgroundColor: ESTAT_COLORS[estat] }]} />
                                <Text style={[styles.estatText, { color: ESTAT_COLORS[estat] }]}>
                                    {ESTAT_LABELS[estat] ?? estat}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => { setConfirming(null); onClose(); }} style={styles.closeBtn}>
                            <Ionicons name="close" size={20} color={HC.textMuted} />
                        </TouchableOpacity>
                    </View>

                    {/* Body */}
                    <ScrollView
                        style={styles.body}
                        contentContainerStyle={styles.bodyContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.sectionTitle}>{t('bookingDetailTitle')}</Text>

                        <View style={styles.infoCard}>
                            <InfoRow icon="calendar-outline"    label={t('bookingFieldDate')}     value={dateStr} />
                            <InfoRow icon="time-outline"        label={t('bookingFieldTime')}     value={timeStr} />
                            {durMin  && <InfoRow icon="hourglass-outline"  label={t('bookingFieldDuration')} value={`${durMin} min`} />}
                            {preu    && <InfoRow icon="pricetag-outline"   label={t('bookingFieldPrice')}    value={`${Number(preu).toFixed(2)} €`} />}
                        </View>

                        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>{t('bookingFieldClient')}</Text>
                        <View style={styles.infoCard}>
                            <InfoRow icon="person-outline"      label={t('bookingFieldNom')}   value={clientNom} />
                            {clientEmail && <InfoRow icon="mail-outline"   label={t('bookingFieldEmail')} value={clientEmail} />}
                            {clientTel   && <InfoRow icon="call-outline"   label={t('bookingFieldPhone')} value={clientTel} />}
                        </View>

                        {worker && (
                            <>
                                <Text style={[styles.sectionTitle, { marginTop: 16 }]}>{t('bookingFieldProfessional')}</Text>
                                <View style={styles.infoCard}>
                                    <InfoRow icon="cut-outline" label={t('bookingFieldWorker')} value={worker} />
                                </View>
                            </>
                        )}

                        {obs ? (
                            <>
                                <Text style={[styles.sectionTitle, { marginTop: 16 }]}>{t('bookingFieldNotes')}</Text>
                                <View style={styles.infoCard}>
                                    <Text style={styles.obsText}>{obs}</Text>
                                </View>
                            </>
                        ) : null}
                    </ScrollView>

                    {/* Footer actions */}
                    {!isTerminal && !confirming && (
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.noShowBtn]}
                                onPress={() => setConfirming('NO_SHOW')}
                                disabled={loading !== null}
                                activeOpacity={0.8}
                            >
                                {loading === 'NO_SHOW'
                                    ? <ActivityIndicator size="small" color="#F97316" />
                                    : <>
                                        <Ionicons name="eye-off-outline" size={16} color="#F97316" />
                                        <Text style={[styles.actionBtnText, { color: '#F97316' }]}>{t('bookingNoShow')}</Text>
                                    </>
                                }
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionBtn, styles.cancelBtn]}
                                onPress={() => setConfirming('CANCELLADA')}
                                disabled={loading !== null}
                                activeOpacity={0.8}
                            >
                                {loading === 'CANCELLADA'
                                    ? <ActivityIndicator size="small" color="#fff" />
                                    : <>
                                        <Ionicons name="close-circle-outline" size={16} color="#fff" />
                                        <Text style={[styles.actionBtnText, { color: '#fff' }]}>{t('bookingCancelAppointment')}</Text>
                                    </>
                                }
                            </TouchableOpacity>
                        </View>
                    )}

                    {!isTerminal && confirming && (
                        <View style={styles.confirmFooter}>
                            <Text style={styles.confirmText}>
                                {confirming === 'CANCELLADA'
                                    ? t('bookingCancelConfirmQ')
                                    : t('bookingNoShowConfirmQ')}
                            </Text>
                            <View style={styles.confirmBtns}>
                                <TouchableOpacity
                                    style={[styles.actionBtn, styles.confirmNoBtn]}
                                    onPress={() => setConfirming(null)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.actionBtnText, { color: HC.textSecondary }]}>{t('no')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionBtn, confirming === 'CANCELLADA' ? styles.cancelBtn : styles.noShowConfirmBtn]}
                                    onPress={confirmAction}
                                    disabled={loading !== null}
                                    activeOpacity={0.8}
                                >
                                    {loading !== null
                                        ? <ActivityIndicator size="small" color={confirming === 'CANCELLADA' ? '#fff' : '#F97316'} />
                                        : <Text style={[styles.actionBtnText, { color: confirming === 'CANCELLADA' ? '#fff' : '#F97316' }]}>{t('bookingConfirmYes')}</Text>
                                    }
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {isTerminal && (
                        <View style={styles.footer}>
                            <View style={[styles.terminalBanner, { backgroundColor: ESTAT_COLORS[estat] + '15' }]}>
                                <Ionicons name="lock-closed-outline" size={14} color={ESTAT_COLORS[estat]} />
                                <Text style={[styles.terminalText, { color: ESTAT_COLORS[estat] }]}>
                                    {t('bookingFinalState')}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        width: '100%',
        maxWidth: 480,
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        maxHeight: '90%',
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerLeft: {
        flex: 1,
        marginRight: 12,
        gap: 6,
    },
    headerService: {
        fontSize: 17,
        fontWeight: '700',
        color: HC.textPrimary,
    },
    estatBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 5,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 20,
        borderWidth: 1,
    },
    estatDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    estatText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Body
    body: {
        flexShrink: 1,
    },
    bodyContent: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: HC.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 8,
    },
    infoCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 4,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        gap: 12,
    },
    infoIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    infoText: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: HC.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        marginBottom: 1,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '500',
        color: HC.textPrimary,
    },
    obsText: {
        fontSize: 13,
        color: HC.textSecondary,
        lineHeight: 20,
        padding: 12,
    },

    // Footer
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        flexDirection: 'row',
        gap: 10,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        borderRadius: 12,
    },
    noShowBtn: {
        backgroundColor: '#fff7ed',
        borderWidth: 1,
        borderColor: '#fed7aa',
    },
    cancelBtn: {
        backgroundColor: '#EF4444',
    },
    actionBtnText: {
        fontSize: 13,
        fontWeight: '700',
    },
    terminalBanner: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        borderRadius: 10,
    },
    terminalText: {
        fontSize: 13,
        fontWeight: '600',
    },
    confirmFooter: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        gap: 10,
    },
    confirmText: {
        fontSize: 14,
        fontWeight: '600',
        color: HC.textPrimary,
        textAlign: 'center',
    },
    confirmBtns: {
        flexDirection: 'row',
        gap: 10,
    },
    confirmNoBtn: {
        backgroundColor: '#f1f5f9',
    },
    noShowConfirmBtn: {
        backgroundColor: '#fff7ed',
        borderWidth: 1,
        borderColor: '#fed7aa',
    },
});
