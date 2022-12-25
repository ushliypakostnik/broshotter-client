// Root

// Constants
import { Names } from '@/utils/constants';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IStore {}

interface IStoreModule extends IStore {
  [key: string]: any;
}

// Common

export type TFieldPayload = {
  field: string;
  value: any;
};

// Preloader

type TPreloaderField = boolean;
export interface IPreloader extends IStore {
  [key: string]: TPreloaderField;
}

// Layout

export type TLanguage = string | null;

export type TEventMessagePayload = {
  id: number;
  text: string;
};

export interface ILayout extends IStoreModule {}
