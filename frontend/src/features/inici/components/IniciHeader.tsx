import React from 'react';
import { Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';
import { ScreenHeader } from '@/ui/components/ScreenHeader';
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

/** Capçalera de l'Inici: salutació, data i empresa; al mòbil, accés al compte. */
export function IniciHeader({ nom, empresa, fotoPerfil, isDesktop }: IniciHeaderProps) {
    const router = useRouter();
    const theme = useTheme();
    const { t, lang } = useLanguage();
    const ara = new Date();
    const data = ara.toLocaleDateString(lang === 'ca' ? 'ca-ES' : 'es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    const dataCap = data.charAt(0).toUpperCase() + data.slice(1);
    const headerClar = theme.headerBg.toLowerCase() === '#ffffff';

    const avatar = isDesktop ? undefined : (
        <TouchableOpacity
            onPress={() => router.push('/configuracio-usuari')}
            accessibilityRole="button"
            accessibilityLabel={t('navConfiguracio')}
            style={[styles.avatar, { backgroundColor: headerClar ? theme.primary : 'rgba(255,255,255,0.22)' }]}
        >
            {fotoPerfil ? (
                <Image source={{ uri: fotoPerfil }} style={styles.avatarImg} />
            ) : (
                <Text style={[styles.avatarText, { color: headerClar ? theme.textOnPrimary : theme.headerText }]}>{inicials(nom)}</Text>
            )}
        </TouchableOpacity>
    );

    return (
        <ScreenHeader
            icon="home-outline"
            title={`${t(salutacio(ara.getHours()))}, ${nom.split(' ')[0]}`}
            subtitle={empresa ? `${dataCap} · ${empresa}` : dataCap}
            right={avatar}
        />
    );
}

const styles = StyleSheet.create({
    avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    avatarImg: { width: 44, height: 44 },
    avatarText: { fontSize: 15, fontWeight: '600' },
});
