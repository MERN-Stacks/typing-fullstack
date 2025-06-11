import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Server } from 'socket.io';
interface Player {
    id: string;
    name: string;
    skin: string;
    health: number;
    speed: number;
    position: {
        x: number;
        y: number;
    };
    inventory: Item[];
    effects: {
        speedBoost?: {
            active: boolean;
            expiresAt: number;
        };
        shield?: {
            active: boolean;
            expiresAt: number;
        };
    };
}
interface Item {
    type: 'heal' | 'attack' | 'speed' | 'shield';
    name: string;
    emoji: string;
}
export declare class GameService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private server;
    private gameState;
    private gameLoopInterval;
    private readonly wordLists;
    private readonly itemTypes;
    private wordCounter;
    constructor();
    setServer(server: Server): void;
    onModuleInit(): void;
    onModuleDestroy(): void;
    startGameLoop(): void;
    stopGameLoop(): void;
    private update;
    private broadcastGameState;
    addPlayer(id: string, name: string, skin: string): Player;
    removePlayer(id: string): void;
    movePlayer(id: string, angle: number): void;
    private generateInitialWords;
    private generateNewWord;
    submitWord(playerId: string, submittedWord: string): void;
    private processWordEffect;
    useItem(playerId: string, index: number): void;
    private attackNearestPlayer;
    private healPlayer;
    private applySpeedBoost;
    private applyShield;
    private giveRandomItem;
    private broadcastMessage;
    private addDemoPlayers;
}
export {};
