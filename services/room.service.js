//interfaces without ts
//rooms = { room1: [{id: 1, name: 'some name'}, {id: 2, name: 'some name'}], room2: [{id: 3, name: 'some name'}, {id: 4, name: 'some name'}] }
//user = {name: 'some name', room: 'some room'}

import UserDto from "../Dtos/user.dto.js";

const rooms = {};

class RoomsService {
  constructor() {
    this.rooms = {};
  }

  joinChat(user, socketId) {
    const userDto = new UserDto(user);

    if (!this.rooms[user.room]) {
      this.rooms[user.room] = [];
    }

    if (this.isRoomFull(user.room)) {
      return { type: "error", message: "Комната заполнена", userDto };
    }

    if (this.isUserExist(user.name, user.room)) {
      return {
        type: "error",
        message: "Участник с таким именем уже есть в комнате",
        userDto,
      };
    }

    this.rooms[user.room].push({ id: socketId, name: user.name });

    return {
      type: "success",
      message: "Упешное присоединение к комнате",
      userDto,
    };
  }

  getFreeRooms() {
    const freeRooms = [];

    for (const room in this.rooms) {
      if (!this.isRoomFull(room)) freeRooms.push(room);
    }

    return freeRooms;
  }

  getRoomData(roomNum) {
    return this.rooms[roomNum];
  }

  isRoomFull(roomNum) {
    return this.rooms[roomNum].length === 2;
  }

  isUserExist(name, roomNum) {
    return this.rooms[roomNum].find((user) => user.name === name);
  }

  deleteRoom(roomNum) {
    delete this.rooms[roomNum];
  }

  deleteRoomBySocketId(socketId) {
    const roomNum = this.findRoomBySocketId(socketId);
    if (roomNum) {
      delete this.rooms[roomNum];
    }
  }

  findRoomBySocketId(socketId) {
    let currentRoom;

    for (const roomNum in this.rooms) {
      const room = this.rooms[roomNum].find((user) => user.id === socketId);

      if (room) {
        currentRoom = roomNum;
        break;
      }
    }

    return currentRoom;
  }
}

const roomService = new RoomsService(rooms);

export default roomService;
