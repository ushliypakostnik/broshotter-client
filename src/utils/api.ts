// Client
import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Constants
import { API_URL } from '@/utils/constants';

// Types
import type { IIndex } from '@/models/api';

const instance: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

const responseBody = (response: AxiosResponse) => response.data;

export const APIService = {
  // Test REST API
  index: (payload: IIndex): Promise<IIndex> =>
    instance.post<IIndex>('/', payload).then(responseBody),
};
