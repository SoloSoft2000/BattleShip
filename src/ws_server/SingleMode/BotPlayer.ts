import { GamePlayer } from '../utils/interfaces';
import { EventEmitter } from 'events';
import { addShips } from './addShips';

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
        setTimeout(() => this.attack(), 2500); // Time for think
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
        setTimeout(() => {
          this.attack()
        }, 2500); // Time for think
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
      ships: addShips(),
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
}
