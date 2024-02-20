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
    
    for (let i = 0; i < length; i++) {
      const curX = direction ? x + i : x;
      const curY = direction ? y : y + i;
      if (curX >= FIELD_SIZE  || curY >= FIELD_SIZE ) 
        return false;

      const startX = Math.max(0, curX - 1);
      const endX = Math.min(curX + 1, FIELD_SIZE - 1);
      const startY = Math.max(0, curY - 1);
      const endY = Math.min(curY + 1, FIELD_SIZE - 1);

      for (let i = startY; i <= endY; i++) {
        for (let j = startX; j <= endX; j++) {
          if (field[i][j] === 'x')
            return false;
        }
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
      if (direction) {
        field[y][x + i] = 'x';
      } else {
        field[y + i][x] = 'x';
      }
    }

    const newShip: Ship = {
      position: { x, y },
      direction,
      length: item,
      type: getType(item),
    };
    result.push(newShip);
  });

  console.log(field);
  
  return result;
};
