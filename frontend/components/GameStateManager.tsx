'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import { socket } from '@/lib/socket'
import type { Socket } from 'socket.io-client'
import type { GameState as ServerGameState, Player } from '@/types/game'

interface GameState extends Omit<ServerGameState, 'players'> {
  players: Player[]
}

interface Effect {
  position: { x: number; y: number }
  emoji: string
  color: string
  id: number
}

interface GameContextType {
  gameState: GameState | null
  socket: Socket
  effects: Effect[]
  isConnected: boolean
  isSpectator: boolean
  currentPlayer: Player | null
  camera: { x: number; y: number }
  setCamera: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>
  connect: (name: string, skin: string, isSpectator?: boolean) => void
  disconnect: () => void
  submitWord: (word: string) => void
  movePlayer: (angle: number) => void
  updatePlayerPosition: (playerId: string, position: { x: number; y: number }) => void
}

const GameContext = createContext<GameContextType | null>(null)

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) throw new Error('useGame must be used within a GameProvider')
  return context
}

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [effects, setEffects] = useState<Effect[]>([])
  const [isConnected, setIsConnected] = useState(socket.connected)
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [camera, setCamera] = useState({ x: 0, y: 0 })
  const [isSpectator, setIsSpectator] = useState(false)

  const connect = useCallback((name: string, skin: string, spectator = false) => {
    if (socket.connected) return
    setIsSpectator(spectator)
    socket.io.opts.query = { name, skin, spectator: spectator ? '1' : '0' }
    socket.connect()
  }, [])

  const disconnect = useCallback(() => {
    socket.disconnect()
  }, [])

  useEffect(() => {
    function onConnect() {
      setIsConnected(true)
    }

    function onDisconnect() {
      setIsConnected(false)
      setCurrentPlayer(null)
      setGameState(null)
    }

    function onGameState(state: GameState) {
      setGameState(state)
    }

    function onEffect(effect: Omit<Effect, 'id'>) {
      setEffects((prev) => [...prev, { ...effect, id: Date.now() + Math.random() }])
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('gameState', onGameState)
    socket.on('effect', onEffect)

    if (socket.connected) onConnect()

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('gameState', onGameState)
      socket.off('effect', onEffect)
    }
  }, [])

  useEffect(() => {
    if (gameState && socket) {
      const me = gameState.players.find((p) => p.id === socket.id)
      setCurrentPlayer(me || null)
    }
  }, [gameState])

  useEffect(() => {
    if (currentPlayer) {
      setCamera({
        x: currentPlayer.position.x - window.innerWidth / 2,
        y: currentPlayer.position.y - window.innerHeight / 2,
      })
    }
  }, [currentPlayer])

  useEffect(() => {
    const timer = setInterval(() => {
      setEffects((prev) => (prev.length > 0 ? prev.slice(1) : []))
    }, 2000)
    return () => clearInterval(timer)
  }, [])

  const submitWord = useCallback((word: string) => {
    if (socket.connected && word && currentPlayer) {
      socket.emit('submitWord', word)
    }
  }, [currentPlayer])

  const movePlayer = useCallback((angle: number) => {
    if (socket.connected && currentPlayer) {
      socket.emit('playerMove', angle)
    }
  }, [currentPlayer])

  const updatePlayerPosition = useCallback((playerId: string, position: { x: number; y: number }) => {
    setGameState((prev) => {
      if (!prev) return null
      const updatedPlayers = prev.players.map((p) =>
        p.id === playerId ? { ...p, position } : p
      )
      return { ...prev, players: updatedPlayers }
    })
  }, [])

  const value = {
    socket,
    gameState,
    effects,
    isConnected,
    isSpectator,
    currentPlayer,
    camera,
    setCamera,
    connect,
    disconnect,
    submitWord,
    movePlayer,
    updatePlayerPosition,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
