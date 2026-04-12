import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { HC, TAB_KEYS, TAB_LABELS, type TabKey } from '../constants/horarios.constants';
import { useTheme } from '@/core/theme/ThemeProvider';

interface HorariosTabsProps {
    activeTab: TabKey;
    onTabChange: (tab: TabKey) => void;
}

export const HorariosTabs: React.FC<HorariosTabsProps> = ({ activeTab, onTabChange }) => {
    const theme = useTheme();
    return (
        <View style={styles.container}>
            {TAB_KEYS.map((key) => {
                const isActive = activeTab === key;
                return (
                    <TouchableOpacity
                        key={key}
                        style={[styles.tab, isActive && { borderBottomColor: theme.primary }]}
                        onPress={() => onTabChange(key)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.tabText, isActive && { color: theme.primary }]}>
                            {TAB_LABELS[key]}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: HC.border,
        paddingHorizontal: 16,
        backgroundColor: HC.white,
    },
    tab: {
        paddingVertical: 14,
        paddingHorizontal: 18,
        marginRight: 8,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    tabText: {
        fontSize: 15,
        fontWeight: '600',
        color: HC.textMuted,
    },
});
