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
var GameService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
let GameService = GameService_1 = class GameService {
    constructor() {
        this.logger = new common_1.Logger(GameService_1.name);
        this.server = null;
        this.gameState = {
            players: new Map(),
            words: [],
            items: [],
            mapSize: { width: 2000, height: 2000 },
        };
        this.gameLoopInterval = null;
        this.wordLists = {
            attack: [
                '공격',
                '타격',
                '폭발',
                '번개',
                '화염',
                '찌르기',
                '참수',
                '격파',
                '총알',
                '핵폭탄',
                '난타',
                '창질',
                '던지기',
                '폭탄',
                '불꽃',
            ],
            heal: [
                '회복',
                '치료',
                '힐링',
                '재생',
                '생명',
                '약초',
                '약물',
                '의료',
                '응급',
                '소생',
                '치유',
                '엘릭서',
                '응급처치',
                '힐포션',
                '봉합',
            ],
            speed: ['속도', '빠름', '질주', '가속', '순간'],
            shield: ['방어', '보호', '실드', '가드', '차단'],
            item: ['아이템', '보물', '선물', '상자', '보상'],
        };
        this.itemTypes = {
            heal: { emoji: '❤️', name: '회복 포션' },
            attack: { emoji: '⚔️', name: '공격 아이템' },
            speed: { emoji: '⚡', name: '속도 부스터' },
            shield: { emoji: '🛡️', name: '방어막' },
        };
        this.wordCounter = 0;
        this.addDemoPlayers();
    }
    setServer(server) {
        this.server = server;
    }
    onModuleInit() {
        this.startGameLoop();
        this.generateInitialWords();
        this.logger.log('Game Service Initialized and Game Loop Started.');
    }
    onModuleDestroy() {
        this.stopGameLoop();
        this.logger.log('Game Loop Stopped.');
    }
    // =================================================================
    // Game Loop
    // =================================================================
    startGameLoop() {
        if (this.gameLoopInterval)
            return;
        // Update the game state every 16ms (~60 FPS)
        this.gameLoopInterval = setInterval(() => {
            this.update();
        }, 1000 / 60);
    }
    stopGameLoop() {
        if (this.gameLoopInterval) {
            clearInterval(this.gameLoopInterval);
            this.gameLoopInterval = null;
        }
    }
    update() {
        // Periodically generate new words
        if (Math.random() < 0.01 && this.gameState.words.length < 50) {
            this.generateNewWord();
        }
        this.broadcastGameState();
    }
    broadcastGameState() {
        if (!this.server) {
            return;
        }
        // We need to convert the Map to an array for JSON serialization
        const playersArray = Array.from(this.gameState.players.values());
        this.server.emit('gameState', {
            ...this.gameState,
            players: playersArray,
        });
    }
    // =================================================================
    // Player Management
    // =================================================================
    addPlayer(id, name, skin) {
        const newPlayer = {
            id,
            name: name || id,
            skin: skin || '😊',
            health: 100,
            speed: 0.5,
            position: {
                x: Math.floor(Math.random() * this.gameState.mapSize.width),
                y: Math.floor(Math.random() * this.gameState.mapSize.height),
            },
            inventory: [],
            effects: {},
        };
        this.gameState.players.set(id, newPlayer);
        this.logger.log(`Player ${name} (${id}) joined the game.`);
        return newPlayer;
    }
    removePlayer(id) {
        if (this.gameState.players.has(id)) {
            this.gameState.players.delete(id);
            this.logger.log(`Player ${id} left the game.`);
            this.broadcastMessage('playerLeft', { id });
        }
    }
    movePlayer(id, angle) {
        const player = this.gameState.players.get(id);
        if (player) {
            // Calculate new position based on angle and player's speed
            const newPosition = {
                x: player.position.x + Math.cos(angle) * player.speed,
                y: player.position.y + Math.sin(angle) * player.speed,
            };
            // World boundary check
            newPosition.x = Math.max(0, Math.min(this.gameState.mapSize.width, newPosition.x));
            newPosition.y = Math.max(0, Math.min(this.gameState.mapSize.height, newPosition.y));
            player.position = newPosition;
        }
    }
    // =================================================================
    // Word Management
    // =================================================================
    generateInitialWords() {
        for (let i = 0; i < 30; i++) {
            this.generateNewWord();
        }
    }
    generateNewWord() {
        const types = Object.keys(this.wordLists);
        const type = types[Math.floor(Math.random() * types.length)];
        const wordList = this.wordLists[type];
        const text = wordList[Math.floor(Math.random() * wordList.length)];
        const newWord = {
            id: this.wordCounter++,
            text,
            type,
            position: {
                x: Math.floor(Math.random() * this.gameState.mapSize.width),
                y: Math.floor(Math.random() * this.gameState.mapSize.height),
            },
        };
        this.gameState.words.push(newWord);
    }
    submitWord(playerId, submittedWord) {
        const player = this.gameState.players.get(playerId);
        if (!player)
            return;
        const wordIndex = this.gameState.words.findIndex((w) => w.text === submittedWord);
        if (wordIndex !== -1) {
            const word = this.gameState.words[wordIndex];
            this.gameState.words.splice(wordIndex, 1); // Remove word
            this.processWordEffect(player, word);
            this.generateNewWord(); // Generate a new word to replace it
            this.broadcastMessage('wordCompleted', {
                wordId: word.id,
                playerId: player.id,
            });
        }
    }
    processWordEffect(player, word) {
        this.logger.log(`Processing effect '${word.type}' for player ${player.name}`);
        switch (word.type) {
            case 'attack':
                this.attackNearestPlayer(player);
                break;
            case 'heal':
                this.healPlayer(player, 20);
                break;
            case 'speed':
                this.applySpeedBoost(player);
                break;
            case 'shield':
                this.applyShield(player);
                break;
            case 'item':
                this.giveRandomItem(player);
                break;
        }
    }
    attackNearestPlayer(attacker) {
        var _a;
        let nearestPlayer = null;
        let minDistance = Infinity;
        for (const player of this.gameState.players.values()) {
            if (player.id === attacker.id)
                continue;
            const distance = Math.hypot(player.position.x - attacker.position.x, player.position.y - attacker.position.y);
            if (distance < minDistance) {
                minDistance = distance;
                nearestPlayer = player;
            }
        }
        if (nearestPlayer) {
            if ((_a = nearestPlayer.effects.shield) === null || _a === void 0 ? void 0 : _a.active) {
                this.logger.log(`Attack on ${nearestPlayer.name} blocked by shield.`);
                this.broadcastMessage('effect', {
                    position: nearestPlayer.position,
                    emoji: '🛡️',
                    color: 'blue',
                });
                return;
            }
            const damage = 25;
            nearestPlayer.health = Math.max(0, nearestPlayer.health - damage);
            this.logger.log(`Player ${attacker.name} attacked ${nearestPlayer.name} for ${damage} damage.`);
            this.broadcastMessage('effect', {
                position: nearestPlayer.position,
                emoji: '💥',
                color: 'red',
            });
            if (nearestPlayer.health === 0) {
                this.logger.log(`Player ${nearestPlayer.name} has been defeated.`);
                // Handle player defeat (e.g., respawn, remove, etc.)
                this.broadcastMessage('playerDefeated', { id: nearestPlayer.id });
            }
        }
    }
    healPlayer(player, amount) {
        player.health = Math.min(100, player.health + amount);
        this.broadcastMessage('effect', {
            position: player.position,
            emoji: '💖',
            color: 'green',
        });
    }
    applySpeedBoost(player) {
        var _a;
        if ((_a = player.effects.speedBoost) === null || _a === void 0 ? void 0 : _a.timeout) {
            clearTimeout(player.effects.speedBoost.timeout);
        }
        player.effects.speedBoost = {
            active: true,
            timeout: setTimeout(() => {
                player.effects.speedBoost.active = false;
            }, 10000),
        }; // 10 seconds
        this.broadcastMessage('effect', {
            position: player.position,
            emoji: '⚡',
            color: 'yellow',
        });
    }
    applyShield(player) {
        var _a;
        if ((_a = player.effects.shield) === null || _a === void 0 ? void 0 : _a.timeout) {
            clearTimeout(player.effects.shield.timeout);
        }
        player.effects.shield = {
            active: true,
            timeout: setTimeout(() => {
                player.effects.shield.active = false;
            }, 15000),
        }; // 15 seconds
        this.broadcastMessage('effect', {
            position: player.position,
            emoji: '🛡️',
            color: 'blue',
        });
    }
    giveRandomItem(player) {
        const itemKeys = Object.keys(this.itemTypes);
        const randomType = itemKeys[Math.floor(Math.random() * itemKeys.length)];
        const itemInfo = this.itemTypes[randomType];
        const newItem = {
            type: randomType,
            name: itemInfo.name,
            emoji: itemInfo.emoji,
        };
        if (player.inventory.length < 5) {
            player.inventory.push(newItem);
            this.broadcastMessage('effect', {
                position: player.position,
                emoji: '🎁',
                color: 'purple',
            });
        }
    }
    // =================================================================
    // General Helpers
    // =================================================================
    broadcastMessage(event, payload) {
        var _a;
        (_a = this.server) === null || _a === void 0 ? void 0 : _a.emit(event, payload);
    }
    // =================================================================
    // Temporary Demo Logic (from game.js)
    // =================================================================
    addDemoPlayers() {
        const demoPlayers = [
            { id: 'bot1', name: 'Bot Alice', skin: '🤖' },
            { id: 'bot2', name: 'Bot Bob', skin: '🐱' },
            { id: 'bot3', name: 'Bot Charlie', skin: '🦊' },
        ];
        demoPlayers.forEach((p) => this.addPlayer(p.id, p.name, p.skin));
    }
};
exports.GameService = GameService;
exports.GameService = GameService = GameService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], GameService);
