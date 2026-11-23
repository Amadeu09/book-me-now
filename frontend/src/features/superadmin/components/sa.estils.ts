import { StyleSheet } from 'react-native';
import { HC } from '@/features/home/constants/inicio.constants';

/** Colors del panell d'administració (fixos: no depenen del color de cap empresa). */
export const SA = {
  ink: '#14142B',
  brand: '#5B5BD6',
  soft: '#F3F3FD',
  line: '#E6E6F0',
  muted: '#5A5A72',
  ok: '#0F8A66',
  okBg: '#E3F7EF',
  warn: '#8A5300',
  warnBg: '#FFF1DC',
  bad: '#B42318',
  badBg: '#FDECEA',
};

export const sa = StyleSheet.create({
  card: { backgroundColor: HC.card, borderWidth: 1, borderColor: SA.line, borderRadius: 16, padding: 20, gap: 14 },
  titol: { fontSize: 17, fontWeight: '700', color: SA.ink },
  text: { fontSize: 14, color: SA.ink },
  muted: { fontSize: 13, color: SA.muted },
  label: { fontSize: 13, fontWeight: '600', color: SA.muted },
  input: {
    minHeight: 44, borderWidth: 1, borderColor: SA.line, borderRadius: 10, paddingHorizontal: 12,
    fontSize: 14, color: SA.ink, backgroundColor: HC.card,
  },
  boto: { minHeight: 44, paddingHorizontal: 18, borderRadius: 10, backgroundColor: SA.brand, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  botoText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  botoSec: { minHeight: 40, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: SA.line, alignItems: 'center', justifyContent: 'center', backgroundColor: HC.card },
  botoSecText: { color: SA.ink, fontWeight: '600', fontSize: 13 },
  chip: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  chipText: { fontSize: 12, fontWeight: '700' },
  error: { fontSize: 13, color: SA.bad },
});

export function dataCurta(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function dataHora(iso: string) {
  return new Date(iso).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}
