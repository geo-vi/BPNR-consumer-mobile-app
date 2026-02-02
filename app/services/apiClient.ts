import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { logger } from './logger';

export const apiClient = axios.create({
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
  },
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    const url = error?.config?.url as string | undefined;
    const status = error?.response?.status as number | undefined;
    logger.warn('HTTP error', { url, status });
    return Promise.reject(error);
  },
);

export async function getJson<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res: AxiosResponse<T> = await apiClient.get(url, config);
  return res.data;
}

export async function postForm<T>(
  url: string,
  body: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res: AxiosResponse<T> = await apiClient.post(url, body, {
    ...config,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(config?.headers ?? {}),
    },
  });
  return res.data;
}

