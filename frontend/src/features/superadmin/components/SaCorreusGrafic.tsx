import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SA, sa } from './sa.estils';

/** Barres dels últims 30 dies amb la línia del límit diari (si el pla en té). */
export function SaCorreusGrafic({ diari, limitDia }: { diari: { dia: string; total: number }[]; limitDia: number | null }) {
  const maxim = Math.max(limitDia ?? 0, ...diari.map((d) => d.total), 10);
  const escala = maxim * 1.1;
  const pct = (v: number) => `${(v / escala) * 100}%` as const;
  const total = diari.reduce((s, d) => s + d.total, 0);
  const resum = `Últimos 30 días: ${total} correos${limitDia ? `, ${diari.filter((d) => d.total > limitDia).length} días por encima de ${limitDia}` : ''}`;

  return (
    <View style={styles.wrap} accessible accessibilityLabel={resum}>
      <View style={styles.area}>
        {limitDia ? (
          <View style={[styles.limit, { bottom: pct(limitDia) }]}>
            <Text style={styles.limitText}>Límite diario {limitDia}</Text>
          </View>
        ) : null}
        <View style={styles.barres}>
          {diari.map((d) => {
            const passa = limitDia !== null && d.total > limitDia;
            return (
              <View key={d.dia} style={styles.col}>
                <View style={[styles.barra, { height: pct(d.total), backgroundColor: passa ? SA.bad : SA.brand }]} />
              </View>
            );
          })}
        </View>
      </View>
      <View style={styles.eix}>
        <Text style={sa.muted}>{diari[0]?.dia.slice(5).split('-').reverse().join('/')}</Text>
        <Text style={sa.muted}>Hoy</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  area: { height: 160, position: 'relative', borderBottomWidth: 1, borderBottomColor: SA.line },
  barres: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  col: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  barra: { width: '100%', borderTopLeftRadius: 3, borderTopRightRadius: 3, minHeight: 1 },
  limit: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1, borderStyle: 'dashed', borderTopColor: SA.bad, zIndex: 1 },
  limitText: { position: 'absolute', right: 0, top: -18, fontSize: 11, fontWeight: '700', color: SA.bad, backgroundColor: '#fff', paddingHorizontal: 4 },
  eix: { flexDirection: 'row', justifyContent: 'space-between' },
});
