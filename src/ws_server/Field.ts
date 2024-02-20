import { Ship, Cell } from './utils/interfaces';

export type ShotStatus = 'miss' | 'killed' | 'shot' | 'already';

export class Field {
  private field: Cell[][];
  private ships: { ship: Ship; hitLeft: number }[];
  private fieldSize: number;

  constructor(size: number = 10) {
    this.field = Array.from({ length: size }, () => Array(size).fill({ ship: null, hit: false }));
    this.ships = [];
    this.fieldSize = size;
  }

  placeShips(shipsForParce: Ship[]): void {
    console.log(shipsForParce);
    
    shipsForParce.forEach((item) => {
      const { x, y } = item.position;

      const direction = item.direction ? 'vertical' : 'horizontal';
      const length = Number(item.length);

      if (direction === 'horizontal') {
        for (let i = 0; i < length; i++) {
          this.field[y][x + i] = {
            ship: item,
            hit: false,
          };
        }
      } else {
        for (let i = 0; i < length; i++) {
          this.field[y + i][x] = {
            ship: item,
            hit: false,
          };
        }
      }

      this.ships.push({ ship: item, hitLeft: item.length });
    });
  }

  printField(): string {
    let result = '';
    for (let x = 0; x < this.fieldSize; x++) {
      for (let y = 0; y < this.fieldSize; y++) {
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

  getCellAlreadyHit(x: number, y: number): boolean {
    const cell = this.field[y][x];
    if (cell.hit) {
      return true;
    } else {
      return false;
    }
  }

  attack(x: number, y: number): ShotStatus {
    const cell = this.field[y][x];
    if (cell.hit) {
      return 'already';
    }
    this.field[y][x] = {
      ...cell,
      hit: true,
    };

    let result = 'miss';
    const shipIndex = this.ships.findIndex((s) => s.ship === cell.ship);
    if (shipIndex !== -1) {
      this.ships[shipIndex].hitLeft--;
      if (this.ships[shipIndex].hitLeft) {
        result = 'shot';
      } else {
        result = 'killed';
        this.ships = this.ships.filter((s) => s.ship !== cell.ship);
      }
    }

    return result as ShotStatus;
  }

  getNeighbourCells(x: number, y: number): { x: number; y: number }[] {
    const result: { x: number; y: number }[] = [];

    const ship = this.field[y][x].ship;

    if (ship) {
      const length = ship.length;
      const direction = ship.direction;
      const startX = Math.max(0, ship.position.x - 1);
      const endX = Math.min(this.fieldSize - 1, direction ? ship.position.x + 1 : ship.position.x + length);
      const startY = Math.max(0, ship.position.y - 1);
      const endY = Math.min(this.fieldSize - 1, direction ? ship.position.y + length : ship.position.y + 1);

      for (let i = startY; i <= endY; i++) {
        for (let j = startX; j <= endX; j++) {
          if (!this.field[i][j].hit) {
            const cell = this.field[i][j];
            this.field[i][j] = {
              ...cell,
              hit: true,
            };
            result.push({ x: j, y: i });
          }
        }
      }
    }
    return result;
  }
}
