import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { palette, radius, shadow, spacing } from '@/styles/theme';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
    const styles = createCardStyles();
    return <View style={[styles.card, style]}>{children}</View>;
}

const createCardStyles = () =>
    StyleSheet.create({
        card: {
            backgroundColor: palette.background,
            borderRadius: radius.xl,
            borderWidth: 1,
            borderColor: palette.border,
            padding: spacing.lg,
            ...shadow.card,
        },
    });
