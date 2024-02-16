import { WebSocketServer } from 'ws';
import { Player } from './Player';
import { Winners } from './Winners';
import { Room } from './Room';
import { Rooms } from './Rooms';

const players: Player[] = [];
const rooms = new Rooms();
const winners = new Winners();

export const gameServer = (): void => {
  const wss = new WebSocketServer({
    port: 3000,
    
  })

  wss.on('connection', (ws) => {
    const player = new Player(ws);
    let activeRoom: Room;  

    ws.on('message', (message) => {
      const { type, data, id } = JSON.parse(message.toString());
      if (id) {
        return;
      }

      switch (type) {
        case 'reg':
          const userInfo = JSON.parse(data);
          const tempId = player.generateId(userInfo);
          if (players.findIndex((item: Player) => item.getId() === tempId) === -1) {
            player.regUser(userInfo, tempId);
            players.push(player);
            winners.send(ws);
            rooms.send(ws);
          } else {
            player.sendErrorLogin();
          }
          break;
        case 'create_room':
          activeRoom = new Room(player);
          rooms.push(activeRoom);
          players.forEach((player) => rooms.send(player.getWS()));
          // rooms.send(ws);
          break;
        case 'add_user_to_room':
          break;
        case 'add_ships':
          break;
        case 'attack':
          break;
        case 'randomAttack':
          break;
        default:
          break;
      }
    });
  });
} ;
