import { Field, ShotStatus } from './Field';
import { Player } from './Player';
import { randomInt, randomUUID } from 'crypto';
import { EventEmitter } from 'events';
import { GamePlayer } from './utils/interfaces';
import { FIELD_SIZE } from './utils/consts';

export class Game extends EventEmitter {
  private owner: Player;
  private oponent: GamePlayer;
  private gameId: string;
  private ownerField: Field;
  private oponentField: Field;
  private oponentFieldJSON: string = '';
  private ownerFieldJSON: string = '';
  private turnId: number = 0;

  constructor(owner: Player, oponent: GamePlayer) {
    super();
    this.owner = owner;
    this.oponent = oponent;
    this.gameId = randomUUID();
    this.ownerField = new Field(FIELD_SIZE);
    this.oponentField = new Field(FIELD_SIZE);
  }

  start(): void {
    const playersInGame = [this.owner, this.oponent];
    playersInGame.forEach((player) => {
      const message: string = JSON.stringify({
        type: 'create_game',
        id: 0,
        data: JSON.stringify({
          idGame: this.gameId,
          idPlayer: player.getId(),
        }),
      });
      player.getWS().send(message);
    });
  }

  handleOwner(message: string): void {
    this.handleMessage(message, true);
  }

  handleOponent(message: string): void {
    this.handleMessage(message, false);
  }

  handleMessage(message: string, isOwner: boolean): void {
    const { type, data } = JSON.parse(message.toString());
    if (type === 'add_ships') {
      this.addShips(data, isOwner);
    }
    if (type === 'attack') {
      this.attack(data);
    }
    if (type === 'randomAttack') {
      this.randomAttack(data);
    }
  }

  randomAttack(data: string): void {
    const { indexPlayer, gameId } = JSON.parse(data);
    const field = indexPlayer === this.owner.getId() ? this.oponentField : this.ownerField;

    let freeCell;
    do {
      const x = randomInt(0, FIELD_SIZE );
      const y = randomInt(0, FIELD_SIZE );
      const isAlreadyHit = field.getCellAlreadyHit(x, y);
      if (!isAlreadyHit) freeCell = { x, y };
    } while (!freeCell);

    const newData = { gameId, indexPlayer, x: freeCell.x, y: freeCell.y };
    this.attack(JSON.stringify(newData));
  }

  addShips(data: string, isOwner: boolean): void {
    const { ships } = JSON.parse(data);
    if (isOwner) {
      console.log('add Owner');

      this.ownerField.placeShips(ships);
      this.ownerFieldJSON = ships;
    } else {
      console.log('add Oponent');

      this.oponentField.placeShips(ships);
      this.oponentFieldJSON = ships;
    }
    if (this.ownerField.getShipsOnField() && this.oponentField.getShipsOnField()) {
      const playersInGame = [this.owner, this.oponent];
      playersInGame.forEach((player) => {
        const fieldJSON = player === this.owner ? this.ownerFieldJSON : this.oponentFieldJSON;
        const message = JSON.stringify({
          type: 'start_game',
          id: 0,
          data: JSON.stringify({ ships: fieldJSON }),
          currentPlayerIndex: player.getId(),
        });
        player.getWS().send(message);
        this.turn(player, this.owner.getId());
      });
    }
  }

  turn(player: GamePlayer, playIndex: number): void {
    this.turnId = playIndex;
    const message = JSON.stringify({
      type: 'turn',
      data: JSON.stringify({ currentPlayer: playIndex }),
    });

    player.getWS().send(message);
  }

  attack(data: string): void {
    const { x, y, indexPlayer } = JSON.parse(data);
    if (this.turnId !== indexPlayer) {
      return;
    }
    const isOwner = this.owner.getId() === indexPlayer;
    const field = isOwner ? this.oponentField : this.ownerField;

    const result = field.attack(x, y);
    if (result === 'already') return;

    this.feedback(indexPlayer, x, y, result);
    if (result === 'miss') {
      const nextPlayer = isOwner ? this.oponent.getId() : this.owner.getId();
      this.turn(this.owner, nextPlayer);
      this.turn(this.oponent, nextPlayer);
    } else if (result === 'killed') {
      const neighbourCells = field.getNeighbourCells(x, y);
      neighbourCells.forEach((cell) => {
        this.feedback(indexPlayer, cell.x, cell.y, 'miss');
      });
      const isFinish = field.getShipsOnField() === 0;
      if (isFinish) {
        const winPlayer = this.turnId;
        const data = { winPlayer };
        const message = {
          type: 'finish',
          data: JSON.stringify(data),
          id: 0,
        };

        this.owner.getWS().send(JSON.stringify(message));
        this.oponent.getWS().send(JSON.stringify(message));
        this.emit('finish', winPlayer === this.owner.getId() ? this.owner : this.oponent);
      }
    }
  }

  feedback(currentPlayer: number, x: number, y: number, status: ShotStatus): void {
    const data = {
      position: { x, y },
      currentPlayer,
      status,
    };
    const message = {
      type: 'attack',
      data: JSON.stringify(data),
      id: 0,
    };
    this.owner.getWS().send(JSON.stringify(message));
    this.oponent.getWS().send(JSON.stringify(message));
  }
}
