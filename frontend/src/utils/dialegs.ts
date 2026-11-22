import { Alert, Platform } from 'react-native';

/** Mostra un avís simple (web: window.alert; natiu: Alert). */
export function avisar(titol: string, missatge: string) {
    if (Platform.OS === 'web') window.alert(missatge);
    else Alert.alert(titol, missatge);
}

/** Demana confirmació. Resol a true si l'usuari accepta. */
export function confirmar(titol: string, missatge: string, textAcceptar: string, textCancelar: string): Promise<boolean> {
    if (Platform.OS === 'web') return Promise.resolve(window.confirm(missatge));
    return new Promise(resolve => {
        Alert.alert(titol, missatge, [
            { text: textCancelar, style: 'cancel', onPress: () => resolve(false) },
            { text: textAcceptar, style: 'destructive', onPress: () => resolve(true) },
        ], { cancelable: true, onDismiss: () => resolve(false) });
    });
}

/** Extreu el missatge d'error de l'API si n'hi ha. */
export function missatgeError(error: unknown, perDefecte: string): string {
    const msg = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
    if (Array.isArray(msg)) return msg.join('\n');
    return msg || perDefecte;
}
