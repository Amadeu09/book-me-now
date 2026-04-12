import React from 'react';
import { View, StyleSheet } from 'react-native';

const CANVAS = 2800;
const STRIPE_SPACING = 28;
const STRIPE_COUNT = Math.ceil(CANVAS / STRIPE_SPACING);

/**
 * Renders a very subtle diagonal stripe texture behind all screen content,
 * similar to Asana's background pattern.
 * Must be placed inside a View with `overflow: 'hidden'` (or clip via absoluteFill).
 */
export function StripedBackground() {
    return (
        <View pointerEvents="none" style={styles.wrapper}>
            <View style={styles.canvas}>
                {Array.from({ length: STRIPE_COUNT }).map((_, i) => (
                    <View key={i} style={[styles.stripe, { left: i * STRIPE_SPACING }]} />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    canvas: {
        width: CANVAS,
        height: CANVAS,
        transform: [{ rotate: '-45deg' }],
    },
    stripe: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 1,
        backgroundColor: '#94a3b8',
        opacity: 0.12,
    },
});
