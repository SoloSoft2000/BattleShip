import { randomInt } from 'crypto';
import { FIELD_SIZE } from '../utils/consts';
import { Ship } from '../utils/interfaces';

type Position = {
  x: number;
  y: number;
  direction: boolean;
};

const getType = (length: number): 'huge' | 'large' | 'medium' | 'small' => {
  switch (length) {
    case 4:
      return 'huge';
    case 3:
      return 'large';
    case 2:
      return 'medium';
  }
  return 'small';
};

export const addShips = (): Ship[] => {
  const field = Array.from({ length: FIELD_SIZE }, () => Array(FIELD_SIZE).fill(' '));
  const ships = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];

  const testPosition = (length: number, pos: Position): boolean => {
    const { x, y, direction } = pos;
    
    if (!direction && x + length > FIELD_SIZE) return false;
    if (direction && y + length > FIELD_SIZE) return false;

    const startX = Math.max(0, x - 1);
    const endX = Math.min(FIELD_SIZE - 1, direction ? x + 1 : x + length);
    const startY = Math.max(0, y - 1);
    const endY = Math.min(FIELD_SIZE - 1, direction ? y + length : y + 1);

    for (let i = startX; i <= endX; i++) {
      for (let j = startY; j <= endY; j++) {
        if (field[i][j] === 'x')
          return false;
      }
    }
  
    return true;
  };

  const newPosition = (length: number): Position => {
    const direction = randomInt(2) ? true : false;
    const x = randomInt(0, FIELD_SIZE);
    const y = randomInt(0, FIELD_SIZE);
    if (testPosition(length, { x, y, direction })) {
      return { x, y, direction };
    } else {
      return newPosition(length);
    }
  };

  const result: Ship[] = [];
  ships.forEach((item) => {
    const { x, y, direction } = newPosition(item);
    for (let i = 0; i < item; i++) {
      const curX = direction ? x : x + i;
      const curY = direction ? y + i : y;
      field[curX][curY] = 'x';
    }

    const newShip: Ship = {
      position: { x, y },
      direction,
      length: item,
      type: getType(item),
    };
    result.push(newShip);
  });

  let print = ' |0|1|2|3|4|5|6|7|8|9|\n';
  for (let i = 0; i < field.length; i++) {
    print += `${i}|`;
    for (let j = 0; j <field.length; j++) {
      print += field[j][i] + '|'
    }
    print += '\n';
  }
  console.log(print);
  
  return result;
};
