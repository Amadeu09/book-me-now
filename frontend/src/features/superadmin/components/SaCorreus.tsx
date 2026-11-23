import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useCorreusAdmin } from '../hooks/useSuperAdmin';
import type { EstadistiquesCorreus, PlaCorreu } from '../services/superadmin.service';
import { SA, sa, dataCurta } from './sa.estils';
import { SaCorreusGrafic } from './SaCorreusGrafic';

const TIPUS: Record<string, string> = {
  CONFIRMACIO_CLIENT: 'Confirmación al cliente',
  MODIFICACIO_CLIENT: 'Cita cambiada (cliente)',
  CANCELLACIO_CLIENT: 'Cancelación (cliente)',
  POST_CITA: '¿Cómo ha ido tu cita?',
  AVIS_NEGOCI: 'Avisos al negocio',
  CONTRASENYA: 'Restablecer contraseña',
  INVITACIO: 'Invitaciones',
  SUPERADMIN: 'Administración',
  ALERTA_QUOTA: 'Alertas de cuota',
  ALTRES: 'Otros',
};

const num = (n: number) => n.toLocaleString('es-ES');
const diners = (n: number) => `${n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;

function Us({ titol, usats, limit, nota }: { titol: string; usats: number; limit: number | null; nota?: string }) {
  const pct = limit ? Math.min(1, usats / limit) : 0;
  const color = pct >= 1 ? SA.bad : pct >= 0.8 ? SA.warn : SA.brand;
  return (
    <View style={[sa.card, styles.us]}>
      <Text style={sa.label}>{titol}</Text>
      <Text style={styles.xifra}>
        {num(usats)}
        <Text style={styles.limit}>{limit ? ` / ${num(limit)}` : ''}</Text>
      </Text>
      {limit ? (
        <View style={styles.pista} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: limit, now: usats }}>
          <View style={[styles.omplert, { width: `${pct * 100}%`, backgroundColor: color }]} />
        </View>
      ) : null}
      <Text style={[sa.muted, pct >= 0.8 && { color, fontWeight: '700' }]}>
        {limit ? `${Math.round((usats / limit) * 100)} % del límite` : nota}
      </Text>
    </View>
  );
}

function VistaPla({ d, pla }: { d: EstadistiquesCorreus; pla: PlaCorreu }) {
  const passaMes = d.mes.projeccio > pla.limitMes;
  const excés = Math.max(0, d.mes.projeccio - pla.limitMes);
  const diesPerSobre = pla.limitDia ? d.diari.filter((x) => x.total > pla.limitDia!).length : 0;
  const cost = pla.excesPer1000 === null
    ? diners(0)
    : diners(pla.preuMes + Math.ceil(excés / 1000) * pla.excesPer1000);

  let veredicte: string;
  if (pla.excesPer1000 === null) {
    veredicte = passaMes || diesPerSobre > 0
      ? `Con este ritmo, el plan gratuito no llega: ${diesPerSobre > 0 ? `en ${diesPerSobre} de los últimos 30 días se habría parado el envío` : ''}${diesPerSobre > 0 && passaMes ? ' y ' : ''}${passaMes ? `a final de mes serían unos ${num(d.mes.projeccio)} correos (límite ${num(pla.limitMes)})` : ''}.`
      : `Con este ritmo cabe en el plan gratuito: unos ${num(d.mes.projeccio)} correos a final de mes.`;
  } else {
    veredicte = `Sin límite diario. A final de mes serían unos ${num(d.mes.projeccio)} correos, ${passaMes ? `${num(excés)} por encima de lo incluido` : `un ${Math.round((d.mes.projeccio / pla.limitMes) * 100)} % de lo incluido`}.`;
  }

  return (
    <View style={styles.col}>
      <View style={styles.fila}>
        <Us titol="Hoy (UTC)" usats={d.avui.enviats} limit={pla.limitDia} nota="Sin límite diario" />
        <Us titol={`Este mes (día ${d.mes.dia} de ${d.mes.diesMes})`} usats={d.mes.enviats} limit={pla.limitMes} />
        <View style={[sa.card, styles.us]}>
          <Text style={sa.label}>Coste estimado del mes</Text>
          <Text style={styles.xifra}>{cost}</Text>
          <Text style={sa.muted}>
            {pla.excesPer1000 === null ? 'Al llegar al límite se paran los envíos' : `${diners(pla.preuMes)}/mes + ${diners(pla.excesPer1000)} por cada 1.000 extra`}
          </Text>
        </View>
      </View>

      <View style={[styles.veredicte, { backgroundColor: passaMes || diesPerSobre > 0 ? SA.warnBg : SA.okBg }]}>
        <Text style={[sa.text, { color: passaMes || diesPerSobre > 0 ? SA.warn : SA.ok, fontWeight: '600' }]}>{veredicte}</Text>
      </View>

      <View style={sa.card}>
        <Text style={sa.titol}>Correos por día</Text>
        <SaCorreusGrafic diari={d.diari} limitDia={pla.limitDia} />
      </View>
    </View>
  );
}

export function SaCorreus() {
  const q = useCorreusAdmin();
  const [pla, setPla] = useState<'free' | 'pro'>('free');
  useEffect(() => { if (q.data) setPla(q.data.plaActual); }, [q.data?.plaActual]); // eslint-disable-line react-hooks/exhaustive-deps

  if (q.isLoading) return <ActivityIndicator color={SA.brand} />;
  if (q.isError || !q.data) return <Text style={sa.error}>No se han podido cargar los datos de correo.</Text>;
  const d = q.data;

  return (
    <View style={styles.col}>
      <View style={styles.capRow}>
        <View style={styles.tabs} accessibilityRole="tablist">
          {(['free', 'pro'] as const).map((id) => {
            const sel = id === pla;
            return (
              <Pressable key={id} onPress={() => setPla(id)} accessibilityRole="tab" accessibilityState={{ selected: sel }} style={[styles.tab, sel && styles.tabSel]}>
                <Text style={[styles.tabText, sel && styles.tabTextSel]}>{id === 'free' ? 'Plan gratuito' : 'Plan Pro'}</Text>
                {d.plaActual === id ? <View style={[sa.chip, { backgroundColor: SA.okBg }]}><Text style={[sa.chipText, { color: SA.ok }]}>Actual</Text></View> : null}
              </Pressable>
            );
          })}
        </View>
        <Text style={sa.muted}>
          {d.comptantDes ? `Contando desde el ${dataCurta(d.comptantDes)}` : 'Aún no se ha enviado ningún correo desde que se cuenta'} · Resend cuenta un correo por destinatario
        </Text>
      </View>

      {d.mes.fallits > 0 ? (
        <View style={[styles.veredicte, { backgroundColor: SA.badBg }]}>
          <Text style={[sa.text, { color: SA.bad, fontWeight: '600' }]}>
            Este mes han fallado {num(d.mes.fallits)} correos{d.avui.fallits ? ` (${num(d.avui.fallits)} hoy)` : ''}. Si es por cuota, se han perdido avisos o confirmaciones.
          </Text>
        </View>
      ) : null}

      <VistaPla d={d} pla={d.plans[pla]} />

      <View style={styles.fila}>
        <View style={[sa.card, styles.taula]}>
          <Text style={sa.titol}>Por tipo (este mes)</Text>
          {d.perTipus.length === 0 ? <Text style={sa.muted}>Sin envíos.</Text> : d.perTipus.map((t) => (
            <View key={t.tipus} style={styles.filaTaula}>
              <Text style={[sa.text, styles.nomTaula]}>{TIPUS[t.tipus] ?? t.tipus}</Text>
              <Text style={sa.muted}>hoy {num(t.avui)}</Text>
              <Text style={[sa.text, styles.valor]}>{num(t.mes)}</Text>
            </View>
          ))}
        </View>
        <View style={[sa.card, styles.taula]}>
          <Text style={sa.titol}>Por empresa (este mes)</Text>
          {d.perEmpresa.length === 0 ? <Text style={sa.muted}>Sin envíos.</Text> : d.perEmpresa.map((e) => (
            <View key={String(e.empresaId)} style={styles.filaTaula}>
              <Text style={[sa.text, styles.nomTaula]} numberOfLines={1}>{e.nom}</Text>
              <Text style={[sa.text, styles.valor]}>{num(e.mes)}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  col: { gap: 16 },
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  us: { flexGrow: 1, flexBasis: 220, gap: 8 },
  xifra: { fontSize: 28, fontWeight: '800', color: SA.ink },
  limit: { fontSize: 16, fontWeight: '600', color: SA.muted },
  pista: { height: 8, borderRadius: 4, backgroundColor: SA.soft, overflow: 'hidden' },
  omplert: { height: '100%', borderRadius: 4 },
  veredicte: { borderRadius: 12, padding: 14 },
  capRow: { gap: 8 },
  tabs: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 40, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: SA.line, backgroundColor: '#fff' },
  tabSel: { borderColor: SA.brand, backgroundColor: SA.soft },
  tabText: { fontSize: 14, fontWeight: '600', color: SA.muted },
  tabTextSel: { color: SA.brand },
  taula: { flexGrow: 1, flexBasis: 320, gap: 4 },
  filaTaula: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: SA.line },
  nomTaula: { flex: 1 },
  valor: { fontWeight: '700', minWidth: 50, textAlign: 'right' },
});
