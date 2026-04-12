import { Tabs, usePathname, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, View, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navbar from "@/ui/components/navBar";
import { useTheme } from '@/core/theme/ThemeProvider';
import { StripedBackground } from '@/components/StripedBackground';

const EMPLEAT_ROUTES = ['/bookings', '/profile', '/vacaciones'];
const ADMIN_RESTRICTED = ['/home', '/services', '/horarios'];

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
                            router.replace('/profile');
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
