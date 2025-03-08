import { Socket } from "socket.io";
import { Directions, Player, PlayerStates } from "../player/entities/Player";
import { Room } from "../room/entities/Room";
import { RoomService } from "../room/RoomService";
import { Game, GameStates, Messages } from "./entities/Game";
import { BoardBuilder } from "./BoardBuilder";
import { ServerService } from "../server/ServerService"
import { Board } from "./entities/Board";
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
        //ServerService.getInstance().sendMessage(room.name,ServerService.messages.out.new_player,"new player");
        ServerService.getInstance().sendMessage(room.name, Messages.NEW_PLAYER, {
            initial : this.initialPositions
        });
        ServerService.getInstance().sendMessage(room.name, Messages.NEW_PLAYER, {
            id: player.id.id,
            x: player.x,
            y: player.y,
            state: player.state,
            direction: player.direction,
            visibility: player.visibility
        });
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
}
