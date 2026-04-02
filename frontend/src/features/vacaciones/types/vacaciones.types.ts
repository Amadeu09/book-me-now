export type DayStatus = 'approved' | 'holiday' | 'today' | null;

export type TipusAbsenciaTreballador = 'VACANCES' | 'MALALTIA' | 'PERMIS' | 'ALTRE';
export type TipusAbsenciaEmpresa = 'FESTA_LOCAL' | 'FESTA_ESTATAL' | 'PONT' | 'ALTRE';

export type EstatAbsencia = 'PENDENT' | 'APROVADA' | 'REBUTJADA';

export interface AbsenciaTreballador {
    id: number;
    treballadorId: number;
    inici: string;
    fi: string;
    motiu?: string;
    tipus: TipusAbsenciaTreballador;
    estat: EstatAbsencia;
    createdAt: string;
}

export interface AbsenciaEmpresa {
    id: number;
    empresaId: number;
    titol: string;
    inici: string;
    fi: string;
    tipus: TipusAbsenciaEmpresa;
    createdAt: string;
}

export interface AbsenciesCalendariResponse {
    treballador: AbsenciaTreballador[];
    empresa: AbsenciaEmpresa[];
    diesVacancesAnuals: number;
    missatgeDies: string | null;
}

export interface CreateAbsenciaPayload {
    inici: string;
    fi: string;
    tipus: TipusAbsenciaTreballador;
    motiu?: string;
}
