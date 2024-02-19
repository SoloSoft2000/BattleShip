import { WebSocketServer, WebSocket } from 'ws';
import { Player } from './Player';
import { Winners } from './Winners';
import { Rooms } from './Rooms';
import { Room } from './Room';
import { Game } from './Game';
import { RegistrationData } from './utils/interfaces';

const players: Player[] = [];
const rooms = new Rooms();
const winners = new Winners();

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

const handleMessage = (message: string, ws: WebSocket): void => {
  const { type, data } = JSON.parse(message.toString());
  switch (type) {
    case 'reg':
      handleRegistration(data, ws);
      break;
    default:
      const player = findPlayerByWS(ws);
      if (player) {
        player.handleMessage(message);
      }
      break;
  }
};

const findPlayerByWS = (ws: WebSocket): Player | undefined => {
  return players.find((player) => player.getWS() === ws);
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

const createPlayer = (userInfo: RegistrationData, ws: WebSocket): Player => {
  const player = new Player(ws);

  player.on('update_room', (room: Room) => {
    if (!rooms.isUserHasRoom(player)) {
      rooms.push(room);
      sendUpdate('Rooms');
    }
  });

  player.on('start_game', (activeRoomIndex: number) => {
    const activeRoom = rooms.getRoomById(activeRoomIndex);
    if (activeRoom) {
      if (rooms.addUserToRoom(activeRoomIndex, player)) {
        sendUpdate('Rooms');
        const owner = activeRoom.getOwner();
        const game: Game | undefined = new Game(owner, player);

        const handlerOwner = (msg: string): void => game.handleOwner(msg);
        const handlerOponent = (msg: string): void => game.handleOponent(msg);

        owner.getWS().on('message', handlerOwner);
        player.getWS().on('message', handlerOponent);

        game.on('finish', (winPlayer: Player) => {
          owner.getWS().off('message', handlerOwner);
          player.getWS().off('message', handlerOponent);

          winners.addWinner(winPlayer);
          rooms.removeRoom(activeRoomIndex);
          sendUpdate('Rooms');
          sendUpdate('Winners');
          game.removeAllListeners();
        });
      }
    }
  });

  player.regUser(userInfo);
  return player;
};

const isPlayerAlreadyRegistered = (tempId: number): boolean => {
  return players.findIndex((item: Player) => item.getId() === tempId) !== -1;
};
