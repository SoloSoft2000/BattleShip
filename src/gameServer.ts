import { WebSocketServer } from 'ws';

export const gameServer = (): void => {
  const wss = new WebSocketServer({
    port: 3000,
    
  })

  wss.on('connection', (ws) => {
    console.log('new connection');
  
    ws.on('message', (message) => {
      const { type, data } = JSON.parse(message.toString());
      console.log(type, data);
    });
  });
} ;
