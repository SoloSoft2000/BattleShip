import { WebSocketServer, WebSocket } from 'ws';
import { Winners } from './Winners';
import { Rooms } from './Rooms';
import { DataBase } from './utils/interfaces';
import { handleClose, handleMessage } from './utils/handles';

const db: DataBase = {
  users: [],
  players: [],
  rooms: new Rooms(),
  winners: new Winners(),
  games: [],
};

export const serverListen = (wss: WebSocketServer): void => {
  wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (message) => {
      const msg = message.toString();
      handleMessage(msg, ws, db);
    });

    ws.on('close', () => {
      handleClose(ws, db);
    });
  });
};

export const closeServer = (wss: WebSocketServer): void => {
  const message = JSON.stringify({ type: 'close', data: 'Server is closing' });
  db.players.forEach((player) => {
    console.log('send "Server Close"');
    player.getWS().send(message);
    player.getWS().close();
  });
  wss.close();
};
