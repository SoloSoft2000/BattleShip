import { WebSocket } from 'ws';
import { DataBase } from './interfaces';
import { Player } from '../Player';
import { findPlayerByWS, isPlayerAlreadyRegistered } from './playerUtils';
import { createPlayer } from './createPlayer';
import { Game } from '../Game';

export const handleMessage = (message: string, ws: WebSocket, db: DataBase): void => {
  const { type, data } = JSON.parse(message);
  console.log('received:', type);
  try {
    console.log('data:', JSON.parse(data));
  } catch (error) {
    console.log('data:', data);
  }
  switch (type) {
    case 'reg':
      handleRegistration(data, ws, db);
      break;
    default:
      const player = findPlayerByWS(ws, db);
      if (player) {
        player.handleMessage(message);
      }
      break;
  }
};

export const handleClose = (ws: WebSocket, db: DataBase): void => {
  const closedPlayer = findPlayerByWS(ws, db);
  if (closedPlayer) {
    db.rooms.removeRoom(db.rooms.getRoomByOwner(closedPlayer));
    const startedGame: Game | undefined = db.games.find((game) => game.getPlayers().includes(closedPlayer));
    if (startedGame) {
      const winner = startedGame
        .getPlayers()
        .find((pl) => pl.getId() !== closedPlayer.getId())
        ?.getId();
      startedGame.finish(winner || 0);
      db.games.splice(db.games.indexOf(startedGame), 1);
    }
    db.players.splice(db.players.indexOf(closedPlayer), 1);
    sendUpdate('Rooms', db);
    sendUpdate('Winners', db);
  }
};

const handleRegistration = (data: string, ws: WebSocket, db: DataBase): void => {
  const userInfo: { name: string; password: string } = JSON.parse(data);
  const tempId = Player.GenerateId(userInfo);

  const oldUser = db.users.find((user) => user.name === userInfo.name);

  if (oldUser) {
    if (oldUser.password !== userInfo.password) {
      Player.SendErrorLogin(ws, 'Invalid password');
      return;
    }
  } else {
    db.users.push(userInfo);
  }

  if (isPlayerAlreadyRegistered(tempId, db)) {
    Player.SendErrorLogin(ws, 'User is already logged in');
    return;
  }

  const player = createPlayer(userInfo, ws, db);
  db.players.push(player);
  db.winners.send(ws);
  db.rooms.send(ws);
};

export const sendUpdate = (type: 'Rooms' | 'Winners', db: DataBase): void => {
  db.players.forEach((player) => {
    if (type === 'Rooms') {
      db.rooms.send(player.getWS());
    } else {
      db.winners.send(player.getWS());
    }
  });
};
