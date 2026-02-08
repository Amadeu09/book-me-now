import React from 'react';
import { StyleSheet, View, Text, TextInput, TextInputProps } from 'react-native';
import { palette, radius, spacing, typography } from '@/styles/theme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[
                    styles.input,
                    error ? styles.inputError : null,
                    props.editable === false ? styles.inputDisabled : null,
                    style
                ]}
                placeholderTextColor={palette.textSubtle}
                {...props}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: spacing.xs,
    },
    label: {
        ...typography.label,
        color: palette.textPrimary,
    },
    input: {
        borderWidth: 1,
        borderColor: palette.border,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        fontSize: 15,
        color: palette.textPrimary,
        backgroundColor: palette.background,
    },
    inputError: {
        borderColor: palette.danger,
    },
    inputDisabled: {
        backgroundColor: palette.borderSoft,
        color: palette.textMuted,
    },
    errorText: {
        fontSize: 12,
        color: palette.danger,
        fontWeight: '500',
    },
});
