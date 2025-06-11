"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const game_service_1 = require("./game.service");
let GameGateway = class GameGateway {
    constructor(gameService) {
        this.gameService = gameService;
        this.logger = new common_1.Logger('GameGateway');
    }
    afterInit(server) {
        this.logger.log('WebSocket Gateway Initialized');
        this.gameService.setServer(server);
    }
    handleConnection(client) {
        const nameRaw = client.handshake.query.name;
        const skinRaw = client.handshake.query.skin;
        const spectator = client.handshake.query.spectator === '1';
        const name = Array.isArray(nameRaw) ? nameRaw[0] : nameRaw || 'Anonymous';
        const skin = Array.isArray(skinRaw) ? skinRaw[0] : skinRaw || '😊';
        if (!spectator) {
            this.gameService.addPlayer(client.id, name, skin);
            this.logger.log(`Client connected: ${client.id} (${name})`);
        }
        else {
            this.logger.log(`Spectator connected: ${client.id} (${name})`);
        }
    }
    handleDisconnect(client) {
        const spectator = client.handshake.query.spectator === '1';
        if (!spectator) {
            this.gameService.removePlayer(client.id);
            this.logger.log(`Client disconnected: ${client.id}`);
        }
        else {
            this.logger.log(`Spectator disconnected: ${client.id}`);
        }
    }
    handlePlayerMove(client, angle) {
        const spectator = client.handshake.query.spectator === '1';
        if (!spectator) {
            this.gameService.movePlayer(client.id, angle);
        }
    }
    handleWordSubmit(client, word) {
        const spectator = client.handshake.query.spectator === '1';
        if (!spectator) {
            this.gameService.submitWord(client.id, word);
        }
    }
};
exports.GameGateway = GameGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], GameGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('playerMove'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Number]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handlePlayerMove", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('submitWord'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "handleWordSubmit", null);
exports.GameGateway = GameGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [game_service_1.GameService])
], GameGateway);
