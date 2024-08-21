import { Server } from "socket.io";
import { v4 as uuid } from "uuid";

import roomService from "../services/room.service.js";
import messageService from "../services/message.service.js";

let usersCount = 0;

export function setupSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    usersCount++;

    socket.on("usersCount", () => {
      io.emit("usersCount", usersCount);
    });

    socket.on("joinChat", (user) => {
      const connectStatus = roomService.joinChat(user, socket.id);

      if (connectStatus.type !== "error") socket.join(user.room);
      socket.emit("joinChat", connectStatus);
    });

    socket.on("getFreeRooms", sendFreeRooms);

    socket.on("waitFriend", (user) => {
      const roomData = roomService.getRoomData(user.room);

      if (!roomData) {
        const connectStatus = roomService.joinChat(user, socket.id);

        if (connectStatus.type === "error") {
          socket.emit("waitFriend", []);
        } else {
          socket.join(user.room);
        }
      }

      if (roomService.isRoomFull(user.room)) {
        io.to(user.room).emit("waitFriend", roomData);
      }

      sendFreeRooms(); // тут отправляю
    });

    socket.on("leftRoom", (roomNum) => {
      leaveSocketRoom();

      roomService.deleteRoomBySocketId(socket.id);
      messageService.deleteMessagesHistory(roomNum);

      socket.to(roomNum).emit("leftRoom", {
        type: "leftRoom",
        message: "Собеседник покинул чат",
      });

      const freeRooms = roomService.getFreeRooms();
      socket.emit("getFreeRooms", freeRooms);
    });

    socket.on("message", ({ roomNum, from, message }) => {
      const newMessage = { from, message, id: uuid() };
      const messageHistory = messageService.addMessage(roomNum, newMessage);

      io.to(roomNum).emit("message", messageHistory);
    });

    socket.on("getMessagesHistory", (roomNum) => {
      const messagesData = messageService.getMessagesHistory(roomNum);
      socket.emit("getMessagesHistory", messagesData);
    });

    socket.on("isTyping", (roomNum) => {
      socket.to(roomNum).emit("isTyping");
    });

    socket.on("disconnect", () => {
      usersCount--;
      io.emit("usersCount", usersCount);

      leaveSocketRoom();

      const roomToDelete = roomService.findRoomBySocketId(socket.id);

      roomService.deleteRoom(roomToDelete);
      messageService.deleteMessagesHistory(roomToDelete);

      socket.to(roomToDelete).emit("leftRoom", {
        type: "leftRoom",
        message: "Собеседник покинул чат",
      });

      sendFreeRooms();
    });

    function leaveSocketRoom() {
      const room = roomService.findRoomBySocketId(socket.id);

      if (room) {
        socket.leave(room);
      }
    }

    function sendFreeRooms() {
      const freeRooms = roomService.getFreeRooms();
      io.emit("getFreeRooms", freeRooms);
    }
  });
}
