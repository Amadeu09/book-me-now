import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC, cardShadow } from '../constants/inicio.constants';

export const StatsCard: React.FC = () => {
    return (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <View style={styles.iconCirclePrimary}>
                    <Ionicons name="bar-chart" size={22} color={HC.primary} />
                </View>
                <View style={styles.headerTitleBlock}>
                    <Text style={styles.title}>Estadísticas (Semanal)</Text>
                </View>
            </View>
            
            <View style={styles.grid}>
                <View style={styles.statBox}>
                    <View style={[styles.iconBox, { backgroundColor: HC.primaryLight }]}>
                        <Ionicons name="calendar-outline" size={24} color={HC.primary} />
                    </View>
                    <Text style={styles.statValue}>42</Text>
                    <Text style={styles.statLabel}>Reservas Totales</Text>
                </View>
                
                <View style={styles.statBox}>
                    <View style={[styles.iconBox, { backgroundColor: HC.greenLight }]}>
                        <Ionicons name="people-outline" size={24} color={HC.green} />
                    </View>
                    <Text style={styles.statValue}>18</Text>
                    <Text style={styles.statLabel}>Nuevos Clientes</Text>
                </View>

                <View style={styles.statBox}>
                    <View style={[styles.iconBox, { backgroundColor: HC.yellowLight }]}>
                        <Ionicons name="cash-outline" size={24} color={HC.yellow} />
                    </View>
                    <Text style={styles.statValue}>$1,240</Text>
                    <Text style={styles.statLabel}>Ingresos Est.</Text>
                </View>

                <View style={styles.statBox}>
                    <View style={[styles.iconBox, { backgroundColor: HC.redLight }]}>
                        <Ionicons name="close-circle-outline" size={24} color={HC.red} />
                    </View>
                    <Text style={styles.statValue}>3</Text>
                    <Text style={styles.statLabel}>Cancelaciones</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: HC.white,
        borderRadius: 16,
        padding: 24,
        ...cardShadow,
        flex: 1, // Will take up flex space in row
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconCirclePrimary: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: HC.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    headerTitleBlock: {
        flex: 1,
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        color: HC.textPrimary,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'space-between',
    },
    statBox: {
        width: '46%', // Ensure 2 items per row with gap
        backgroundColor: HC.screenBg,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        color: HC.textPrimary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: HC.textMuted,
        textAlign: 'center',
    }
});
