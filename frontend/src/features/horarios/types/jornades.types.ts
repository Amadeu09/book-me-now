/* ──────────────────────────────────────────
   Jornades (plantillas de horario) – Types
   ────────────────────────────────────────── */

/** Tramo horario dentro de un día */
export interface Tram {
    iniciMin: number;   // minutos desde 00:00 (ej: 480 = 08:00)
    fiMin: number;      // minutos desde 00:00 (ej: 840 = 14:00)
}

/** Día dentro de una rotación */
export interface DiaRotacio {
    dow: number;          // 1 = Lunes … 7 = Domingo
    esDescans: boolean;
    trams: Tram[];
}

/** Rotación (una semana-tipo) */
export interface Rotacio {
    index: number;
    nom: string;
    dies: DiaRotacio[];
}

/** Payload para crear una plantilla */
export interface CreateJornadaPayload {
    empresaId: number;
    nom: string;
    activa: boolean;
    rotacions: Rotacio[];
}

/** Estado del formulario (sin empresaId, se inyecta al guardar) */
export interface JornadaFormState {
    nom: string;
    activa: boolean;
    rotacions: Rotacio[];
}

/* ── Helpers ───────────────────────────── */

export const DOW_LABELS: Record<number, string> = {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado',
    7: 'Domingo',
};

/** Convierte HH:MM a minutos desde medianoche */
export function timeToMinutes(hh: number, mm: number): number {
    return hh * 60 + mm;
}

/** Convierte minutos desde medianoche a "HH:MM" */
export function minutesToTime(min: number): string {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Genera la semana por defecto (7 días, Domingo descanso) */
export function createDefaultWeek(): DiaRotacio[] {
    return Array.from({ length: 7 }, (_, i) => ({
        dow: i + 1,
        esDescans: i + 1 === 7, // Domingo descanso por defecto
        trams: [],
    }));
}

/** Genera una rotación por defecto */
export function createDefaultRotation(index: number): Rotacio {
    return {
        index,
        nom: `Rotación ${index + 1}`,
        dies: createDefaultWeek(),
    };
}

/* ── API Response types ────────────────── */

/** Respuesta del backend para GET /empreses/:id/jornades */
export interface JornadaPlantillaResponse {
    id: number;
    empresaId: number;
    nom: string;
    activa: boolean;
    rotacions: (Rotacio & { id?: number })[];
}

/** Resumen derivado para mostrar en PlantillaCard */
export interface PlantillaSummary {
    id: number;
    nom: string;
    activa: boolean;
    daysLabel: string;       // e.g. "L-V" or "L-D"
    hoursLabel: string;      // e.g. "09:00 - 18:00"
    rotationsCount: number;
    accentColor: string;
}

const ACCENT_COLORS = ['#6366F1', '#3B82F6', '#8B5CF6', '#22C55E', '#EF4444', '#F59E0B'];
const SHORT_DOW: Record<number, string> = { 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S', 7: 'D' };

/** Transforma la respuesta cruda del API en un resumen para la UI */
export function summarizePlantilla(p: JornadaPlantillaResponse, index: number): PlantillaSummary {
    const firstRotation = p.rotacions[0];
    let daysLabel = '—';
    let hoursLabel = '—';

    if (firstRotation) {
        // Días laborables (no descanso)
        const workDays = firstRotation.dies
            .filter((d) => !d.esDescans)
            .sort((a, b) => a.dow - b.dow);

        if (workDays.length > 0) {
            const first = SHORT_DOW[workDays[0].dow];
            const last = SHORT_DOW[workDays[workDays.length - 1].dow];
            daysLabel = workDays.length === 1 ? first : `${first}-${last}`;
        }

        // Rango horario del primer día con tramos
        const dayWithTrams = firstRotation.dies.find((d) => d.trams.length > 0);
        if (dayWithTrams) {
            const allStarts = dayWithTrams.trams.map((t) => t.iniciMin);
            const allEnds = dayWithTrams.trams.map((t) => t.fiMin);
            hoursLabel = `${minutesToTime(Math.min(...allStarts))} - ${minutesToTime(Math.max(...allEnds))}`;
        }
    }

    return {
        id: p.id,
        nom: p.nom,
        activa: p.activa,
        daysLabel,
        hoursLabel,
        rotationsCount: p.rotacions.length,
        accentColor: ACCENT_COLORS[index % ACCENT_COLORS.length],
    };
}

/** Respuesta paginada del backend para GET /empreses/:id/jornades/paginadas */
export interface JornadaPlantillaPaginatedResponse {
    data: JornadaPlantillaResponse[];
    total: number;
    page: number;
    rows: number;
    totalPages: number;
}
