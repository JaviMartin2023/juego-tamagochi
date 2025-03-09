import { Socket } from "socket.io";
import { Directions, Player, PlayerStates } from "../player/entities/Player";
import { Room } from "../room/entities/Room";
import { RoomService } from "../room/RoomService";
import { Game, GameStates, Messages } from "./entities/Game";
import { BoardBuilder } from "./BoardBuilder";
import { ServerService } from "../server/ServerService"
import { Board } from "./entities/Board";
import { Server } from "http";

export class GameService {
    private games: Game[];

    private static instance: GameService;
    private board : Board;
    private initialPositions: { x: number, y: number }[];
    private constructor() {
        this.games = [];
        this.board = new BoardBuilder().getBoard();
        this.initialPositions = [
            { x: 0, y: 0 },
            { x: 0, y: this.board.size - 1 },
            { x: this.board.size -1, y: 0 },
            { x: this.board.size -1, y: this.board.size -1}
        ];
    };

    static getInstance(): GameService {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new GameService();
        return this.instance;
    }

    public buildPlayer(socket: Socket): Player {
        return {
            id: socket,
            x: 0,
            y: 0,
            state: PlayerStates.Idle,
            direction: Directions.Up,
            visibility: true
        }
    }

    public addPlayer(player: Player): boolean {
        const room: Room = RoomService.getInstance().addPlayer(player);
        this.assignInitialPosition(player);
        const genRanHex = (size: Number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        if (room.players.length == 1) {
            const game: Game = {
                id: "game" + genRanHex(128),
                state: GameStates.WAITING,
                room: room,
                board: new BoardBuilder().getBoard()
            }
            room.game = game;
            this.games.push(game);
        }

        if (room.occupied) {
            if (room.game) {
                room.game.state = GameStates.PLAYING;
                if (ServerService.getInstance().isActive()) {
                    ServerService.getInstance().sendMessage(room.name, Messages.BOARD, room.game.board);
                    ServerService.getInstance().sendMessage(room.name, Messages.NEW_PLAYER, room.players.map(p => ({
                        id: p.id.id,
                        x: p.x,
                        y: p.y,
                        state: p.state,
                        direction: p.direction,
                        visibility: p.visibility
                    })));
                }
            }
            return true;
        }

        return false;
    }

    public assignInitialPosition(player: Player): void {
        if (this.initialPositions.every(position => position === undefined)) {
            this.initialPositions = [
                { x: 0, y: 0 },
                { x: 0, y: this.board.size - 1 },
                { x: this.board.size -1, y: 0 },
                { x: this.board.size -1, y: this.board.size -1}
            ];
        }
        let randomPosition = this.randomNumberInitial();
        let randomArrayPosition = this.initialPositions[randomPosition];
        while (randomArrayPosition == undefined) {
             randomPosition = this.randomNumberInitial();
             randomArrayPosition = this.initialPositions[randomPosition];          
        }
        player.x = randomArrayPosition.x;
        player.y = randomArrayPosition.y;
        delete(this.initialPositions[randomPosition]);
        console.log(`Player assigned position: (${player.x}, ${player.y})`);
    }

    public randomNumberInitial () : number {
        return Math.floor(Math.random() * this.initialPositions.length);
    }

    public socketPlayer(socket: Socket): Player| undefined { 
        for (const game of this.games) {
            for (const player of game.room.players) {
                if (player.id === socket) {
                    return player;
                }
            }
        }
        return undefined;
    }

    public movePlayer(playerId: string): boolean {
        let room: Room | undefined;
        let player: Player | undefined;

        for (const game of this.games) {
            if (game.room.players.some(p => p.id.id === playerId)) {
                room = game.room;
                player = game.room.players.find(p => p.id.id === playerId);
            }
        }

        if (!room || !player) return false;

        let newX = player.x;
        let newY = player.y;

        switch (player.direction) {
            case Directions.Up:
                newY--;
                break;
            case Directions.Down:
                newY++;
                break;
            case Directions.Left:
                newX--;
                break;
            case Directions.Right:
                newX++;
                break;
        }

        if (newX >= 0 && newX < this.board.size && newY >= 0 && newY < this.board.size && !room.players.some(p => p.x === newX && p.y === newY)) {
            player.x = newX;
            player.y = newY;
            ServerService.getInstance().sendMessage(room.name, Messages.NEW_PLAYER, room.players.map(p => ({
                id: p.id.id,
                x: p.x,
                y: p.y,
                state: p.state,
                direction: p.direction,
                visibility: p.visibility
            })));
            return true;
        }

        return false;
    }
}