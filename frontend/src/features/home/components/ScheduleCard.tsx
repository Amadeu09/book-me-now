import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC, cardShadow } from '../constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';

export const ScheduleCard: React.FC = () => {
    const theme = useTheme();
    const { t } = useLanguage();
    const MOCK_SCHEDULE = [
        { day: t('dayMonday'), hours: '09:00 - 18:00', status: 'open' },
        { day: t('dayTuesday'), hours: '09:00 - 18:00', status: 'open' },
        { day: t('dayWednesday'), hours: '09:00 - 18:00', status: 'open' },
        { day: t('dayThursday'), hours: '09:00 - 18:00', status: 'open' },
        { day: t('dayFriday'), hours: '09:00 - 18:00', status: 'open' },
        { day: t('daySaturday'), hours: '10:00 - 14:00', status: 'reduced' },
        { day: t('daySunday'), hours: t('closed'), status: 'closed' },
    ];
    return (
        <View style={[styles.card, { backgroundColor: theme.primaryLight, borderWidth: theme.softBorderWidth, borderColor: theme.softBorderColor }]}>
            <View style={styles.headerRow}>
                <View style={[styles.iconCirclePrimary, { backgroundColor: theme.primaryMid }]}>
                    <Ionicons name="time" size={22} color={theme.primary} />
                </View>
                <View style={styles.headerTitleBlock}>
                    <Text style={styles.title}>{t('scheduleTitle')}</Text>
                </View>
            </View>
            <View style={styles.content}>
                {MOCK_SCHEDULE.map((item, index) => (
                    <View key={item.day} style={[
                        styles.row, 
                        index !== MOCK_SCHEDULE.length - 1 && styles.borderBottom
                    ]}>
                        <Text style={styles.day}>{item.day}</Text>
                        <Text style={[
                            styles.hours,
                            item.status === 'closed' && styles.closedText,
                            item.status === 'reduced' && styles.reducedText
                        ]}>
                            {item.hours}
                        </Text>
                    </View>
                ))}
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
    content: {
        marginTop: 4,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: HC.borderSoft,
    },
    day: {
        fontSize: 14,
        color: HC.textSecondary,
        fontWeight: '500',
    },
    hours: {
        fontSize: 14,
        color: HC.textPrimary,
        fontWeight: '600',
    },
    closedText: {
        color: HC.red,
    },
    reducedText: {
        color: HC.yellow,
    }
});
