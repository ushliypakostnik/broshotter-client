// Client
import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Constants
import { API_URL } from '@/utils/constants';

// Types
import type { IEnter } from '@/models/api';

const instance: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

const responseBody = (response: AxiosResponse) => response.data;

export const APIService = {
  enter: (payload: IEnter): Promise<IEnter> =>
    instance.post<IEnter>('/', payload).then(responseBody),
};
