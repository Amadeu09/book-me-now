/* ──────────────────────────────────────────
   Horarios – Colors, Types & Mock Data
   ────────────────────────────────────────── */

// ─── Colors ───────────────────────────────
export const HC = {
    primary: '#FF6A00',
    primaryLight: '#FFF1E8',
    primaryDark: '#E55D00',
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
    borderSoft: '#F3F4F6',
    card: '#FFFFFF',
    screenBg: '#F8F9FB',

    white: '#FFFFFF',
    overlay: 'rgba(0,0,0,0.06)',
} as const;

// ─── Shadow ───────────────────────────────
export const cardShadow = {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
} as const;

// ─── Types ────────────────────────────────
export type EmployeeStatus = 'available' | 'break' | 'vacation';

export interface Employee {
    id: string;
    name: string;
    role: string;
    shift: string;
    status: EmployeeStatus;
    initials: string;
    avatarColor: string;
    templateName: string;
    photoUri?: string | null;
}


export interface DayScheduleConfig {
    label: string;
    status: 'open' | 'reduced' | 'closed';
    timeStart?: string;
    timeEnd?: string;
}

export interface HolidayTag {
    id: string;
    label: string;
}

// ─── Status helpers ───────────────────────
export const STATUS_CONFIG: Record<EmployeeStatus, {
    label: string;
    color: string;
    bgColor: string;
    dotColor: string;
}> = {
    available: { label: 'DISPONIBLE', color: HC.green, bgColor: HC.greenLight, dotColor: HC.green },
    break: { label: 'EN DESCANSO', color: HC.yellow, bgColor: HC.yellowLight, dotColor: HC.yellow },
    vacation: { label: 'Vacaciones', color: HC.primary, bgColor: HC.primaryLight, dotColor: HC.primary },
};

export const DAY_STATUS_CONFIG: Record<string, {
    label: string; color: string; bgColor: string;
}> = {
    open: { label: 'ABIERTO', color: HC.green, bgColor: HC.greenLight },
    reduced: { label: 'REDUCIDO', color: HC.primary, bgColor: HC.primaryLight },
    closed: { label: 'CERRADO', color: HC.textMuted, bgColor: HC.borderSoft },
};

// ─── Mock data ────────────────────────────
export const MOCK_EMPLOYEES: Employee[] = [
    {
        id: '1', name: 'Ana López', role: 'ESTILISTA SENIOR',
        shift: 'Mañana: 08:00 - 14:00', status: 'available',
        initials: 'AL', avatarColor: '#E0C8A8', templateName: 'Jornada Completa',
    },
    {
        id: '2', name: 'Carlos Ruiz', role: 'BARBERO',
        shift: 'Jornada: 09:00 - 18:00', status: 'available',
        initials: 'CR', avatarColor: '#A8C8E0', templateName: 'Turno Mañana',
    },
    {
        id: '3', name: 'Maria Gonzalez', role: 'MANICURISTA',
        shift: 'Tarde: 14:00 - 20:00', status: 'vacation',
        initials: 'MG', avatarColor: '#C8E0A8', templateName: 'Personalizado',
    },
    {
        id: '4', name: 'Elena Martínez', role: 'ESTILISTA',
        shift: 'Mañana: 08:00 - 14:00', status: 'available',
        initials: 'EM', avatarColor: '#D4B896', templateName: 'Turno Mañana',
    },
    {
        id: '5', name: 'Ricardo Soto', role: 'BARBERO',
        shift: 'Jornada: 09:00 - 18:00', status: 'break',
        initials: 'RS', avatarColor: '#B0C4DE', templateName: 'Jornada Completa',
    },
    {
        id: '6', name: 'Carla Benítez', role: 'ESTILISTA',
        shift: 'Tarde: 14:00 - 20:00', status: 'available',
        initials: 'CB', avatarColor: '#C8A8E0', templateName: 'Turno Mañana',
    },
];



export const MOCK_DAY_SCHEDULE: DayScheduleConfig[] = [
    { label: 'LUNES - VIERNES', status: 'open', timeStart: '09:00 AM', timeEnd: '06:00 PM' },
    { label: 'SÁBADO', status: 'reduced', timeStart: '10:00 AM', timeEnd: '02:00 PM' },
    { label: 'DOMINGO', status: 'closed' },
];

export const MOCK_HOLIDAYS: HolidayTag[] = [
    { id: '1', label: '25 Dic' },
    { id: '2', label: '1 Ene' },
];

export const WEEKDAY_LABELS = ['L', 'M', 'M', 'J', 'V'];

export const TAB_KEYS = ['global', 'plantillas', 'personal'] as const;
export type TabKey = typeof TAB_KEYS[number];
export const TAB_LABELS: Record<TabKey, string> = {
    global: 'Global',
    plantillas: 'Plantillas',
    personal: 'Personal',
};
