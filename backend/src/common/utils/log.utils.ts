/**
 * Amaga els tokens de les URL abans d'escriure-les als logs. Qui tingui accés als
 * logs no ha de poder gestionar reserves ni valorar en nom d'un client.
 * Cobreix /reserves/gestio/:token, /valoracions/reserva/:token i ?token=.
 */
export function ocultarTokens(url: string): string {
  return url
    .replace(/(\/(?:gestio|reserva)\/)[^/?#]+/gi, '$1***')
    .replace(/([?&]token=)[^&#]+/gi, '$1***');
}
