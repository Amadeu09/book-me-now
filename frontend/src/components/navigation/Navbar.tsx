import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { BlurView } from 'expo-blur';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { name: 'Inicio', icon: 'home-outline', route: '/home' },
    { name: 'Reservas', icon: 'calendar-outline', route: '/bookings' },
    { name: 'Servicios', icon: 'briefcase-outline', route: '/services' },
    { name: 'Perfil', icon: 'person-outline', route: '/profile' },
  ];

  return (
    <BlurView intensity={80} tint="dark" style={styles.navbar}>
      <View style={styles.navbarInner}>
        {navItems.map((item) => {
          const isActive = pathname === item.route;
          return (
            <TouchableOpacity
              key={item.route}
              style={styles.navItem}
              onPress={() => router.push(item.route as any)}
            >
              <Ionicons
                name={(isActive ? item.icon.replace('-outline', '') : item.icon) as any}
                size={24}
                color={isActive ? '#f472b6' : 'rgba(255,255,255,0.6)'}
              />
              <Text style={[styles.navText, isActive && styles.navTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  navbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  navbarInner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  navText: {
    fontSize: 11,
    marginTop: 4,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  navTextActive: {
    color: '#f472b6',
  },
});
