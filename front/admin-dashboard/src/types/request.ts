export interface RequestOptions extends RequestInit {
    headers?: Record<string, string>;
    timeout?: number;
  }
  
  export interface ErrorResponse {
    error: string;
    message: string;
    statusCode: number;
  }
  
  export type ApiResult<T> = 
    | { success: true; data: T }
    | { success: false; error: ErrorResponse };
  
  export interface UseRequestConfig {
    baseURL?: string;
    defaultHeaders?: Record<string, string>;
    timeout?: number;
  }