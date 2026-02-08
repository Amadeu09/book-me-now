export type ApiError = {
  status: number;
  message: string;
  code?: string;
};

export type ApiResponse<T> = {
  data: T;
  meta?: Record<string, any>;
};
