import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { HC, cardShadow } from '../constants/horarios.constants';

interface FloatingAddButtonProps {
    onPress?: () => void;
}

export const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({ onPress }) => (
    <TouchableOpacity
        style={styles.fab}
        onPress={onPress}
        activeOpacity={0.85}
    >
        <Text style={styles.icon}>+</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: HC.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...cardShadow,
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 6,
        zIndex: 100,
    },
    icon: {
        color: HC.white,
        fontSize: 28,
        fontWeight: '300',
        lineHeight: 30,
        marginTop: -1,
    },
});
