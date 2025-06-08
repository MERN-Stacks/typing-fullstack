import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets'
import { Logger } from '@nestjs/common'
import { Server, Socket } from 'socket.io'
import { GameService } from './game.service'

@WebSocketGateway({
  cors: {
    origin: '*', // In production, you should restrict this to your frontend's domain
  },
})
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server!: Server
  private logger: Logger = new Logger('GameGateway')

  constructor(private readonly gameService: GameService) {}

  // Pass the server instance to the game service once the gateway is initialized
  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized')
    this.gameService.setServer(server)
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`)
    const name = (client.handshake.query.name as string) || 'Anonymous'
    const skin = (client.handshake.query.skin as string) || '😊'
    this.gameService.addPlayer(client.id, name, skin)
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`)
    this.gameService.removePlayer(client.id)
  }

  @SubscribeMessage('playerMove')
  handlePlayerMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() angle: number,
  ): void {
    this.gameService.movePlayer(client.id, angle)
  }

  @SubscribeMessage('submitWord')
  handleWordSubmit(
    @ConnectedSocket() client: Socket,
    @MessageBody() word: string,
  ): void {
    this.gameService.submitWord(client.id, word)
  }
}
