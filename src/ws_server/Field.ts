interface Ship {
  type: 'huge' | 'large' | 'medium' | 'small';
  direction: boolean;
  length: 4 | 3 | 2 | 1;
  position: {
    x: number;
    y: number;
  };
  hitLeft: number;
}

interface Cell {
  ship: Ship | null;
  hit: boolean;
}

export type ShotStatus = 'miss'|'killed'|'shot';

export class Field {
  private field: Cell[][];
  private ships: Ship[];

  constructor(size: number = 10) {
    this.field = Array.from( {length: size }, () => Array(size).fill({ship: null, hit: false}));
    this.ships = [];
  }

  placeShips(shipsForParce: Ship[]): void {
    shipsForParce.forEach((item) => {
      const { x, y } = item.position;
      
      const direction = item.direction ? 'vertical' : 'horizontal';
      const length = Number(item.length);

      if (direction === 'horizontal') {
        for (let i = 0; i < length; i++) {
          this.field[y][x+i] = {
            ship: item,
            hit: false
          };
        }
      } else {
        for (let i = 0; i < length; i++) {
          this.field[y+i][x] = {
            ship: item,
            hit: false
          };
        }
      }

      this.ships.push(item)
    });
  }

  printField(): string {
    let result = '';
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        const shipInCell = this.field[x][y].ship;
        result += shipInCell ? shipInCell.length.toString() : '0';
      }
      result += '\n';
    }
    return result;
  }

  getShips(): Ship[] {
    return this.ships;
  }

  attack(x: number, y: number): ShotStatus {
    const cell = this.field[y][x];
    cell.hit = true;

    let result = 'miss';
    
    if (cell.ship) {
      cell.ship.hitLeft--;
      if (cell.ship.hitLeft) {
        result = 'shot';
      } else {
        result = 'killed';
        this.ships = this.ships.filter(s => s !== cell.ship);
      }
    }

    return result as ShotStatus;
  }
}
