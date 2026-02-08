import { StyleSheet } from 'react-native';

export const palette = {
    background: '#ffffff',
    textPrimary: '#0f172a',
    textMuted: '#475569',
    textSubtle: '#6b7280',
    border: '#d1d5db',
    borderSoft: '#e5e7eb',
    accent: '#0f172a',
    danger: '#ef4444',
    overlay: 'rgba(0,0,0,0.25)',
};

export const spacing = {
    xs: 4,
    sm: 6,
    md: 10,
    lg: 12,
    xl: 16,
    xxl: 24,
    gutter: 16,
    gutterWeb: 48,
};

export const radius = {
    sm: 8,
    md: 10,
    lg: 12,
    xl: 14,
    modal: 16,
    pill: 999,
};

export const shadow = {
    card: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 1,
    },
};

export const servicesStyles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: palette.background },
    container: {
        flex: 1,
        padding: spacing.gutter,
        paddingBottom: spacing.xxl,
        backgroundColor: palette.background,
    },
    containerWeb: {
        paddingHorizontal: spacing.gutterWeb,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
    },
    title: { fontSize: 24, fontWeight: '800', color: palette.textPrimary },
    btnPrimary: {
        backgroundColor: palette.accent,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: radius.md,
    },
    btnDisabled: { opacity: 0.7 },
    btnPrimaryText: { color: palette.background, fontWeight: '700' },
    listContent: {
        gap: spacing.xl,
        paddingBottom: spacing.xxl + spacing.md,
    },
    columnWrapper: {
        gap: spacing.xl,
    },
    paginationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xl,
        paddingTop: spacing.md,
    },
    pageBtn: {
        width: 44,
        height: 44,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: palette.border,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette.background,
    },
    pageBtnDisabled: {
        opacity: 0.4,
    },
    pageBtnText: { fontSize: 18, fontWeight: '700', color: palette.textPrimary },
    pageMeta: { fontSize: 14, color: palette.textMuted },
    loaderBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl },
    emptyText: { color: palette.textSubtle, fontSize: 14 },
});
