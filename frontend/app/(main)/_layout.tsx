import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, useWindowDimensions } from 'react-native';
import Navbar from "@/ui/components/navBar";
import { HC } from "@/features/home/constants/inicio.constants";
import { useTheme } from '@/core/theme/ThemeProvider';

export default function MainLayout() {
    const { width } = useWindowDimensions();
    const isDesktopWeb = Platform.OS === 'web' && width >= 1024;
    const theme = useTheme();

    return (
        <View style={{ flex: 1, flexDirection: isDesktopWeb ? 'row' : 'column', backgroundColor: theme.background }}>
            {isDesktopWeb && (
                <Navbar variant="desktop" />
            )}

            <View style={{ flex: 1, paddingBottom: isDesktopWeb ? 0 : 72 }}>
                <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
                    <Tabs.Screen name="home" />
                    <Tabs.Screen name="bookings" />
                    <Tabs.Screen name="services" />
                    <Tabs.Screen name="profile" />
                    <Tabs.Screen name="horarios" />
                    <Tabs.Screen name="vacaciones" />
                </Tabs>
            </View>

            {!isDesktopWeb && <Navbar variant="mobile" />}
        </View>
    );
}
