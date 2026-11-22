import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/core/api/api';
import { clearSession } from '@/utils/session';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';
import { useUsuariActual } from '@/features/inici/hooks/useUsuariActual';
import { ConfigLayout } from '../components/ConfigLayout';
import { UsuariPerfilSection } from '../components/UsuariPerfilSection';
import { UsuariAparencaSection } from '../components/UsuariAparencaSection';
import { UsuariContrasenyaSection } from '../components/UsuariContrasenyaSection';
import { Boto } from '../components/Boto';

/** Configuració › Usuari: perfil, aparença, contrasenya i sortir. */
export default function ConfigUsuariScreen() {
    const router = useRouter();
    const theme = useTheme();
    const { t } = useLanguage();
    const queryClient = useQueryClient();
    const { user, carregat, esAdmin, treballador, carregantTreballador } = useUsuariActual();

    const tancarSessio = async () => {
        // Invalida el token al servidor; si falla, la sessió local es tanca igualment
        await api.post('/auth/logout').catch(() => undefined);
        await clearSession();
        queryClient.clear();
        router.replace('/login');
    };

    const nom = treballador?.nom ?? user?.nom ?? user?.email?.split('@')[0] ?? t('userFallback');
    const jornada = treballador?.plantilla?.nom ?? null;

    return (
        <ConfigLayout actiu="usuari" esAdmin={esAdmin}>
            {!carregat || carregantTreballador || !user ? (
                <ActivityIndicator color={theme.primary} style={styles.loader} />
            ) : (
                <>
                    <View style={styles.columns}>
                    <View style={styles.colMain}>
                    <UsuariPerfilSection
                        nom={nom}
                        email={user.email}
                        rol={user.rol}
                        jornada={jornada}
                        fotoPerfil={treballador?.Usuari?.fotoPerfil ?? user.fotoPerfil ?? null}
                    />
                    </View>
                    <View style={styles.colSide}>
                    <UsuariAparencaSection />
                    <UsuariContrasenyaSection />
                    </View>
                    </View>
                    <View style={styles.footer}>
                        <Boto label={t('configTancarSessio')} onPress={tancarSessio} variant="danger" />
                    </View>
                </>
            )}
        </ConfigLayout>
    );
}

const styles = StyleSheet.create({
    loader: { paddingVertical: 48 },
    footer: { flexDirection: 'row' },
    columns: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, alignItems: 'flex-start' },
    colMain: { flexGrow: 1, flexShrink: 1, flexBasis: 420, minWidth: 0, gap: 20 },
    colSide: { flexGrow: 1, flexShrink: 1, flexBasis: 420, minWidth: 0, gap: 20 },
});
