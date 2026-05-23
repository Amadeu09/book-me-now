export const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril',
    'Mayo', 'Junio', 'Julio', 'Agosto',
    'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

// Calendar circle colors — worker absences use cool tones, company events use warm tones
export const TREBALLADOR_COLORS: Record<string, string> = {
    VACANCES: '#3B82F6',  // blue
    MALALTIA: '#EF4444',  // red
    PERMIS:   '#8B5CF6',  // purple
    ALTRE:    '#6B7280',  // gray
};

export const EMPRESA_COLORS: Record<string, string> = {
    FESTA_LOCAL:   '#F97316',  // orange
    FESTA_ESTATAL: '#6366F1',  // primary indigo
    PONT:          '#F59E0B',  // amber
    ALTRE:         '#94A3B8',  // slate
};

export const TREBALLADOR_LABELS: Record<string, string> = {
    VACANCES: 'Vacances',
    MALALTIA: 'Malaltia',
    PERMIS:   'Permís',
    ALTRE:    'Altre',
};

export const EMPRESA_LABELS: Record<string, string> = {
    FESTA_LOCAL:   'Festa Local',
    FESTA_ESTATAL: 'Festa Estatal',
    PONT:          'Pont',
    ALTRE:         'Altre',
};
