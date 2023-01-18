import type { Text } from 'troika-three-text';

import type { AnimationAction, AnimationMixer, Group, Vector3 } from 'three';

// API Interfaces
///////////////////////////////////////////////////////

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
  selfharm = 'selfharm', // Самоповреждение
  onSelfharm = 'onSelfharm', // На самоповреждение
  relocation = 'relocation', // Переход на другую локацию
  onRelocation = 'onRelocation', // На переход на другую локацию
}

// Мир
export interface ITree {
  x: number;
  z: number;
  scale: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
}

export interface ITreeScene {
  model: Group;
  rotate: number;
}

export interface ILocation {
  id: string;
  x: number;
  y: number;
  name: string;
  ground: string;
  trees: ITree[];
  users: string[];
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
  location: string;
  startX: number;
  startY: number;
  startZ: number;
}

export interface IShotThree extends IShot {
  model: string;
}

export interface IExplosion extends IShot {
  enemy: string;
}

export interface IExplosionThree extends IShot {
  model: string;
  scale: number;
  isOff: boolean;
}

export interface IOnExplosion {
  message: IExplosion;
  updates: IUpdateMessage[];
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
  sound: string;
  scale: string;
  weapon: string;
  fire: string;
  text: typeof Text;
  isHide: boolean;
  isRun: boolean;
  isMove: boolean;
  isNotJump: boolean;
  isDead: boolean;
  mixer: AnimationMixer;
  prevAction: AnimationAction;
  nextAction: AnimationAction;
  isFire: boolean;
  isFireOff: boolean;
  fireScale: number;
}

// Оружие

export interface IUserOnShot {
  id: string;
  pseudo: string;
  positionX: number;
  positionY: number;
  positionZ: number;
}

// Кровь
export interface IBlood {
  id: number;
  velocity: Vector3;
  mesh: string;
  scale: number;
  isOff: boolean;
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
