import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, useWindowDimensions } from 'react-native';
import { palette, spacing } from "@/constants/theme";

// Components
import { InicioHeader } from '../components/InicioHeader';
import { LocalDataCard } from '../components/LocalDataCard';
import { ScheduleCard } from '../components/ScheduleCard';
import { StatsCard } from '../components/StatsCard';

export default function Home() {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768; // Based on the standard rules

    return (
        <SafeAreaView style={styles.container}>
            <InicioHeader />
            
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.mainWrapper, isDesktop && styles.desktopWrapper]}>
                    <LocalDataCard />
                    
                    <View style={[styles.blocksRow, !isDesktop && styles.blocksColumn]}>
                        <ScheduleCard />
                        <StatsCard />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: palette.background 
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.xl, // Default spacing
        paddingBottom: 40,
    },
    mainWrapper: {
        width: '100%',
        alignSelf: 'center',
        gap: spacing.xl,
    },
    desktopWrapper: {
        maxWidth: 1000,
    },
    blocksRow: {
        flexDirection: 'row',
        gap: spacing.xl,
        alignItems: 'stretch',
    },
    blocksColumn: {
        flexDirection: 'column',
    }
});
