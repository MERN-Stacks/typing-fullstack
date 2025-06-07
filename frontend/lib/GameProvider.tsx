'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import { io, Socket } from 'socket.io-client'
import type { GameState as ServerGameState, Player } from '@/types/game'

interface GameState extends Omit<ServerGameState, 'players'> {
  players: Player[]
}

interface Word {
  id: number
  text: string
  type: string
  position: { x: number; y: number }
}

interface Effect {
  position: { x: number; y: number }
  emoji: string
  color: string
  id: number
}

interface GameContextType {
  gameState: GameState | null
  socket: Socket | null
  effects: Effect[]
  isConnected: boolean
  connect: (name: string, skin: string) => void
  disconnect: () => void
  submitWord: (word: string) => void
  movePlayer: (position: { x: number; y: number }) => void
}

const GameContext = createContext<GameContextType | null>(null)

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [effects, setEffects] = useState<Effect[]>([])
  const [isConnected, setIsConnected] = useState(false)

  const connect = useCallback(
    (name: string, skin: string) => {
      if (socket || isConnected) return

      const newSocket = io(SOCKET_URL, {
        transports: ['websocket'],
        query: { name, skin },
        autoConnect: true,
      })

      setSocket(newSocket)

      newSocket.on('connect', () => {
        console.log('Connected to WebSocket server')
        setIsConnected(true)
      })

      newSocket.on('gameState', (state: GameState) => {
        setGameState(state)
      })

      newSocket.on('effect', (effect: Omit<Effect, 'id'>) => {
        setEffects((prevEffects) => [
          ...prevEffects,
          { ...effect, id: Date.now() + Math.random() },
        ])
      })

      newSocket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server')
        setIsConnected(false)
        setSocket(null)
      })
    },
    [socket, isConnected],
  )

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect()
      setSocket(null)
      setIsConnected(false)
    }
  }, [socket])

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [socket])

  useEffect(() => {
    const timer = setInterval(() => {
      setEffects((prevEffects) =>
        prevEffects.length > 0 ? prevEffects.slice(1) : [],
      )
    }, 2000) // Effects last for 2 seconds
    return () => clearInterval(timer)
  }, [])

  const submitWord = useCallback(
    (word: string) => {
      if (socket && word) {
        socket.emit('submitWord', word)
      }
    },
    [socket],
  )

  const movePlayer = useCallback(
    (position: { x: number; y: number }) => {
      if (socket) {
        socket.emit('playerMove', position)
      }
    },
    [socket],
  )

  const value = {
    socket,
    gameState,
    effects,
    isConnected,
    connect,
    disconnect,
    submitWord,
    movePlayer,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
