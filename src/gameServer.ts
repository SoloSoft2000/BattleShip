import { WebSocketServer } from 'ws';

export const gameServer = (): void => {
  const wss = new WebSocketServer({
    port: 3000,
    
  })

  let userIdx = 0;

  wss.on('connection', (ws) => {
    console.log('new connection');
  
    ws.on('message', (message) => {
      const { type, data } = JSON.parse(message.toString());
      console.log(type, data);
      if (type === 'reg') {
        userIdx++;
        const { name, password } = JSON.parse(data);
        const userData = JSON.stringify({
          name, 
          index: userIdx,
          error: false,
          errorText: ''
        });

        const regJson: string = JSON.stringify({
          type: 'reg',
          id: 0,
          data: userData,
        })

        const winners = [{ name, wins: 1}, { name: 'Eugene', wins: 2 }]; //[]

        const updateWinners: string = JSON.stringify({
          type: 'update_winners',
          id: 0,
          data: JSON.stringify(winners),
        })

        console.log(password);
        console.log(regJson, updateWinners);
        
        
        ws.send(regJson, (err) => {
          console.log(err);          
        } );

        ws.send(updateWinners, (err) => {
          console.log(err);          
        } );
      }
    });
  });
} ;
