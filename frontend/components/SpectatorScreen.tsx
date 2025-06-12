'use client'

import { useEffect, useRef } from 'react'
import { useGame } from '@/components/GameStateManager'

export default function SpectatorScreen() {
  const { gameState, camera, setCamera } = useGame()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const isMouseDown = useRef(false)
  const prevMouse = useRef({ x: 0, y: 0 })

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
    ctx.strokeStyle = '#444'
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
      ctx.fillStyle = {
        heal: 'limegreen',
        attack: 'red',
        speed: '#3498db',
        shield: '#f39c12',
        item: '#9b59b6',
      }[word.type] || 'white'
      ctx.fillText(word.text, word.position.x, word.position.y)
    })

    gameState.players.forEach((player) => {
      if (player.name === '관전자') return

      ctx.fillStyle = 'red'
      ctx.fillRect(player.position.x - 25, player.position.y - 40, 50, 5)
      ctx.fillStyle = 'green'
      ctx.fillRect(
        player.position.x - 25,
        player.position.y - 40,
        (player.health / 100) * 50,
        5
      )

      ctx.font = '30px Arial'
      ctx.fillText(player.skin, player.position.x, player.position.y)
      ctx.font = '14px Arial'
      ctx.fillStyle = 'white'
      ctx.fillText(player.name, player.position.x, player.position.y + 20)
    })

    ctx.restore()
  }, [gameState, camera])

  // ✅ 마우스로 드래그해서 카메라 이동
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      isMouseDown.current = true
      prevMouse.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseUp = () => {
      isMouseDown.current = false
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown.current) return
      const dx = e.clientX - prevMouse.current.x
      const dy = e.clientY - prevMouse.current.y
      setCamera((prev) => ({
        x: prev.x - dx,
        y: prev.y - dy,
      }))
      prevMouse.current = { x: e.clientX, y: e.clientY }
    }

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [setCamera])

  return (
    <div className="w-screen h-screen relative bg-black">
      <canvas ref={canvasRef} className="block absolute inset-0 z-0" />
      {gameState && (
        <div className="absolute top-4 right-4 z-10 text-white text-sm bg-black/60 px-4 py-2 rounded max-h-[300px] overflow-y-auto">
          <div className="mb-2 font-bold text-lg">👥 전체 플레이어</div>
          {[...gameState.players]
            .filter((p) => p.name !== '관전자')
            .sort((a, b) => b.health - a.health)
            .map((player, index) => (
              <div key={player.id}>
                {index + 1}위 - {player.skin} {player.name} ({player.health})
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
