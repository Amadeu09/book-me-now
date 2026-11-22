import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { HC } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';
import type { ProfileServei } from '@/features/profile/services/profile.service';
import { IniciCard } from './IniciCard';

interface ServeisAssignatsCardProps {
    serveis: ProfileServei[];
    loading: boolean;
}

export function ServeisAssignatsCard({ serveis, loading }: ServeisAssignatsCardProps) {
    const theme = useTheme();
    const { t } = useLanguage();
    const actius = serveis.filter((s) => s.actiu !== false);

    return (
        <IniciCard title={t('iniciServeisAssignats')}>
            {loading ? (
                <ActivityIndicator style={styles.loader} color={theme.primary} />
            ) : actius.length === 0 ? (
                <Text style={styles.empty}>{t('iniciCapServei')}</Text>
            ) : (
                <View style={styles.chips}>
                    {actius.map((s) => (
                        <View key={s.id} style={styles.chip}>
                            <Text style={styles.nom}>{s.nom}</Text>
                            <Text style={styles.durada}>{s.duradaMin} min</Text>
                        </View>
                    ))}
                </View>
            )}
        </IniciCard>
    );
}

const styles = StyleSheet.create({
    loader: { paddingVertical: 16 },
    empty: { fontSize: 14, color: HC.textMuted, paddingVertical: 8 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
    chip: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: HC.border,
    },
    nom: { fontSize: 13, fontWeight: '600', color: HC.textPrimary },
    durada: { fontSize: 13, color: HC.textMuted },
});
