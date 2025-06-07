'use client'

import React, { useState } from 'react'

export default function LoginScreen({
  onStart,
}: {
  onStart: (nickname: string, skin: string) => void
}) {
  const [nickname, setNickname] = useState('')
  const [selectedSkin, setSelectedSkin] = useState('🐶')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFE29F] via-[#FFA99F] to-[#FF719A]">
      <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-xl p-8 w-full max-w-sm flex flex-col items-center space-y-6">
        <img
          src="/logo/typing-battle-logo.png"
          alt="Typing Battle Logo"
          className="w-[200px] h-auto object-contain"
        />

        <input
          type="text"
          placeholder="닉네임을 입력하세요"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-full text-center focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        <div className="w-full">
          <p className="text-sm text-gray-600 mb-2 text-center">스킨 선택</p>
          <div className="flex justify-center flex-wrap gap-2">
            {['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => setSelectedSkin(emoji)}
                className={`text-xl hover:scale-110 transition-transform ${
                  selectedSkin === emoji
                    ? 'ring-2 ring-yellow-400 rounded-full'
                    : ''
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onStart(nickname, selectedSkin)}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 rounded-full transition-colors"
        >
          게임 시작
        </button>
      </div>
    </div>
  )
}
