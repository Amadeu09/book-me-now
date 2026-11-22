import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';
import type { FiltreEstat } from '../types/equip.types';

interface Props {
    cerca: string;
    onCerca: (v: string) => void;
    filtre: FiltreEstat;
    onFiltre: (f: FiltreEstat) => void;
    comptes: Record<FiltreEstat, number>;
    ambSegments?: boolean;
}

export function EquipFiltres({ cerca, onCerca, filtre, onFiltre, comptes, ambSegments = true }: Props) {
    const theme = useTheme();
    const { t } = useLanguage();
    const opcions: { clau: FiltreEstat; label: string }[] = [
        { clau: 'tots', label: t('equipTots') },
        { clau: 'actius', label: t('equipActius') },
        { clau: 'inactius', label: t('equipInactius') },
    ];

    return (
        <View style={styles.row}>
            <View style={styles.cerca}>
                <Ionicons name="search-outline" size={16} color={HC.textLight} />
                <TextInput
                    value={cerca}
                    onChangeText={onCerca}
                    placeholder={t('equipCerca')}
                    placeholderTextColor={HC.textLight}
                    accessibilityLabel={t('equipCerca')}
                    style={styles.input}
                />
            </View>
            {ambSegments ? (
                <View style={styles.segments} accessibilityRole="tablist">
                    {opcions.map(o => {
                        const actiu = filtre === o.clau;
                        return (
                            <Pressable
                                key={o.clau}
                                onPress={() => onFiltre(o.clau)}
                                accessibilityRole="tab"
                                accessibilityState={{ selected: actiu }}
                                style={[styles.segment, actiu && { backgroundColor: HC.card, borderColor: HC.border }]}
                            >
                                <Text style={[styles.segmentText, actiu && { color: theme.primary }]}>
                                    {o.label} · {comptes[o.clau]}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 },
    cerca: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        borderWidth: 1, borderColor: HC.borderInput, borderRadius: 10,
        paddingHorizontal: 12, minHeight: 42, backgroundColor: HC.card,
        flexGrow: 1, flexBasis: 220, maxWidth: 360,
    },
    input: { flex: 1, fontSize: 14, color: HC.textPrimary, paddingVertical: 8, outlineStyle: 'none' } as object,
    segments: { flexDirection: 'row', backgroundColor: HC.borderSoft, borderRadius: 10, padding: 3, gap: 2 },
    segment: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: 'transparent' },
    segmentText: { fontSize: 13, fontWeight: '600', color: HC.textMuted },
});
