import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC } from '@/features/home/constants/inicio.constants';
import { useLanguage } from '@/core/i18n';
import { EquipAvatar } from './EquipAvatar';
import { useTextosMembre } from './EquipFila';
import type { MembreEquip } from '../types/equip.types';

/** Targeta d'una persona per a la vista mòbil. */
export function EquipTargeta({ membre, onPress }: { membre: MembreEquip; onPress: () => void }) {
    const { t } = useLanguage();
    const textos = useTextosMembre();
    const sensePlantilla = !membre.plantilla;

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`${t('equipObrir')} ${membre.nom}`}
            style={({ pressed }) => [styles.card, pressed && styles.pressed, !membre.actiu && styles.inactiu]}
        >
            <EquipAvatar nom={membre.nom} foto={membre.Usuari?.fotoPerfil} mida={44} />
            <View style={styles.body}>
                <Text style={styles.nom} numberOfLines={1}>{membre.nom}</Text>
                <View style={styles.metaRow}>
                    <Text style={[styles.meta, sensePlantilla && styles.metaAvis]} numberOfLines={1}>
                        {textos.plantilla(membre)}
                    </Text>
                    <Text style={styles.meta}>·</Text>
                    <Text style={styles.meta}>{textos.serveis(membre)}</Text>
                </View>
            </View>
            {!membre.actiu ? <Text style={styles.inactiuText}>{t('equipInactiu')}</Text> : null}
            <Ionicons name="chevron-forward" size={18} color={HC.textLight} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: HC.card, borderWidth: 1, borderColor: HC.border, borderRadius: 14,
        padding: 14, minHeight: 72,
    },
    pressed: { opacity: 0.85 },
    inactiu: { opacity: 0.7 },
    body: { flex: 1, minWidth: 0 },
    nom: { fontSize: 15, fontWeight: '600', color: HC.textPrimary },
    metaRow: { flexDirection: 'row', gap: 6, marginTop: 3 },
    meta: { fontSize: 13, color: HC.textMuted },
    metaAvis: { color: HC.statusYellowText, fontWeight: '600' },
    inactiuText: { fontSize: 12, fontWeight: '600', color: HC.textMuted },
});
