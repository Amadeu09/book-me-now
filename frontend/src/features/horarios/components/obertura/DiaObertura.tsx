import React, { useRef, useState } from 'react';
import { View, Text, TextInput, Switch, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HC } from '@/features/home/constants/inicio.constants';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';
import {
    clauFranges, minutsAText, seguentFranja, validaFranges,
    type FrangaMin, type FrangaText,
} from '../../utils/franges';

export type EstatDesat = 'inactiu' | 'desant' | 'desat' | 'error';

interface Props {
    nom: string;
    inicials: FrangaMin[];
    onDesar: (franges: FrangaMin[]) => Promise<void>;
    onEstat: (e: EstatDesat) => void;
    apilat: boolean;
}

const aText = (f: FrangaMin[]): FrangaText[] => f.map(x => ({ inici: minutsAText(x.iniciMin), fi: minutsAText(x.fiMin) }));

/**
 * Fila d'un dia de l'horari d'obertura. Desa sola: en canviar l'interruptor,
 * afegir o treure una franja, o quan una hora perd el focus i és vàlida.
 */
export function DiaObertura({ nom, inicials, onDesar, onEstat, apilat }: Props) {
    const theme = useTheme();
    const { t } = useLanguage();
    const [franges, setFranges] = useState<FrangaText[]>(() => aText(inicials));
    const [invalid, setInvalid] = useState(false);
    const desat = useRef(clauFranges(inicials));
    const abansDeTancar = useRef<FrangaMin[]>(inicials);
    const obert = franges.length > 0;

    const desa = async (noves: FrangaText[]) => {
        const valides = validaFranges(noves);
        setInvalid(valides === null);
        if (!valides) return;
        const clau = clauFranges(valides);
        if (clau === desat.current) return;
        onEstat('desant');
        try {
            await onDesar(valides);
            desat.current = clau;
            if (valides.length > 0) abansDeTancar.current = valides;
            onEstat('desat');
        } catch {
            onEstat('error');
        }
    };

    const canviaObert = (valor: boolean) => {
        const noves = valor ? aText(abansDeTancar.current.length ? abansDeTancar.current : [{ iniciMin: 540, fiMin: 1200 }]) : [];
        setFranges(noves);
        desa(noves);
    };

    const editaHora = (index: number, camp: keyof FrangaText, valor: string) =>
        setFranges(prev => prev.map((f, i) => (i === index ? { ...f, [camp]: valor.replace(/[^\d:]/g, '') } : f)));

    const afegeix = () => {
        const valides = validaFranges(franges) ?? [];
        const nova = seguentFranja(valides);
        if (!nova) return;
        const noves = [...franges, { inici: minutsAText(nova.iniciMin), fi: minutsAText(nova.fiMin) }];
        setFranges(noves);
        desa(noves);
    };

    const treu = (index: number) => {
        const noves = franges.filter((_, i) => i !== index);
        setFranges(noves);
        desa(noves);
    };

    const inputHora = (index: number, camp: keyof FrangaText) => (
        <TextInput
            value={franges[index][camp]}
            onChangeText={v => editaHora(index, camp, v)}
            onBlur={() => desa(franges)}
            onSubmitEditing={() => desa(franges)}
            maxLength={5}
            keyboardType="numbers-and-punctuation"
            selectTextOnFocus
            accessibilityLabel={`${nom} ${camp === 'inici' ? '·' : '–'} ${franges[index][camp]}`}
            style={[styles.hora, invalid && styles.horaInvalida]}
        />
    );

    return (
        <View style={[styles.row, apilat && styles.rowApilat]}>
            <View style={styles.cap}>
                <Switch
                    value={obert}
                    onValueChange={canviaObert}
                    trackColor={{ true: theme.primary, false: HC.borderInput }}
                    thumbColor={HC.white}
                    {...({ activeThumbColor: HC.white } as object)}
                    accessibilityLabel={nom}
                />
                <Text style={[styles.nom, !obert && styles.nomTancat]}>{nom}</Text>
            </View>

            <View style={styles.franges}>
                {obert ? (
                    franges.map((_, i) => (
                        <View key={i} style={styles.franja}>
                            {inputHora(i, 'inici')}
                            <Text style={styles.guio}>–</Text>
                            {inputHora(i, 'fi')}
                            <Pressable onPress={() => treu(i)} hitSlop={8} accessibilityRole="button" accessibilityLabel={t('horTreureFranja')} style={styles.treure}>
                                <Ionicons name="close" size={14} color={HC.textMuted} />
                            </Pressable>
                        </View>
                    ))
                ) : (
                    <Text style={styles.tancat}>{t('closed')}</Text>
                )}
                {obert && franges.length < 6 ? (
                    <Pressable onPress={afegeix} accessibilityRole="button" style={styles.afegir}>
                        <Ionicons name="add" size={14} color={theme.primary} />
                        <Text style={[styles.afegirText, { color: theme.primary }]}>{t('horFranja')}</Text>
                    </Pressable>
                ) : null}
            </View>
            {invalid ? <Text style={styles.error}>{t('horHoraInvalida')}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12,
        paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: HC.borderSoft,
    },
    rowApilat: { flexDirection: 'column', alignItems: 'flex-start', gap: 10 },
    cap: { flexDirection: 'row', alignItems: 'center', gap: 12, width: 170 },
    nom: { fontSize: 14, fontWeight: '600', color: HC.textPrimary },
    nomTancat: { color: HC.textMuted },
    franges: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
    franja: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        borderWidth: 1, borderColor: HC.border, borderRadius: 10, paddingLeft: 6, paddingRight: 4, paddingVertical: 4,
        backgroundColor: HC.card,
    },
    hora: {
        width: 56, textAlign: 'center', fontSize: 14, fontWeight: '600', color: HC.textPrimary,
        paddingVertical: 6, borderRadius: 6, backgroundColor: HC.inputBg,
    },
    horaInvalida: { color: HC.statusRedText, backgroundColor: HC.statusRedBg },
    guio: { color: HC.textMuted, fontSize: 14 },
    treure: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
    tancat: { fontSize: 14, color: HC.textMuted, fontStyle: 'italic' },
    afegir: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 8, paddingVertical: 8 },
    afegirText: { fontSize: 13, fontWeight: '600' },
    error: { width: '100%', fontSize: 12, color: HC.statusRedText },
});
