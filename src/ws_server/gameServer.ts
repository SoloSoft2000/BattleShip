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
const games: Game[] = [];

export const serverListen = (wss: WebSocketServer): void => {
  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      const msg = message.toString();
      const { type, data } = JSON.parse(msg);
      console.log('received:', type);
      try {
        console.log('data:', JSON.parse(data));
      } catch (error) {
        console.log('data:', data);
        
      }
      handleMessage(msg, ws);
    });

    ws.on('close', () => {
      const closedPlayer = findPlayerByWS(ws);
      if (closedPlayer) {
        rooms.removeRoom(rooms.getRoomByOwner(closedPlayer));
        const startedGame: Game | undefined = games.find(game => game.getPlayers().includes(closedPlayer))
        if (startedGame) {
          const winner = startedGame.getPlayers().find(pl => pl.getId() !== closedPlayer.getId())?.getId();
          startedGame.finish(winner || 0);
          games.splice(games.indexOf(startedGame), 1);
        }
        players.splice(players.indexOf(closedPlayer), 1);
        sendUpdate('Rooms');
        sendUpdate('Winners');
      }
    })
  });
};

export const closeServer = (wss: WebSocketServer): void => {
  const message = JSON.stringify({ type: 'close', data: 'Server is closing' });
  players.forEach((player) => {
      player.getWS().send(message);
      player.getWS().close();
  })
  wss.close();
}

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

  if (!verifyPassword(userInfo)) {
    Player.SendErrorLogin(ws, 'Invalid password');
    return;
  }

  if (isPlayerAlreadyRegistered(tempId)) {
    Player.SendErrorLogin(ws, 'User is already logged in');
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
    if (rooms.getRoomByOwner(player) === -1) {
      rooms.push(room);
      sendUpdate('Rooms');
    }
  });

  player.on('start_game', (activeRoomIndex: number) => {
    const activeRoom = rooms.getRoomById(activeRoomIndex);
    if (activeRoom) {
      if (rooms.addUserToRoom(activeRoomIndex, player)) {
        const playerHasRoom = rooms.getRoomByOwner(player);
        if ( playerHasRoom !== -1) {
          rooms.removeRoom(playerHasRoom);
        }
        sendUpdate('Rooms');
        const owner = activeRoom.getOwner();
        const game: Game = new Game(owner, player);
        games.push(game);

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
          games.splice(games.indexOf(game), 1);
          game.removeAllListeners();
        });

        game.start();
      }
    }
  });

  player.on('finish_bot', (winPlayer: Player) => {
    winners.addWinner(winPlayer);
    sendUpdate('Winners');
  })

  player.regUser(userInfo);
  return player;
};

const isPlayerAlreadyRegistered = (tempId: number): boolean => {
  return players.findIndex((item: Player) => item.getId() === tempId) !== -1;
};

const verifyPassword = (userInfo: RegistrationData): boolean => {
  const { name, password } = userInfo;
  const idx = players.findIndex((player) => player.getName() === name);
  if (idx === -1 || players[idx].checkPassword(password)) {
    return true;
  } else 
  return false;
}