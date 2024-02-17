import { WebSocket } from 'ws';
import { createHmac } from 'crypto';
import { Winners } from './Winners';
import { Rooms } from './Rooms';
import { Room } from './Room';

interface RegistrationData {
  name: string,
  password: string
}

export class Player {
  private name: string = '';
  private password: string = '';
  private idPlayer: number = 0;
  private ws: WebSocket;
  private rooms: Rooms;
  private winners: Winners;

  constructor(ws: WebSocket, rooms: Rooms, winners: Winners) {
    this.ws = ws;
    this.rooms = rooms;
    this.winners = winners;

    ws.on('message', (message) => {
      this.handleMessage(message.toString());
    })
  }

  handleMessage(message: string): void {
    const { type, data } = JSON.parse(message.toString());
    let activeRoom: Room | undefined;
    switch (type) {
      case 'create_room':
        activeRoom = new Room(this);
        this.rooms.push(activeRoom);

        // players.forEach((player) => rooms.send(player.getWS()));
        break;
      case 'add_user_to_room':
        const { indexRoom } = JSON.parse(data);
        if (this.rooms.addUserToRoom(indexRoom, this)) {
          activeRoom = this.rooms.getRoomById(indexRoom);
          // if (activeRoom) {
          //   players.forEach((player) => rooms.send(player.getWS()));
          //   new Game(activeRoom.getOwner(), player);
          // }
        }
        break;
    }
  }

  getId(): number {
    return this.idPlayer;
  }
  
  getName(): string {
    return this.name;
  }

  getWS(): WebSocket {
    return this.ws;
  }

  static GenerateId({name, password}: RegistrationData): number {
    const hash = createHmac('sha256', 'BattleShip').update(name + password).digest('hex');
    return parseInt(hash, 16);
  }

  regUser(regData: RegistrationData): void {
    this.name = regData.name;
    this.password = regData.password;

    this.idPlayer = Player.GenerateId(regData);
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

  static SendErrorLogin(ws: WebSocket): void {
    const userData = JSON.stringify({
      error: true,
      errorText: 'User is already logged in'
    })
    const regJson: string = JSON.stringify({
      type: 'reg',
      id: 0,
      data: userData,
    })
    ws.send(regJson);
  }
}
