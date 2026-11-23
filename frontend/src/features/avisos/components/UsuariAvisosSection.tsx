import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC } from '@/features/home/constants/inicio.constants';
import { useLanguage } from '@/core/i18n';
import { ConfigSection } from '@/features/configuracio/components/ConfigSection';
import { Boto } from '@/features/configuracio/components/Boto';
import { usePush } from '../hooks/usePush';

/** Configuració › Usuari: activar les notificacions push en aquest dispositiu. */
export function UsuariAvisosSection() {
  const { t } = useLanguage();
  const { estat, ocupat, error, activar, desactivar } = usePush();

  const nota =
    estat === 'denegat' ? t('pushDenegat')
    : estat === 'no-suportat' ? t('pushNoSuportat')
    : estat === 'cal-installar' ? t('pushIos')
    : error === 'no-disponible' ? t('pushNoDisponible')
    : error === 'error' ? t('pushError')
    : null;

  return (
    <ConfigSection title={t('pushTitol')}>
      <Text style={styles.text}>{t('pushText')}</Text>
      {estat === 'actiu' ? (
        <View style={styles.row}>
          <View style={styles.actiu}>
            <Ionicons name="checkmark-circle" size={18} color="#0F8A66" />
            <Text style={styles.actiuText}>{t('pushActiu')}</Text>
          </View>
          <Boto label={t('pushDesactivar')} onPress={desactivar} loading={ocupat} />
        </View>
      ) : estat === 'inactiu' ? (
        <View style={styles.row}>
          <Boto label={t('pushActivar')} variant="primary" onPress={activar} loading={ocupat} />
        </View>
      ) : null}
      {nota ? <Text style={styles.nota} accessibilityLiveRegion="polite">{nota}</Text> : null}
    </ConfigSection>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: 14, lineHeight: 20, color: HC.textSecondary },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 },
  actiu: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actiuText: { fontSize: 14, fontWeight: '600', color: '#0F8A66' },
  nota: { fontSize: 13, lineHeight: 19, color: HC.textMuted },
});
