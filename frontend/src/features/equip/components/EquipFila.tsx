import React from 'react';
import { View, Text, Pressable, StyleSheet, type PressableStateCallbackType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { tintPrimari } from '@/core/theme/tint';
import { useLanguage } from '@/core/i18n';
import { EquipAvatar } from './EquipAvatar';
import type { MembreEquip } from '../types/equip.types';

/** Textos derivats d'una persona, compartits per la fila i la targeta. */
export function useTextosMembre() {
    const { t } = useLanguage();
    return {
        plantilla: (m: MembreEquip) => m.plantilla?.nom ?? t('equipSensePlantilla'),
        serveis: (m: MembreEquip) => {
            const n = m.serveis?.length ?? 0;
            return n === 1 ? t('equipUnServei') : t('equipNServeis').replace('{n}', String(n));
        },
        vacances: (m: MembreEquip) => t('equipDiesVac')
            .replace('{usats}', String(m.diesVacancesUsats ?? 0))
            .replace('{total}', String(m.diesVacancesAnuals ?? 0)),
    };
}

interface Props {
    membre: MembreEquip;
    seleccionat: boolean;
    onPress: () => void;
}

export function EquipFila({ membre, seleccionat, onPress }: Props) {
    const theme = useTheme();
    const { t } = useLanguage();
    const textos = useTextosMembre();
    const sensePlantilla = !membre.plantilla;
    const vacancesEsgotades = membre.diesVacancesAnuals > 0 && membre.diesVacancesUsats >= membre.diesVacancesAnuals;

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected: seleccionat }}
            accessibilityLabel={`${t('equipObrir')} ${membre.nom}`}
            style={(state) => [
                styles.row,
                (state as PressableStateCallbackType & { hovered?: boolean }).hovered && styles.rowHover,
                seleccionat && { backgroundColor: tintPrimari(theme) },
            ]}
        >
            <View style={[styles.cell, styles.colNom]}>
                <EquipAvatar nom={membre.nom} foto={membre.Usuari?.fotoPerfil} />
                <View style={styles.flex}>
                    <Text style={styles.nom} numberOfLines={1}>{membre.nom}</Text>
                    <Text style={styles.email} numberOfLines={1}>{membre.Usuari?.email ?? ''}</Text>
                </View>
            </View>
            <View style={[styles.cell, styles.colPlantilla]}>
                {sensePlantilla ? (
                    <View style={styles.avisChip}>
                        <Ionicons name="alert-circle-outline" size={13} color={HC.statusYellowText} />
                        <Text style={styles.avisText}>{textos.plantilla(membre)}</Text>
                    </View>
                ) : (
                    <Text style={styles.text} numberOfLines={1}>{textos.plantilla(membre)}</Text>
                )}
            </View>
            <Text style={[styles.cell, styles.colServeis, styles.text]}>{textos.serveis(membre)}</Text>
            <Text style={[styles.cell, styles.colVacances, styles.text, vacancesEsgotades && { color: HC.statusRedText }]}>
                {textos.vacances(membre)}
            </Text>
            <View style={[styles.cell, styles.colEstat]}>
                <View style={[styles.estat, { backgroundColor: membre.actiu ? HC.statusGreenBg : HC.borderSoft }]}>
                    <Text style={[styles.estatText, { color: membre.actiu ? HC.statusGreenText : HC.textMuted }]}>
                        {membre.actiu ? t('equipActiu') : t('equipInactiu')}
                    </Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={HC.textLight} />
        </Pressable>
    );
}

export const AMPLADES_COLUMNES = {
    nom: { flex: 2.4 },
    plantilla: { flex: 1.5 },
    serveis: { flex: 1 },
    vacances: { flex: 1 },
    estat: { flex: 0.9 },
} as const;

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingHorizontal: 16, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: HC.borderSoft,
    },
    rowHover: { backgroundColor: '#F8FAFC' },
    cell: { minWidth: 0 },
    colNom: { ...AMPLADES_COLUMNES.nom, flexDirection: 'row', alignItems: 'center', gap: 10 },
    colPlantilla: AMPLADES_COLUMNES.plantilla,
    colServeis: AMPLADES_COLUMNES.serveis,
    colVacances: AMPLADES_COLUMNES.vacances,
    colEstat: AMPLADES_COLUMNES.estat,
    flex: { flex: 1, minWidth: 0 },
    nom: { fontSize: 14, fontWeight: '600', color: HC.textPrimary },
    email: { fontSize: 12, color: HC.textMuted, marginTop: 1 },
    text: { fontSize: 13, color: HC.textSecondary },
    avisChip: {
        flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
        backgroundColor: HC.statusYellowBg, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3,
    },
    avisText: { fontSize: 12, fontWeight: '600', color: HC.statusYellowText },
    estat: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
    estatText: { fontSize: 12, fontWeight: '600' },
});
