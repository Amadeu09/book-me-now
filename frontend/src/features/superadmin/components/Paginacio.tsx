import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { sa } from './sa.estils';

export function Paginacio({ page, total, onPage }: { page: number; total: number; onPage: (p: number) => void }) {
  if (total <= 1) return null;
  return (
    <View style={styles.row}>
      <Pressable onPress={() => onPage(page - 1)} disabled={page <= 1} style={[sa.botoSec, page <= 1 && styles.off]} accessibilityRole="button" accessibilityLabel="Página anterior">
        <Text style={sa.botoSecText}>Anterior</Text>
      </Pressable>
      <Text style={sa.muted}>{page} / {total}</Text>
      <Pressable onPress={() => onPage(page + 1)} disabled={page >= total} style={[sa.botoSec, page >= total && styles.off]} accessibilityRole="button" accessibilityLabel="Página siguiente">
        <Text style={sa.botoSecText}>Siguiente</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  off: { opacity: 0.5 },
});
