// ─────────────────────────────────────────────
// NPC Memory & Emotional AI Engine — Type Definitions
// ─────────────────────────────────────────────

// Memory System
export type MemoryType =
  | 'conversation'
  | 'event'
  | 'gift'
  | 'insult'
  | 'romance'
  | 'betrayal'
  | 'achievement'
  | 'shared_activity'
  | 'observation'

export interface NPCMemory {
  id: string
  timestamp: number // epoch ms
  type: MemoryType
  content: string // description of what happened
  importance: number // 1-10
  relatedNpcIds?: string[]
  emotionalImpact?: Partial<Record<EmotionType, number>>
  decayLevel?: number // 0 = fresh, 1 = forgotten
}

// Emotion System
export type EmotionType =
  | 'joy'
  | 'anger'
  | 'sadness'
  | 'fear'
  | 'trust'
  | 'disgust'
  | 'anticipation'
  | 'surprise'

export interface EmotionState {
  joy: number // 0-100
  anger: number // 0-100
  sadness: number // 0-100
  fear: number // 0-100
  trust: number // 0-100
  disgust: number // 0-100
  anticipation: number // 0-100
  surprise: number // 0-100
}

export interface EmotionModifiers {
  baseWeights: Partial<Record<EmotionType, number>>
  triggers: EmotionTrigger[]
}

export interface EmotionTrigger {
  condition: string // description of what triggers this
  emotion: EmotionType
  intensityDelta: number
  cooldown?: number // ms
}

// NPC Personality Profile (OCEAN Big Five)
export interface PersonalityProfile {
  openness: number // 0-100
  conscientiousness: number // 0-100
  extraversion: number // 0-100
  agreeableness: number // 0-100
  neuroticism: number // 0-100
}

// NPC Autonomous Action
export type AutonomousActionType =
  | 'talk_to_npc'
  | 'go_to_location'
  | 'start_activity'
  | 'form_opinion'
  | 'start_rumor'
  | 'confess_crush'
  | 'start_fight'
  | 'make_friend'

export interface AutonomousAction {
  id: string
  type: AutonomousActionType
  npcId: string // the NPC doing the action
  targetNpcId?: string
  targetLocation?: string
  description: string
  timestamp: number
  emotionalState: EmotionState
}

// World Activity Log
export interface WorldActivityLog {
  entries: WorldActivityEntry[]
  maxEntries: number // keep last 50
}

export interface WorldActivityEntry {
  id: string
  timestamp: number
  period: string
  description: string
  involvedNpcIds: string[]
  type: 'npc_interaction' | 'event' | 'world_change' | 'player_absent'
}

// Group Scene
export interface GroupScene {
  id: string
  title: string
  description: string
  involvedNpcIds: string[]
  requiredRelationships?: Record<
    string,
    { minFriendship?: number; minRomance?: number }
  >
  dialogueSequence: GroupDialogueLine[]
  playerChoices?: GroupSceneChoice[]
  unlockConditions?: {
    semester?: number
    minStats?: Partial<Record<string, number>>
    npcIdsUnlocked?: string[]
  }
}

export interface GroupDialogueLine {
  speakerId: string // NPC id or 'player'
  text: string
  emotion?: EmotionType
  delay?: number // ms before next line
}

export interface GroupSceneChoice {
  id: string
  text: string
  effects: {
    npcEmotions?: Record<string, Partial<EmotionState>>
    npcRelationships?: Record<
      string,
      { friendship?: number; romance?: number }
    >
    playerStats?: Partial<Record<string, number>>
  }
}

// Memory retrieval context for AI
export interface MemoryContext {
  recentMemories: NPCMemory[] // last 5 memories
  significantMemories: NPCMemory[] // importance >= 7
  relationshipMemories: NPCMemory[] // memories about player
  emotionalTrend: string // summary of emotional state
}
