import { WebSocket } from 'ws';
import { createHmac } from 'crypto';

interface RegistrationData {
  name: string,
  password: string
}

export class Player {
  private name: string = '';
  private password: string = '';
  private idPlayer: number = 0;
  private ws: WebSocket;

  constructor(ws: WebSocket) {
    this.ws = ws;
  }

  getId(): number {
    return this.idPlayer;
  }
  
  getName(): string {
    return this.name;
  }

  generateId({name, password}: RegistrationData): number {
    const hash = createHmac('sha256', 'BattleShip').update(name + password).digest('hex');
    return parseInt(hash, 10);
  }

  regUser(regData: RegistrationData, id: number): void {
    this.name = regData.name;
    this.password = regData.password;

    this.idPlayer = id;
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

  sendErrorLogin(): void {
    const userData = JSON.stringify({
      error: true,
      errorText: 'User is already logged in'
    })
    const regJson: string = JSON.stringify({
      type: 'reg',
      id: 0,
      data: userData,
    })
    this.ws.send(regJson);
  }
}
