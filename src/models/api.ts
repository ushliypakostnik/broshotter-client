// API Interfaces
///////////////////////////////////////////////////////

export interface IAPIService {
  enter: (payload: IEnter) => Promise<unknown>,
}

export interface IEnter {
  name: string,
}
