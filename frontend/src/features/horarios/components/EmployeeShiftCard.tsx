import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC, cardShadow, STATUS_CONFIG, type Employee } from '../constants/horarios.constants';

/* ──────────────────────────────────────────
   EmployeeShiftCard
   – Mobile: standalone card with avatar, name, shift, status badge
   – Desktop row: used inside the personal table
   ────────────────────────────────────────── */

interface EmployeeShiftCardProps {
    employee: Employee;
    variant?: 'card' | 'row';
    onAction?: () => void;
}

export const EmployeeShiftCard: React.FC<EmployeeShiftCardProps> = ({
    employee,
    variant = 'card',
    onAction,
}) => {
    const sts = STATUS_CONFIG[employee.status];

    if (variant === 'row') return <DesktopRow employee={employee} sts={sts} onAction={onAction} />;
    return <MobileCard employee={employee} sts={sts} />;
};

/* ── Mobile Card ───────────────────────── */
const MobileCard: React.FC<{ employee: Employee; sts: typeof STATUS_CONFIG.available }> = ({
    employee, sts,
}) => (
    <View style={styles.mCard}>
        <View style={styles.avatarWrap}>
            <View style={[styles.avatar, { backgroundColor: employee.avatarColor }]}>
                <Text style={styles.avatarText}>{employee.initials}</Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: sts.dotColor }]} />
        </View>
        <View style={styles.mInfo}>
            <Text style={styles.mName}>{employee.name}</Text>
            <Text style={styles.mShift}>{employee.shift}</Text>
        </View>
        <Text style={[styles.mBadge, { color: sts.color }]}>{sts.label}</Text>
    </View>
);

/* ── Desktop Row ───────────────────────── */
const DesktopRow: React.FC<{
    employee: Employee;
    sts: typeof STATUS_CONFIG.available;
    onAction?: () => void;
}> = ({ employee, sts, onAction }) => (
    <View style={styles.dRow}>
        {/* Empleado */}
        <View style={styles.dCellEmployee}>
            <View style={styles.avatarWrap}>
                <View style={[styles.avatar, { backgroundColor: employee.avatarColor }]}>
                    <Text style={styles.avatarText}>{employee.initials}</Text>
                </View>
            </View>
            <View>
                <Text style={styles.dName}>{employee.name}</Text>
                <Text style={styles.dRole}>{employee.role}</Text>
            </View>
        </View>
        {/* Plantilla */}
        <View style={styles.dCellTemplate}>
            <View style={styles.templateBadge}>
                <Text style={styles.templateBadgeText}>{employee.templateName}</Text>
            </View>
        </View>
        {/* Estado */}
        <View style={styles.dCellStatus}>
            <View style={[styles.statusDotSmall, { backgroundColor: sts.dotColor }]} />
            <Text style={[styles.dStatusText, { color: sts.color }]}>{sts.label}</Text>
            {employee.status === 'vacation' && (
                <Text style={styles.dStatusSub}>Vuelve el 15 de Oct.</Text>
            )}
        </View>
        {/* Acciones */}
        <TouchableOpacity style={styles.dCellAction} onPress={onAction}>
            <Ionicons name="open-outline" size={18} color={HC.textMuted} />
        </TouchableOpacity>
    </View>
);

/* ── Styles ────────────────────────────── */
const styles = StyleSheet.create({
    /* Avatar (shared) */
    avatarWrap: { position: 'relative' },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: HC.white,
        fontSize: 15,
        fontWeight: '700',
    },
    statusDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: HC.white,
    },

    /* ── Mobile card ──────────────── */
    mCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: HC.white,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        ...cardShadow,
    },
    mInfo: { flex: 1, marginLeft: 12 },
    mName: {
        fontSize: 15,
        fontWeight: '700',
        color: HC.textPrimary,
        marginBottom: 2,
    },
    mShift: {
        fontSize: 13,
        color: HC.textMuted,
    },
    mBadge: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.3,
    },

    /* ── Desktop row ──────────────── */
    dRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: HC.borderSoft,
    },
    dCellEmployee: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dName: {
        fontSize: 14,
        fontWeight: '700',
        color: HC.textPrimary,
    },
    dRole: {
        fontSize: 12,
        color: HC.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    dCellTemplate: {
        flex: 1.5,
        alignItems: 'flex-start',
    },
    templateBadge: {
        backgroundColor: HC.primaryLight,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
    },
    templateBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: HC.primary,
    },
    dCellStatus: {
        flex: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 6,
    },
    statusDotSmall: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    dStatusText: {
        fontSize: 13,
        fontWeight: '600',
    },
    dStatusSub: {
        fontSize: 11,
        color: HC.textLight,
        width: '100%',
        marginTop: 2,
    },
    dCellAction: {
        width: 36,
        alignItems: 'center',
    },
});
