interface Ship {
  type: 'huge' | 'large' | 'medium' | 'small',
  direction: boolean,
  length: 4 | 3 | 2 | 1,
  position: {
    x: number,
    y: number
  }
}

export class Field {
  private field: string[][];
  hasShips = false;

  constructor(size: number = 10) {
    this.field = Array.from({ length: size }, () => Array(size).fill(''));
  }

  placeShips(ships: Ship[]): void {
    ships.forEach(ship => {
      const { x, y } = ship.position;
      const direction = ship.direction ? 'vertical' : 'horizontal';
      const length = ship.length;

      if (direction === 'horizontal') {
        for (let i = 0; i < length; i++) {
          this.field[y][x + i] = ship.type;
        }
      } else {
        for (let i = 0; i < length; i++) {
          this.field[y + i][x] = ship.type;
        }
      }
    });
    this.hasShips = true;
  }

}