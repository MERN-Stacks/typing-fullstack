import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
export declare class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly gameService;
    server: Server;
    private logger;
    constructor(gameService: GameService);
    afterInit(server: Server): void;
    handleConnection(client: Socket, ...args: any[]): void;
    handleDisconnect(client: Socket): void;
    handlePlayerMove(client: Socket, newPosition: {
        x: number;
        y: number;
    }): void;
    handleWordSubmit(client: Socket, word: string): void;
}
