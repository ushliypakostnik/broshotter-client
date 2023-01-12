import type { Text } from 'troika-three-text';

import { AnimationAction, AnimationMixer } from 'three';

// API Interfaces
///////////////////////////////////////////////////////
// Тест REST API
export interface IIndex {
  name: string;
}

// Websockets
export enum EmitterEvents {
  onConnect = 'onConnect', // На присоединение пользователя
  onOnConnect = 'onOnConnect', // Ответ клиента серверу на соединение
  setNewPlayer = 'setNewPlayer', // Установить нового игрока
  onUpdatePlayer = 'onUpdatePlayer', // Подтвердить нового игрока
  enter = 'enter', // Назваться и зайти в игру
  onEnter = 'onEnter', // Отклик сервера о заходе
  reenter = 'reenter', // Начать сначала

  updateToClients = 'updateToClients', // Постоянные обновления клиентам
  updateToServer = 'updateToServer', // Пришло обновление от клиента

  shot = 'shot', // Выстрел
  onShot = 'onShot', // На выстрел
  unshot = 'unshot', // Удаление выстрела
  onUnshot = 'onUnshot', // На удаление выстрела
  explosion = 'explosion', // На взрыв
  onExplosion = 'onExplosion', // На ответ взрыв
  hits = 'hits', // Урон
}

// Движущийся объект принадлежащий игроку (выстрел) или сам игрок
export interface IMoveObject {
  positionX: number;
  positionY: number;
  positionZ: number;
  directionX: number;
  directionY: number;
  directionZ: number;
}

// Выстрел
export interface IShot extends IMoveObject {
  id: number | null;
  player: string;
  startX: number;
  startY: number;
  startZ: number;
}

export interface IShotThree extends IShot {
  model: string;
}

export interface IExplosion extends IShot {
  isOnEnemy: boolean;
}

export interface IExplosionThree extends IShot {
  model: string;
  scale: number;
  isOff: boolean;
}

export interface IOnExplosion {
  message: IExplosion;
  updates: IUpdateMessage[],
}

// Игрок

export interface IUser extends IMoveObject {
  id: string;
  name: string;
  health: number;
  animation: string;
  isFire: boolean;
  isOnHit: boolean;
}

export interface IUserThree extends IUser {
  model: string;
  pseudo: string;
  scale: string;
  weapon: string;
  fire: string;
  text: typeof Text;
  isHide: boolean;
  isRun: boolean;
  isMove: boolean;
  isNotJump: boolean;
  mixer: AnimationMixer;
  prevAction: AnimationAction;
  nextAction: AnimationAction;
  isFire: boolean;
  isFireOff: boolean;
  fireScale: number;
}

// Обновления игрока
export interface IUpdateMessage {
  [key: string]: number | string | boolean | null;
}

// Обновления игры
export interface IGameUpdates {
  users: IUser[];
  shots: IShot[];
}
