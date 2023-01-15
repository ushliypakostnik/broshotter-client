// Client
import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Types

// Constants
import { API_URL } from '@/utils/constants';

const instance: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

const responseBody = (response: AxiosResponse) => response.data;

export const APIService = {
  getLocation: (id: string): Promise<any> =>
    instance.get(`/${id}`).then(responseBody),

  getMap: (): Promise<any> =>
    instance.get('/map').then(responseBody),
};
