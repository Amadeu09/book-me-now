import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';

export type PestanyaHoraris = 'obertura' | 'plantilles' | 'festius';

const ICONES: Record<PestanyaHoraris, React.ComponentProps<typeof Ionicons>['name']> = {
    obertura: 'storefront-outline',
    plantilles: 'git-branch-outline',
    festius: 'calendar-clear-outline',
};

export function HorarisPestanyes({ actiu, onCanvi }: { actiu: PestanyaHoraris; onCanvi: (p: PestanyaHoraris) => void }) {
    const theme = useTheme();
    const { t } = useLanguage();
    const pestanyes: { clau: PestanyaHoraris; label: string }[] = [
        { clau: 'obertura', label: t('horTabObertura') },
        { clau: 'plantilles', label: t('horTabPlantilles') },
        { clau: 'festius', label: t('horTabFestius') },
    ];

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs} accessibilityRole="tablist">
            {pestanyes.map(p => {
                const sel = p.clau === actiu;
                const color = sel ? theme.primary : HC.textSecondary;
                return (
                    <Pressable
                        key={p.clau}
                        onPress={() => onCanvi(p.clau)}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: sel }}
                        style={[styles.tab, sel && { borderBottomColor: theme.primary }]}
                    >
                        <Ionicons name={ICONES[p.clau]} size={16} color={color} />
                        <Text style={[styles.tabText, { color }, sel && styles.tabTextSel]}>{p.label}</Text>
                    </Pressable>
                );
            })}
            <View style={styles.linia} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    tabs: { flexDirection: 'row', gap: 4, borderBottomWidth: 1, borderBottomColor: HC.border, flexGrow: 1 },
    tab: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -1,
    },
    tabText: { fontSize: 14 },
    tabTextSel: { fontWeight: '600' },
    linia: { flex: 1 },
});
