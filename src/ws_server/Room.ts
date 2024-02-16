import { Player } from './Player';

export class Room {
  private id: number;
  private players: Player[] = [];

  constructor(player: Player) {
    this.id = Date.now();
    this.players.push(player);
  }

  addUser(player: Player): boolean {
    if (this.players.length < 2) {
      this.players.push(player);
      return true;
    }
    return false;
  }

  getId(): number {
    return this.id;
  }

  getOwner(): Player {
    return this.players[0];
  }

  getPlayerCount(): number {
    return this.players.length;
  }
}