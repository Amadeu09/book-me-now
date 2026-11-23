import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { avisar, confirmar, missatgeError } from '@/utils/dialegs';
import { useEmpresesAdmin, useEstatEmpresa } from '../hooks/useSuperAdmin';
import type { EmpresaAdmin } from '../services/superadmin.service';
import { SA, sa, dataCurta } from './sa.estils';
import { Paginacio } from './Paginacio';

function FilaEmpresa({ e }: { e: EmpresaAdmin }) {
  const estat = useEstatEmpresa();
  const canviar = async () => {
    const desactivar = e.activa;
    const ok = await confirmar(
      desactivar ? 'Desactivar empresa' : 'Activar empresa',
      desactivar
        ? `¿Desactivar "${e.nom}"? Sus usuarios saldrán al momento y no podrán entrar; su página pública dejará de aceptar reservas.`
        : `¿Volver a activar "${e.nom}"?`,
      desactivar ? 'Desactivar' : 'Activar',
      'Cancelar',
    );
    if (!ok) return;
    try {
      await estat.mutateAsync({ id: e.id, activa: !e.activa });
    } catch (err) {
      avisar('Error', missatgeError(err, 'No se ha podido cambiar el estado.'));
    }
  };

  return (
    <View style={styles.fila}>
      <View style={styles.principal}>
        <View style={styles.nomRow}>
          <Text style={styles.nom} numberOfLines={1}>{e.nom}</Text>
          <View style={[sa.chip, { backgroundColor: e.activa ? SA.okBg : SA.badBg }]}>
            <Text style={[sa.chipText, { color: e.activa ? SA.ok : SA.bad }]}>{e.activa ? 'Activa' : 'Desactivada'}</Text>
          </View>
        </View>
        <Text style={sa.muted} numberOfLines={1}>{e.tipo} · {e.ubicacio} · alta {dataCurta(e.createdAt)}</Text>
        <Text style={sa.muted} numberOfLines={1}>{e.admins.join(', ') || 'Sin administrador'}</Text>
      </View>
      <View style={styles.xifres}>
        <Text style={styles.xifra}>{e.treballadors}<Text style={sa.muted}> equipo</Text></Text>
        <Text style={styles.xifra}>{e.reserves30d}<Text style={sa.muted}> reservas/30d</Text></Text>
      </View>
      <Pressable onPress={canviar} disabled={estat.isPending} style={[sa.botoSec, e.activa && { borderColor: SA.badBg }]} accessibilityRole="button" accessibilityLabel={`${e.activa ? 'Desactivar' : 'Activar'} ${e.nom}`}>
        <Text style={[sa.botoSecText, e.activa && { color: SA.bad }]}>{e.activa ? 'Desactivar' : 'Activar'}</Text>
      </Pressable>
    </View>
  );
}

export function SaEmpreses() {
  const [cerca, setCerca] = useState('');
  const [page, setPage] = useState(1);
  const q = useEmpresesAdmin(cerca.trim(), page);

  return (
    <View style={sa.card}>
      <View style={styles.cap}>
        <Text style={sa.titol} accessibilityRole="header">Empresas{q.data ? ` · ${q.data.total}` : ''}</Text>
        <TextInput
          value={cerca}
          onChangeText={(v) => { setCerca(v); setPage(1); }}
          placeholder="Buscar por nombre, ciudad o email"
          accessibilityLabel="Buscar empresas"
          style={[sa.input, styles.cerca]}
        />
      </View>
      {q.isLoading ? <ActivityIndicator color={SA.brand} /> : q.isError ? (
        <Text style={sa.error}>No se han podido cargar las empresas.</Text>
      ) : (
        <FlatList
          data={q.data?.data ?? []}
          keyExtractor={(e) => String(e.id)}
          renderItem={({ item }) => <FilaEmpresa e={item} />}
          ListEmptyComponent={<Text style={sa.muted}>No hay empresas con esa búsqueda.</Text>}
          scrollEnabled={false}
        />
      )}
      <Paginacio page={page} total={q.data?.totalPages ?? 1} onPage={setPage} />
    </View>
  );
}

const styles = StyleSheet.create({
  cap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  cerca: { flexGrow: 1, flexBasis: 240, maxWidth: 360 },
  fila: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 14, paddingVertical: 14, borderTopWidth: 1, borderTopColor: SA.line },
  principal: { flexGrow: 1, flexBasis: 260, minWidth: 0, gap: 3 },
  nomRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nom: { fontSize: 15, fontWeight: '700', color: SA.ink, flexShrink: 1 },
  xifres: { gap: 2, minWidth: 150 },
  xifra: { fontSize: 14, fontWeight: '700', color: SA.ink },
});
