import { WebSocketServer } from 'ws';
import { Player } from './Player';
import { Winners } from './Winners';
import { Rooms } from './Rooms';
import { Room } from './Room';
import { Game } from './Game';

const players: Player[] = [];
const rooms = new Rooms();
const winners = new Winners();

export const gameServer = (): void => {
  const wss = new WebSocketServer({
    port: 3000,
    
  })

  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      const { type, data, id } = JSON.parse(message.toString());
      if (id) {
        return;
      }

      switch (type) {
        case 'reg':
          const userInfo = JSON.parse(data);
          const tempId = Player.GenerateId(userInfo);
          if (players.findIndex((item: Player) => item.getId() === tempId) === -1) {
            const player = new Player(ws, rooms, winners);
            player.on('update_room', () => {
              players.forEach((player) => rooms.send(player.getWS()));
            })
            player.on('start_game', (activeRoom: Room) => {
              players.forEach((player) => rooms.send(player.getWS()));
              new Game(activeRoom.getOwner(), player);
            })
            player.regUser(userInfo);
            players.push(player);
            winners.send(ws);
            rooms.send(ws);
          } else {
            Player.SendErrorLogin(ws);
          }
          break;
        default:
          break;
      }
    });
  });
} ;
