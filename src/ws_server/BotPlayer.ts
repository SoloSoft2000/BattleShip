import { GamePlayer, Ship } from './utils/interfaces';
import { EventEmitter } from 'events';

export class BotPlayer extends EventEmitter implements GamePlayer {
  private name: string;
  private idPlayer: number;
  private idGame: string = '';
  private ourHit: boolean = false;

  constructor(name: string) {
    super();
    this.name = `Bot for play with ${name}`;
    this.idPlayer = Date.now();
  }

  handleMessage(message: string): void {
    const { type, data } = JSON.parse(message);
    if (type === 'create_game') {
      this.idGame = JSON.parse(data).idGame;
      this.createGame();
      return;
    }
    if (type === 'turn') {
      const { currentPlayer } = JSON.parse(data);
      if (currentPlayer === this.idPlayer) {
        this.ourHit = true;
        this.attack();
      } else {
        this.ourHit = false;
      }
      return;
    }
    if (type === 'attack') {
      const { currentPlayer, status } = JSON.parse(data);
      if (currentPlayer === this.idPlayer) {
        console.log('save data after attack' ,status);
      }
      if (status !== 'miss' && this.ourHit) {
        this.attack();
      }
      return;
    }
    
  }

  private attack(): void {
    const dataToSend = {
      gameId: this.idGame,
      indexPlayer: this.idPlayer,
    };
    const msg = {
      type: 'randomAttack',
      id: 0,
      data: JSON.stringify(dataToSend),
    };
    this.emit('message', JSON.stringify(msg));
  }

  private createGame(): void {
    const dataToSend = {
      gameId: this.idGame,
      indexPlayer: this.idPlayer,
      ships: this.addShip(),
    };
    const msg = {
      type: 'add_ships',
      id: 0,
      data: JSON.stringify(dataToSend),
    };
    this.emit('message', JSON.stringify(msg));
  }

  getId(): number {
    return this.idPlayer;
  }

  send(message: string): void {
    this.handleMessage(message);
  }

  getWS(): { send: (message: string) => void } {
    return {
      send: (message: string): void => {
        this.send(message);
      },
    };
  }

  getName(): string {
    return this.name;
  }

  private addShip(): Ship[] {
    const result: Ship[] = [
      {
        position: {
          x: 5,
          y: 5,
        },
        direction: false,
        type: 'huge',
        length: 4,
      },
      {
        position: {
          x: 5,
          y: 0,
        },
        direction: true,
        type: 'large',
        length: 3,
      },
      {
        position: {
          x: 7,
          y: 0,
        },
        direction: true,
        type: 'large',
        length: 3,
      },
      {
        position: {
          x: 1,
          y: 7,
        },
        direction: true,
        type: 'medium',
        length: 2,
      },
      {
        position: {
          x: 8,
          y: 7,
        },
        direction: true,
        type: 'medium',
        length: 2,
      },
      {
        position: {
          x: 4,
          y: 8,
        },
        direction: false,
        type: 'medium',
        length: 2,
      },
      {
        position: {
          x: 0,
          y: 0,
        },
        direction: false,
        type: 'small',
        length: 1,
      },
      {
        position: {
          x: 2,
          y: 1,
        },
        direction: false,
        type: 'small',
        length: 1,
      },
      {
        position: {
          x: 2,
          y: 4,
        },
        direction: false,
        type: 'small',
        length: 1,
      },
      {
        type: 'small',
        direction: false,
        length: 1,
        position: {
          x: 0,
          y: 2,
        },
      },
    ];
    return result;
  }
}
