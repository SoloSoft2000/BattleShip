import { WebSocket } from 'ws';
import { createHmac } from 'crypto';
import { Room } from './Room';
import { EventEmitter } from 'events';
import { GamePlayer, RegistrationData } from './utils/interfaces';
import { BotPlayer } from './SingleMode/BotPlayer';
import { Game } from './Game';

export class Player extends EventEmitter implements GamePlayer {
  private name: string = '';
  private password: string = '';
  private idPlayer: number = 0;
  private ws: WebSocket;

  constructor(ws: WebSocket) {
    super();
    this.ws = ws;
  }

  handleMessage(message: string): void {
    const { type, data } = JSON.parse(message.toString());
    switch (type) {
      case 'create_room':
        const activeRoom = new Room(this);
        this.emit('update_room', activeRoom);
        break;
      case 'add_user_to_room':
        const idx = JSON.parse(data).indexRoom;
        this.emit('start_game', idx);
        break;
      case 'single_play':
        const bot = new BotPlayer(this.name);
        const game = new Game(this, bot);

        const handlerOwner = (msg: string): void => game.handleOwner(msg);
        const handlerOponent = (msg: string): void => game.handleOponent(msg);

        this.getWS().on('message', handlerOwner);
        bot.on('message', handlerOponent);

        game.on('finish', (winPlayer: GamePlayer) => {
          this.emit('finish_bot', winPlayer);
        });
        
        game.start();
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

  static GenerateId({ name, password }: RegistrationData): number {
    const hash = createHmac('sha256', 'BattleShip')
      .update(name + password)
      .digest('hex');
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
      errorText: '',
    });

    const regJson: string = JSON.stringify({
      type: 'reg',
      id: 0,
      data: userData,
    });

    this.ws.send(regJson);
  }

  static SendErrorLogin(ws: WebSocket): void {
    const userData = JSON.stringify({
      error: true,
      errorText: 'User is already logged in',
    });
    const regJson: string = JSON.stringify({
      type: 'reg',
      id: 0,
      data: userData,
    });
    ws.send(regJson);
  }
}
