import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { palette, radius, spacing } from "@/constants/theme";

type ButtonVariant = 'primary' | 'ghost' | 'danger';

interface ButtonProps {
    onPress: () => void;
    label: string;
    variant?: ButtonVariant;
    disabled?: boolean;
    loading?: boolean;
}

export function Button({ onPress, label, variant = 'primary', disabled, loading }: ButtonProps) {
    const styles = createButtonStyles();
    const isDisabled = disabled || loading;

    const variantStyle = {
        primary: styles.btnPrimary,
        ghost: styles.btnGhost,
        danger: styles.btnDelete,
    }[variant];

    const textStyle = {
        primary: styles.btnPrimaryText,
        ghost: styles.btnGhostText,
        danger: styles.btnDeleteText,
    }[variant];

    return (
        <TouchableOpacity
            style={[variantStyle, isDisabled && styles.btnDisabled]}
            onPress={onPress}
            disabled={isDisabled}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'ghost' ? palette.textSubtle : '#ffffff'} />
            ) : (
                <Text style={textStyle}>{label}</Text>
            )}
        </TouchableOpacity>
    );
}

const createButtonStyles = () =>
    StyleSheet.create({
        btnPrimary: {
            backgroundColor: palette.accent,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderRadius: radius.md,
            alignItems: 'center',
            justifyContent: 'center',
        },
        btnPrimaryText: { color: palette.background, fontWeight: '700' },
        btnGhost: {
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            alignItems: 'center',
            justifyContent: 'center',
        },
        btnGhostText: { color: palette.textSubtle, fontWeight: '700' },
        btnDelete: {
            backgroundColor: palette.danger,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderRadius: radius.md,
            alignItems: 'center',
            justifyContent: 'center',
        },
        btnDeleteText: { color: palette.background, fontWeight: '700' },
        btnDisabled: { opacity: 0.7 },
    });
