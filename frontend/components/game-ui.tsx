'use client'

import type React from 'react'

import { useState } from 'react'
import type { GameState, NearestPlayer, Player } from '@/types/game'

interface GameUIProps {
  gameState: GameState
  currentUser: Player | null
  isSpectator: boolean
  onExitGame: () => void
  onSubmitWord: (word: string) => void
}

export default function GameUI({
  gameState,
  currentUser,
  isSpectator,
  onExitGame,
  onSubmitWord,
}: GameUIProps) {
  const [typingInput, setTypingInput] = useState('')

  const handleSubmit = () => {
    if (!typingInput.trim() || !currentUser) return
    onSubmitWord(typingInput.trim())
    setTypingInput('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  if (isSpectator) {
    return (
      <div className="absolute top-5 left-5 z-10">
        <div className="bg-white/90 px-4 py-2 rounded-lg mb-2 font-bold">
          관전 모드
        </div>
        <button
          onClick={onExitGame}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          나가기
        </button>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Player Info (Center) */}
      {currentUser && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 p-4 rounded-2xl text-center min-w-[150px] pointer-events-auto">
          <div className="w-15 h-15 rounded-full bg-gradient-to-br from-pink-400 to-yellow-400 flex items-center justify-center text-2xl mx-auto mb-2">
            {currentUser.skin}
          </div>
          <div className="font-bold mb-2">{currentUser.name}</div>
          <div className="w-25 h-5 bg-gray-300 rounded-full overflow-hidden relative mx-auto">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-300"
              style={{ width: `${currentUser.health}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white text-shadow">
              {currentUser.health}
            </span>
          </div>
        </div>
      )}

      {/* Player List (Right) */}
      <div className="absolute top-5 right-5 bg-white/90 p-4 rounded-2xl min-w-[200px] pointer-events-auto">
        <h3 className="font-bold mb-3 text-gray-800">playerlist</h3>
        <div className="space-y-2">
          {Array.from(gameState.players.values()).map((player, index) => (
            <div
              key={player.id}
              className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-yellow-400 flex items-center justify-center text-sm">
                {player.skin}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold">
                  #{index + 1} {player.name}
                </div>
                <div className="w-15 h-2 bg-gray-300 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-300"
                    style={{ width: `${player.health}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inventory (Right Bottom) */}
      {currentUser && (
        <div className="absolute bottom-24 right-5 bg-white/90 p-4 rounded-2xl min-w-[150px] pointer-events-auto">
          <h3 className="font-bold mb-3 text-gray-800">item</h3>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 9 }).map((_, index) => {
              const item = currentUser.inventory[index]
              return (
                <div
                  key={index}
                  className={`w-10 h-10 border-2 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:bg-purple-100 ${
                    item
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-dashed border-gray-300'
                  }`}
                >
                  {item && (
                    <span className="text-lg" title={item.name}>
                      {item.emoji}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Typing Input (Bottom) */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 w-[300px] pointer-events-auto">
        <input
          type="text"
          value={typingInput}
          onChange={(e) => setTypingInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="단어를 입력하세요..."
          className="w-full px-4 py-3 bg-white/90 text-gray-800 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          autoFocus
        />
        <button
          onClick={handleSubmit}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          입력
        </button>
      </div>

      {/* Exit Button */}
      <div className="absolute top-5 left-5 pointer-events-auto">
        <button
          onClick={onExitGame}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          나가기
        </button>
      </div>
    </div>
  )
}
