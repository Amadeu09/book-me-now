import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NAV_ITEMS = [
  { name: 'Inicio', icon: 'home-outline', activeIcon: 'home', path: '/home' },
  { name: 'Reservas', icon: 'calendar-outline', activeIcon: 'calendar', path: '/bookings' },
  { name: 'Servicios', icon: 'grid-outline', activeIcon: 'grid', path: '/services' },
  { name: 'Perfil', icon: 'person-outline', activeIcon: 'person', path: '/profile' },
  { name: 'Horarios y disponibilidad', icon: 'time-outline', activeIcon: 'time', path: '/horarios' },
] as const;

type NavbarProps = {
  variant?: 'desktop' | 'mobile';
};

export default function Navbar({ variant }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isDesktopWeb = variant === 'desktop' || (variant !== 'mobile' && Platform.OS === 'web' && width >= 1024);

  const [collapsed, setCollapsed] = useState(false);

  const sidebarWidth = collapsed ? 70 : 240;

  return (
    <BlurView
      intensity={80}
      tint="light"
      style={[
        styles.container,
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
            <Text style={styles.webLogo}>BookMeNow</Text>
            <Text style={styles.webSubtitle}>Panel</Text>
          </View>

          <TouchableOpacity
            onPress={() => setCollapsed(true)}
            style={styles.toggleButtonHeader}
          >
            <Ionicons name="chevron-back" size={22} color="#334155" />
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
          <Ionicons name="chevron-forward" size={22} color="#334155" />
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
                isActive && isDesktopWeb && styles.navItemWebActive,
              ]}
            >
              <Ionicons
                name={iconName}
                size={24}
                color={isActive ? '#0f172a' : '#6b7280'}
                style={isDesktopWeb ? styles.iconLeft : {}}
              />

              {/* Texto solo si NO está colapsado */}
              {!collapsed && (
                <Text
                  style={[
                    styles.navText,
                    isActive ? styles.navTextActive : styles.navTextInactive,
                  ]}
                >
                  {item.name}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 50,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
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
});
