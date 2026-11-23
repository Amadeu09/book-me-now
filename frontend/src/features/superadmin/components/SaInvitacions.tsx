import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Switch, FlatList, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { avisar, confirmar, missatgeError } from '@/utils/dialegs';
import { useCrearInvitacio, useInvitacionsAdmin, useRevocarInvitacio } from '../hooks/useSuperAdmin';
import type { EstatInvitacio, InvitacioAdmin } from '../services/superadmin.service';
import { SA, sa, dataCurta } from './sa.estils';
import { Paginacio } from './Paginacio';

const ESTATS: Record<EstatInvitacio, { label: string; color: string; bg: string }> = {
  PENDENT: { label: 'Pendiente', color: SA.brand, bg: SA.soft },
  USADA: { label: 'Usada', color: SA.ok, bg: SA.okBg },
  CADUCADA: { label: 'Caducada', color: SA.muted, bg: '#EFEFF4' },
  REVOCADA: { label: 'Anulada', color: SA.bad, bg: SA.badBg },
};

function NovaInvitacio() {
  const crear = useCrearInvitacio();
  const [email, setEmail] = useState('');
  const [nom, setNom] = useState('');
  const [dies, setDies] = useState('7');
  const [enviar, setEnviar] = useState(true);
  const [resultat, setResultat] = useState<{ enllac: string; emailEnviat: boolean } | null>(null);
  const [copiat, setCopiat] = useState(false);

  const onCrear = async () => {
    try {
      const r = await crear.mutateAsync({
        email: email.trim() || undefined,
        nomEmpresa: nom.trim() || undefined,
        dies: Math.min(30, Math.max(1, parseInt(dies, 10) || 7)),
        enviarEmail: Boolean(email.trim()) && enviar,
      });
      setResultat({ enllac: r.enllac, emailEnviat: r.emailEnviat });
      setCopiat(false);
      setEmail('');
      setNom('');
    } catch (e) {
      avisar('Error', missatgeError(e, 'No se ha podido crear la invitación.'));
    }
  };

  const copiar = async () => {
    if (!resultat) return;
    if (Platform.OS === 'web' && navigator.clipboard) {
      await navigator.clipboard.writeText(resultat.enllac);
      setCopiat(true);
    }
  };

  return (
    <View style={sa.card}>
      <Text style={sa.titol} accessibilityRole="header">Nueva invitación</Text>
      <Text style={sa.muted}>Enlace de un solo uso para dar de alta un negocio. Si pones el email, solo esa persona podrá usarlo.</Text>
      <View style={styles.formRow}>
        <View style={styles.camp}>
          <Text style={sa.label} nativeID="inv-email">Email (opcional)</Text>
          <TextInput accessibilityLabelledBy="inv-email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={sa.input} />
        </View>
        <View style={styles.camp}>
          <Text style={sa.label} nativeID="inv-nom">Nombre del negocio (opcional)</Text>
          <TextInput accessibilityLabelledBy="inv-nom" value={nom} onChangeText={setNom} style={sa.input} />
        </View>
        <View style={[styles.camp, styles.campCurt]}>
          <Text style={sa.label} nativeID="inv-dies">Caduca en (días)</Text>
          <TextInput accessibilityLabelledBy="inv-dies" value={dies} onChangeText={(v) => setDies(v.replace(/\D/g, ''))} keyboardType="number-pad" maxLength={2} style={sa.input} />
        </View>
      </View>
      <View style={styles.enviarRow}>
        <Switch value={enviar && Boolean(email.trim())} onValueChange={setEnviar} disabled={!email.trim()} accessibilityLabel="Enviar el enlace por email" />
        <Text style={[sa.text, !email.trim() && { color: SA.muted }]}>Enviar el enlace por email</Text>
      </View>
      <Pressable onPress={onCrear} disabled={crear.isPending} style={[sa.boto, { alignSelf: 'flex-start' }]} accessibilityRole="button">
        {crear.isPending ? <ActivityIndicator color="#fff" /> : <Text style={sa.botoText}>Crear invitación</Text>}
      </Pressable>

      {resultat ? (
        <View style={styles.resultat} accessibilityLiveRegion="polite">
          <Text style={[sa.text, { fontWeight: '700' }]}>
            {resultat.emailEnviat ? 'Invitación creada y enviada por email.' : 'Invitación creada. Copia el enlace y envíaselo:'}
          </Text>
          <Text selectable style={styles.enllac}>{resultat.enllac}</Text>
          {Platform.OS === 'web' ? (
            <Pressable onPress={copiar} style={[sa.botoSec, { alignSelf: 'flex-start' }]} accessibilityRole="button">
              <Text style={sa.botoSecText}>{copiat ? 'Copiado' : 'Copiar enlace'}</Text>
            </Pressable>
          ) : null}
          <Text style={sa.muted}>Este enlace solo se muestra ahora: no se guarda en ningún sitio.</Text>
        </View>
      ) : null}
    </View>
  );
}

