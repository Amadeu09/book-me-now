import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { HC } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';
import { salutacio } from '../utils/dates';

interface IniciHeaderProps {
    nom: string;
    empresa?: string;
    fotoPerfil?: string | null;
    isDesktop: boolean;
}

function inicials(nom: string): string {
    return nom.split(' ').filter(Boolean).map((p) => p[0]).join('').toUpperCase().slice(0, 2) || 'U';
}

export function IniciHeader({ nom, empresa, fotoPerfil, isDesktop }: IniciHeaderProps) {
    const router = useRouter();
    const theme = useTheme();
    const { t, lang } = useLanguage();
    const ara = new Date();
    const data = ara.toLocaleDateString(lang === 'ca' ? 'ca-ES' : 'es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    const primerNom = nom.split(' ')[0];

    return (
        <View style={styles.row}>
            <View style={styles.texts}>
                <Text style={styles.date}>{data.charAt(0).toUpperCase() + data.slice(1)}</Text>
                <Text style={[styles.title, isDesktop && styles.titleDesktop]} accessibilityRole="header">
                    {t(salutacio(ara.getHours()))}, {primerNom}
                </Text>
            </View>
            {isDesktop ? (
                empresa ? <Text style={styles.empresa}>{empresa}</Text> : null
            ) : (
                <TouchableOpacity
                    onPress={() => router.push('/configuracio-usuari')}
                    accessibilityRole="button"
                    accessibilityLabel={t('navConfiguracio')}
                    style={[styles.avatar, { backgroundColor: theme.primary }]}
                >
                    {fotoPerfil ? (
                        <Image source={{ uri: fotoPerfil }} style={styles.avatarImg} />
                    ) : (
                        <Text style={[styles.avatarText, { color: theme.textOnPrimary }]}>{inicials(nom)}</Text>
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' },
    texts: { gap: 2, flexShrink: 1 },
    date: { fontSize: 14, color: HC.textMuted },
    title: { fontSize: 22, fontWeight: '700', color: HC.textPrimary },
    titleDesktop: { fontSize: 28 },
    empresa: { fontSize: 14, color: HC.textMuted },
    avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    avatarImg: { width: 44, height: 44 },
    avatarText: { fontSize: 15, fontWeight: '600' },
});
