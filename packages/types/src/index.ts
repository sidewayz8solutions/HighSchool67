export * from './story'
export * from './avatar'
export * from './npc-system'

export type Clique = 'jock' | 'nerd' | 'popular' | 'goth' | 'artsy' | 'preppy'

export interface Stats {
  academics: number
  athletics: number
  creativity: number
  popularity: number
  rebellion: number
  happiness: number
  energy: number
}

export interface Currency {
  points: number
  gems: number
}

export interface RoomItem {
  id: string
  name: string
  category: 'furniture' | 'wall' | 'floor' | 'poster' | 'lighting' | 'clothing'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  cost: Currency
  statBonuses: Partial<Stats>
  gridSize?: { width: number; height: number }
}

export interface PlacedItem extends RoomItem {
  position: { x: number; y: number }
  rotation: 0 | 90 | 180 | 270
}

export interface Room {
  width: number
  height: number
  wallColor: string
  floorType: string
  items: PlacedItem[]
}

export interface NPCVisualConfig {
  seed: string
  hair: string[]
  hairColor: string
  skinColor: string
  glasses?: string[]
}

export interface NPC {
  id: string
  name: string
  clique: Clique
  avatar: string // legacy, replaced by visualConfig
  visualConfig: NPCVisualConfig
  relationship: number // 0-100
  romance: number // 0-100
  unlocked: boolean
  bio: string
  personality: 'friendly' | 'tsundere' | 'mysterious' | 'hyper' | 'chill' | 'dramatic' | 'ambitious' | 'loyal'
  schedule: Record<string, string> // period -> location description
}

export interface Rival {
  id: string
  name: string
  clique: Clique
  visualConfig: NPCVisualConfig
  hostility: number // 0-100
  reason: string
  encounters: number
}

export interface RandomEvent {
  id: string
  title: string
  description: string
  choices: {
    id: string
    text: string
    effects: Partial<Stats>
    npcEffects?: Record<string, { friendship?: number; romance?: number }>
    currency?: Partial<Currency>
  }[]
  period: Period[]
  semester: number[]
  weight: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
  reward?: Partial<Currency>
  condition: 'stat_reached' | 'npc_max' | 'chapter_complete' | 'minigame_score' | 'days_played' | 'rival_defeated'
  targetValue: number
  targetKey?: string
}

export type Period = 'morning' | 'lunch' | 'afternoon' | 'evening' | 'night'

export interface GameProgress {
  semester: 1 | 2 | 3 | 4
  day: number
  period: Period
}

export interface DailyChallenge {
  id: string
  title: string
  description: string
  reward: Currency
  completed: boolean
  type: 'minigame' | 'social' | 'stat' | 'rival' | 'explore'
  targetValue: number
  currentValue: number
}

export interface GameState {
  player: Player
  progress: GameProgress
  npcs: NPC[]
  rivals: Rival[]
  challenges: DailyChallenge[]
  achievements: Achievement[]
  storyProgress: import('./story').StoryProgress
  lastPlayedAt: string
}

export interface Player {
  id: string
  name: string
  avatar: string
  avatarConfig: import('./avatar').AvatarConfig
  clique: Clique
  stats: Stats
  currency: Currency
  room: Room
  inventory: RoomItem[]
  equipped: {
    outfit: string | null
    accessory: string | null
  }
}
