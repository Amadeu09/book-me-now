export const HC = {
    primary: '#6366F1',
    primaryLight: '#EEF2FF',
    primaryDark: '#4338CA',
    green: '#22C55E',
    greenLight: '#ECFDF5',
    yellow: '#F59E0B',
    yellowLight: '#FFFBEB',
    red: '#EF4444',
    redLight: '#FEF2F2',

    textPrimary: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#6B7280',
    textLight: '#9CA3AF',

    border: '#E5E7EB',
    borderInput: '#D1D5DB',
    borderSoft: '#F3F4F6',
    card: '#FFFFFF',
    screenBg: '#F8F9FB',
    inputBg: '#F9FAFB',

    white: '#FFFFFF',
    overlay: 'rgba(0,0,0,0.06)',
    modalOverlay: 'rgba(0,0,0,0.45)',

    // Status badge colors (skills doc §7)
    statusGreenBg: '#DCFCE7',
    statusGreenText: '#16A34A',
    statusYellowBg: '#FEF3C7',
    statusYellowText: '#D97706',
    statusRedBg: '#FEE2E2',
    statusRedText: '#DC2626',

    // Calendar event colors
    eventBlueBg: '#EBF5FF',
} as const;

export const cardShadow = {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
} as const;
