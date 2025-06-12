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
    origin: '*',
  },
})
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server!: Server
  private logger: Logger = new Logger('GameGateway')

  constructor(private readonly gameService: GameService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized')
    this.gameService.setServer(server)
  }

  handleConnection(client: Socket) {
    const nameRaw = client.handshake.query.name
    const skinRaw = client.handshake.query.skin
    const spectator = client.handshake.query.spectator === '1'

    const name = Array.isArray(nameRaw) ? nameRaw[0] : nameRaw || 'Anonymous'
    const skin = Array.isArray(skinRaw) ? skinRaw[0] : skinRaw || '😊'

    if (!spectator) {
      this.gameService.addPlayer(client.id, name, skin)
      this.logger.log(`Client connected: ${client.id} (${name})`)
    } else {
      this.logger.log(`Spectator connected: ${client.id} (${name})`)
    }
  }

  handleDisconnect(client: Socket) {
    const spectator = client.handshake.query.spectator === '1'
    if (!spectator) {
      this.gameService.removePlayer(client.id)
      this.logger.log(`Client disconnected: ${client.id}`)
    } else {
      this.logger.log(`Spectator disconnected: ${client.id}`)
    }
  }

  @SubscribeMessage('playerMove')
  handlePlayerMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() angle: number,
  ): void {
    const spectator = client.handshake.query.spectator === '1'
    if (!spectator) {
      this.gameService.movePlayer(client.id, angle)
    }
  }

  @SubscribeMessage('submitWord')
  handleWordSubmit(
    @ConnectedSocket() client: Socket,
    @MessageBody() word: string,
  ): void {
    const spectator = client.handshake.query.spectator === '1'
    if (!spectator) {
      this.gameService.submitWord(client.id, word)
    }
  }

  @SubscribeMessage('useItem')
  handleUseItem(
    @ConnectedSocket() client: Socket,
    @MessageBody() index: number,
  ) {
    this.gameService.useItem(client.id, index)
  }
}
