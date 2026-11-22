export type TipusAbsenciaEmpresa = 'FESTA_LOCAL' | 'FESTA_ESTATAL' | 'PONT' | 'ALTRE';

export interface AbsenciaEmpresa {
    id: number;
    empresaId: number;
    titol: string;
    inici: string;
    fi: string;
    tipus: TipusAbsenciaEmpresa;
    createdAt: string;
    updatedAt: string;
    /** Cites actives dins del tancament (només tancaments futurs). */
    reservesAfectades?: number;
}

export interface CreateAbsenciaEmpresaDto {
    titol: string;
    inici: string;
    fi?: string;
    tipus: TipusAbsenciaEmpresa;
}
