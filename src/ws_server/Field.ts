interface Ship {
  type: 'huge' | 'large' | 'medium' | 'small';
  direction: boolean;
  length: 4 | 3 | 2 | 1;
  position: {
    x: number;
    y: number;
  };
}

interface Cell {
  ship: Ship | null;
  hit: boolean;
}

export type ShotStatus = 'miss'|'killed'|'shot';

export class Field {
  private field: Cell[][];
  private ships: { ship: Ship, hitLeft: number }[];

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

      this.ships.push({ship: item, hitLeft: item.length})
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

  getShipsOnField(): number {
    return this.ships.length;
  }

  attack(x: number, y: number): ShotStatus {
    const cell = this.field[y][x];
    cell.hit = true;

    let result = 'miss';
    const shipIndex = this.ships.findIndex(s => s.ship === cell.ship)
    if (shipIndex !== -1) {
      
      // console.log();
      
      this.ships[shipIndex].hitLeft--;
      if (this.ships[shipIndex].hitLeft) {
        result = 'shot';
      } else {
        result = 'killed';
        this.ships = this.ships.filter(s => s.ship !== cell.ship);
      }
    }

    return result as ShotStatus;
  }

  getNeighbourCells(x: number, y: number): { x: number, y: number }[] {
    const result: { x: number, y: number }[] = [];

    const ship = this.field[y][x].ship;

    if (ship) {
      const length = ship.length;
      const direction = ship.direction;
      const startX = Math.max(0, x - 1);
      const endX = Math.min(9, direction ? x + length : x + 1);
      const startY = Math.max(0, y - 1);
      const endY = Math.min(9, direction ? y + 1 : y + length);


      for (let i = startX; i <= endX; i++ ) {
        for (let j = startY; j < endY; j++) {
          if (!this.field[i][j].hit) {
            this.field[i][j].hit = true;
            result.push({ x: i, y: j });
          }
        }
      }
    }
    return result;
  }
}
