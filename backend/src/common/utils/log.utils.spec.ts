import { ocultarTokens } from './log.utils';

describe('ocultarTokens', () => {
  it('amaga els tokens de gestió, valoració i reset', () => {
    expect(ocultarTokens('/api/reserves/gestio/abc-123/cancellar')).toBe('/api/reserves/gestio/***/cancellar');
    expect(ocultarTokens('/api/valoracions/reserva/xyz')).toBe('/api/valoracions/reserva/***');
    expect(ocultarTokens('/reset-password?token=secret&x=1')).toBe('/reset-password?token=***&x=1');
  });

  it('no toca les altres rutes', () => {
    expect(ocultarTokens('/api/reserves/setmana?inici=2026-01-01')).toBe('/api/reserves/setmana?inici=2026-01-01');
  });
});
