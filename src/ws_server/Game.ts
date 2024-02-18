import { Field } from './Field';
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
      const { ships } = JSON.parse(data);
      if (isOwner) {
        this.ownerField.placeShips(ships);
        this.ownerFieldJSON = ships;
      } else {
        this.oponentField.placeShips(ships);
        this.oponentFieldJSON = ships;
      }
      if (this.ownerField.hasShips && this.oponentField.hasShips) {
        let sendMessage = JSON.stringify({
          type: 'start_game',
          id: 0,
          data: JSON.stringify({ ships: this.ownerFieldJSON }),
          currentPlayerIndex: 0,
        });
        this.owner.getWS().send(sendMessage);

        sendMessage = JSON.stringify({
          type: 'start_game',
          id: 0,
          data: JSON.stringify({ ships: this.oponentFieldJSON }),
          currentPlayerIndex: 1,
        });
        this.oponent.getWS().send(sendMessage);
      }
    }
  }
}
