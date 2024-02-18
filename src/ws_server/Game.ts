import { Field, ShotStatus } from './Field';
import { Player } from './Player';
import { v4 as uuidv4 } from 'uuid';

export class Game {
  private owner: Player;
  private oponent: Player;
  private gameId: string;
  private ownerField: Field;
  private oponentField: Field;
  private oponentFieldJSON: string = '';
  private ownerFieldJSON: string = '';

  private turnId: number = 0;

  constructor(owner: Player, oponent: Player) {
    this.owner = owner;
    this.oponent = oponent;
    this.gameId = uuidv4();

    this.ownerField = new Field();
    this.oponentField = new Field();

    
    let message: string = JSON.stringify({
      type: 'create_game',
      id: 0,
      data: JSON.stringify({
        idGame: this.gameId,
        idPlayer: owner.getId(),
      }),
    });
    owner.getWS().send(message);
    message = JSON.stringify({
      type: 'create_game',
      id: 0,
      data: JSON.stringify({
        idGame: this.gameId,
        idPlayer: oponent.getId(),
      }),
    });
    oponent.getWS().send(message);

    owner.getWS().on('message', (message) => this.handleMessage(message.toString(), true));
    oponent.getWS().on('message', (message) => this.handleMessage(message.toString(), false));
  }

  handleMessage(message: string, isOwner: boolean): void {
    const { type, data } = JSON.parse(message.toString());
    if (type === 'add_ships') {
      this.addShips(data, isOwner);
    }
    if (type === 'attack') {
      this.attack(data);
    }
  }

  addShips(data: string, isOwner: boolean): void {
    const { ships } = JSON.parse(data);
    if (isOwner) {
      this.ownerField.placeShips(ships);
      this.ownerFieldJSON = ships;
      // console.log(this.ownerField.printField());
    } else {
      this.oponentField.placeShips(ships);
      this.oponentFieldJSON = ships;
      // console.log(this.oponentField.printField());
    }
    if (this.ownerField.getShipsOnField() && this.oponentField.getShipsOnField()) {
      let sendMessage = JSON.stringify({
        type: 'start_game',
        id: 0,
        data: JSON.stringify({ ships: this.ownerFieldJSON }),
        currentPlayerIndex: this.owner.getId(),
      });
      this.owner.getWS().send(sendMessage);
      this.turn(this.owner, this.owner.getId());

      sendMessage = JSON.stringify({
        type: 'start_game',
        id: 0,
        data: JSON.stringify({ ships: this.oponentFieldJSON }),
        currentPlayerIndex: this.oponent.getId(),
      });
      this.oponent.getWS().send(sendMessage);
      this.turn(this.oponent, this.owner.getId());
    }
  }

  turn(player: Player, playIndex: number): void {
    this.turnId = playIndex;
    const message = JSON.stringify({
      type: 'turn',
      data: JSON.stringify({currentPlayer: playIndex})
    })

    player.getWS().send(message);
  }

  attack(data: string): void {
    const { x, y, indexPlayer } = JSON.parse(data);
    if (this.turnId !== indexPlayer) {
      return;
    }

    const isOwner = this.owner.getId() === indexPlayer;
    
    const result = isOwner ? this.oponentField.attack(x, y) : this.ownerField.attack(x, y);
    
    this.feedback(indexPlayer, x, y, result);
    if (result === 'miss') {
      this.turn(this.owner, isOwner ? this.oponent.getId() : this.owner.getId());
      this.turn(this.oponent, isOwner ? this.oponent.getId() : this.owner.getId());
    } else if (result === 'killed') {
      const neighbourCells = isOwner ? this.oponentField.getNeighbourCells(x, y) : this.ownerField.getNeighbourCells(x, y);
      // console.log(neighbourCells);
      neighbourCells.forEach(cell => {
        this.feedback(indexPlayer, cell.x, cell.y, 'miss');
      })
    }

    console.log( isOwner ? this.oponentField.getShipsOnField() : this.ownerField.getShipsOnField() );
    
  }

  feedback(currentPlayer: number, x: number, y: number, status: ShotStatus): void {
    const data = { 
      position: { x, y },
      currentPlayer,
      status
    };
    const message = {
      type: 'attack',
      data: JSON.stringify(data),
      id: 0
    }
    this.owner.getWS().send(JSON.stringify(message));
    this.oponent.getWS().send(JSON.stringify(message));
  }
}
