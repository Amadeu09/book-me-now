import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/core/theme/ThemeProvider';

interface ScreenHeaderProps {
    title: string;
    subtitle?: string;
    /** Icona d'Ionicons que identifica la secció. */
    icon?: React.ComponentProps<typeof Ionicons>['name'];
    /** Accions o elements a la dreta (botons, avatar...). */
    right?: React.ReactNode;
}

/** Amplada màxima del contingut de les pantalles; la capçalera s'hi alinea. */
export const SCREEN_MAX_WIDTH = 1440;

/**
 * Capçalera comuna de totes les pantalles de l'app de gestió.
 * Pren els colors de l'empresa (headerBg / headerText) del tema.
 */
export function ScreenHeader({ title, subtitle, icon, right }: ScreenHeaderProps) {
    const theme = useTheme();
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const headerClar = theme.headerBg.toLowerCase() === '#ffffff';

    return (
        <View
            style={[
                styles.container,
                isDesktop ? styles.containerDesktop : styles.containerMobile,
                { backgroundColor: theme.headerBg, borderBottomColor: headerClar ? '#E5E7EB' : 'rgba(255,255,255,0.18)' },
            ]}
        >
            <View style={styles.inner}>
                <View style={styles.left}>
                    {icon && isDesktop ? (
                        <View style={[styles.iconBadge, { backgroundColor: headerClar ? theme.primary + '1A' : 'rgba(255,255,255,0.18)' }]}>
                            <Ionicons name={icon} size={22} color={headerClar ? theme.primary : theme.headerText} />
                        </View>
                    ) : null}
                    <View style={styles.texts}>
                        <Text
                            style={[styles.title, isDesktop && styles.titleDesktop, { color: theme.headerText }]}
                            accessibilityRole="header"
                            numberOfLines={1}
                        >
                            {title}
                        </Text>
                        {subtitle ? (
                            <Text style={[styles.subtitle, { color: theme.headerSubtitle }]} numberOfLines={2}>
                                {subtitle}
                            </Text>
                        ) : null}
                    </View>
                </View>
                {right ? <View style={styles.right}>{right}</View> : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { borderBottomWidth: 1, width: '100%' },
    containerDesktop: { paddingHorizontal: 40, paddingVertical: 22 },
    containerMobile: { paddingHorizontal: 16, paddingVertical: 14 },
    inner: {
        width: '100%',
        maxWidth: SCREEN_MAX_WIDTH,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
    },
    left: { flexDirection: 'row', alignItems: 'center', gap: 14, flexShrink: 1, minWidth: 0 },
    iconBadge: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    texts: { flexShrink: 1, minWidth: 0, gap: 3 },
    title: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
    titleDesktop: { fontSize: 24 },
    subtitle: { fontSize: 14, lineHeight: 20 },
    right: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 0 },
});
