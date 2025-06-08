import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { Server } from 'socket.io'

interface Player {
  id: string
  name: string
  skin: string
  health: number
  speed: number
  position: { x: number; y: number }
  inventory: Item[]
  effects: {
    speedBoost?: { active: boolean; timeout: NodeJS.Timeout }
    shield?: { active: boolean; timeout: NodeJS.Timeout }
  }
}

interface Word {
  id: number
  text: string
  type: 'attack' | 'heal' | 'speed' | 'shield' | 'item'
  position: { x: number; y: number }
}

interface Item {
  type: 'heal' | 'attack' | 'speed' | 'shield'
  name: string
  emoji: string
}

interface GameState {
  players: Map<string, Player>
  words: Word[]
  items: any[] // This might be deprecated if items are only in inventory
  mapSize: { width: number; height: number }
}

@Injectable()
export class GameService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GameService.name)
  private server: Server | null = null
  private gameState: GameState = {
    players: new Map(),
    words: [],
    items: [],
    mapSize: { width: 2000, height: 2000 },
  }

  private gameLoopInterval: NodeJS.Timeout | null = null

  private readonly wordLists = {
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
  }

  private readonly itemTypes = {
    heal: { emoji: '❤️', name: '회복 포션' },
    attack: { emoji: '⚔️', name: '공격 아이템' },
    speed: { emoji: '⚡', name: '속도 부스터' },
    shield: { emoji: '🛡️', name: '방어막' },
  }

  private wordCounter = 0

  constructor() {
    this.addDemoPlayers()
  }

  setServer(server: Server) {
    this.server = server
  }

  onModuleInit() {
    this.startGameLoop()
    this.generateInitialWords()
    this.logger.log('Game Service Initialized and Game Loop Started.')
  }

  onModuleDestroy() {
    this.stopGameLoop()
    this.logger.log('Game Loop Stopped.')
  }

  // =================================================================
  // Game Loop
  // =================================================================
  startGameLoop() {
    if (this.gameLoopInterval) return
    // Update the game state every 16ms (~60 FPS)
    this.gameLoopInterval = setInterval(() => {
      this.update()
    }, 1000 / 60)
  }

  stopGameLoop() {
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval)
      this.gameLoopInterval = null
    }
  }

  private update() {
    // Periodically generate new words
    if (Math.random() < 0.01 && this.gameState.words.length < 50) {
      this.generateNewWord()
    }
    this.broadcastGameState()
  }

  private broadcastGameState() {
    if (!this.server) {
      return
    }
    // We need to convert the Map to an array for JSON serialization
    const playersArray = Array.from(this.gameState.players.values())
    this.server.emit('gameState', {
      ...this.gameState,
      players: playersArray,
    })
  }

  // =================================================================
  // Player Management
  // =================================================================
  addPlayer(id: string, name: string, skin: string): Player {
    const newPlayer: Player = {
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
    }
    this.gameState.players.set(id, newPlayer)
    this.logger.log(`Player ${name} (${id}) joined the game.`)
    return newPlayer
  }

  removePlayer(id: string) {
    if (this.gameState.players.has(id)) {
      this.gameState.players.delete(id)
      this.logger.log(`Player ${id} left the game.`)
      this.broadcastMessage('playerLeft', { id })
    }
  }

  movePlayer(id: string, angle: number) {
    const player = this.gameState.players.get(id)
    if (player) {
      // Calculate new position based on angle and player's speed
      const newPosition = {
        x: player.position.x + Math.cos(angle) * player.speed,
        y: player.position.y + Math.sin(angle) * player.speed,
      }

      // World boundary check
      newPosition.x = Math.max(
        0,
        Math.min(this.gameState.mapSize.width, newPosition.x),
      )
      newPosition.y = Math.max(
        0,
        Math.min(this.gameState.mapSize.height, newPosition.y),
      )

      player.position = newPosition
    }
  }

  // =================================================================
  // Word Management
  // =================================================================
  private generateInitialWords() {
    for (let i = 0; i < 30; i++) {
      this.generateNewWord()
    }
  }

  private generateNewWord() {
    const types = Object.keys(this.wordLists) as (keyof typeof this.wordLists)[]
    const type = types[Math.floor(Math.random() * types.length)]
    const wordList = this.wordLists[type]
    const text = wordList[Math.floor(Math.random() * wordList.length)]

    const newWord: Word = {
      id: this.wordCounter++,
      text,
      type,
      position: {
        x: Math.floor(Math.random() * this.gameState.mapSize.width),
        y: Math.floor(Math.random() * this.gameState.mapSize.height),
      },
    }
    this.gameState.words.push(newWord)
  }

  submitWord(playerId: string, submittedWord: string) {
    const player = this.gameState.players.get(playerId)
    if (!player) return

    const wordIndex = this.gameState.words.findIndex(
      (w) => w.text === submittedWord,
    )
    if (wordIndex !== -1) {
      const word = this.gameState.words[wordIndex]
      this.gameState.words.splice(wordIndex, 1) // Remove word
      this.processWordEffect(player, word)
      this.generateNewWord() // Generate a new word to replace it
      this.broadcastMessage('wordCompleted', {
        wordId: word.id,
        playerId: player.id,
      })
    }
  }

  private processWordEffect(player: Player, word: Word) {
    this.logger.log(
      `Processing effect '${word.type}' for player ${player.name}`,
    )
    switch (word.type) {
      case 'attack':
        this.attackNearestPlayer(player)
        break
      case 'heal':
        this.healPlayer(player, 20)
        break
      case 'speed':
        this.applySpeedBoost(player)
        break
      case 'shield':
        this.applyShield(player)
        break
      case 'item':
        this.giveRandomItem(player)
        break
    }
  }

  private attackNearestPlayer(attacker: Player) {
    let nearestPlayer: Player | null = null
    let minDistance = Infinity

    for (const player of this.gameState.players.values()) {
      if (player.id === attacker.id) continue

      const distance = Math.hypot(
        player.position.x - attacker.position.x,
        player.position.y - attacker.position.y,
      )

      if (distance < minDistance) {
        minDistance = distance
        nearestPlayer = player
      }
    }

    if (nearestPlayer) {
      if (nearestPlayer.effects.shield?.active) {
        this.logger.log(`Attack on ${nearestPlayer.name} blocked by shield.`)
        this.broadcastMessage('effect', {
          position: nearestPlayer.position,
          emoji: '🛡️',
          color: 'blue',
        })
        return
      }
      const damage = 25
      nearestPlayer.health = Math.max(0, nearestPlayer.health - damage)
      this.logger.log(
        `Player ${attacker.name} attacked ${nearestPlayer.name} for ${damage} damage.`,
      )
      this.broadcastMessage('effect', {
        position: nearestPlayer.position,
        emoji: '💥',
        color: 'red',
      })
      if (nearestPlayer.health === 0) {
        this.logger.log(`Player ${nearestPlayer.name} has been defeated.`)
        // Handle player defeat (e.g., respawn, remove, etc.)
        this.broadcastMessage('playerDefeated', { id: nearestPlayer.id })
      }
    }
  }

  private healPlayer(player: Player, amount: number) {
    player.health = Math.min(100, player.health + amount)
    this.broadcastMessage('effect', {
      position: player.position,
      emoji: '💖',
      color: 'green',
    })
  }

  private applySpeedBoost(player: Player) {
    if (player.effects.speedBoost?.timeout) {
      clearTimeout(player.effects.speedBoost.timeout)
    }
    player.effects.speedBoost = {
      active: true,
      timeout: setTimeout(() => {
        player.effects.speedBoost!.active = false
      }, 10000) as unknown as NodeJS.Timeout,
    } // 10 seconds
    this.broadcastMessage('effect', {
      position: player.position,
      emoji: '⚡',
      color: 'yellow',
    })
  }

  private applyShield(player: Player) {
    if (player.effects.shield?.timeout) {
      clearTimeout(player.effects.shield.timeout)
    }
    player.effects.shield = {
      active: true,
      timeout: setTimeout(() => {
        player.effects.shield!.active = false
      }, 15000) as unknown as NodeJS.Timeout,
    }
    this.broadcastMessage('effect', {
      position: player.position,
      emoji: '🛡️',
      color: 'blue',
    })
  }

  private giveRandomItem(player: Player) {
    const itemKeys = Object.keys(
      this.itemTypes,
    ) as (keyof typeof this.itemTypes)[]
    const randomType = itemKeys[Math.floor(Math.random() * itemKeys.length)]
    const itemInfo = this.itemTypes[randomType]

    const newItem: Item = {
      type: randomType,
      name: itemInfo.name,
      emoji: itemInfo.emoji,
    }

    if (player.inventory.length < 5) {
      player.inventory.push(newItem)
      this.broadcastMessage('effect', {
        position: player.position,
        emoji: '🎁',
        color: 'purple',
      })
    }
  }

  // =================================================================
  // General Helpers
  // =================================================================
  private broadcastMessage(event: string, payload: any) {
    this.server?.emit(event, payload)
  }

  // =================================================================
  // Temporary Demo Logic (from game.js)
  // =================================================================
  private addDemoPlayers() {
    const demoPlayers = [
      { id: 'bot1', name: 'Bot Alice', skin: '🤖' },
      { id: 'bot2', name: 'Bot Bob', skin: '🐱' },
      { id: 'bot3', name: 'Bot Charlie', skin: '🦊' },
    ]

    demoPlayers.forEach((p) => this.addPlayer(p.id, p.name, p.skin))
  }
}
