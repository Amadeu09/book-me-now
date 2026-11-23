import React, { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { HC } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { tintPrimari } from '@/core/theme/tint';
import { useLanguage } from '@/core/i18n';
import { useAvisos, useMarcarAvisos } from '../hooks/useAvisos';
import type { Avis } from '../services/avisos.service';
import { tempsRelatiu } from './temps';

const ICONES: Record<string, { nom: React.ComponentProps<typeof Ionicons>['name']; color: string; bg: string }> = {
  RESERVA_NOVA: { nom: 'calendar-outline', color: '#0F8A66', bg: '#E3F7EF' },
  RESERVA_CANCELLADA: { nom: 'close-circle-outline', color: '#B42318', bg: '#FDECEA' },
  RESERVA_CANVIADA: { nom: 'swap-horizontal-outline', color: '#8A5300', bg: '#FFF1DC' },
};

/** Campana amb els avisos de reserves. Es posa a la capçalera de les pantalles. */
export function CampanaAvisos({ sobreColor }: { sobreColor: boolean }) {
  const theme = useTheme();
  const router = useRouter();
  const { t, lang } = useLanguage();
  const { width } = useWindowDimensions();
  const esDesktop = width >= 768;
  const avisos = useAvisos();
  const marcar = useMarcarAvisos();
  const [obert, setObert] = useState(false);
  const noLlegides = avisos.data?.noLlegides ?? 0;
  const colorIcona = sobreColor ? '#FFFFFF' : HC.textPrimary;

  const obrir = (a: Avis) => {
    if (!a.llegida) marcar.mutate(a.id);
    setObert(false);
    router.push('/bookings');
  };

  return (
    <>
      <Pressable
        onPress={() => setObert(true)}
        accessibilityRole="button"
        accessibilityLabel={`${t('avisosObrir')}${noLlegides ? `, ${t('avisosNoLlegits').replace('{n}', String(noLlegides))}` : ''}`}
        style={[styles.boto, { backgroundColor: sobreColor ? 'rgba(255,255,255,0.16)' : HC.card, borderColor: sobreColor ? 'rgba(255,255,255,0.25)' : HC.border }]}
      >
        <Ionicons name={noLlegides ? 'notifications' : 'notifications-outline'} size={20} color={colorIcona} />
        {noLlegides > 0 ? (
          <View style={styles.badge}><Text style={styles.badgeText}>{noLlegides > 9 ? '9+' : noLlegides}</Text></View>
        ) : null}
      </Pressable>

      <Modal visible={obert} transparent animationType={esDesktop ? 'fade' : 'slide'} onRequestClose={() => setObert(false)}>
        <Pressable style={styles.fons} onPress={() => setObert(false)} accessibilityLabel={t('equipTancar')}>
          <Pressable
            onPress={() => undefined}
            style={[styles.panell, esDesktop ? styles.panellDesktop : styles.panellMobil]}
            accessibilityViewIsModal
          >
            <View style={styles.cap}>
              <Text style={styles.titol} accessibilityRole="header">{t('avisosTitol')}</Text>
              <View style={styles.capAccions}>
                {noLlegides > 0 ? (
                  <Pressable onPress={() => marcar.mutate(undefined)} accessibilityRole="button" style={styles.marcar}>
                    <Text style={[styles.marcarText, { color: theme.primary }]}>{t('avisosMarcarTots')}</Text>
                  </Pressable>
                ) : null}
                <Pressable onPress={() => setObert(false)} accessibilityRole="button" accessibilityLabel={t('equipTancar')} style={styles.tancar}>
                  <Ionicons name="close" size={20} color={HC.textMuted} />
                </Pressable>
              </View>
            </View>
            <FlatList
              data={avisos.data?.data ?? []}
              keyExtractor={(a) => String(a.id)}
              style={styles.llista}
              renderItem={({ item }) => {
                const ic = ICONES[item.tipus] ?? ICONES.RESERVA_NOVA;
                return (
                  <Pressable
                    onPress={() => obrir(item)}
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.item, !item.llegida && { backgroundColor: tintPrimari(theme, '0F') }, pressed && { opacity: 0.8 }]}
                  >
                    <View style={[styles.icona, { backgroundColor: ic.bg }]}><Ionicons name={ic.nom} size={18} color={ic.color} /></View>
                    <View style={styles.itemText}>
                      <Text style={[styles.itemTitol, !item.llegida && styles.noLlegit]}>{item.titol}</Text>
                      <Text style={styles.itemCos} numberOfLines={2}>{item.cos}</Text>
                      <Text style={styles.itemTemps}>{tempsRelatiu(item.createdAt, t, lang)}</Text>
                    </View>
                    {!item.llegida ? <View style={[styles.punt, { backgroundColor: theme.primary }]} accessibilityLabel="•" /> : null}
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <View style={styles.buit}>
                  <Ionicons name="notifications-off-outline" size={28} color={HC.textLight} />
                  <Text style={styles.buitTitol}>{t('avisosBuit')}</Text>
                  <Text style={styles.buitText}>{t('avisosBuitText')}</Text>
                </View>
              }
            />
            <Pressable onPress={() => { setObert(false); router.push('/configuracio-usuari'); }} accessibilityRole="link" style={styles.peu}>
              <Ionicons name="phone-portrait-outline" size={16} color={theme.primary} />
              <Text style={[styles.peuText, { color: theme.primary }]}>{t('avisosActivarDispositiu')}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  boto: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -4, right: -4, minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 5, backgroundColor: '#E5352A', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  fons: { flex: 1, backgroundColor: 'rgba(15,23,42,0.35)' },
  panell: { backgroundColor: HC.card, overflow: 'hidden' },
  panellDesktop: { position: 'absolute', top: 76, right: 24, width: 400, maxHeight: 560, borderRadius: 16, borderWidth: 1, borderColor: HC.border, shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 30, shadowOffset: { width: 0, height: 16 } },
  panellMobil: { position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '85%', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  cap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: HC.borderSoft },
  titol: { fontSize: 17, fontWeight: '700', color: HC.textPrimary },
  capAccions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  marcar: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 8 },
  marcarText: { fontSize: 13, fontWeight: '600' },
  tancar: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  llista: { flexGrow: 0 },
  item: { flexDirection: 'row', gap: 12, paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: HC.borderSoft, alignItems: 'flex-start' },
  icona: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  itemText: { flex: 1, gap: 2 },
  itemTitol: { fontSize: 14, fontWeight: '600', color: HC.textPrimary },
  noLlegit: { fontWeight: '800' },
  itemCos: { fontSize: 13, color: HC.textSecondary, lineHeight: 18 },
  itemTemps: { fontSize: 12, color: HC.textMuted, marginTop: 2 },
  punt: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  buit: { alignItems: 'center', gap: 6, padding: 28 },
  buitTitol: { fontSize: 15, fontWeight: '700', color: HC.textPrimary },
  buitText: { fontSize: 13, color: HC.textMuted, textAlign: 'center', lineHeight: 19 },
  peu: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 48, borderTopWidth: 1, borderTopColor: HC.borderSoft },
  peuText: { fontSize: 13, fontWeight: '600' },
});
