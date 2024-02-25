import { Ship, Cell, ShotStatus } from './utils/interfaces';

export class Field {
  private field: Cell[][];
  private ships: { ship: Ship; hitLeft: number }[];
  private fieldSize: number;

  constructor(size: number = 10) {
    this.field = Array.from({ length: size }, () => Array(size).fill({ ship: null, hitStatus: undefined }));
    this.ships = [];
    this.fieldSize = size;
  }

  placeShips(shipsForParce: Ship[]): void {
    shipsForParce.forEach((item) => {
      const { x, y } = item.position;

      const direction = item.direction;
      const length = Number(item.length);

      for (let i = 0; i < length; i++) {
        const curX = direction ? x : x + i;
        const curY = direction ? y + i : y;
        this.field[curX][curY] = {
          ship: item,
          hitStatus: undefined,
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
    if (cell.hitStatus) {
      return true;
    } else {
      return false;
    }
  }

  attack(x: number, y: number): ShotStatus {
    const cell = this.field[x][y];
    if (cell.hitStatus) {
      return 'already';
    }

    let result: ShotStatus = 'miss';
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

    this.field[x][y] = {
      ...cell,
      hitStatus: result,
    };

    return result as ShotStatus;
  }

  getNeighbourCells(x: number, y: number): { x: number; y: number; status: ShotStatus }[] {
    const result: { x: number; y: number; status: ShotStatus }[] = [];

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
          if (this.field[i][j].hitStatus === 'shot') {
            const cell = this.field[i][j];
            this.field[i][j] = {
              ...cell,
              hitStatus: 'killed',
            };
            result.push({ x: i, y: j, status: 'killed' });
          } else if (!this.field[i][j].hitStatus) {
            const cell = this.field[i][j];
            this.field[i][j] = {
              ...cell,
              hitStatus: 'miss',
            };
            result.push({ x: i, y: j, status: 'miss' });
          }
        }
      }
    }
    return result;
  }
}
