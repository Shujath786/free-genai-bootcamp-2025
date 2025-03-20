import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { API_CONFIG } from './config';
import { APIError, APIResponse } from './types';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create(API_CONFIG);
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(this.handleError(error))
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(this.handleError(error))
    );
  }

  private handleError(error: AxiosError): APIError {
    return {
      message: error.response?.data?.message || 'An unexpected error occurred',
      code: error.code,
      status: error.response?.status,
    };
  }

  async get<T>(url: string, params?: object): Promise<APIResponse<T>> {
    const response: AxiosResponse<T> = await this.client.get(url, { params });
    return {
      data: response.data,
      status: response.status,
    };
  }

  async post<T>(url: string, data?: object): Promise<APIResponse<T>> {
    const response: AxiosResponse<T> = await this.client.post(url, data);
    return {
      data: response.data,
      status: response.status,
    };
  }

  async put<T>(url: string, data?: object): Promise<APIResponse<T>> {
    const response: AxiosResponse<T> = await this.client.put(url, data);
    return {
      data: response.data,
      status: response.status,
    };
  }

  async delete<T>(url: string): Promise<APIResponse<T>> {
    const response: AxiosResponse<T> = await this.client.delete(url);
    return {
      data: response.data,
      status: response.status,
    };
  }
}

export const apiClient = new APIClient();