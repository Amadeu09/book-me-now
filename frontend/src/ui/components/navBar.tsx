import React, { useState, useEffect } from 'react';
import { clearSession, getUser } from '@/utils/session';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Image,
  useWindowDimensions,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/core/theme/ThemeProvider';

const ALL_NAV_ITEMS = [
  { name: 'Perfil', icon: 'person-outline', activeIcon: 'person', path: '/profile', adminOnly: false },
  { name: 'Reservas', icon: 'calendar-outline', activeIcon: 'calendar', path: '/bookings', adminOnly: false },
  { name: 'Servicios', icon: 'grid-outline', activeIcon: 'grid', path: '/services', adminOnly: true },
  { name: 'Horarios y disponibilidad', icon: 'time-outline', activeIcon: 'time', path: '/horarios', adminOnly: true },
  { name: 'Vacaciones', icon: 'sunny-outline', activeIcon: 'sunny', path: '/vacaciones', adminOnly: false },
  { name: 'Estadísticas', icon: 'bar-chart-outline', activeIcon: 'bar-chart', path: '/estadisticas', adminOnly: true },
];

type MobileNavItem = {
  name: string;
  icon: string;
  activeIcon: string;
  path?: string;
  adminOnly: boolean;
  activePaths?: string[];
  isSheet?: boolean;
};

const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  { name: 'Perfil',       icon: 'person-outline',    activeIcon: 'person',    path: '/profile',    adminOnly: false },
  { name: 'Reserves',     icon: 'calendar-outline',  activeIcon: 'calendar',  path: '/bookings',   adminOnly: false },
  { name: 'Manteniment',  icon: 'construct-outline', activeIcon: 'construct', adminOnly: true, activePaths: ['/services', '/horarios'], isSheet: true },
  { name: 'Vacances',     icon: 'sunny-outline',     activeIcon: 'sunny',     path: '/vacaciones', adminOnly: false },
  { name: 'Estadísticas', icon: 'bar-chart-outline', activeIcon: 'bar-chart', path: '/estadisticas', adminOnly: true },
];

const MANTENIMENT_ITEMS = [
  { icon: 'grid-outline' as const, label: 'Serveis', path: '/services' },
  { icon: 'time-outline' as const, label: 'Horaris i disponibilitat', path: '/horarios' },
];

type NavbarProps = {
  variant?: 'desktop' | 'mobile';
};

