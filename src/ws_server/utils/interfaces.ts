import { WebSocket } from "ws";

export interface Position {
  x: number,
  y: number
}

export interface Ship {
  type: 'huge' | 'large' | 'medium' | 'small';
  direction: boolean;
  length: number;
  position: Position
}

export interface Cell {
  ship: Ship | null;
  hit: boolean;
}

export interface RegistrationData {
  name: string;
  password: string;
}

export interface RowRoomDTO {
  roomId: number;
  roomUsers: { name: string; index: number }[];
}

export interface RowWinner {
  id: number;
  name: string;
  wins: number;
}

export interface RowWinnerDTO {
  name: string;
  wins: number;
}

export interface GamePlayer {
  getId(): number;
  getWS(): WebSocket | { send: (message: string) => void };
  getName(): string;
}
