// API Interfaces
///////////////////////////////////////////////////////
// Тест REST API
export interface IIndex {
  name: string;
}

// Websockets
export enum EmitterEvents {
  onConnect = 'onConnect', // Ответ сервера на соединение
  onOnConnect = 'onOnConnect', // Ответ клиента серверу на соединение
  setNewPlayer = 'setNewPlayer', // Установить нового игрока
  updateToClients = 'updateToClients', // Ответ сервера на соединение
  updateToServer = 'updateToServer', // Пришло обновление от клиента
}

// Игрок

interface IUserId {
  id: string;
}

export interface IUser extends IUserId {
  id: string;
  name: string;
}

// Обновления игрока
export interface IUpdateMessage extends IUserId {
  updates: {
    [key: string]: number | string | boolean | null;
  };
}

// Игра
export interface IGameState {
  users: {
    [key: string]: IUser;
  };
}

// Обновления игры
export interface IGameUpdates {
  users: IUpdateMessage[];
}
