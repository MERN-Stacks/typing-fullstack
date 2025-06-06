'use client'

import { useGame } from '@/lib/GameProvider'
import LoginScreen from '@/components/LoginScreen'
import GameScreen from '@/components/GameScreen'

export default function Page() {
  const { isConnected } = useGame()

  return isConnected ? <GameScreen /> : <LoginScreen />
}
