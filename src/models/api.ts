// API Interfaces
///////////////////////////////////////////////////////
// Тест REST API
export interface IIndex {
  name: string,
}

// Игрок
export interface IUser {
  id: number;
  name: string;
}

// Игра
export interface IGameState {
  game: {
    users: IUser[],
  },
}

// Обновления игрока
export interface IUploadMessage {
  user: IUser,
}

