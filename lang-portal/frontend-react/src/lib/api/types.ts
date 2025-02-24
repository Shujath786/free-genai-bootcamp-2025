export interface APIError {
  message: string;
  code?: string;
  status?: number;
}

export interface APIResponse<T> {
  data: T;
  status: number;
  message?: string;
}