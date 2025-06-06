'use client'

import { useRef, useEffect, useState } from 'react'
import { socket } from '@/lib/socket'

interface GameCanvasProps {
  nickname: string
  skin: string
}

// Define the types for our game state
// These should match the types on the backend
interface Player {
  id: string
  name: string
  skin: string
  health: number
  position: { x: number; y: number }
}

interface GameState {
  players: Player[]
  words: any[]
  items: any[]
  mapSize: { width: number; height: number }
}

const GameCanvas = ({ nickname, skin }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)

  // Effect for handling socket connection and events
  useEffect(() => {
    // Pass nickname and skin as query params for the connection
    socket.auth = { nickname, skin }
    socket.connect()

    function onConnect() {
      console.log('Connected to server!')
    }

    function onDisconnect() {
      console.log('Disconnected from server')
    }

    function onGameState(value: GameState) {
      setGameState(value)
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('gameState', onGameState)

    // Cleanup on component unmount
    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('gameState', onGameState)
      socket.disconnect()
    }
  }, [nickname, skin])

  // Effect for the rendering loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    let animationFrameId: number

    const render = () => {
      // Resize canvas to fill window
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height)

      // Background
      context.fillStyle = '#1a202c' // dark gray
      context.fillRect(0, 0, canvas.width, canvas.height)

      if (gameState) {
        // Find our player
        const me = gameState.players.find((p) => p.id === socket.id)
        const camera = {
          x: me ? me.position.x - canvas.width / 2 : 0,
          y: me ? me.position.y - canvas.height / 2 : 0,
        }

        // --- Drawing logic will go here ---

        // Draw players
        gameState.players.forEach((player) => {
          context.save()
          context.translate(
            player.position.x - camera.x,
            player.position.y - camera.y,
          )

          // Draw player body
          context.font = '40px sans-serif'
          context.textAlign = 'center'
          context.textBaseline = 'middle'
          context.fillText(player.skin, 0, 0)

          // Draw player name
          context.fillStyle = 'white'
          context.font = '14px sans-serif'
          context.fillText(player.name, 0, 35)
          context.restore()
        })
      }

      animationFrameId = window.requestAnimationFrame(render)
    }
    render()

    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [gameState]) // Rerender when gameState changes

  return <canvas ref={canvasRef} className="w-full h-full" />
}

export default GameCanvas
