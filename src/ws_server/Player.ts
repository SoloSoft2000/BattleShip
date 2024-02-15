import { WebSocket } from 'ws';

interface RegistrationData {
  name: string,
  password: string
}

export class Player {
  private name: string = '';
  private password: string = '';
  private idPlayer: number;
  private ws: WebSocket;

  constructor(ws: WebSocket) {
    this.ws = ws;
    this.idPlayer = Date.now();
  }

  regUser(regData: RegistrationData): void {
    console.log(regData);
    
    this.name = regData.name;
    this.password = regData.password;

    const userData = JSON.stringify({
      name: this.name, 
      index: this.idPlayer,
      error: false,
      errorText: ''
    });

    const regJson: string = JSON.stringify({
      type: 'reg',
      id: 0,
      data: userData,
    })

    this.ws.send(regJson, (err) => {
      if (err)
        console.log(err);          
      console.log(`reg send`);
    } );
  }
}
