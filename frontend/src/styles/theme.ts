// Global theme configuration
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

export const typography = {
    h1: { fontSize: 28, fontWeight: '800' },
    h2: { fontSize: 24, fontWeight: '800' },
    h3: { fontSize: 18, fontWeight: '800' },
    body: { fontSize: 15, fontWeight: '400' },
    bodySmall: { fontSize: 14, fontWeight: '400' },
    caption: { fontSize: 12, fontWeight: '500' },
    label: { fontSize: 15, fontWeight: '600' },
} as const;
