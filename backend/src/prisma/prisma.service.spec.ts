import { ambTimeoutsDespertar } from './prisma.service';

describe('ambTimeoutsDespertar', () => {
  it('afegeix els timeouts si la URL no en porta', () => {
    const url = ambTimeoutsDespertar('postgresql://u:p@host.neon.tech:5432/db?sslmode=require');
    const params = new URL(url!).searchParams;
    expect(params.get('sslmode')).toBe('require');
    expect(params.get('connect_timeout')).toBe('20');
    expect(params.get('pool_timeout')).toBe('20');
  });

  it('respecta els valors que ja hi ha a la URL', () => {
    const url = ambTimeoutsDespertar('postgresql://u:p@host/db?connect_timeout=5');
    expect(new URL(url!).searchParams.get('connect_timeout')).toBe('5');
  });

  it('no toca una URL absent o invàlida', () => {
    expect(ambTimeoutsDespertar(undefined)).toBeUndefined();
    expect(ambTimeoutsDespertar('no-es-una-url')).toBe('no-es-una-url');
  });
});
