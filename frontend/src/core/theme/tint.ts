/**
 * Fons suau del color de l'empresa per a elements sobre blanc.
 * primaryLight és blanc al tema per defecte, i aquí cal que es vegi.
 */
export function tintPrimari(theme: { primary: string; primaryLight: string }, alpha = '1A'): string {
    return /^#[0-9a-f]{6}$/i.test(theme.primary) ? theme.primary + alpha : theme.primaryLight;
}
