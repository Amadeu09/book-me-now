import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { HC } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';
import { uploadMyFoto } from '@/features/profile/services/profile.service';
import { patchStoredUser } from '@/utils/session';
import { ConfigSection } from './ConfigSection';
import { Field } from './Field';
import { Boto } from './Boto';
import { escollirImatge } from '../hooks/useEscollirImatge';

interface Props {
    nom: string;
    email: string;
    rol: string;
    jornada: string | null;
    fotoPerfil: string | null;
}

export function UsuariPerfilSection({ nom, email, rol, jornada, fotoPerfil }: Props) {
    const theme = useTheme();
    const { t } = useLanguage();
    const queryClient = useQueryClient();
    const [foto, setFoto] = useState<string | null>(fotoPerfil);
    const [pujant, setPujant] = useState(false);

    const canviarFoto = async () => {
        const uri = await escollirImatge(true);
        if (!uri) return;
        setPujant(true);
        try {
            const url = await uploadMyFoto(uri);
            setFoto(url ?? uri);
            if (url) await patchStoredUser({ fotoPerfil: url });
            queryClient.invalidateQueries({ queryKey: ['mi-treballador'] });
        } catch (err: any) {
            Alert.alert(t('error'), err?.response?.data?.message || t('photoUploadError'));
        } finally {
            setPujant(false);
        }
    };

    const imatge = foto ?? fotoPerfil;
    const inicials = nom.split(' ').filter(Boolean).map((p) => p[0]).join('').toUpperCase().slice(0, 2) || 'U';

    return (
        <ConfigSection title={t('configElTeuPerfil')}>
            <View style={styles.fotoRow}>
                {imatge ? (
                    <Image source={{ uri: imatge }} style={styles.avatar} accessibilityLabel={nom} />
                ) : (
                    <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                        <Text style={[styles.avatarText, { color: theme.textOnPrimary }]}>{inicials}</Text>
                    </View>
                )}
                <Boto label={t('configCanviarFoto')} onPress={canviarFoto} loading={pujant} />
            </View>
            <View style={styles.grid}>
                <Field label={t('configNom')} value={nom} readOnly />
                <Field label={t('configCorreu')} value={email} readOnly />
                <Field label={t('configRol')} value={rol === 'ADMIN_GENERAL' ? t('rolAdmin') : t('rolEmpleat')} readOnly />
                <Field label={t('configJornada')} value={jornada ?? t('configSenseJornada')} readOnly />
            </View>
            <Text style={styles.help}>{t('configPerfilAjuda')}</Text>
        </ConfigSection>
    );
}

const styles = StyleSheet.create({
    fotoRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    avatarText: { fontSize: 24, fontWeight: '700' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    help: { fontSize: 12, color: HC.textMuted },
});
