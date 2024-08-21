import express from "express";
import { createServer } from "http";
import { setupSocket } from "./socket/socket.js";

const app = express();
const httpServer = createServer(app);

setupSocket(httpServer);

httpServer.listen(3000, () => {
  console.log("Сервер запущен");
});
