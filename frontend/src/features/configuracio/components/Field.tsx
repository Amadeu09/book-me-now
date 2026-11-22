import React from 'react';
import { View, Text, TextInput, StyleSheet, type TextInputProps } from 'react-native';
import { HC } from '@/features/home/constants/inicio.constants';

interface FieldProps extends TextInputProps {
    label: string;
    help?: string;
    error?: string;
    readOnly?: boolean;
}

/** Camp de formulari amb etiqueta, ajuda i error. */
export function Field({ label, help, error, readOnly, style, ...input }: FieldProps) {
    return (
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                {...input}
                editable={!readOnly}
                accessibilityLabel={label}
                placeholderTextColor={HC.textLight}
                style={[styles.input, readOnly && styles.readOnly, !!error && styles.inputError, style]}
            />
            {error ? <Text style={styles.error}>{error}</Text> : help ? <Text style={styles.help}>{help}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    field: { gap: 6, flexGrow: 1, flexBasis: 240 },
    label: { fontSize: 13, fontWeight: '600', color: HC.textSecondary },
    input: {
        fontSize: 14,
        paddingHorizontal: 12,
        paddingVertical: 10,
        minHeight: 44,
        borderWidth: 1,
        borderColor: HC.borderInput,
        borderRadius: 10,
        backgroundColor: HC.card,
        color: HC.textPrimary,
    },
    readOnly: { backgroundColor: '#F8FAFC', borderColor: HC.border, color: HC.textSecondary },
    inputError: { borderColor: HC.red },
    help: { fontSize: 12, color: HC.textMuted },
    error: { fontSize: 12, color: HC.statusRedText },
});
