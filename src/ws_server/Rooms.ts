import { WebSocket } from 'ws';
import { Room } from './Room';
import { Player } from './Player';
import { RowRoomDTO } from './utils/interfaces';

export class Rooms {
  private rooms: Room[] = [];

  constructor() {}

  push(room: Room): void {
    this.rooms.push(room);
  }

  getRoomById(id: number): Room | undefined {
    return this.rooms.find((room) => room.getId() === id);
  }

  getRoomByOwner(player: Player): number {
    const room = this.rooms.find((room) => room.getOwner() === player);
    if (room) return room.getId();
    return -1;
  }

  addUserToRoom(idRoom: number, player: Player): boolean {
    const room = this.getRoomById(idRoom);
    if (room && room.getPlayerCount() < 2 && room.getOwner().getId() !== player.getId()) {
      room.addUser(player);
      return true;
    }
    return false;
  }

  removeRoom(idRoom: number): void {
    this.rooms = this.rooms.filter((room) => room.getId() !== idRoom);
  }

  private getRooms(): RowRoomDTO[] {
    const result = this.rooms
      .filter((room) => room.getPlayerCount() === 1)
      .map((room) => {
        return {
          roomId: room.getId(),
          roomUsers: [
            {
              name: room.getOwner().getName(),
              index: 0,
            },
          ],
        };
      });
    return result;
  }

  send(ws: WebSocket): void {
    const message: string = JSON.stringify({
      type: 'update_room',
      id: 0,
      data: JSON.stringify(this.getRooms()),
    });

    ws.send(message);
  }
}
