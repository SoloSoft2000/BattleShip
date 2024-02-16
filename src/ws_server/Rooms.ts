import { WebSocket } from 'ws';
import { Room } from "./Room";

interface rowRoomDTO {
  roomId: number,
  roomUsers: { name: string, index: number }[]
}

export class Rooms {
  private rooms: Room[] = [];

  constructor() {
  }
  
  push(room: Room): void {
    this.rooms.push(room);
  }

  private getRooms(): rowRoomDTO[] {
    const result = this.rooms
      .filter((room) => room.getPlayerCount() === 1)
      .map((room) => {
        return {
          roomId: room.getId(),
          roomUsers: [{
            name: room.getOwner().getName(),
            index: 0
          }]
        }
      });
    return result;
  }

  send(ws: WebSocket): void {
    const message: string = JSON.stringify({
      type: 'update_room',
      id: 0,
      data: JSON.stringify(this.getRooms()),
    })

    console.log(message);
    
    ws.send(message, (err) => {
      if (err)
        console.log(err);
      else 
        console.log('rooms send');
    })
  }
}