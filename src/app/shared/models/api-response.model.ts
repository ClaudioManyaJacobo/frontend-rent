export interface SuccessResponse<T> {
  status: number;
  message: string;
  data: T;
  error: null;
}

export interface ErrorResponse {
  status: number;
  message: string;
  data: null;
  error: {
    details: unknown;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationResponse<T> {
  status: number;
  message: string;
  data: T[];
  meta: PaginationMeta;
  error: null;
}
