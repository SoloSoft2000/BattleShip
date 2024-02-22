import { WebSocket } from 'ws';
import { DataBase, RegistrationData } from './interfaces';
import { Player } from '../Player';
import { Room } from '../Room';
import { Game } from '../Game';
import { sendUpdate } from './handles';

export const createPlayer = (userInfo: RegistrationData, ws: WebSocket, db: DataBase): Player => {
  const player = new Player(ws);

  player.on('update_room', (room: Room) => {
    if (db.rooms.getRoomByOwner(player) === -1) {
      db.rooms.push(room);
      sendUpdate('Rooms', db);
    }
  });

  player.on('start_game', (activeRoomIndex: number) => {
    const activeRoom = db.rooms.getRoomById(activeRoomIndex);
    if (activeRoom) {
      if (db.rooms.addUserToRoom(activeRoomIndex, player)) {
        const playerHasRoom = db.rooms.getRoomByOwner(player);
        if (playerHasRoom !== -1) {
          db.rooms.removeRoom(playerHasRoom);
        }
        sendUpdate('Rooms', db);
        const owner = activeRoom.getOwner();
        const game: Game = new Game(owner, player);
        db.games.push(game);

        const handlerOwner = (msg: string): void => game.handleOwner(msg);
        const handlerOponent = (msg: string): void => game.handleOponent(msg);

        owner.getWS().on('message', handlerOwner);
        player.getWS().on('message', handlerOponent);

        game.on('finish', (winPlayer: Player) => {
          owner.getWS().off('message', handlerOwner);
          player.getWS().off('message', handlerOponent);

          db.winners.addWinner(winPlayer);
          db.rooms.removeRoom(activeRoomIndex);
          sendUpdate('Rooms', db);
          sendUpdate('Winners', db);
          db.games.splice(db.games.indexOf(game), 1);
          game.removeAllListeners();
        });

        game.start();
      }
    }
  });

  player.on('finish_bot', (winPlayer: Player) => {
    db.winners.addWinner(winPlayer);
    sendUpdate('Winners', db);
  });

  player.regUser(userInfo);
  return player;
};
