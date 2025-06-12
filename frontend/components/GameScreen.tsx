'use client'

import React, { useRef, useEffect, useState } from 'react'
import { useGame } from '@/components/GameStateManager'
import { useRouter } from 'next/navigation'

export default function GameScreen() {
  const {
    gameState,
    socket,
    submitWord,
    movePlayer,
    effects,
    disconnect,
    currentPlayer,
    camera,
    updatePlayerPosition,
    useItem: handleUseItem,
  } = useGame()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [word, setWord] = useState('')
  const router = useRouter()

  const mousePosition = useRef({ x: 0, y: 0 })
  const isMouseDown = useRef(false)

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
      switch (word.type) {
        case 'heal':
          ctx.fillStyle = 'limegreen'
          break
        case 'attack':
          ctx.fillStyle = 'red'
          break
        case 'speed':
          ctx.fillStyle = '#3498db'
          break
        case 'shield':
          ctx.fillStyle = '#f39c12'
          break
        case 'item':
          ctx.fillStyle = '#9b59b6'
          break
        default:
          ctx.fillStyle = 'white'
          break
      }

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

      const now = Date.now();

      // ⚡ 스피드 버프 표시
      if (
        player.effects?.speedBoost?.expiresAt &&
        player.effects.speedBoost.expiresAt > now
      ) {
        ctx.font = '24px Arial';
        ctx.fillStyle = 'yellow';
        ctx.fillText('⚡', player.position.x - 20, player.position.y - 50);
      }

      // 🛡️ 실드 버프 표시
      if (
        player.effects?.shield?.expiresAt &&
        player.effects.shield.expiresAt > now
      ) {
        console.log('Shield effect active for player:', player.id);
        console.log(player.effects.shield.expiresAt )
        ctx.font = '24px Arial';
        ctx.fillStyle = 'blue';
        ctx.fillText('🛡️', player.position.x + 20, player.position.y - 50);
      }
    })

    effects.forEach((effect) => {
      ctx.font = '30px Arial'
      ctx.fillStyle = effect.color
      ctx.fillText(effect.emoji, effect.position.x, effect.position.y)
    })

    ctx.restore()
  }, [gameState, camera, effects])

  useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key >= '1' && e.key <= '5') {
      const index = parseInt(e.key, 10) - 1;
      handleUseItem(index); 
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUseItem]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      isMouseDown.current = true
      mousePosition.current = { x: e.clientX, y: e.clientY }
    }
    const handleMouseUp = () => {
      isMouseDown.current = false
    }
    const handleMouseMove = (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY }
    }

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleMouseMove)

    let animationFrameId: number
    const gameLoop = () => {
      if (isMouseDown.current && currentPlayer && gameState) {
        const playerScreenPos = {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        }
        const dx = mousePosition.current.x - playerScreenPos.x
        const dy = mousePosition.current.y - playerScreenPos.y
        const distance = Math.hypot(dx, dy)

        if (distance > 1) {
          const maxSpeed = 1
          const speedFactor = 0.06
          const speed = Math.min(maxSpeed, distance * speedFactor)

          const angle = Math.atan2(dy, dx)

          const newPlayerPos = {
            x: currentPlayer.position.x + Math.cos(angle) * speed,
            y: currentPlayer.position.y + Math.sin(angle) * speed,
          }

          const clampedX = Math.max(
            0,
            Math.min(gameState.mapSize.width, newPlayerPos.x),
          )
          const clampedY = Math.max(
            0,
            Math.min(gameState.mapSize.height, newPlayerPos.y),
          )
          const clampedPos = { x: clampedX, y: clampedY }

          updatePlayerPosition(currentPlayer.id, clampedPos)

          movePlayer(angle)
        }
      }
      animationFrameId = requestAnimationFrame(gameLoop)
    }

    gameLoop()

    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [currentPlayer, gameState, movePlayer, updatePlayerPosition])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleWordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitWord(word)
    setWord('')
  }

  const handleExitGame = () => {
    disconnect()
    router.push('/')
  }

  return (
    <div className="relative w-screen h-screen bg-gray-900">
      <canvas ref={canvasRef} className="block" />
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10">
        <form onSubmit={handleWordSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="Type a word and press Enter"
            className="w-[300px] rounded-lg border border-gray-300 bg-gray-800 p-2.5 text-white"
            autoFocus
          />
        </form>
      </div>

      <button
        onClick={handleExitGame}
        className="absolute top-2.5 left-2.5 z-10 cursor-pointer rounded-md border-none bg-red-600/70 p-2 text-white"
      >
        나가기
      </button>

        {currentPlayer && (
        <div className="absolute bottom-5 left-5 z-10 flex gap-2 bg-black/60 p-2 rounded-md">
          {currentPlayer.inventory.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center w-10 text-white text-sm"
            >
              <div className="text-2xl">{item.emoji}</div>
              <div>{index + 1}</div>
            </div>
          ))}
        </div>
      )}

      {gameState && (
        <div className="absolute top-2.5 right-2.5 z-10 min-w-[140px] rounded-md bg-black/50 p-2.5 text-white">
          <h4 className="m-0 mb-1.5">플레이어 랭킹</h4>
          {[...gameState.players]
            .sort((a, b) => b.health - a.health)
            .map((player, index) => (
              <div
                key={player.id}
                className={`text-sm ${
                  player.id === socket?.id ? 'font-bold text-green-400' : ''
                }`}
              >
                {index + 1}위 - {player.skin} {player.name} ({player.health})
              </div>
            ))}
        </div>
      )}
    </div>
  )
}