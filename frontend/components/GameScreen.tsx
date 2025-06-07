'use client'

import React, { useRef, useEffect, useState } from 'react'
import { useGame } from '@/lib/GameProvider'

const GameScreen = () => {
  const { gameState, socket, submitWord, movePlayer, effects } = useGame()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [word, setWord] = useState('')
  const [camera, setCamera] = useState({ x: 0, y: 0 })
  const lastMousePos = useRef({ x: 0, y: 0 })
  const isDragging = useRef(false)

  const currentPlayer = gameState?.players.find((p) => p.id === socket?.id)

  useEffect(() => {
    if (currentPlayer) {
      setCamera({
        x: currentPlayer.position.x - window.innerWidth / 2,
        y: currentPlayer.position.y - window.innerHeight / 2,
      })
    }
  }, [currentPlayer?.position.x, currentPlayer?.position.y])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !gameState) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.save()
    ctx.translate(-camera.x, -camera.y)

    const gridSize = 50
    ctx.strokeStyle = '#333'
    for (let x = 0; x <= gameState.mapSize.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, gameState.mapSize.height)
      ctx.stroke()
    }
    for (let y = 0; y <= gameState.mapSize.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(gameState.mapSize.width, y)
      ctx.stroke()
    }

    ctx.font = '20px Arial'
    ctx.textAlign = 'center'
    gameState.words.forEach((word) => {
      const type = word.type as 'attack' | 'heal'
      ctx.fillStyle = type === 'heal' ? 'limegreen' : type === 'attack' ? 'red' : 'white'
      ctx.fillText(word.text, word.position.x, word.position.y)
    })

    gameState.players.forEach((player) => {
      ctx.fillStyle = 'red'
      ctx.fillRect(player.position.x - 25, player.position.y - 40, 50, 5)
      ctx.fillStyle = 'green'
      ctx.fillRect(
        player.position.x - 25,
        player.position.y - 40,
        (player.health / 100) * 50,
        5,
      )

      ctx.font = '30px Arial'
      ctx.fillText(player.skin, player.position.x, player.position.y)
      ctx.font = '14px Arial'
      ctx.fillStyle = 'white'
      ctx.fillText(player.name, player.position.x, player.position.y + 20)
    })

    effects.forEach((effect) => {
      ctx.font = '30px Arial'
      ctx.fillStyle = effect.color
      ctx.fillText(effect.emoji, effect.position.x, effect.position.y)
    })

    ctx.restore()
  }, [gameState, camera, effects])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true
      lastMousePos.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseUp = () => {
      isDragging.current = false
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current && currentPlayer) {
        const newPosition = {
          x: currentPlayer.position.x + e.clientX - lastMousePos.current.x,
          y: currentPlayer.position.y + e.clientY - lastMousePos.current.y,
        }

        newPosition.x = Math.max(0, Math.min(gameState?.mapSize.width || 0, newPosition.x))
        newPosition.y = Math.max(0, Math.min(gameState?.mapSize.height || 0, newPosition.y))

        movePlayer(newPosition)
        lastMousePos.current = { x: e.clientX, y: e.clientY }
      }
    }

    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('mousemove', handleMouseMove)

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mousemove', handleMouseMove)
    }
  }, [currentPlayer, movePlayer, gameState?.mapSize])

  const handleWordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitWord(word)
    setWord('')
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#111' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
      }}>
        <form onSubmit={handleWordSubmit}>
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="Type a word and press Enter"
            style={{
              padding: '10px',
              width: '300px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              background: '#222',
              color: 'white',
            }}
            autoFocus
          />
        </form>
      </div>

      {currentPlayer && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          color: 'white',
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: '10px',
          borderRadius: '5px',
        }}>
          <h3>{currentPlayer.name}</h3>
          <p>Health: {currentPlayer.health}</p>
        </div>
      )}

      {gameState && (
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          color: 'white',
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: '10px',
          borderRadius: '5px',
          minWidth: '140px',
        }}>
          <h4 style={{ margin: '0 0 5px 0' }}>플레이어 랭킹</h4>
          {[...gameState.players]
            .sort((a, b) => b.health - a.health)
            .map((player, index) => (
              <div
                key={player.id}
                style={{
                  fontSize: '14px',
                  fontWeight: player.id === socket?.id ? 'bold' : 'normal',
                  color: player.id === socket?.id ? '#4ade80' : 'white',
                }}
              >
                {index + 1}위 - {player.skin} {player.name} ({player.health})
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

export default GameScreen
