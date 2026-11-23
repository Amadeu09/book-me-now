import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { LogoBookMeNow } from '@/ui/components/LogoBookMeNow';
import { jo, logoutSuper, onSessioCaducada } from '../services/superadmin.service';
import { getSuperToken } from '../services/superadmin.sessio';
import { SaLogin } from '../components/SaLogin';
import { SaEmpreses } from '../components/SaEmpreses';
import { SaInvitacions } from '../components/SaInvitacions';
import { SaRegistre } from '../components/SaRegistre';
import { SaCorreus } from '../components/SaCorreus';
import { SA } from '../components/sa.estils';

type Pestanya = 'empreses' | 'invitacions' | 'correus' | 'registre';
const PESTANYES: { clau: Pestanya; label: string; icona: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { clau: 'empreses', label: 'Empresas', icona: 'business-outline' },
  { clau: 'invitacions', label: 'Invitaciones', icona: 'mail-outline' },
  { clau: 'correus', label: 'Correos', icona: 'paper-plane-outline' },
  { clau: 'registre', label: 'Registro', icona: 'list-outline' },
];

/** Panell personal del propietari de BookMeNow. Accés i sessió separats de les empreses. */
export default function SuperAdminScreen() {
  const qc = useQueryClient();
  const [estat, setEstat] = useState<'carregant' | 'fora' | 'dins'>('carregant');
  const [email, setEmail] = useState('');
  const [pestanya, setPestanya] = useState<Pestanya>('empreses');

  const comprovar = useCallback(async () => {
    if (!(await getSuperToken())) return setEstat('fora');
    try {
      setEmail((await jo()).email);
      setEstat('dins');
    } catch {
      setEstat('fora');
    }
  }, []);

  useEffect(() => {
    comprovar();
    onSessioCaducada(() => setEstat('fora'));
    return () => onSessioCaducada(null);
  }, [comprovar]);

  const sortir = async () => {
    await logoutSuper();
    qc.removeQueries({ predicate: (q) => String(q.queryKey[0]).startsWith('sa-') });
    setEstat('fora');
  };

  if (estat === 'carregant') return <View style={styles.centre}><ActivityIndicator color={SA.brand} /></View>;
  if (estat === 'fora') return <SaLogin onEntrat={comprovar} />;

  return (
    <View style={styles.safe}>
      <View style={styles.barra}>
        <View style={styles.marca}>
          <LogoBookMeNow mida={32} />
          <View>
            <Text style={styles.marcaText} accessibilityRole="header">Administración</Text>
            <Text style={styles.email} numberOfLines={1}>{email}</Text>
          </View>
        </View>
        <Pressable onPress={sortir} style={styles.sortir} accessibilityRole="button">
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.sortirText}>Salir</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inner}>
          <View style={styles.tabs} accessibilityRole="tablist">
            {PESTANYES.map((p) => {
              const sel = p.clau === pestanya;
              return (
                <Pressable key={p.clau} onPress={() => setPestanya(p.clau)} accessibilityRole="tab" accessibilityState={{ selected: sel }} style={[styles.tab, sel && styles.tabSel]}>
                  <Ionicons name={p.icona} size={16} color={sel ? SA.brand : SA.muted} />
                  <Text style={[styles.tabText, sel && styles.tabTextSel]}>{p.label}</Text>
                </Pressable>
              );
            })}
          </View>
          {pestanya === 'empreses' && <SaEmpreses />}
          {pestanya === 'invitacions' && <SaInvitacions />}
          {pestanya === 'correus' && <SaCorreus />}
          {pestanya === 'registre' && <SaRegistre />}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SA.soft },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: SA.soft },
  barra: { backgroundColor: SA.ink, paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  marca: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 },
  marcaText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  email: { color: '#B9B9FA', fontSize: 12 },
  sortir: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  sortirText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  content: { padding: 16, paddingBottom: 48 },
  inner: { width: '100%', maxWidth: 1100, alignSelf: 'center', gap: 20 },
  tabs: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: SA.line, backgroundColor: '#fff' },
  tabSel: { borderColor: SA.brand },
  tabText: { fontSize: 14, color: SA.muted, fontWeight: '600' },
  tabTextSel: { color: SA.brand },
});
