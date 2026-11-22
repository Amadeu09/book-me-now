import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { HC } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';

export type ApartatConfig = 'empresa' | 'usuari';

interface ConfigLayoutProps {
    actiu: ApartatConfig;
    esAdmin: boolean;
    children: React.ReactNode;
}

/** Marc comú de Configuració: títol i pestanyes Empresa / Usuari. */
export function ConfigLayout({ actiu, esAdmin, children }: ConfigLayoutProps) {
    const router = useRouter();
    const theme = useTheme();
    const { t } = useLanguage();
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;

    const pestanyes: { key: ApartatConfig; label: string; path: string }[] = [
        ...(esAdmin ? [{ key: 'empresa' as const, label: t('navEmpresa'), path: '/configuracio-empresa' }] : []),
        { key: 'usuari', label: t('navUsuari'), path: '/configuracio-usuari' },
    ];

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
            <StatusBar barStyle="dark-content" />
            <ScrollView contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]} keyboardShouldPersistTaps="handled">
                <View style={styles.inner}>
                    <View style={styles.header}>
                        <Text style={styles.overline}>{t('configTitol')}</Text>
                        <Text style={[styles.title, isDesktop && styles.titleDesktop]} accessibilityRole="header">
                            {actiu === 'empresa' ? t('navEmpresa') : t('navUsuari')}
                        </Text>
                    </View>
                    {pestanyes.length > 1 && (
                        <View style={styles.tabs} accessibilityRole="tablist">
                            {pestanyes.map((p) => {
                                const sel = p.key === actiu;
                                return (
                                    <TouchableOpacity
                                        key={p.key}
                                        accessibilityRole="tab"
                                        accessibilityState={{ selected: sel }}
                                        onPress={() => !sel && router.replace(p.path as never)}
                                        style={[styles.tab, sel && { borderBottomColor: theme.primary }]}
                                    >
                                        <Text style={[styles.tabText, sel && { color: theme.primary, fontWeight: '600' }]}>{p.label}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                    {children}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1 },
    content: { padding: 16, paddingBottom: 40 },
    contentDesktop: { paddingHorizontal: 40, paddingVertical: 32 },
    inner: { width: '100%', maxWidth: 860, alignSelf: 'center', gap: 20 },
    header: { gap: 2 },
    overline: { fontSize: 14, color: HC.textMuted },
    title: { fontSize: 22, fontWeight: '700', color: HC.textPrimary },
    titleDesktop: { fontSize: 28 },
    tabs: { flexDirection: 'row', gap: 4, borderBottomWidth: 1, borderBottomColor: HC.border },
    tab: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -1 },
    tabText: { fontSize: 14, color: HC.textSecondary },
});
