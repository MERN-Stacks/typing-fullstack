'use client'

import { useState } from 'react'
import GameCanvas from '@/components/game/GameCanvas'

const skins = [
  '😊',
  '🤖',
  '🐱',
  '🐶',
  '🦊',
  '🐸',
  '🐼',
  '🦄',
  '👻',
  '🎃',
  '⭐',
  '🌟',
]

export default function HomePage() {
  const [isInGame, setIsInGame] = useState(false)
  const [nickname, setNickname] = useState('')
  const [selectedSkin, setSelectedSkin] = useState(skins[0])

  const handleStartGame = () => {
    if (nickname.trim()) {
      setIsInGame(true)
    } else {
      alert('Please enter a nickname.')
    }
  }

  if (isInGame) {
    return <GameCanvas nickname={nickname} skin={selectedSkin} />
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-cyan-400">Typing Battle</h1>
          <p className="text-gray-400 mt-2">Enter the arena!</p>
        </div>

        {/* Profile Preview */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-6xl">
            {selectedSkin}
          </div>
          <p className="font-semibold text-lg">{nickname || 'Anonymous'}</p>
        </div>

        {/* Nickname Input */}
        <div>
          <label
            htmlFor="nickname"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Nickname
          </label>
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter your nickname"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>

        {/* Skin Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Choose your skin
          </label>
          <div className="grid grid-cols-6 gap-2">
            {skins.map((skin) => (
              <button
                key={skin}
                onClick={() => setSelectedSkin(skin)}
                className={`p-2 rounded-lg text-2xl transition-transform duration-150 ${
                  selectedSkin === skin
                    ? 'bg-cyan-500 scale-110'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {skin}
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartGame}
          className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 rounded-lg text-white font-bold text-lg transition-transform duration-150 ease-in-out hover:scale-105"
        >
          Start Game
        </button>
      </div>
    </main>
  )
}
