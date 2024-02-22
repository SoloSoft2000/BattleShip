import { WebSocket } from 'ws';
import { DataBase } from './interfaces';
import { Player } from '../Player';

export const findPlayerByWS = (ws: WebSocket, db: DataBase): Player | undefined => {
  return db.players.find((player) => player.getWS() === ws);
};

export const isPlayerAlreadyRegistered = (tempId: number, db: DataBase): boolean => {
  return db.players.findIndex((item: Player) => item.getId() === tempId) !== -1;
};
