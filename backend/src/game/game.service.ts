import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { Server } from 'socket.io'

// Define types for better structure
interface Player {
  id: string
  name: string
  skin: string
  health: number
  position: { x: number; y: number }
  inventory: any[]
}

interface GameState {
  players: Map<string, Player>
  words: any[]
  items: any[]
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

  constructor() {
    this.addDemoPlayers() // For testing
  }

  setServer(server: Server) {
    this.server = server
  }

  // Called when the service is initialized
  onModuleInit() {
    this.startGameLoop()
    this.logger.log('Game Service Initialized and Game Loop Started.')
  }

  // Called when the application is shutting down
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
    // In the future: update player positions, check for collisions, etc.
    // For now, it just broadcasts the state
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
      position: {
        x: Math.floor(Math.random() * this.gameState.mapSize.width),
        y: Math.floor(Math.random() * this.gameState.mapSize.height),
      },
      inventory: [],
    }
    this.gameState.players.set(id, newPlayer)
    this.logger.log(`Player ${name} (${id}) joined the game.`)
    return newPlayer
  }

  removePlayer(id: string) {
    if (this.gameState.players.has(id)) {
      this.gameState.players.delete(id)
      this.logger.log(`Player ${id} left the game.`)
    }
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

  // Placeholder for moving a player
  movePlayer(id: string, newPosition: { x: number; y: number }) {
    const player = this.gameState.players.get(id)
    if (player) {
      // In a real game, you would validate the movement here
      player.position = newPosition
    }
  }
}
