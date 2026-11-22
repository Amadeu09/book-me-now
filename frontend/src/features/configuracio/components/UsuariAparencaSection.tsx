import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { HC } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';
import { updateMyColor, updateMyIdioma } from '@/features/profile/services/profile.service';
import { getUser, patchStoredUser } from '@/utils/session';
import { ConfigSection } from './ConfigSection';

/** Mateixa paleta que fins ara al perfil. `null` = color per defecte. */
const PALETA: { nom: string; valor: string | null }[] = [
    { nom: 'Per defecte', valor: null },
    { nom: 'Pissarra', valor: '#5B7A96' },
    { nom: 'Índigo', valor: '#6264A0' },
    { nom: 'Lavanda', valor: '#7B5E9A' },
    { nom: 'Rosa', valor: '#9E5A72' },
    { nom: 'Corall', valor: '#B55E54' },
    { nom: 'Terracota', valor: '#A86040' },
    { nom: 'Ocre', valor: '#9B7030' },
    { nom: 'Oliva', valor: '#6C7E4A' },
    { nom: 'Sàlvia', valor: '#4A7E68' },
    { nom: 'Teal', valor: '#3E7C7E' },
    { nom: 'Marí', valor: '#3E587A' },
];

/** El color i l'idioma s'apliquen i es desen en tocar-los. */
export function UsuariAparencaSection() {
    const theme = useTheme();
    const { t, lang, setLang } = useLanguage();
    const [color, setColor] = useState<string | null>(null);

    useEffect(() => {
        getUser().then((u) => setColor(u?.colorPrimari ?? null));
    }, []);

    const triarColor = async (valor: string | null) => {
        const anterior = color;
        setColor(valor);
        theme.setPrimaryColor(valor);
        try {
            await updateMyColor(valor);
            await patchStoredUser({ colorPrimari: valor ?? undefined });
        } catch {
            setColor(anterior);
            theme.setPrimaryColor(anterior);
            Alert.alert(t('error'), t('profileUpdateError'));
        }
    };

    const triarIdioma = async (nou: 'ca' | 'es') => {
        if (nou === lang) return;
        const anterior = lang;
        setLang(nou);
        try {
            await updateMyIdioma(nou);
            await patchStoredUser({ idioma: nou });
        } catch {
            setLang(anterior);
            Alert.alert(t('error'), t('profileUpdateError'));
        }
    };

    return (
        <ConfigSection title={t('configAparenca')}>
            <View style={styles.field}>
                <Text style={styles.label}>{t('appColor')}</Text>
                <View style={styles.swatches} accessibilityRole="radiogroup">
                    {PALETA.map((p) => {
                        const sel = p.valor === color;
                        return (
                            <TouchableOpacity
                                key={p.nom}
                                onPress={() => triarColor(p.valor)}
                                accessibilityRole="radio"
                                accessibilityLabel={p.valor ? p.nom : t('configColorDefecte')}
                                accessibilityState={{ checked: sel }}
                                style={[styles.swatchRing, sel && styles.swatchRingSel]}
                            >
                                <View style={[styles.swatch, { backgroundColor: p.valor ?? HC.primary }]} />
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
            <View style={styles.field}>
                <Text style={styles.label}>{t('language')}</Text>
                <View style={styles.langs} accessibilityRole="radiogroup">
                    {(['ca', 'es'] as const).map((l) => {
                        const sel = l === lang;
                        return (
                            <TouchableOpacity
                                key={l}
                                onPress={() => triarIdioma(l)}
                                accessibilityRole="radio"
                                accessibilityState={{ checked: sel }}
                                style={[styles.lang, sel && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                            >
                                <Text style={[styles.langText, sel && { color: theme.textOnPrimary, fontWeight: '600' }]}>
                                    {l === 'ca' ? t('langCa') : t('langEs')}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </ConfigSection>
    );
}

const styles = StyleSheet.create({
    field: { gap: 8 },
    label: { fontSize: 13, fontWeight: '600', color: HC.textSecondary },
    swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    swatchRing: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
    swatchRingSel: { borderColor: HC.textPrimary },
    swatch: { width: 32, height: 32, borderRadius: 16 },
    langs: { flexDirection: 'row', gap: 8 },
    lang: { paddingHorizontal: 18, paddingVertical: 10, minHeight: 44, borderRadius: 10, borderWidth: 1, borderColor: HC.border, backgroundColor: HC.card, justifyContent: 'center' },
    langText: { fontSize: 14, color: HC.textSecondary },
});
