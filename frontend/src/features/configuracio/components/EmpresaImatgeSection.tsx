import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { HC } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';
import { uploadBannerEmpresa, uploadFotoEmpresa } from '@/features/empresas/services/empresas.service';
import { patchStoredEmpresa } from '@/utils/session';
import { ConfigSection } from './ConfigSection';
import { Boto } from './Boto';
import { escollirImatge } from '../hooks/useEscollirImatge';

interface Props {
    empresaId: number;
    nom: string;
    fotoPerfil?: string | null;
    bannerUrl?: string | null;
}

export function EmpresaImatgeSection({ empresaId, nom, fotoPerfil, bannerUrl }: Props) {
    const theme = useTheme();
    const { t } = useLanguage();
    const queryClient = useQueryClient();
    const [pujant, setPujant] = useState<'logo' | 'banner' | null>(null);

    const pujar = async (tipus: 'logo' | 'banner') => {
        const uri = await escollirImatge(tipus === 'logo');
        if (!uri) return;
        setPujant(tipus);
        try {
            if (tipus === 'logo') {
                const updated = await uploadFotoEmpresa(empresaId, uri);
                if (updated?.fotoPerfil) await patchStoredEmpresa({ fotoPerfil: updated.fotoPerfil });
            } else {
                const updated = await uploadBannerEmpresa(empresaId, uri);
                if (updated?.bannerUrl) await patchStoredEmpresa({ bannerUrl: updated.bannerUrl });
            }
            queryClient.invalidateQueries({ queryKey: ['empresa', empresaId] });
        } catch (err: any) {
            Alert.alert(t('error'), err?.response?.data?.message || t(tipus === 'logo' ? 'photoUploadError' : 'bannerUploadError'));
        } finally {
            setPujant(null);
        }
    };

    return (
        <ConfigSection title={t('configImatge')}>
            <View style={[styles.banner, { backgroundColor: theme.primaryLight === '#ffffff' ? HC.primaryLight : theme.primaryLight }]}>
                {bannerUrl ? <Image source={{ uri: bannerUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" accessibilityLabel={t('configBanner')} /> : null}
                <View style={styles.bannerBtn}>
                    <Boto label={t('configCanviarBanner')} onPress={() => pujar('banner')} loading={pujant === 'banner'} />
                </View>
            </View>
            <View style={styles.logoRow}>
                {fotoPerfil ? (
                    <Image source={{ uri: fotoPerfil }} style={styles.logo} accessibilityLabel={t('configLogotip')} />
                ) : (
                    <View style={[styles.logo, { backgroundColor: theme.primary }]}>
                        <Text style={[styles.logoText, { color: theme.textOnPrimary }]}>{nom.slice(0, 2).toUpperCase()}</Text>
                    </View>
                )}
                <View style={styles.logoInfo}>
                    <Text style={styles.logoLabel}>{t('configLogotip')}</Text>
                    <Boto label={t('configPujarLogotip')} onPress={() => pujar('logo')} loading={pujant === 'logo'} />
                </View>
            </View>
        </ConfigSection>
    );
}

const styles = StyleSheet.create({
    banner: { height: 140, borderRadius: 12, overflow: 'hidden', justifyContent: 'flex-end', alignItems: 'flex-end', padding: 12 },
    bannerBtn: { flexDirection: 'row' },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    logo: { width: 72, height: 72, borderRadius: 16, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    logoText: { fontSize: 24, fontWeight: '700' },
    logoInfo: { gap: 8, alignItems: 'flex-start' },
    logoLabel: { fontSize: 14, fontWeight: '600', color: HC.textPrimary },
});
