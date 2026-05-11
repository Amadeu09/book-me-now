import React, { useRef, useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Platform,
    PanResponder,
    type LayoutChangeEvent,
} from 'react-native';
import { HC } from '../../constants/horarios.constants';
import { minutesToTime, type Tram } from '../../types/jornades.types';
import { mergeTrams, pxToMinutes } from './timelineUtils';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useLanguage } from '@/core/i18n';

/* ══════════════════════════════════════════
   TimelinePainter
   Interactive 24h timeline where users can
   paint hour ranges by click+drag / touch+drag.

   Uses PanResponder (works on web + native)
   and useRef for drag state to avoid stale
   closures during rapid move events.
   ══════════════════════════════════════════ */

const TOTAL_MIN = 1440;
const SNAP = 15;
const BAR_HEIGHT = 40;
const BAR_RADIUS = 10;

const LABEL_HOURS = [0, 6, 12, 18, 24];

interface TimelinePainterProps {
    trams: Tram[];
    onTramsChange: (trams: Tram[]) => void;
    disabled?: boolean;
}

interface DragInfo {
    startMin: number;
    currentMin: number;
}

export const TimelinePainter: React.FC<TimelinePainterProps> = React.memo(({
    trams,
    onTramsChange,
    disabled,
}) => {
    const theme = useTheme();
    const { t } = useLanguage();
    const barWidthRef = useRef(0);
    const barRef = useRef<View>(null);
    const dragRef = useRef<DragInfo | null>(null);
    const tramsRef = useRef(trams);
    tramsRef.current = trams;

    // Visual-only state — triggers re-render for preview
    const [preview, setPreview] = useState<{ s: number; e: number } | null>(null);

    /* ── Layout measurement ──────── */
    const onLayout = useCallback((e: LayoutChangeEvent) => {
        barWidthRef.current = e.nativeEvent.layout.width;
    }, []);

    /* ── Offset helper ─────────────
       locationX works in RN Web + Native
       for touches on the responder view  */
    const getMinutes = useCallback((locationX: number): number => {
        const width = barWidthRef.current;
        if (!width) return 0;
        return pxToMinutes(locationX, width, SNAP);
    }, []);

    /* ── PanResponder (universal) ── */
    const panResponder = useMemo(() =>
        PanResponder.create({
            onStartShouldSetPanResponder: () => !disabled,
            onMoveShouldSetPanResponder: () => !disabled,
            onPanResponderTerminationRequest: () => false, // don't let ScrollView steal

            onPanResponderGrant: (evt) => {
                const lx = evt.nativeEvent.locationX;
                const min = getMinutes(lx);
                dragRef.current = { startMin: min, currentMin: min };
                setPreview(null);
            },

            onPanResponderMove: (evt) => {
                if (!dragRef.current) return;
                const lx = evt.nativeEvent.locationX;
                const min = getMinutes(lx);
                dragRef.current.currentMin = min;

                const s = Math.min(dragRef.current.startMin, min);
                const e = Math.max(dragRef.current.startMin, min);
                if (e - s >= SNAP) {
                    setPreview({ s, e });
                }
            },

            onPanResponderRelease: () => {
                const drag = dragRef.current;
                if (!drag) return;

                const startMin = Math.min(drag.startMin, drag.currentMin);
                const endMin = Math.max(drag.startMin, drag.currentMin);

                if (endMin - startMin >= SNAP) {
                    const newTram: Tram = { iniciMin: startMin, fiMin: endMin };
                    const merged = mergeTrams([...tramsRef.current, newTram]);
                    onTramsChange(merged);
                }

                dragRef.current = null;
                setPreview(null);
            },

            onPanResponderTerminate: () => {
                dragRef.current = null;
                setPreview(null);
            },
        }),
        [disabled, getMinutes, onTramsChange]);

    /* ── Render a filled block ───── */
    const renderBlock = (tram: Tram, i: number, isPreview = false) => {
        const left = (tram.iniciMin / TOTAL_MIN) * 100;
        const w = ((tram.fiMin - tram.iniciMin) / TOTAL_MIN) * 100;
        return (
            <View
                key={isPreview ? 'preview' : i}
                style={[
                    styles.filledBlock,
                    {
                        left: `${left}%`,
                        width: `${w}%`,
                        backgroundColor: theme.primary,
                        opacity: isPreview ? 0.45 : 1,
                    },
                ]}
                pointerEvents="none"
            />
        );
    };

    return (
        <View style={styles.container}>
            {/* ── Interactive bar ───── */}
            <View
                ref={barRef}
                onLayout={onLayout}
                style={[
                    styles.bar,
                    !disabled && Platform.OS === 'web' && {
                        cursor: 'crosshair',
                        userSelect: 'none',
                    } as any,
                ]}
                {...panResponder.panHandlers}
            >
                {/* Hour tick lines – flex approach for pixel-perfect rendering */}
                <View style={styles.ticksRow} pointerEvents="none">
                    {Array.from({ length: 24 }, (_, i) => {
                        const isMajor = (i + 1) % 6 === 0;
                        return (
                            <View
                                key={i}
                                style={[
                                    styles.tickSection,
                                    { borderRightColor: isMajor ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.07)' },
                                ]}
                            />
                        );
                    })}
                </View>

                {/* Existing filled ranges */}
                {trams.map((tram, i) => renderBlock(tram, i))}

                {/* Preview while dragging */}
                {preview && preview.e - preview.s >= SNAP &&
                    renderBlock({ iniciMin: preview.s, fiMin: preview.e }, -1, true)
                }
            </View>

            {/* ── Hour labels ────────── */}
            <View style={styles.labelsRow} pointerEvents="none">
                {LABEL_HOURS.map((h) => (
                    <Text
                        key={h}
                        style={[styles.label, { left: `${(h / 24) * 100}%` }]}
                    >
                        {String(h).padStart(2, '0')}:00
                    </Text>
                ))}
            </View>

            {/* ── Floating tooltip ──── */}
            {preview && preview.e - preview.s >= SNAP && (
                <View
                    pointerEvents="none"
                    style={[
                        styles.tooltip,
                        {
                            left: `${((preview.s + preview.e) / 2 / TOTAL_MIN) * 100}%`,
                        },
                    ]}
                >
                    <Text style={styles.tooltipText}>
                        {minutesToTime(preview.s)} – {minutesToTime(preview.e)}
                    </Text>
                </View>
            )}

            {/* ── Hint text ────────── */}
            {trams.length === 0 && !preview && (
                <Text style={styles.hintText}>
                    {t('timelinePainterHint')}
                </Text>
            )}
        </View>
    );
});

