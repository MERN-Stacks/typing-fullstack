// export interface Player {
//   id: string
//   name: string
//   speed: number
//   skin: string
//   health: number
//   position: { x: number; y: number }
//   inventory: Item[]
//   shield: number
// }

export interface Player {
  id: string
  name: string
  skin: string
  health: number
  speed: number
  position: { x: number; y: number }
  inventory: Item[]
  effects: {
    speedBoost?: { active: boolean; expiresAt: number; }
    shield?: { active: boolean; expiresAt: number; }
  }
}

export interface NearestPlayer {
  id: string
  health: number
  position: { x: number; y: number }
}

export interface Word {
  id: number
  text: string
  type: string
  position: { x: number; y: number }
  color: string
}

export interface Item {
  type: string
  emoji: string
  name: string
}

export interface GameState {
  players: Map<string, Player>
  words: Word[]
  items: Item[]
  camera: { x: number; y: number }
  mapSize: { width: number; height: number }
}
