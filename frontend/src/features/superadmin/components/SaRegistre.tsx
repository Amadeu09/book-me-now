import React, { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useRegistreAdmin } from '../hooks/useSuperAdmin';
import type { AccioRegistre } from '../services/superadmin.service';
import { SA, sa, dataHora } from './sa.estils';
import { Paginacio } from './Paginacio';

const ACCIONS: Record<string, string> = {
  LOGIN: 'Inicio de sesión',
  LOGOUT: 'Cierre de sesión',
  CONTRASENYA_CANVIADA: 'Contraseña cambiada',
  EMPRESA_ACTIVADA: 'Empresa activada',
  EMPRESA_DESACTIVADA: 'Empresa desactivada',
  INVITACIO_CREADA: 'Invitación creada',
  INVITACIO_REVOCADA: 'Invitación anulada',
};

function detall(a: AccioRegistre): string {
  const d = a.detall ?? {};
  if (typeof d.nom === 'string') return d.nom;
  if (typeof d.email === 'string') return d.email;
  if (typeof d.nomEmpresa === 'string') return d.nomEmpresa;
  if (typeof d.invitacioId === 'number') return `Invitación #${d.invitacioId}`;
  return '';
}

export function SaRegistre() {
  const [page, setPage] = useState(1);
  const q = useRegistreAdmin(page);
  return (
    <View style={sa.card}>
      <Text style={sa.titol} accessibilityRole="header">Registro de acciones</Text>
      {q.isLoading ? <ActivityIndicator color={SA.brand} /> : (
        <FlatList
          data={q.data?.data ?? []}
          keyExtractor={(a) => String(a.id)}
          renderItem={({ item }) => (
            <View style={styles.fila}>
              <Text style={[sa.muted, styles.quan]}>{dataHora(item.createdAt)}</Text>
              <Text style={[sa.text, styles.accio]}>{ACCIONS[item.accio] ?? item.accio}</Text>
              <Text style={[sa.muted, styles.detall]} numberOfLines={1}>{detall(item)}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={sa.muted}>Sin acciones todavía.</Text>}
          scrollEnabled={false}
        />
      )}
      <Paginacio page={page} total={q.data?.totalPages ?? 1} onPage={setPage} />
    </View>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: SA.line },
  quan: { width: 130 },
  accio: { width: 190, fontWeight: '600' },
  detall: { flex: 1, minWidth: 120 },
});
