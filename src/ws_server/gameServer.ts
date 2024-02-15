import { WebSocketServer } from 'ws';
import { Player } from './Player';
import { Winners } from './Winners';
import { Room } from './Room';

const players: Player[] = [];
const rooms: string[] = [];
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

            const updateRooms: string = JSON.stringify({
              type: 'update_room',
              id: 0,
              data: JSON.stringify(rooms),
            })

            ws.send(updateRooms, (err) => {
              if (err)
                console.log(err);
              else 
                console.log('rooms send');
            })
          } else {
            player.sendErrorLogin();
          }
          break;
        case 'create_room':
          activeRoom = new Room(player);
          rooms.push(activeRoom);
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
