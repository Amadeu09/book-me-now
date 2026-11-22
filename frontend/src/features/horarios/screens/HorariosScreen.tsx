import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { useTheme } from '@/core/theme/ThemeProvider';
import { SCREEN_MAX_WIDTH } from '@/ui/components/ScreenHeader';
import { HorariosHeader } from '../components/HorariosHeader';
import { HorarisPestanyes, type PestanyaHoraris } from '../components/HorarisPestanyes';
import { HorariObertura } from '../components/obertura/HorariObertura';
import { PlantillesTab } from '../components/plantilles/PlantillesTab';
import { FestiusTab } from '../components/festius/FestiusTab';

/**
 * Horaris: tres pestanyes sense res repetit.
 * L'equip (persones, serveis, vacances) viu al mòdul Equip.
 */
export default function HorariosScreen() {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;
    const theme = useTheme();
    const [pestanya, setPestanya] = useState<PestanyaHoraris>('obertura');

    return (
        <View style={[styles.safe, { backgroundColor: theme.background }]}>
            <HorariosHeader />
            <ScrollView
                contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.inner}>
                    <HorarisPestanyes actiu={pestanya} onCanvi={setPestanya} />
                    {pestanya === 'obertura' && <HorariObertura onVeureTancaments={() => setPestanya('festius')} />}
                    {pestanya === 'plantilles' && <PlantillesTab />}
                    {pestanya === 'festius' && <FestiusTab />}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1 },
    content: { padding: 16, paddingBottom: 40 },
    contentDesktop: { paddingHorizontal: 40, paddingTop: 24, paddingBottom: 40 },
    inner: { width: '100%', maxWidth: SCREEN_MAX_WIDTH, alignSelf: 'center', gap: 20 },
});
