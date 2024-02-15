import { WebSocket } from 'ws';
import { Player } from "./Player";

interface rowWinner {
  id: number,
  name: string,
  wins: number
}

interface rowWinnerDTO {
  name: string,
  wins: number
}

export class Winners {
  private tableWinners: rowWinner[] = [
    { id: 123, name: 'Eugene', wins: 2}, // example
    { id: 423, name: 'EugeneS', wins: 3}, // example
  ];

  constructor() {
  }

  addWinner(winner: Player): void {
    const winIndex = this.tableWinners.findIndex((row) => row.id === winner.getId());
    if (winIndex === -1) {
      this.tableWinners.push({
            id: winner.getId(),
            name: winner.getName(),
            wins: 1})
    } else {
      this.tableWinners[winIndex] = {
        ...this.tableWinners[winIndex],
        wins: this.tableWinners[winIndex].wins++
      }
    }
  }

  getWinners(): rowWinnerDTO[] {
    const result = this.tableWinners
      .sort((a, b) => b.wins - a.wins)
      .map((row) => { return { name: row.name, wins: row.wins } });
    return result;
  }

  send(ws: WebSocket): void {
    const message = {
      type: 'update_winners',
      id: 0,
      data: JSON.stringify(this.getWinners())
    }
    ws.send(JSON.stringify(message), err => {
      if (err)
      console.log(err);
    else 
      console.log('winners send');
    })
  }
}