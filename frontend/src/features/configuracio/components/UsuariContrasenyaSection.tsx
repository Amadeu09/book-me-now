import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HC } from '@/features/home/constants/inicio.constants';
import { useLanguage } from '@/core/i18n';
import { changePassword } from '@/features/profile/services/profile.service';
import { ConfigSection } from './ConfigSection';
import { Field } from './Field';
import { Boto } from './Boto';

const REQUISITS = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export function UsuariContrasenyaSection() {
    const { t } = useLanguage();
    const [actual, setActual] = useState('');
    const [nova, setNova] = useState('');
    const [repeticio, setRepeticio] = useState('');
    const [error, setError] = useState('');
    const [ok, setOk] = useState(false);
    const [desant, setDesant] = useState(false);

    const canviar = async () => {
        setError('');
        setOk(false);
        if (!actual) return setError(t('currentPasswordRequired'));
        if (!nova) return setError(t('newPasswordRequired'));
        if (nova !== repeticio) return setError(t('passwordMismatch'));
        if (!REQUISITS.test(nova)) return setError(t('configContrasenyaAjuda'));
        setDesant(true);
        try {
            await changePassword(actual, nova);
            setActual('');
            setNova('');
            setRepeticio('');
            setOk(true);
        } catch (err: any) {
            const msg = err?.response?.data?.message;
            setError(Array.isArray(msg) ? msg.join(', ') : msg || t('profileUpdateError'));
        } finally {
            setDesant(false);
        }
    };

    return (
        <ConfigSection title={t('configContrasenya')}>
            <View style={styles.grid}>
                <Field label={t('currentPassword')} value={actual} onChangeText={setActual} secureTextEntry autoComplete="current-password" />
                <Field label={t('newPassword')} value={nova} onChangeText={setNova} secureTextEntry autoComplete="new-password" />
                <Field label={t('configRepeteix')} value={repeticio} onChangeText={setRepeticio} secureTextEntry autoComplete="new-password" />
            </View>
            {error ? (
                <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text>
            ) : ok ? (
                <Text style={styles.ok} accessibilityLiveRegion="polite">{t('configContrasenyaCanviada')}</Text>
            ) : (
                <Text style={styles.help}>{t('configContrasenyaAjuda')}</Text>
            )}
            <View style={styles.row}>
                <Boto label={t('configCanviarContrasenya')} onPress={canviar} loading={desant} />
            </View>
        </ConfigSection>
    );
}

const styles = StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    help: { fontSize: 12, color: HC.textMuted },
    error: { fontSize: 13, color: HC.statusRedText },
    ok: { fontSize: 13, color: HC.statusGreenText },
    row: { flexDirection: 'row' },
});
