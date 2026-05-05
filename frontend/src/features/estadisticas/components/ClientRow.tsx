import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC, cardShadow } from '@/features/home/constants/inicio.constants';
import { useLanguage } from '@/core/i18n';
import type { ClientItem } from '../types/clients.types';

interface ClientRowProps {
    client: ClientItem;
    isDesktop: boolean;
    onEdit: (client: ClientItem) => void;
    onDelete: (client: ClientItem) => void;
}

export function ClientRow({ client, isDesktop, onEdit, onDelete }: ClientRowProps) {
    const [showMenu, setShowMenu] = useState(false);
    const { t } = useLanguage();

    const menu = showMenu && (
        <View style={cs.menuPopover}>
            <TouchableOpacity style={cs.menuItem} onPress={() => { setShowMenu(false); onEdit(client); }}>
                <Text style={cs.menuItemText}>{t('edit')}</Text>
            </TouchableOpacity>
            <View style={cs.menuDivider} />
            <TouchableOpacity style={cs.menuItem} onPress={() => { setShowMenu(false); onDelete(client); }}>
                <Text style={[cs.menuItemText, { color: HC.red }]}>{t('delete')}</Text>
            </TouchableOpacity>
        </View>
    );

    const dotsBtn = (
        <View style={cs.dotsWrap}>
            <TouchableOpacity
                onPress={() => setShowMenu(v => !v)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons name="ellipsis-vertical" size={16} color={HC.textMuted} />
            </TouchableOpacity>
            {menu}
        </View>
    );

    if (isDesktop) {
        return (
            <View style={[cs.tableRow, showMenu && cs.elevated]}>
                <Text style={[cs.tdPrimary, { flex: 2 }]} numberOfLines={1}>{client.nom}</Text>
                <Text style={[cs.tdMuted, { flex: 2 }]} numberOfLines={1}>{client.email ?? '—'}</Text>
                <Text style={[cs.tdMuted, { flex: 1 }]} numberOfLines={1}>{client.telefon ?? '—'}</Text>
                <Text style={[cs.tdMuted, { flex: 1 }]} numberOfLines={1}>{client.visites ?? 0}</Text>
                {dotsBtn}
            </View>
        );
    }

    return (
        <View style={[cs.mobileRow, showMenu && cs.elevated]}>
            <View style={cs.mobileInner}>
                <View style={cs.mobileText}>
                    <Text style={cs.tdPrimary} numberOfLines={1}>{client.nom}</Text>
                    <Text style={cs.tdMuted} numberOfLines={1}>{client.email ?? client.telefon ?? '—'}</Text>
                </View>
                {dotsBtn}
            </View>
        </View>
    );
}

const cs = StyleSheet.create({
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: HC.borderSoft,
    },
    mobileRow: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: HC.borderSoft,
    },
    mobileInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    mobileText: { flex: 1 },
    elevated: { zIndex: 100 },
    tdPrimary: { fontSize: 14, fontWeight: '600', color: HC.textPrimary },
    tdMuted: { fontSize: 13, color: HC.textMuted, marginTop: 1 },

    dotsWrap: { position: 'relative', width: 28, alignItems: 'center' },
    menuPopover: {
        position: 'absolute',
        top: 24,
        right: 0,
        backgroundColor: HC.white,
        borderRadius: 8,
        paddingVertical: 4,
        minWidth: 120,
        ...cardShadow,
        elevation: 5,
        zIndex: 1000,
    },
    menuItem: { paddingVertical: 10, paddingHorizontal: 16 },
    menuItemText: { fontSize: 14, color: HC.textPrimary },
    menuDivider: { height: 1, backgroundColor: HC.borderSoft },
});
