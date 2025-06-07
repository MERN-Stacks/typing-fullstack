'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import GameCanvas from '@/components/game-canvas'
import GameUI from '@/components/game-ui'
import { useGame } from '@/lib/GameProvider'
import type { Player, GameState as ClientGameState } from '@/types/game'

export default function GamePage() {
  const router = useRouter()
  const {
    gameState: serverState,
    socket,
    effects,
    isConnected,
    disconnect,
    submitWord,
    movePlayer,
  } = useGame()

  const [currentUser, setCurrentUser] = useState<Player | null>(null)
  const [isSpectator, setIsSpectator] = useState(false)
  const [clientGameState, setClientGameState] =
    useState<ClientGameState | null>(null)

  useEffect(() => {
    if (!isConnected && !socket) {
      router.push('/')
      return
    }

    const spectatorMode = sessionStorage.getItem('isSpectator')
    if (spectatorMode === 'true') {
      setIsSpectator(true)
    }

    if (serverState && socket) {
      const me = serverState.players.find((p) => p.id === socket.id)
      if (me) {
        setCurrentUser(me)
      }

      // Convert players array to Map for easier lookup in components
      const playersMap = new Map(
        serverState.players.map((p) => [p.id, p as Player]),
      )

      const enrichedGameState: ClientGameState = {
        ...serverState,
        players: playersMap,
        // camera is a client-side only concept for now
        camera: clientGameState?.camera || { x: 0, y: 0 },
        // items are not yet on the server state
        items: clientGameState?.items || [],
        // effects are managed by the provider, but we can pass them here if needed
        // effects: effects,
      }
      setClientGameState(enrichedGameState)
    }
  }, [
    isConnected,
    socket,
    router,
    serverState,
    clientGameState?.camera,
    clientGameState?.items,
  ])

  const handleExitGame = () => {
    disconnect()
    router.push('/')
  }

  const handleUpdatePlayer = (playerId: string, updates: Partial<Player>) => {
    if (updates.position) {
      movePlayer(updates.position)
    }
    // Other updates can be sent via a new socket event if needed
  }

  const handleUpdateGameState = (updates: Partial<ClientGameState>) => {
    setClientGameState((prev) => (prev ? { ...prev, ...updates } : null))
  }

  if (!isConnected || !clientGameState) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        Loading or Connecting...
      </div>
    )
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gray-800">
      <GameCanvas
        gameState={clientGameState}
        currentUser={currentUser}
        isSpectator={isSpectator}
        onUpdatePlayer={handleUpdatePlayer}
        onUpdateGameState={handleUpdateGameState}
      />

      <GameUI
        gameState={clientGameState}
        currentUser={currentUser}
        isSpectator={isSpectator}
        onExitGame={handleExitGame}
        onSubmitWord={submitWord}
      />
    </div>
  )
}
