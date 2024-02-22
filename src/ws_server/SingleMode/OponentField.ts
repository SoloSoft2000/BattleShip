import { FIELD_SIZE } from '../utils/consts';
import { Position } from '../utils/interfaces';

export class OponentField {
  private field: string[][];
  private isShotShip = false;
  private positionShot: Position[] = [];

  constructor() {
    this.field = Array.from({ length: FIELD_SIZE }, () => Array(FIELD_SIZE).fill(' '));
  }

  saveStatus(x: number, y: number, status: string): void {
    if (status === 'miss') {
      this.field[x][y] = '~';
    } else {
      if (status === 'shot') {
        this.isShotShip = true;
        this.positionShot.push({ x, y });
        this.positionShot.sort((a, b): number => {
          if (a.x !== b.x) {
            return a.x - b.x;
          } else {
            return a.y - b.y;
          }
        });
      } else {
        this.isShotShip = false;
        this.positionShot.length = 0;
      }
      this.field[x][y] = 'x';
    }
  }

  attack(): Position {
    let x = -1;
    let y = -1;
    if (this.isShotShip) {
      const lastShot = this.positionShot[this.positionShot.length - 1];

      if (this.positionShot.length === 1) {
        const nextDirections = [
          { dx: -1, dy: 0 },
          { dx: 1, dy: 0 },
          { dx: 0, dy: -1 },
          { dx: 0, dy: 1 },
        ];

        for (const direction of nextDirections) {
          const currX = lastShot.x + direction.dx;
          const currY = lastShot.y + direction.dy;
          if (
            currX >= 0 &&
            currX < FIELD_SIZE &&
            currY >= 0 &&
            currY < FIELD_SIZE &&
            this.field[currX][currY] !== '~'
          ) {
            x = currX;
            y = currY;
            break;
          }
        }
      } else {
        const firstShot = this.positionShot[0];
        if (firstShot.x === lastShot.x) {
          x = firstShot.x;
          const currY = firstShot.y - 1;
          if (currY >= 0 && this.field[x][currY] !== '~') {
            y = currY;
          } else {
            y = lastShot.y + 1;
          }
        } else {
          y = firstShot.y;
          const currX = firstShot.x - 1;
          if (currX >= 0 && this.field[currX][y] !== '~') {
            x = currX;
          } else {
            x = lastShot.x + 1;
          }
        }
      }
    }
    return { x, y };
  }

  printField(): void {
    let print = ' |0|1|2|3|4|5|6|7|8|9|\n';
    for (let i = 0; i < this.field.length; i++) {
      print += `${i}|`;
      for (let j = 0; j < this.field.length; j++) {
        print += this.field[j][i] + '|';
      }
      print += '\n';
    }
    console.log(print);
  }
}
