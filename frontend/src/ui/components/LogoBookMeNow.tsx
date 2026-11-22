import React from 'react';
import { Image, StyleSheet } from 'react-native';

const LOGO = require('../../../assets/images/logo.png');

/** Logotip de BookMeNow (monograma "bn"). Sempre amb els colors de la marca. */
export function LogoBookMeNow({ mida = 40 }: { mida?: number }) {
    return (
        <Image
            source={LOGO}
            style={[styles.logo, { width: mida, height: mida, borderRadius: Math.round(mida * 0.23) }]}
            accessibilityIgnoresInvertColors
            accessible={false}
        />
    );
}

const styles = StyleSheet.create({
    logo: { resizeMode: 'contain' },
});
