import React, { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet, type PressableStateCallbackType } from 'react-native';
import { LogoBookMeNow } from './LogoBookMeNow';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';
import type { TranslationKeys } from '@/core/i18n/locales/ca';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export type SidebarItem = {
  key: TranslationKeys;
  icon: IconName;
  activeIcon: IconName;
  path: string;
};

interface SidebarDesktopProps {
  items: SidebarItem[];
  configItems: SidebarItem[];
  user: { nom?: string | null; email?: string; rol?: string; fotoPerfil?: string | null } | null;
  onLogout: () => void;
}

const AMPLE = 256;
const PLEGAT = 80;
const CLAU_PLEGAT = 'sidebarPlegat';

/** Pressable amb estat de hover (react-native-web l'afegeix, però el tipus no l'inclou). */
type EstatPressable = PressableStateCallbackType & { hovered?: boolean };

function inicials(text: string): string {
  return text.split(/[\s@.]/).filter(Boolean).map((p) => p[0]).join('').toUpperCase().slice(0, 2) || 'U';
}

/** Menú lateral d'escriptori: logotip, seccions, Configuració i compte. Es pot plegar. */
export function SidebarDesktop({ items, configItems, user, onLogout }: SidebarDesktopProps) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const { t } = useLanguage();
  const [plegat, setPlegat] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(CLAU_PLEGAT).then((v) => setPlegat(v === '1')).catch(() => undefined);
  }, []);

  const canviarPlegat = () => {
    const nou = !plegat;
    setPlegat(nou);
    AsyncStorage.setItem(CLAU_PLEGAT, nou ? '1' : '0').catch(() => undefined);
  };

  const fonsClar = theme.sidebarBg.toLowerCase() === '#ffffff';
  const hoverBg = fonsClar ? 'rgba(148,163,184,0.12)' : 'rgba(255,255,255,0.10)';
  const vora = fonsClar ? '#E5E7EB' : 'rgba(255,255,255,0.16)';

  const nom = user?.nom || user?.email?.split('@')[0] || t('userFallback');
  const rol = user?.rol === 'ADMIN_GENERAL' ? t('rolAdmin') : t('rolEmpleat');

  const renderItem = (item: SidebarItem) => {
    const actiu = pathname === item.path;
    return (
      <Pressable
        key={item.path}
        onPress={() => router.push(item.path as never)}
        accessibilityRole="link"
        accessibilityLabel={t(item.key)}
        accessibilityState={{ selected: actiu }}
        style={(state) => [
          styles.item,
          plegat && styles.itemPlegat,
          (state as EstatPressable).hovered && !actiu && { backgroundColor: hoverBg },
          actiu && { backgroundColor: theme.sidebarActiveBg },
        ]}
      >
        {actiu && !plegat ? <View style={[styles.accent, { backgroundColor: theme.sidebarText }]} /> : null}
        <Ionicons
          name={actiu ? item.activeIcon : item.icon}
          size={21}
          color={actiu ? theme.sidebarText : theme.sidebarTextInactive}
        />
        {!plegat && (
          <Text style={[styles.itemText, { color: actiu ? theme.sidebarText : theme.sidebarTextInactive }, actiu && styles.itemTextActiu]} numberOfLines={1}>
            {t(item.key)}
          </Text>
        )}
      </Pressable>
    );
  };

  const seccio = (titol: string) =>
    plegat ? (
      <View style={[styles.separador, { backgroundColor: vora }]} />
    ) : (
      <Text style={[styles.seccio, { color: theme.sidebarTextInactive }]}>{titol}</Text>
    );

  return (
    <View style={[styles.container, { width: plegat ? PLEGAT : AMPLE, backgroundColor: theme.sidebarBg, borderRightColor: vora }]}>
      {/* Marca */}
      <View style={[styles.marca, plegat && styles.marcaPlegada]}>
        <Pressable
          onPress={() => router.push('/inici' as never)}
          accessibilityRole="link"
          accessibilityLabel="BookMeNow"
          style={styles.marcaLink}
        >
          <LogoBookMeNow mida={40} />
          {!plegat && (
            <View style={styles.marcaTextos}>
              <Text style={[styles.marcaNom, { color: theme.sidebarText }]}>BookMeNow</Text>
              <Text style={[styles.marcaSub, { color: theme.sidebarTextInactive }]}>{t('navPanel')}</Text>
            </View>
          )}
        </Pressable>
        <Pressable
          onPress={canviarPlegat}
          accessibilityRole="button"
          accessibilityLabel={plegat ? t('navDesplegar') : t('navPlegar')}
          style={(state) => [styles.toggle, { borderColor: vora }, (state as EstatPressable).hovered && { backgroundColor: hoverBg }]}
        >
          <Ionicons name={plegat ? 'chevron-forward' : 'chevron-back'} size={16} color={theme.sidebarTextInactive} />
        </Pressable>
      </View>

      {/* Navegació */}
      <ScrollView style={styles.nav} contentContainerStyle={styles.navContent} showsVerticalScrollIndicator={false}>
        {seccio(t('navSeccioPrincipal'))}
        {items.map(renderItem)}
        {seccio(t('navConfiguracio'))}
        {configItems.map(renderItem)}
      </ScrollView>

      {/* Compte */}
      {user && (
        <View style={[styles.compte, plegat && styles.comptePlegat, { borderTopColor: vora }]}>
          <Pressable
            onPress={() => router.push('/configuracio-usuari' as never)}
            accessibilityRole="link"
            accessibilityLabel={t('navUsuari')}
            style={(state) => [styles.compteLink, plegat && styles.compteLinkPlegat, (state as EstatPressable).hovered && { backgroundColor: hoverBg }]}
          >
            <View style={[styles.avatar, { backgroundColor: theme.sidebarActiveBg }]}>
              {user.fotoPerfil ? (
                <Image source={{ uri: user.fotoPerfil }} style={styles.avatarImg} />
              ) : (
                <Text style={[styles.avatarText, { color: theme.sidebarText }]}>{inicials(nom)}</Text>
              )}
            </View>
            {!plegat && (
              <View style={styles.compteTextos}>
                <Text style={[styles.compteNom, { color: theme.sidebarText }]} numberOfLines={1}>{nom}</Text>
                <Text style={[styles.compteRol, { color: theme.sidebarTextInactive }]} numberOfLines={1}>{rol}</Text>
              </View>
            )}
          </Pressable>
          <Pressable
            onPress={onLogout}
            accessibilityRole="button"
            accessibilityLabel={t('logout')}
            style={(state) => [styles.logout, (state as EstatPressable).hovered && { backgroundColor: hoverBg }]}
          >
            <Ionicons name="log-out-outline" size={20} color={theme.sidebarTextInactive} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: '100%', borderRightWidth: 1, paddingTop: 18, paddingHorizontal: 12, zIndex: 50 },
  marca: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, marginBottom: 18, gap: 8 },
  marcaPlegada: { flexDirection: 'column', gap: 12 },
  marcaLink: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1, minWidth: 0 },
  marcaTextos: { flexShrink: 1, minWidth: 0 },
  marcaNom: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  marcaSub: { fontSize: 12, marginTop: 1 },
  toggle: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  nav: { flex: 1, marginHorizontal: -12 },
  navContent: { gap: 2, paddingHorizontal: 12, paddingBottom: 12 },
  seccio: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: 12, marginTop: 14, marginBottom: 6 },
  separador: { height: 1, marginVertical: 12, marginHorizontal: 8 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 42, paddingHorizontal: 12, borderRadius: 10, position: 'relative' },
  itemPlegat: { justifyContent: 'center', paddingHorizontal: 0 },
  accent: { position: 'absolute', left: -12, top: 9, bottom: 9, width: 3, borderTopRightRadius: 3, borderBottomRightRadius: 3 },
  itemText: { fontSize: 14, fontWeight: '500', flexShrink: 1 },
  itemTextActiu: { fontWeight: '600' },
  compte: { flexDirection: 'row', alignItems: 'center', gap: 4, borderTopWidth: 1, paddingVertical: 12, marginHorizontal: -4 },
  comptePlegat: { flexDirection: 'column', gap: 6 },
  compteLink: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 6, borderRadius: 10, minWidth: 0 },
  compteLinkPlegat: { flex: 0 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImg: { width: 38, height: 38 },
  avatarText: { fontSize: 14, fontWeight: '700' },
  compteTextos: { flex: 1, minWidth: 0 },
  compteNom: { fontSize: 14, fontWeight: '600' },
  compteRol: { fontSize: 12, marginTop: 1 },
  logout: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