TimelinePainter.displayName = 'TimelinePainter';

/* ══════════════════════════════════════════
   Styles
   ══════════════════════════════════════════ */
const styles = StyleSheet.create({
    container: {
        position: 'relative',
        marginBottom: 6,
    },

    bar: {
        height: BAR_HEIGHT,
        backgroundColor: HC.borderSoft,
        borderRadius: BAR_RADIUS,
        position: 'relative',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: HC.border,
    },

    /* Flex-based tick rows — pixel-perfect, no percentage rounding */
    ticksRow: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
    },
    tickSection: {
        flex: 1,
        borderRightWidth: 1,
    },

    filledBlock: {
        position: 'absolute',
        top: 3,
        bottom: 3,
        borderRadius: 6,
    },

    labelsRow: {
        position: 'relative',
        height: 18,
        marginTop: 2,
    },
    label: {
        position: 'absolute',
        fontSize: 10,
        fontWeight: '500',
        color: HC.textLight,
        transform: [{ translateX: -14 }],
    },

    tooltip: {
        position: 'absolute',
        top: -28,
        transform: [{ translateX: -40 }],
        backgroundColor: HC.textPrimary,
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    tooltipText: {
        fontSize: 11,
        fontWeight: '700',
        color: HC.white,
    },

    hintText: {
        fontSize: 12,
        color: HC.textLight,
        fontStyle: 'italic',
        marginTop: 4,
    },
});
