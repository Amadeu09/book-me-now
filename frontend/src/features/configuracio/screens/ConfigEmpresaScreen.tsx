import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { HC } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';
import { useUsuariActual } from '@/features/inici/hooks/useUsuariActual';
import { ConfigLayout } from '../components/ConfigLayout';
import { ConfigSection } from '../components/ConfigSection';
import { EmpresaImatgeSection } from '../components/EmpresaImatgeSection';
import { TipusNegociPicker } from '../components/TipusNegociPicker';
import { Field } from '../components/Field';
import { Boto } from '../components/Boto';
import { useEmpresaForm } from '../hooks/useEmpresaForm';

/** Configuració › Empresa (només administradors). */
export default function ConfigEmpresaScreen() {
    const theme = useTheme();
    const { t } = useLanguage();
    const { user } = useUsuariActual();
    const empresaId = user?.empresaId ?? null;
    const { empresa, carregant, form, errors, canviar, desar, descartar, desant, missatge } = useEmpresaForm(empresaId);

    return (
        <ConfigLayout actiu="empresa" esAdmin>
            {carregant || !empresa || empresaId === null ? (
                <ActivityIndicator color={theme.primary} style={styles.loader} />
            ) : (
                <>
                    <View style={styles.columns}>
                    <View style={styles.colSide}>
                    <EmpresaImatgeSection empresaId={empresaId} nom={empresa.nom} fotoPerfil={empresa.fotoPerfil} bannerUrl={empresa.bannerUrl} />

                    <ConfigSection title={t('configReservesOnline')}>
                        <View style={styles.diesRow}>
                            <Field
                                label={t('configDiesAntelacio')}
                                value={form.diasAntesReserva}
                                onChangeText={(v) => canviar('diasAntesReserva', v)}
                                keyboardType="number-pad"
                                error={errors.diasAntesReserva}
                                help={t('configDiesAjuda')}
                            />
                        </View>
                    </ConfigSection>
                    </View>

                    <View style={styles.colMain}>
                    <ConfigSection title={t('configDadesNegoci')}>
                        <View style={styles.grid}>
                            <Field label={t('configNomEmpresa')} value={form.nom} onChangeText={(v) => canviar('nom', v)} error={errors.nom} />
                            <Field label={t('configUbicacio')} value={form.ubicacio} onChangeText={(v) => canviar('ubicacio', v)} error={errors.ubicacio} />
                            <Field label={t('configCapacitat')} value={form.capacitat} onChangeText={(v) => canviar('capacitat', v)} keyboardType="number-pad" error={errors.capacitat} />
                        </View>
                        <TipusNegociPicker value={form.tipo} onChange={(v) => canviar('tipo', v)} />
                        <Field
                            label={t('configDescripcio')}
                            value={form.descripcio}
                            onChangeText={(v) => canviar('descripcio', v)}
                            multiline
                            numberOfLines={3}
                            style={styles.textarea}
                            help={t('configDescripcioAjuda')}
                        />
                    </ConfigSection>
                    </View>
                    </View>

                    <View style={styles.footer}>
                        {missatge ? <Text style={styles.missatge} accessibilityLiveRegion="polite">{missatge}</Text> : <View />}
                        <View style={styles.buttons}>
                            <Boto label={t('configDescartar')} onPress={descartar} disabled={desant} />
                            <Boto label={t('configDesar')} onPress={desar} variant="primary" loading={desant} />
                        </View>
                    </View>
                </>
            )}
        </ConfigLayout>
    );
}

const styles = StyleSheet.create({
    loader: { paddingVertical: 48 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    textarea: { minHeight: 88, textAlignVertical: 'top' },
    diesRow: { maxWidth: 420 },
    columns: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, alignItems: 'flex-start' },
    colSide: { flexGrow: 2, flexShrink: 1, flexBasis: 360, minWidth: 0, gap: 20 },
    colMain: { flexGrow: 3, flexShrink: 1, flexBasis: 480, minWidth: 0, gap: 20 },
    footer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
    buttons: { flexDirection: 'row', gap: 12 },
    missatge: { fontSize: 14, color: HC.textSecondary, flexShrink: 1 },
});
