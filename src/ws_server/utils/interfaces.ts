export interface Ship {
  type: 'huge' | 'large' | 'medium' | 'small';
  direction: boolean;
  length: 4 | 3 | 2 | 1;
  position: {
    x: number;
    y: number;
  };
}

export interface Cell {
  ship: Ship | null;
  hit: boolean;
}

export interface RegistrationData {
  name: string;
  password: string;
}

export interface RowRoomDTO {
  roomId: number;
  roomUsers: { name: string; index: number }[];
}

export interface RowWinner {
  id: number;
  name: string;
  wins: number;
}

export interface RowWinnerDTO {
  name: string;
  wins: number;
}