export default function Navbar({ variant }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const isDesktopWeb = variant === 'desktop' || (variant !== 'mobile' && Platform.OS === 'web' && width >= 1024);

  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mantenimentSheetOpen, setMantenimentSheetOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await getUser();
        if (u) setUser(u);
      } catch {
        // ignore
      }
    };
    loadUser();
  }, [pathname]);

  const isEmpleat = user?.rol === 'EMPLEAT';
  const desktopItems = isEmpleat ? ALL_NAV_ITEMS.filter(i => !i.adminOnly) : ALL_NAV_ITEMS;
  const mobileItems = isEmpleat ? MOBILE_NAV_ITEMS.filter(i => !i.adminOnly) : MOBILE_NAV_ITEMS;

  const handleLogout = async () => {
    try {
      await clearSession();
      router.replace('/login');
    } catch (err) {
      if (__DEV__) console.error('Logout error', err);
    }
  };

  const sidebarWidth = collapsed ? 70 : 240;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.sidebarBg },
        isDesktopWeb
          ? { ...styles.containerWeb, width: sidebarWidth, position: 'relative' }
          : { ...styles.containerMobile, paddingBottom: insets.bottom || 8 },
      ]}
    >
      {/* HEADER WEB EXPANDIDO */}
      {isDesktopWeb && !collapsed && (
        <View style={styles.webHeaderRow}>
          <View style={styles.webHeaderTextContainer}>
            <Text style={[styles.webLogo, { color: theme.headerText }]}>BookMeNow</Text>
            <Text style={[styles.webSubtitle, { color: theme.headerSubtitle }]}>Panel</Text>
          </View>
          <TouchableOpacity onPress={() => setCollapsed(true)} style={styles.toggleButtonHeader}>
            <Ionicons name="chevron-back" size={22} color={theme.sidebarText} />
          </TouchableOpacity>
        </View>
      )}

      {/* HEADER WEB COLAPSADO */}
      {isDesktopWeb && collapsed && (
        <TouchableOpacity onPress={() => setCollapsed(false)} style={styles.toggleButtonCollapsed}>
          <Ionicons name="chevron-forward" size={22} color={theme.sidebarText} />
        </TouchableOpacity>
      )}

      {/* NAV ITEMS — Desktop sidebar */}
      {isDesktopWeb && (
        <View style={styles.navListWeb}>
          {desktopItems.map((item) => {
            const isActive = pathname === item.path;
            const iconName = isActive ? item.activeIcon : item.icon;
            return (
              <TouchableOpacity
                key={item.path}
                activeOpacity={0.8}
                onPress={() => router.push(item.path as any)}
                style={[
                  styles.navItemBase,
                  styles.navItemWeb,
                  collapsed && styles.navItemCollapsed,
                  isActive && { backgroundColor: theme.sidebarActiveBg, borderWidth: 1, borderColor: theme.sidebarActiveBorder },
                ]}
              >
                <Ionicons
                  name={iconName as any}
                  size={24}
                  color={isActive ? theme.sidebarText : theme.sidebarTextInactive}
                  style={styles.iconLeft}
                />
                {!collapsed && (
                  <Text style={[styles.navText, { color: isActive ? theme.sidebarText : theme.sidebarTextInactive }]}>
                    {item.name}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* NAV ITEMS — Mobile bottom bar */}
      {!isDesktopWeb && (
        <View style={styles.navListMobile}>
          {mobileItems.map((item) => {
            const isActive = item.activePaths
              ? item.activePaths.includes(pathname)
              : pathname === item.path;
            const iconName = isActive ? item.activeIcon : item.icon;
            return (
              <TouchableOpacity
                key={item.name}
                activeOpacity={0.8}
                onPress={() => {
                  if (item.isSheet) {
                    setMantenimentSheetOpen(true);
                  } else if (item.path) {
                    router.push(item.path as any);
                  }
                }}
                style={[styles.navItemBase, styles.navItemMobile]}
              >
                <Ionicons
                  name={iconName as any}
                  size={24}
                  color={isActive ? theme.sidebarText : theme.sidebarTextInactive}
                />
                <Text style={[styles.mobileNavText, { color: isActive ? theme.sidebarText : theme.sidebarTextInactive }]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* PERFIL USUARIO WEB (Bottom) */}
      {isDesktopWeb && user && (
        <View style={[
          styles.profileContainerWeb,
          collapsed && styles.profileContainerCollapsed,
          { backgroundColor: theme.sidebarBg, borderTopColor: theme.sidebarActiveBorder },
        ]}>
          <View style={[styles.avatarCircle, { backgroundColor: theme.sidebarActiveBg }]}>
            {user?.fotoPerfil ? (
              <Image source={{ uri: user.fotoPerfil }} style={styles.avatarImage} />
            ) : (
              <Text style={[styles.avatarText, { color: theme.sidebarText }]}>
                {user?.email?.[0]?.toUpperCase() ?? 'U'}
              </Text>
            )}
          </View>
          {!collapsed && (
            <View style={styles.profileTextContainer}>
              <Text style={[styles.profileName, { color: theme.sidebarText }]} numberOfLines={1}>{user?.nom}</Text>
              <Text style={[styles.profileEmail, { color: theme.sidebarTextInactive }]} numberOfLines={1}>{user?.email}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={theme.sidebarTextInactive} />
          </TouchableOpacity>
        </View>
      )}

      {/* MANTENIMENT BOTTOM SHEET */}
      {!isDesktopWeb && (
        <Modal
          visible={mantenimentSheetOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setMantenimentSheetOpen(false)}
        >
          <View style={styles.sheetOverlay}>
            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={1}
              onPress={() => setMantenimentSheetOpen(false)}
            />
            <View style={[styles.sheet, { paddingBottom: insets.bottom || 16 }]}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Manteniment</Text>
              {MANTENIMENT_ITEMS.map((si) => (
                <TouchableOpacity
                  key={si.path}
                  style={styles.sheetRow}
                  onPress={() => {
                    setMantenimentSheetOpen(false);
                    router.push(si.path as any);
                  }}
                >
                  <Ionicons name={si.icon} size={24} color="#0f172a" />
                  <Text style={styles.sheetRowText}>{si.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.sheetCancelBtn}
                onPress={() => setMantenimentSheetOpen(false)}
              >
                <Text style={styles.sheetCancelText}>Cancel·lar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 50,
    borderColor: 'rgba(148, 163, 184, 0.25)',
  },

  containerMobile: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
  },

  containerWeb: {
    top: 0,
    bottom: 0,
    left: 0,
    borderRightWidth: 1,
    paddingTop: 20,
    paddingHorizontal: 10,
  },

  webHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingRight: 10,
  },

  webHeaderTextContainer: {
    flexDirection: 'column',
  },

  webLogo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },

  webSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },

  toggleButtonHeader: {
    padding: 6,
    borderRadius: 6,
  },

  toggleButtonCollapsed: {
    alignSelf: 'flex-end',
    padding: 6,
    marginBottom: 20,
  },

  navListMobile: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  navListWeb: {
    flexDirection: 'column',
    gap: 4,
  },

  navItemBase: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },

  navItemWeb: {
    justifyContent: 'flex-start',
    gap: 12,
  },

  navItemCollapsed: {
    justifyContent: 'center',
  },

  navItemWebActive: {
    backgroundColor: 'rgba(226, 232, 240, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.6)',
  },

  navItemMobile: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 6,
  },

  iconLeft: {
    marginRight: 4,
  },

  navText: {
    fontSize: 14,
    fontWeight: '600',
  },

  mobileNavText: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },

  navTextInactive: {
    color: '#6b7280',
  },

  navTextActive: {
    color: '#0f172a',
  },

  profileContainerWeb: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.4)',
    paddingTop: 15,
    paddingBottom: 20,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileContainerCollapsed: {
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 15,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  profileTextContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  profileName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  profileEmail: {
    fontSize: 11,
    color: '#64748b',
  },
  logoutButton: {
    padding: 6,
    borderRadius: 8,
  },

  // Bottom sheet
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center',
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9',
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9',
  },
  sheetRowText: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '500',
    flex: 1,
  },
  sheetCancelBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  sheetCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
});
