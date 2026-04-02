import api from '@/core/api/api';

export type TipusAbsencia = 'VACANCES' | 'MALALTIA' | 'PERMIS' | 'ALTRE';

export interface AbsenciaPendent {
    id: number;
    inici: string;
    fi: string;
    motiu?: string | null;
    tipus: TipusAbsencia;
    estat: 'PENDENT';
    createdAt: string;
    treballador: {
        id: number;
        nom: string;
        Usuari: { fotoPerfil: string | null };
    };
}

export interface AbsenciesPendentsPage {
    data: AbsenciaPendent[];
    total: number;
    page: number;
    rows: number;
    totalPages: number;
}

export const getAbsenciesPendents = (page = 1, rows = 4): Promise<AbsenciesPendentsPage> =>
    api.get('/absencies/pendents', { params: { page, rows } }).then(r => r.data);

export const updateEstatAbsencia = (id: number, estat: 'APROVADA' | 'REBUTJADA'): Promise<unknown> =>
    api.patch(`/absencies/${id}/estat`, { estat }).then(r => r.data);
