import { WebSocketServer } from 'ws';
import { Player } from './Player';

export const gameServer = (): void => {
  const wss = new WebSocketServer({
    port: 3000,
    
  })

  wss.on('connection', (ws) => {
    const player = new Player(ws);
  
    ws.on('message', (message) => {
      const { type, data, id } = JSON.parse(message.toString());
      if (id) {
        return;
      }

      switch (type) {
        case 'reg':
          player.regUser(data);
          break;
        case 'create_room':
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

      console.log(type, data);
      

        const winners = [{ name: 'ddd', wins: 1}, { name: 'Eugene', wins: 2 }]; //[]

        const updateWinners: string = JSON.stringify({
          type: 'update_winners',
          id: 0,
          data: JSON.stringify(winners),
        })

        ws.send(updateWinners, (err) => {
          console.log(err);          
        } );
    });
  });
} ;
