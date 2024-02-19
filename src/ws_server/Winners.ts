import { WebSocket } from 'ws';
import { Player } from './Player';
import { RowWinner, RowWinnerDTO } from './utils/interfaces';

export class Winners {
  private tableWinners: RowWinner[] = [];

  constructor() {}

  addWinner(winner: Player): void {
    const winIndex = this.tableWinners.findIndex((row) => row.id === winner.getId());
    if (winIndex === -1) {
      this.tableWinners.push({
        id: winner.getId(),
        name: winner.getName(),
        wins: 1,
      });
    } else {
      console.log('win+1');

      const wins = this.tableWinners[winIndex].wins + 1;
      this.tableWinners[winIndex] = {
        ...this.tableWinners[winIndex],
        wins,
      };
    }
  }

  private getWinners(): RowWinnerDTO[] {
    const result = this.tableWinners
      .sort((a, b) => b.wins - a.wins)
      .map((row) => {
        return { name: row.name, wins: row.wins };
      });
    return result;
  }

  send(ws: WebSocket): void {
    const message = {
      type: 'update_winners',
      id: 0,
      data: JSON.stringify(this.getWinners()),
    };
    ws.send(JSON.stringify(message), (err) => {
      if (err) console.log(err);
      else console.log('winners send');
    });
  }
}
