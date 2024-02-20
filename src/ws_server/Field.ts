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
    shipsForParce.forEach((item) => {
      const { x, y } = item.position;

      const direction = item.direction;
      const length = Number(item.length);

      for (let i = 0; i < length; i++) {
        const curX = direction ? x + i : x;
        const curY = direction ? y : y + i;
        this.field[curX][curY] = {
          ship: item,
          hit: false,
        };
      }

      this.ships.push({ ship: item, hitLeft: item.length });
    });
  }

  getShipsOnField(): number {
    return this.ships.length;
  }

  getCellAlreadyHit(x: number, y: number): boolean {
    const cell = this.field[x][y];
    if (cell.hit) {
      return true;
    } else {
      return false;
    }
  }

  attack(x: number, y: number): ShotStatus {
    const cell = this.field[x][y];
    if (cell.hit) {
      return 'already';
    }
    this.field[x][y] = {
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

    const ship = this.field[x][y].ship;

    if (ship) {
      const length = ship.length;
      const direction = ship.direction;
      const startX = Math.max(0, ship.position.x - 1);
      const endX = Math.min(this.fieldSize - 1, direction ? ship.position.x + 1 : ship.position.x + length);
      const startY = Math.max(0, ship.position.y - 1);
      const endY = Math.min(this.fieldSize - 1, direction ? ship.position.y + length : ship.position.y + 1);

      for (let i = startX; i <= endX; i++) {
        for (let j = startY; j <= endY; j++) {
          if (!this.field[i][j].hit) {
            const cell = this.field[i][j];
            this.field[i][j] = {
              ...cell,
              hit: true,
            };
            result.push({ x: i, y: j });
          }
        }
      }
    }
    return result;
  }
}
