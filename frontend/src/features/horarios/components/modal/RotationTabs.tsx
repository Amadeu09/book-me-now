import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { HC } from '../../constants/horarios.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';

interface RotationTabsProps {
    rotations: { index: number; nom: string }[];
    activeIndex: number;
    onSelect: (index: number) => void;
    onAdd: () => void;
}

export const RotationTabs: React.FC<RotationTabsProps> = ({
    rotations,
    activeIndex,
    onSelect,
    onAdd,
}) => {
    const theme = useTheme();
    const { t } = useLanguage();
    return (
        <View style={styles.container}>
            {rotations.map((r) => {
                const isActive = r.index === activeIndex;
                return (
                    <TouchableOpacity
                        key={r.index}
                        style={[styles.tab, isActive && { borderBottomColor: theme.primary }]}
                        onPress={() => onSelect(r.index)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.tabText, isActive && { color: theme.primary }]}>
                            {r.nom}
                        </Text>
                    </TouchableOpacity>
                );
            })}
            <TouchableOpacity onPress={onAdd} activeOpacity={0.7} style={styles.addTab}>
                <Text style={[styles.addText, { color: theme.primary }]}>{t('addRotation')}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: HC.border,
    },
    tab: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: 'transparent', // overridden inline with theme.primary
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: HC.textMuted,
    },
    tabTextActive: {},
    addTab: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    addText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
