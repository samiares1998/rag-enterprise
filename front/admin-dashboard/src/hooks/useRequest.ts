import { useCallback, useRef } from 'react';
import type { RequestOptions, ErrorResponse, ApiResult, UseRequestConfig } from '../types/request';


//NO ME TOMARE EL TIEMPO DE ENTENDER ESTE CODIGO XD :v 

interface UseRequestReturn {
    request: <TResponse>(
        url: string,
        options?: RequestOptions
    ) => Promise<ApiResult<TResponse>>;

    GET: <TResponse>(
        url: string,
        options?: RequestOptions
    ) => Promise<ApiResult<TResponse>>;

    POST: <TBody, TResponse>(
        url: string,
        body: TBody,
        options?: RequestOptions
    ) => Promise<ApiResult<TResponse>>;

    PUT: <TBody, TResponse>(
        url: string,
        body: TBody,
        options?: RequestOptions
    ) => Promise<ApiResult<TResponse>>;

    PATCH: <TBody, TResponse>(
        url: string,
        body: TBody,
        options?: RequestOptions
    ) => Promise<ApiResult<TResponse>>;

    DELETE: <TResponse>(
        url: string,
        options?: RequestOptions
    ) => Promise<ApiResult<TResponse>>;
}

export const useRequest = (config?: UseRequestConfig): UseRequestReturn => {
    const abortControllers = useRef<Map<string, AbortController>>(new Map());

    const getFullUrl = useCallback((url: string): string => {
        if (url.startsWith('http')) return url;
        return config?.baseURL ? `${config.baseURL}${url}` : url;
    }, [config?.baseURL]);

    const getHeaders = useCallback((options?: RequestOptions): HeadersInit => {
        const defaultHeaders = config?.defaultHeaders || {};
        return {
            'Content-Type': 'application/json',
            ...defaultHeaders,
            ...options?.headers,
        };
    }, [config?.defaultHeaders]);

    const createAbortController = useCallback((url: string): AbortController => {
        const controller = new AbortController();
        abortControllers.current.set(url, controller);
        return controller;
    }, []);

    const cleanupAbortController = useCallback((url: string): void => {
        abortControllers.current.delete(url);
    }, []);

    const request = useCallback(async <TResponse>(
        url: string,
        options: RequestOptions = {}
    ): Promise<ApiResult<TResponse>> => {
        const fullUrl = getFullUrl(url);
        const controller = createAbortController(fullUrl);

        const timeout = options.timeout || config?.timeout || 10000;

        const timeoutId = setTimeout(() => {
            controller.abort();
        }, timeout);

        try {
            const response = await fetch(fullUrl, {
                ...options,
                headers: getHeaders(options),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            cleanupAbortController(fullUrl);

            // Manejar errores HTTP
            if (!response.ok) {
                const errorText = await response.text();
                let errorData: ErrorResponse;

                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = {
                        error: `HTTP Error ${response.status}`,
                        message: errorText || response.statusText,
                        statusCode: response.status,
                    };
                }

                return {
                    success: false,
                    error: errorData,
                };
            }

            // Manejar respuestas vacías (204 No Content)
            if (response.status === 204) {
                return {
                    success: true,
                    data: undefined as TResponse,
                };
            }

            const data = await response.json() as TResponse;

            return {
                success: true,
                data,
            };

        } catch (error) {
            clearTimeout(timeoutId);
            cleanupAbortController(fullUrl);

            const errorResponse: ErrorResponse = {
                error: 'Network Error',
                message: error instanceof Error ? error.message : 'Unknown error occurred',
                statusCode: 0,
            };

            if (error instanceof DOMException && error.name === 'AbortError') {
                errorResponse.error = 'Request Timeout';
                errorResponse.message = `Request took longer than ${timeout}ms`;
            }

            return {
                success: false,
                error: errorResponse,
            };
        }
    }, [getFullUrl, getHeaders, createAbortController, cleanupAbortController, config?.timeout]);

    // Métodos específicos
    const GET = useCallback(<TResponse>(
        url: string,
        options?: RequestOptions
    ): Promise<ApiResult<TResponse>> => {
        return request<TResponse>(url, { ...options, method: 'GET' });
    }, [request]);

    const POST = useCallback(<TBody, TResponse>(
        url: string,
        body: TBody,
        options?: RequestOptions
    ): Promise<ApiResult<TResponse>> => {
        return request<TResponse>(url, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body),
        });
    }, [request]);

    const PUT = useCallback(<TBody, TResponse>(
        url: string,
        body: TBody,
        options?: RequestOptions
    ): Promise<ApiResult<TResponse>> => {
        return request<TResponse>(url, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }, [request]);

    const PATCH = useCallback(<TBody, TResponse>(
        url: string,
        body: TBody,
        options?: RequestOptions
    ): Promise<ApiResult<TResponse>> => {
        return request<TResponse>(url, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    }, [request]);

    const DELETE = useCallback(<TResponse>(
        url: string,
        options?: RequestOptions
    ): Promise<ApiResult<TResponse>> => {
        return request<TResponse>(url, { ...options, method: 'DELETE' });
    }, [request]);

    // Cancelar peticiones pendientes al desmontar
    const cancelAllRequests = useCallback(() => {
        abortControllers.current.forEach(controller => controller.abort());
        abortControllers.current.clear();
    }, []);


    return {
        request,
        GET,
        POST,
        PUT,
        PATCH,
        DELETE,
    };
};