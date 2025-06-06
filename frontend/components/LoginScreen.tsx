'use client'

import React, { useState } from 'react'
import { useGame } from '@/lib/GameProvider'

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

const LoginScreen = () => {
  const { connect } = useGame()
  const [nickname, setNickname] = useState('')
  const [selectedSkin, setSelectedSkin] = useState(skins[0])
  const [showSkins, setShowSkins] = useState(false)

  const handlePlay = () => {
    if (nickname.trim()) {
      connect(nickname.trim(), selectedSkin)
    } else {
      alert('Please enter a nickname.')
    }
  }

  const handleSpectate = () => {
    // For spectating, we connect with a generic name and a special flag maybe
    // The backend logic for spectating needs to be implemented.
    // For now, let's just connect as a normal player named "Spectator".
    connect(`Spectator_${Math.floor(Math.random() * 1000)}`, '👀')
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-lg p-8 space-y-6 relative">
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

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handlePlay}
            className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 rounded-lg text-white font-bold text-lg transition-transform duration-150 ease-in-out hover:scale-105"
          >
            Play
          </button>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowSkins(!showSkins)}
              className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 rounded-lg transition"
            >
              Choose Skin
            </button>
            <button
              onClick={handleSpectate}
              className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded-lg transition"
            >
              Spectate
            </button>
          </div>
        </div>

        {/* Skin Selection Modal */}
        {showSkins && (
          <div className="absolute inset-0 bg-gray-800 bg-opacity-95 z-10 p-8 rounded-2xl flex flex-col">
            <h2 className="text-2xl font-bold text-center mb-4">
              Choose your skin
            </h2>
            <div className="grid grid-cols-4 gap-4 flex-grow">
              {skins.map((skin) => (
                <button
                  key={skin}
                  onClick={() => {
                    setSelectedSkin(skin)
                    setShowSkins(false)
                  }}
                  className={`p-4 rounded-lg text-4xl transition-transform duration-150 flex justify-center items-center ${
                    selectedSkin === skin
                      ? 'bg-cyan-500 scale-110'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {skin}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowSkins(false)}
              className="mt-4 py-2 px-4 bg-red-500 hover:bg-red-600 rounded-lg"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

export default LoginScreen
