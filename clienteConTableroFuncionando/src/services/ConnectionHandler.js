import { io } from "../../node_modules/socket.io-client/dist/socket.io.esm.min.js";
import { GameService } from "./GameService.js";
import { UIv1 } from "../UIv1.js";

export const ConnectionHandler = {
    connected: false,
    socket: null,
    url: null,
    controller: null,
    init: (url, controller, onConnectedCallBack, onDisconnectedCallBack) => {
        ConnectionHandler.controller = controller;
        ConnectionHandler.socket = io(url); 
        ConnectionHandler.socket.onAny((message, payload) => {
            console.log("Esta llegando: ");
            console.log(payload);
            console.log(payload.type);
            console.log(payload.content);
        });

        ConnectionHandler.socket.on("connect", (data) => {
            ConnectionHandler.socket.on("connectionStatus", (data) => {
                ConnectionHandler.connected = true;
                console.log(data);
                onConnectedCallBack();
            });
            ConnectionHandler.socket.on("message", (payload) => {
                ConnectionHandler.controller.actionController(payload);
                
            });
            ConnectionHandler.socket.on("playerMoved", (payload) => {
                console.log("El jugador se ha movido");
                const { id, x, y } = payload;
                const player = GameService.getInstance().getPlayerById(id);
                if (player) {
                    player.x = x;
                    player.y = y;
                    UIv1.drawPlayers([player]);
                }
            });
            ConnectionHandler.socket.on("disconnect", () => {
                ConnectionHandler.connected = false;
                onDisconnectedCallBack();
            });
        });
    },

    movePlayer: () => {
        if (ConnectionHandler.connected && ConnectionHandler.socket) {
            console.log("moviendo jugador");
            ConnectionHandler.socket.emit("movePlayer");
        } else {
            console.log("No se ha podido mover el jugador");
            console.log("Estado de conexión:", ConnectionHandler.connected);
            console.log("Estado del socket:", ConnectionHandler.socket);
        }
    },
}