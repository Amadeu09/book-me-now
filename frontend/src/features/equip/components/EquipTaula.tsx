import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { HC } from '@/features/home/constants/inicio.constants';
import { useLanguage } from '@/core/i18n';
import { EquipFila, AMPLADES_COLUMNES } from './EquipFila';
import type { MembreEquip } from '../types/equip.types';

interface Props {
    membres: MembreEquip[];
    seleccionatId: number | null;
    onSelecciona: (id: number) => void;
    textBuit: string;
}

export function EquipTaula({ membres, seleccionatId, onSelecciona, textBuit }: Props) {
    const { t } = useLanguage();
    return (
        <View style={styles.card}>
            <View style={styles.head}>
                <Text style={[styles.th, AMPLADES_COLUMNES.nom]}>{t('equipColEmpleat')}</Text>
                <Text style={[styles.th, AMPLADES_COLUMNES.plantilla]}>{t('equipColPlantilla')}</Text>
                <Text style={[styles.th, AMPLADES_COLUMNES.serveis]}>{t('equipColServeis')}</Text>
                <Text style={[styles.th, AMPLADES_COLUMNES.vacances]}>{t('equipColVacances')}</Text>
                <Text style={[styles.th, AMPLADES_COLUMNES.estat]}>{t('equipColEstat')}</Text>
                <View style={styles.chevronSpace} />
            </View>
            <FlatList
                data={membres}
                keyExtractor={m => String(m.id)}
                renderItem={({ item }) => (
                    <EquipFila membre={item} seleccionat={item.id === seleccionatId} onPress={() => onSelecciona(item.id)} />
                )}
                ListEmptyComponent={<Text style={styles.buit}>{textBuit}</Text>}
                scrollEnabled={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: HC.card, borderWidth: 1, borderColor: HC.border, borderRadius: 16, overflow: 'hidden' },
    head: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingHorizontal: 16, paddingVertical: 10,
        backgroundColor: '#F8FAFC', borderBottomWidth: 1, borderBottomColor: HC.border,
    },
    th: { fontSize: 11, fontWeight: '700', color: HC.textMuted, letterSpacing: 0.5, textTransform: 'uppercase' },
    chevronSpace: { width: 16 },
    buit: { padding: 28, textAlign: 'center', fontSize: 14, color: HC.textMuted },
});
