import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Image,
  useWindowDimensions,
  Platform,
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

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await AsyncStorage.getItem('user');
        if (u) {
          setUser(JSON.parse(u));
        }
      } catch (err) {
        // ignore
      }
    };
    loadUser();
  }, [pathname]);

  const isEmpleat = user?.rol === 'EMPLEAT';
  const NAV_ITEMS = isEmpleat
    ? ALL_NAV_ITEMS.filter(item => !item.adminOnly)
    : ALL_NAV_ITEMS;

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'user']);
      router.replace('/login');
    } catch (err) {
      console.error('Logout error', err);
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

      {/* ===========================
          HEADER WEB EXPANDIDO
         =========================== */}
      {isDesktopWeb && !collapsed && (
        <View style={styles.webHeaderRow}>
          <View style={styles.webHeaderTextContainer}>
            <Text style={[styles.webLogo, { color: theme.headerText }]}>BookMeNow</Text>
            <Text style={[styles.webSubtitle, { color: theme.headerSubtitle }]}>Panel</Text>
          </View>

          <TouchableOpacity
            onPress={() => setCollapsed(true)}
            style={styles.toggleButtonHeader}
          >
            <Ionicons name="chevron-back" size={22} color={theme.sidebarText} />
          </TouchableOpacity>
        </View>
      )}

      {/* ===========================
          HEADER WEB COLAPSADO
         =========================== */}
      {isDesktopWeb && collapsed && (
        <TouchableOpacity
          onPress={() => setCollapsed(false)}
          style={styles.toggleButtonCollapsed}
        >
          <Ionicons name="chevron-forward" size={22} color={theme.sidebarText} />
        </TouchableOpacity>
      )}

      {/* ===========================
          NAV ITEMS
         =========================== */}
      <View style={isDesktopWeb ? styles.navListWeb : styles.navListMobile}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          const iconName = isActive ? item.activeIcon : item.icon;

          return (
            <TouchableOpacity
              key={item.path}
              activeOpacity={0.8}
              onPress={() => router.push(item.path as any)}
              style={[
                styles.navItemBase,
                isDesktopWeb ? styles.navItemWeb : styles.navItemMobile,
                collapsed && isDesktopWeb && styles.navItemCollapsed,
                isActive && isDesktopWeb && { backgroundColor: theme.sidebarActiveBg, borderWidth: 1, borderColor: theme.sidebarActiveBorder },
              ]}
            >
              <Ionicons
                name={iconName}
                size={24}
                color={isActive ? theme.sidebarText : theme.sidebarTextInactive}
                style={isDesktopWeb ? styles.iconLeft : {}}
              />

              {/* Texto solo si NO está colapsado */}
              {!collapsed && (
                <Text
                  style={[
                    styles.navText,
                    { color: isActive ? theme.sidebarText : theme.sidebarTextInactive }
                  ]}
                >
                  {item.name}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ===========================
          PERFIL USUARIO WEB (Bottom)
         =========================== */}
      {isDesktopWeb && user && (
        <View style={[styles.profileContainerWeb, collapsed && styles.profileContainerCollapsed, { backgroundColor: theme.sidebarBg, borderTopColor: theme.sidebarActiveBorder }]}>
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

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 50,
    borderColor: 'rgba(148, 163, 184, 0.25)',
  },

  // MOBILE (bottom bar)
  containerMobile: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
  },

  // WEB (sidebar)
  containerWeb: {
    top: 0,
    bottom: 0,
    left: 0,
    borderRightWidth: 1,
    paddingTop: 20,
    paddingHorizontal: 10,
  },

  /* ----------------------  
        HEADER WEB
     ---------------------- */

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

  /* ----------------------  
        NAV ITEMS
     ---------------------- */

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

  navTextInactive: {
    color: '#6b7280',
  },

  navTextActive: {
    color: '#0f172a',
  },

  /* ----------------------  
        PERFIL WEB (Bottom)
     ---------------------- */
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
});
