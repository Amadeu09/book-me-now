import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, useWindowDimensions } from 'react-native';
import Navbar from '../../components/navBar';

export default function TabsLayout() {
    const { width } = useWindowDimensions();
    const isDesktopWeb = Platform.OS === 'web' && width >= 1024;

    return (
        <View style={{ flex: 1, flexDirection: isDesktopWeb ? 'row' : 'column', backgroundColor: '#fff' }}>
            {isDesktopWeb && (
                <Navbar variant="desktop" />
            )}

            <View style={{ flex: 1, paddingBottom: isDesktopWeb ? 0 : 72 }}>
                <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
                    <Tabs.Screen name="index" options={{ title: 'Home' }} />
                    <Tabs.Screen name="bookings" options={{ title: 'Reservas' }} />
                    <Tabs.Screen name="services" options={{ title: 'Servicios' }} />
                    <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
                </Tabs>
            </View>

            {!isDesktopWeb && <Navbar variant="mobile" />}
        </View>
    );
}
