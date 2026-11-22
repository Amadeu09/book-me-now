import { Tabs, usePathname, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, View, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navbar from "@/ui/components/navBar";
import { useTheme } from '@/core/theme/ThemeProvider';
import { StripedBackground } from '@/components/StripedBackground';

const ADMIN_RESTRICTED = ['/services', '/equip', '/horarios', '/estadisticas', '/configuracio-empresa'];

export default function MainLayout() {
    const { width } = useWindowDimensions();
    const isDesktopWeb = Platform.OS === 'web' && width >= 1024;
    const theme = useTheme();
    const router = useRouter();
    const pathname = usePathname();
    const [roleChecked, setRoleChecked] = useState(false);

    useEffect(() => {
        const checkRole = async () => {
            try {
                const raw = await AsyncStorage.getItem('user');
                if (raw) {
                    const user = JSON.parse(raw);
                    if (user?.rol === 'EMPLEAT') {
                        const isRestricted = ADMIN_RESTRICTED.some(r => pathname.startsWith(r));
                        if (isRestricted || pathname === '/') {
                            router.replace('/inici');
                        }
                    }
                }
            } catch {
                // ignore
            } finally {
                setRoleChecked(true);
            }
        };
        checkRole();
    }, []);

    return (
        <View style={{ flex: 1, flexDirection: isDesktopWeb ? 'row' : 'column', backgroundColor: theme.background }}>
            <StripedBackground />
            {isDesktopWeb && (
                <Navbar variant="desktop" />
            )}

            <View style={{ flex: 1, paddingBottom: isDesktopWeb ? 0 : 72 }}>
                <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
                    <Tabs.Screen name="inici" />
                    <Tabs.Screen name="profile" options={{ href: null }} />
                    <Tabs.Screen name="bookings" />
                    <Tabs.Screen name="services" />
                    <Tabs.Screen name="equip" />
                    <Tabs.Screen name="horarios" />
                    <Tabs.Screen name="vacaciones" />
                    <Tabs.Screen name="estadisticas" />
                    <Tabs.Screen name="valoracions-empresa" options={{ href: null }} />
                    <Tabs.Screen name="configuracio-empresa" />
                    <Tabs.Screen name="configuracio-usuari" />
                </Tabs>
            </View>

            {!isDesktopWeb && <Navbar variant="mobile" />}
        </View>
    );
}
