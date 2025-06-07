'use client'

import { useGame } from '@/lib/GameProvider'
import LoginScreen from '@/components/LoginScreen'
import GameScreen from '@/components/GameScreen'

export default function Page() {
  const { isConnected, connect } = useGame()

  return isConnected ? (
    <GameScreen />
  ) : (
    <LoginScreen
      onStart={(nickname: string, skin: string) => {
        connect(nickname, skin)
      }}
    />
  )
}
