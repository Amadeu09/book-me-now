export interface ClientItem {
    id: number;
    nom: string;
    email?: string | null;
    telefon?: string | null;
    empresaId: number;
    createdAt: string;
    updatedAt: string;
}

export interface ClientsPaginatedResponse {
    data: ClientItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
