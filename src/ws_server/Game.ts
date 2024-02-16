// import { WebSocket } from 'ws';
import { Player } from './Player';
import { v4 as uuidv4 } from 'uuid';

export class Game {
  private owner: Player;
  private oponent: Player;
  private gameId: string;

  constructor(owner: Player, oponent: Player) {
    this.owner = owner;
    this.oponent = oponent;
    this.gameId = uuidv4();

    let message: string = JSON.stringify({
      type: 'create_game',
      id: 0,
      data: JSON.stringify({
        idGame: this.gameId,
        idPlayer: owner.getId()
      })
    })
    owner.getWS().send(message);
    message = JSON.stringify({
      type: 'create_game',
      id: 0,
      data: JSON.stringify({
        idGame: this.gameId,
        idPlayer: oponent.getId()
      })
    })
    oponent.getWS().send(message);
  }
}