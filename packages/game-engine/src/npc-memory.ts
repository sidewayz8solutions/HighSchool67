import type {
  NPCMemory,
  MemoryType,
  EmotionType,
  MemoryContext,
  EmotionState,
} from '@repo/types'

let memoryCounter = 0

function generateMemoryId(): string {
  memoryCounter++
  return `mem_${Date.now()}_${memoryCounter}`
}

// ─── Factory ───────────────────────────────────────────────

export function createMemory(
  npcId: string,
  data: Omit<NPCMemory, 'id' | 'timestamp' | 'decayLevel'>
): NPCMemory {
  return {
    id: generateMemoryId(),
    timestamp: Date.now(),
    decayLevel: 0,
    ...data,
  }
}

// ─── Memory Management ─────────────────────────────────────

export function addMemory(
  memories: NPCMemory[],
  memory: NPCMemory
): NPCMemory[] {
  // Keep memories sorted by timestamp (newest first)
  const updated = [memory, ...memories]
  // Cap at 100 memories per NPC to prevent bloat
  if (updated.length > 100) {
    // Remove oldest lowest-importance memories
    const toKeep = updated
      .map((m, i) => ({
        memory: m,
        index: i,
        score: importanceScore(m) - i * 0.01, // prefer newer
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 100)
      .sort((a, b) => b.memory.timestamp - a.memory.timestamp)
      .map((t) => t.memory)
    return toKeep
  }
  return updated
}

export function getRelevantMemories(
  memories: NPCMemory[],
  context: {
    aboutPlayer?: boolean
    type?: MemoryType
    limit?: number
  }
): NPCMemory[] {
  let filtered = [...memories]

  if (context.type) {
    filtered = filtered.filter((m) => m.type === context.type)
  }

  if (context.aboutPlayer !== undefined) {
    filtered = filtered.filter((m) => {
      const mentionsPlayer =
        m.content.toLowerCase().includes('player') ||
        m.content.toLowerCase().includes('you') ||
        m.content.toLowerCase().includes('your')
      return context.aboutPlayer ? mentionsPlayer : !mentionsPlayer
    })
  }

  // Sort by importance score (highest first)
  filtered.sort((a, b) => importanceScore(b) - importanceScore(a))

  const limit = context.limit ?? 10
  return filtered.slice(0, limit)
}

export function getMemoryContext(
  npcId: string,
  memories: NPCMemory[],
  currentEmotions: EmotionState
): MemoryContext {
  const recent = [...memories]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5)

  const significant = memories.filter(
    (m) => importanceScore(m) >= 7
  )

  const relationship = memories.filter((m) => {
    const c = m.content.toLowerCase()
    return (
      c.includes('player') ||
      c.includes('you ') ||
      c.includes('your ') ||
      c.includes('met player')
    )
  })

  return {
    recentMemories: recent,
    significantMemories: significant,
    relationshipMemories: relationship,
    emotionalTrend: getEmotionalTrend(currentEmotions, recent),
  }
}

export function decayOldMemories(memories: NPCMemory[]): NPCMemory[] {
  const now = Date.now()
  const FORGET_THRESHOLD = 0.95

  return memories
    .map((m) => {
      const ageMs = now - m.timestamp
      // Decay rate: importance 10 takes 30 days to fully decay
      // importance 1 takes 3 days to fully decay
      const decayHalfLife = m.importance * 3 * 24 * 60 * 60 * 1000 // importance * 3 days in ms
      const decayLevel = Math.min(1, ageMs / decayHalfLife)
      return { ...m, decayLevel }
    })
    .filter((m) => m.decayLevel! < FORGET_THRESHOLD)
}

export function importanceScore(memory: NPCMemory): number {
  const decay = memory.decayLevel ?? 0
  const currentImportance = memory.importance * (1 - decay)
  // Boost for memories with emotional impact
  const emotionalBonus = memory.emotionalImpact
    ? Object.values(memory.emotionalImpact).reduce(
        (sum, v) => sum + Math.abs(v ?? 0) * 0.5,
        0
      )
    : 0
  return Math.round((currentImportance + emotionalBonus) * 10) / 10
}

export function shouldRemember(
  memories: NPCMemory[],
  newEvent: string
): boolean {
  // Check if this event is too similar to a recent memory
  const recentMemories = [...memories]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 20)

  const newWords = newEvent
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3)

  if (newWords.length === 0) return true

  for (const mem of recentMemories) {
    const memWords = mem.content
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3)

    const intersection = newWords.filter((w) => memWords.includes(w))
    const similarity =
      intersection.length / Math.max(newWords.length, memWords.length)

    // If >70% similar words, consider it a duplicate
    if (similarity > 0.7) return false
  }

  return true
}

// ─── Helpers ───────────────────────────────────────────────

function getEmotionalTrend(
  emotions: EmotionState,
  recentMemories: NPCMemory[]
): string {
  const dominant = getDominantEmotionFromState(emotions)
  const recentEmotionalMemories = recentMemories.filter(
    (m) => m.emotionalImpact && Object.keys(m.emotionalImpact).length > 0
  )

  if (recentEmotionalMemories.length === 0) {
    return `feeling ${dominant} at ${Math.round(emotions[dominant])}% intensity`
  }

  // Count positive vs negative recent memories
  let positive = 0
  let negative = 0
  recentEmotionalMemories.forEach((m) => {
    if (m.emotionalImpact) {
      if ((m.emotionalImpact.joy ?? 0) > 0) positive++
      if ((m.emotionalImpact.trust ?? 0) > 0) positive++
      if ((m.emotionalImpact.anger ?? 0) > 0) negative++
      if ((m.emotionalImpact.sadness ?? 0) > 0) negative++
    }
  })

  if (positive > negative) {
    return `trending positive, currently ${dominant} (${Math.round(emotions[dominant])}%)`
  }
  if (negative > positive) {
    return `trending negative, currently ${dominant} (${Math.round(emotions[dominant])}%)`
  }
  return `emotionally mixed, currently ${dominant} (${Math.round(emotions[dominant])}%)`
}

function getDominantEmotionFromState(emotions: EmotionState): EmotionType {
  let dominant: EmotionType = 'joy'
  let maxVal = -1

  ;(Object.entries(emotions) as Array<[EmotionType, number]>).forEach(
    ([emotion, value]) => {
      if (value > maxVal) {
        maxVal = value
        dominant = emotion
      }
    }
  )

  return dominant
}