function FilaInvitacio({ i }: { i: InvitacioAdmin }) {
  const revocar = useRevocarInvitacio();
  const e = ESTATS[i.estat];
  const onRevocar = async () => {
    const ok = await confirmar('Anular invitación', `¿Anular la invitación${i.email ? ` de ${i.email}` : ''}? El enlace dejará de funcionar.`, 'Anular', 'Cancelar');
    if (!ok) return;
    try { await revocar.mutateAsync(i.id); } catch (err) { avisar('Error', missatgeError(err, 'No se ha podido anular.')); }
  };
  return (
    <View style={styles.fila}>
      <View style={[sa.chip, { backgroundColor: e.bg }]}><Text style={[sa.chipText, { color: e.color }]}>{e.label}</Text></View>
      <View style={styles.principal}>
        <Text style={sa.text} numberOfLines={1}>{i.email ?? 'Cualquier email'}{i.nomEmpresa ? ` · ${i.nomEmpresa}` : ''}</Text>
        <Text style={sa.muted} numberOfLines={1}>
          Creada {dataCurta(i.createdAt)}
          {i.estat === 'USADA' && i.empresaNom ? ` · alta de ${i.empresaNom}` : ''}
          {i.estat === 'PENDENT' ? ` · caduca ${dataCurta(i.caduca)}` : ''}
        </Text>
      </View>
      {i.estat === 'PENDENT' ? (
        <Pressable onPress={onRevocar} disabled={revocar.isPending} style={sa.botoSec} accessibilityRole="button" accessibilityLabel={`Anular invitación ${i.email ?? ''}`}>
          <Text style={[sa.botoSecText, { color: SA.bad }]}>Anular</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function SaInvitacions() {
  const [page, setPage] = useState(1);
  const q = useInvitacionsAdmin(page);
  return (
    <View style={styles.col}>
      <NovaInvitacio />
      <View style={sa.card}>
        <Text style={sa.titol} accessibilityRole="header">Invitaciones</Text>
        {q.isLoading ? <ActivityIndicator color={SA.brand} /> : (
          <FlatList
            data={q.data?.data ?? []}
            keyExtractor={(i) => String(i.id)}
            renderItem={({ item }) => <FilaInvitacio i={item} />}
            ListEmptyComponent={<Text style={sa.muted}>Todavía no has creado ninguna invitación.</Text>}
            scrollEnabled={false}
          />
        )}
        <Paginacio page={page} total={q.data?.totalPages ?? 1} onPage={setPage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  col: { gap: 20 },
  formRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  camp: { gap: 6, flexGrow: 1, flexBasis: 220 },
  campCurt: { flexGrow: 0, flexBasis: 140 },
  enviarRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  resultat: { gap: 8, padding: 14, borderRadius: 12, backgroundColor: SA.soft },
  enllac: { fontSize: 13, color: SA.ink, fontFamily: Platform.OS === 'web' ? 'monospace' : undefined },
  fila: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: SA.line },
  principal: { flexGrow: 1, flexBasis: 220, minWidth: 0, gap: 2 },
});
