export type Servei = {
  id: number;
  nom: string;
  duradaMin: number;
  preu: number;
  actiu: boolean;
};

export type ServeiPage = {
  data: Servei[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
  };
};
