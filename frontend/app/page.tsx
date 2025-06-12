'use client'

import { useGame } from '@/components/GameStateManager'
import LoginScreen from '@/components/LoginScreen'
import GameScreen from '@/components/GameScreen'
import SpectatorScreen from '@/components/SpectatorScreen'

export default function Page() {
  const { isConnected, connect, isSpectator } = useGame()

  if (!isConnected) {
    return (
      <LoginScreen
        onStart={(nickname: string, skin: string, isSpectator: boolean) => {
          connect(nickname, skin, isSpectator)
        }}
      />
    )
  }

  return isSpectator ? <SpectatorScreen /> : <GameScreen />
}
