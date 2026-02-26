import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { palette, spacing, typography, radius } from "@/constants/theme";
export const ServicesHeader: React.FC = () => {
    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.title}>Services</Text>
                <Text style={styles.subtitle}>Manage services and check availability.</Text>
            </View>


        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.gutterWeb,
        paddingVertical: spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: palette.borderSoft,
        backgroundColor: palette.background,
    },
    title: {
        ...typography.h1,
        color: palette.textPrimary,
        marginBottom: 4,
    },
    subtitle: {
        ...typography.body,
        color: palette.textMuted,
    },

});
