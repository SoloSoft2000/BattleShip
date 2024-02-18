import { WebSocketServer, WebSocket } from 'ws';
import { Player } from './Player';
import { Winners } from './Winners';
import { Rooms } from './Rooms';
import { Room } from './Room';
import { Game } from './Game';

interface UserInfo {
  name: string;
  password: string;
}

const players: Player[] = [];
const rooms = new Rooms();
const winners = new Winners();

const handleMessage = (message: string, ws: WebSocket): void => {
  const { type, data } = JSON.parse(message.toString());

  switch (type) {
    case 'reg':
      handleRegistration(data, ws);
      break;
    default:
      break;
  }
};

const handleRegistration = (data: string, ws: WebSocket): void => {
  const userInfo = JSON.parse(data);
  const tempId = Player.GenerateId(userInfo);

  if (isPlayerAlreadyRegistered(tempId)) {
    Player.SendErrorLogin(ws);
    return;
  }

  const player = createPlayer(userInfo, ws);
  players.push(player);
  winners.send(ws);
  rooms.send(ws);
};

const sendUpdate = (type: 'Rooms' | 'Winners'): void => {
  players.forEach((player) => {
    if (type === 'Rooms') {
      rooms.send(player.getWS());
    } else {
      winners.send(player.getWS());
    }
  });
};

const createPlayer = (userInfo: UserInfo, ws: WebSocket): Player => {
  const player = new Player(ws, rooms);

  player.on('update_room', () => {
    sendUpdate('Rooms');
  });

  player.on('start_game', (activeRoom: Room) => {
    sendUpdate('Rooms');
    new Game(activeRoom.getOwner(), player);
  });

  player.regUser(userInfo);
  return player;
};

const isPlayerAlreadyRegistered = (tempId: number): boolean => {
  return players.findIndex((item: Player) => item.getId() === tempId) !== -1;
};

export const gameServer = (): void => {
  const wss = new WebSocketServer({
    port: 3000,
  });

  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      handleMessage(message.toString(), ws);
    });
  });
};
