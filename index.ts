import { closeServer, serverListen } from "./src/ws_server/gameServer";
import { httpServer } from "./src/http_server/index";
import { WebSocketServer } from "ws";

const HTTP_PORT = 8181;
const WS_PORT = 3000;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

console.log('WebSocket server on the ws://localhost:3000');
const wss = new WebSocketServer({
  port: WS_PORT
});

process.on('SIGINT', () => {
  closeServer(wss);
});

process.on('SIGTERM', () => {
  closeServer(wss);
});

process.on('SIGKILL', () => {
  closeServer(wss);
});

serverListen(wss);