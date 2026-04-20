import type {
  NPC,
  Period,
  AutonomousAction,
  AutonomousActionType,
  WorldActivityEntry,
  EmotionState,
  EmotionType,
} from '@repo/types'
import { getDefaultEmotions, getPersonalityEmotionBase } from './emotion-engine'

let actionCounter = 0
let entryCounter = 0

function generateActionId(): string {
  actionCounter++
  return `act_${Date.now()}_${actionCounter}`
}

function generateEntryId(): string {
  entryCounter++
  return `log_${Date.now()}_${entryCounter}`
}

// ─── Personality Compatibility ─────────────────────────────

const CLIQUE_COMPATIBILITY: Record<string, Record<string, number>> = {
  jock: { jock: 0.8, popular: 0.6, preppy: 0.4, nerd: 0.2, artsy: 0.3, goth: 0.1 },
  popular: { popular: 0.7, jock: 0.6, preppy: 0.5, artsy: 0.4, nerd: 0.3, goth: 0.2 },
  nerd: { nerd: 0.8, artsy: 0.5, preppy: 0.4, popular: 0.2, goth: 0.3, jock: 0.1 },
  goth: { goth: 0.7, artsy: 0.6, nerd: 0.3, popular: 0.1, jock: 0.1, preppy: 0.1 },
  artsy: { artsy: 0.7, goth: 0.6, nerd: 0.5, popular: 0.4, preppy: 0.3, jock: 0.2 },
  preppy: { preppy: 0.6, popular: 0.5, nerd: 0.4, jock: 0.4, artsy: 0.3, goth: 0.1 },
}

const PERSONALITY_SYNERGY: Record<string, Record<string, number>> = {
  friendly: { friendly: 0.9, hyper: 0.8, chill: 0.7, loyal: 0.7, tsundere: 0.3, mysterious: 0.4, dramatic: 0.5, ambitious: 0.5 },
  tsundere: { tsundere: 0.5, dramatic: 0.6, mysterious: 0.4, ambitious: 0.5, chill: 0.3, friendly: 0.3, hyper: 0.2, loyal: 0.3 },
  mysterious: { mysterious: 0.6, chill: 0.5, dramatic: 0.4, tsundere: 0.4, loyal: 0.4, friendly: 0.4, hyper: 0.2, ambitious: 0.3 },
  hyper: { hyper: 0.8, friendly: 0.8, dramatic: 0.6, chill: 0.4, tsundere: 0.2, mysterious: 0.2, loyal: 0.5, ambitious: 0.4 },
  chill: { chill: 0.8, loyal: 0.7, friendly: 0.7, mysterious: 0.5, hyper: 0.4, tsundere: 0.3, dramatic: 0.2, ambitious: 0.3 },
  dramatic: { dramatic: 0.7, hyper: 0.6, tsundere: 0.6, friendly: 0.5, mysterious: 0.4, ambitious: 0.5, chill: 0.2, loyal: 0.3 },
  ambitious: { ambitious: 0.7, dramatic: 0.5, tsundere: 0.5, friendly: 0.5, loyal: 0.5, chill: 0.3, mysterious: 0.3, hyper: 0.4 },
  loyal: { loyal: 0.8, chill: 0.7, friendly: 0.7, ambitious: 0.5, mysterious: 0.4, hyper: 0.5, tsundere: 0.3, dramatic: 0.3 },
}

// ─── Autonomous Action Generation ──────────────────────────

export function generateAutonomousActions(
  npcs: NPC[],
  period: Period,
  atmosphere: number // 0-100 global school atmosphere
): AutonomousAction[] {
  const actions: AutonomousAction[] = []
  const unlockedNpcs = npcs.filter((n) => n.unlocked)

  for (const npc of unlockedNpcs) {
    // Each NPC has a chance to do something based on personality
    const baseChance = getActivityChance(npc.personality)
    const atmosphereMod = (atmosphere - 50) / 100 // -0.5 to +0.5
    const roll = Math.random() + atmosphereMod

    if (roll < baseChance) continue

    const action = generateSingleAction(npc, unlockedNpcs, period)
    if (action) actions.push(action)
  }

  return actions
}

function generateSingleAction(
  npc: NPC,
  allNpcs: NPC[],
  period: Period
): AutonomousAction | null {
  const emotionBase = getPersonalityEmotionBase(npc.personality)
  const baseEmotions: EmotionState = getDefaultEmotions()
  // Apply base weights
  ;(Object.entries(emotionBase.baseWeights) as Array<[EmotionType, number]>).forEach(
    ([emotion, weight]) => {
      baseEmotions[emotion] = Math.min(100, weight)
    }
  )

  const possibleTypes = getPossibleActionTypes(npc.personality)
  const type = possibleTypes[Math.floor(Math.random() * possibleTypes.length)]!

  let targetNpcId: string | undefined
  let targetLocation: string | undefined
  let description: string

  const location = npc.schedule[period] ?? 'school'

  switch (type) {
    case 'talk_to_npc': {
      const targets = allNpcs.filter(
        (n) => n.id !== npc.id && shouldNpcInteract(npc, n)
      )
      if (targets.length === 0) return null
      const target = targets[Math.floor(Math.random() * targets.length)]!
      targetNpcId = target.id
      description = `${npc.name} had a conversation with ${target.name} at ${location}`
      break
    }
    case 'go_to_location': {
      const locations = ['Cafeteria', 'Library', 'Gym', 'Courtyard', 'Hallway']
      targetLocation = locations[Math.floor(Math.random() * locations.length)]!
      description = `${npc.name} went to the ${targetLocation}`
      break
    }
    case 'start_activity': {
      const activities = getActivitiesForClique(npc.clique)
      const activity = activities[Math.floor(Math.random() * activities.length)]!
      description = `${npc.name} ${activity} at ${location}`
      break
    }
    case 'form_opinion': {
      const targets = allNpcs.filter((n) => n.id !== npc.id)
      if (targets.length === 0) return null
      const target = targets[Math.floor(Math.random() * targets.length)]!
      targetNpcId = target.id
      const opinions = ['likes', 'is suspicious of', 'admires', 'is jealous of']
      const opinion = opinions[Math.floor(Math.random() * opinions.length)]!
      description = `${npc.name} ${opinion} ${target.name}`
      break
    }
    case 'start_rumor': {
      const targets = allNpcs.filter((n) => n.id !== npc.id)
      if (targets.length === 0) return null
      const target = targets[Math.floor(Math.random() * targets.length)]!
      targetNpcId = target.id
      description = `A rumor about ${target.name} started spreading, apparently from ${npc.name}`
      break
    }
    case 'confess_crush': {
      const targets = allNpcs.filter(
        (n) => n.id !== npc.id && npc.relationship > 40
      )
      if (targets.length === 0) return null
      const target = targets[Math.floor(Math.random() * targets.length)]!
      targetNpcId = target.id
      description = `${npc.name} confessed their feelings to ${target.name}`
      baseEmotions.joy = Math.min(100, baseEmotions.joy + 20)
      baseEmotions.anticipation = Math.min(100, baseEmotions.anticipation + 30)
      break
    }
    case 'start_fight': {
      const targets = allNpcs.filter(
        (n) => n.id !== npc.id && n.clique !== npc.clique
      )
      if (targets.length === 0) return null
      const target = targets[Math.floor(Math.random() * targets.length)]!
      targetNpcId = target.id
      description = `${npc.name} got into an argument with ${target.name} in the ${location}`
      baseEmotions.anger = Math.min(100, baseEmotions.anger + 30)
      break
    }
    case 'make_friend': {
      const targets = allNpcs.filter(
        (n) => n.id !== npc.id && shouldNpcInteract(npc, n)
      )
      if (targets.length === 0) return null
      const target = targets[Math.floor(Math.random() * targets.length)]!
      targetNpcId = target.id
      description = `${npc.name} and ${target.name} became closer friends`
      baseEmotions.joy = Math.min(100, baseEmotions.joy + 15)
      baseEmotions.trust = Math.min(100, baseEmotions.trust + 10)
      break
    }
    default:
      description = `${npc.name} wandered around ${location}`
  }

  return {
    id: generateActionId(),
    type,
    npcId: npc.id,
    targetNpcId,
    targetLocation,
    description,
    timestamp: Date.now(),
    emotionalState: baseEmotions,
  }
}

// ─── NPC-NPC Interaction Simulation ────────────────────────

export function simulateNpcInteractions(npcs: NPC[]): {
  actions: AutonomousAction[]
  relationshipChanges: Array<{ npcA: string; npcB: string; delta: number }>
} {
  const actions: AutonomousAction[] = []
  const relationshipChanges: Array<{
    npcA: string
    npcB: string
    delta: number
  }> = []

  const unlockedNpcs = npcs.filter((n) => n.unlocked)

  for (let i = 0; i < unlockedNpcs.length; i++) {
    for (let j = i + 1; j < unlockedNpcs.length; j++) {
      const a = unlockedNpcs[i]!
      const b = unlockedNpcs[j]!

      if (!shouldNpcInteract(a, b)) continue

      // Determine interaction outcome
      const compat = getCompatibility(a, b)
      const roll = Math.random()

      let delta = 0
      let type: AutonomousActionType = 'talk_to_npc'

      if (compat > 0.6 && roll < 0.3) {
        // Positive interaction
        delta = Math.floor(Math.random() * 5) + 2
        type = 'make_friend'
      } else if (compat > 0.4 && roll < 0.5) {
        // Neutral conversation
        delta = Math.floor(Math.random() * 3) + 1
        type = 'talk_to_npc'
      } else if (compat < 0.3 && roll < 0.2) {
        // Negative interaction
        delta = -(Math.floor(Math.random() * 5) + 2)
        type = 'start_fight'
      } else {
        // No significant interaction
        continue
      }

      const emotionsA = getPersonalityEmotionBase(a.personality)
      const baseEmotions: EmotionState = getDefaultEmotions()
      ;(Object.entries(emotionsA.baseWeights) as Array<[EmotionType, number]>).forEach(
        ([emotion, weight]) => {
          baseEmotions[emotion] = Math.min(100, weight)
        }
      )

      actions.push({
        id: generateActionId(),
        type,
        npcId: a.id,
        targetNpcId: b.id,
        description: `${a.name} and ${b.name} ${type === 'make_friend' ? 'bonded' : type === 'start_fight' ? 'argued' : 'talked'}`,
        timestamp: Date.now(),
        emotionalState: baseEmotions,
      })

      relationshipChanges.push({
        npcA: a.id,
        npcB: b.id,
        delta,
      })
    }
  }

  return { actions, relationshipChanges }
}

export function shouldNpcInteract(npcA: NPC, npcB: NPC): boolean {
  // Same clique = more likely
  if (npcA.clique === npcB.clique) return true

  // Check clique compatibility
  const cliqueCompat = CLIQUE_COMPATIBILITY[npcA.clique]?.[npcB.clique] ?? 0.3
  const personalityCompat =
    PERSONALITY_SYNERGY[npcA.personality]?.[npcB.personality] ?? 0.5

  // Relationship level influences future interactions
  const relMod = (npcA.relationship + npcB.relationship) / 200 // 0-1
  const chance = cliqueCompat * 0.4 + personalityCompat * 0.4 + relMod * 0.2

  return Math.random() < chance
}

function getCompatibility(npcA: NPC, npcB: NPC): number {
  const cliqueCompat = CLIQUE_COMPATIBILITY[npcA.clique]?.[npcB.clique] ?? 0.3
  const personalityCompat =
    PERSONALITY_SYNERGY[npcA.personality]?.[npcB.personality] ?? 0.5
  return (cliqueCompat + personalityCompat) / 2
}

// ─── World Activity Log ────────────────────────────────────

export function generateWorldActivityLog(
  actions: AutonomousAction[],
  period: Period
): WorldActivityEntry[] {
  const entries: WorldActivityEntry[] = []

  // Group actions by type for more interesting log entries
  const byType = groupBy(actions, (a) => a.type)

  for (const [type, typeActions] of Object.entries(byType)) {
    if (typeActions.length === 0) continue

    // Create merged entries for common action types
    const merged = mergeSimilarActions(typeActions, period)
    entries.push(...merged)
  }

  return entries.slice(0, 20) // Cap entries
}

export function processOfflineActivity(
  npcs: NPC[],
  timeAwayMs: number
): WorldActivityEntry[] {
  const entries: WorldActivityEntry[] = []
  const periodsAway = Math.floor(timeAwayMs / (4 * 60 * 60 * 1000)) // ~4h per period

  if (periodsAway <= 0) return entries

  const unlockedNpcs = npcs.filter((n) => n.unlocked)
  const periodNames: Period[] = ['morning', 'lunch', 'afternoon', 'evening', 'night']

  for (let p = 0; p < Math.min(periodsAway, 10); p++) {
    const period = periodNames[p % periodNames.length]!
    const atmosphere = 40 + Math.random() * 40 // Random atmosphere

    const actions = generateAutonomousActions(unlockedNpcs, period, atmosphere)
    const periodEntries = generateWorldActivityLog(actions, period)

    // Add time offset to make timestamps sequential
    for (const entry of periodEntries) {
      entry.timestamp = Date.now() - (periodsAway - p) * 4 * 60 * 60 * 1000
      entry.period = period
      entries.push(entry)
    }
  }

  return entries.slice(0, 50) // Keep last 50
}

// ─── Helpers ───────────────────────────────────────────────

function getActivityChance(personality: string): number {
  const chances: Record<string, number> = {
    friendly: 0.3,
    tsundere: 0.4,
    mysterious: 0.5,
    hyper: 0.2,
    chill: 0.6,
    dramatic: 0.25,
    ambitious: 0.35,
    loyal: 0.4,
  }
  return chances[personality] ?? 0.5
}

function getPossibleActionTypes(personality: string): AutonomousActionType[] {
  const base: AutonomousActionType[] = [
    'talk_to_npc',
    'go_to_location',
    'start_activity',
  ]
  const extra: Record<string, AutonomousActionType[]> = {
    friendly: ['make_friend', 'form_opinion'],
    tsundere: ['start_fight', 'confess_crush'],
    mysterious: ['form_opinion', 'start_rumor'],
    hyper: ['start_activity', 'make_friend'],
    chill: ['go_to_location', 'form_opinion'],
    dramatic: ['start_fight', 'confess_crush', 'start_rumor'],
    ambitious: ['start_activity', 'form_opinion'],
    loyal: ['make_friend', 'form_opinion'],
  }
  return [...base, ...(extra[personality] ?? [])]
}

function getActivitiesForClique(clique: string): string[] {
  const activities: Record<string, string[]> = {
    jock: ['practiced plays', 'worked out', 'ran drills', 'played a pickup game'],
    popular: ['planned an event', 'gossiped', 'took selfies', 'hosted a study session'],
    nerd: ['studied together', 'debugged code', 'built a robot', 'debated theories'],
    goth: ['wrote poetry', 'listened to music', 'sketched in the dark', 'discussed philosophy'],
    artsy: ['painted a mural', 'sketched portraits', 'practiced an instrument', 'wrote lyrics'],
    preppy: ['organized a fundraiser', 'studied for exams', 'planned a debate', 'networked'],
  }
  return activities[clique] ?? ['hung out']
}

function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {}
  for (const item of arr) {
    const key = keyFn(item)
    if (!result[key]) result[key] = []
    result[key].push(item)
  }
  return result
}

function mergeSimilarActions(
  actions: AutonomousAction[],
  period: Period
): WorldActivityEntry[] {
  if (actions.length === 0) return []

  // For small sets, create individual entries
  if (actions.length <= 3) {
    return actions.map((a) => ({
      id: generateEntryId(),
      timestamp: a.timestamp,
      period,
      description: a.description,
      involvedNpcIds: a.targetNpcId
        ? [a.npcId, a.targetNpcId]
        : [a.npcId],
      type: 'npc_interaction' as const,
    }))
  }

  // Merge larger sets into summary entries
  const entries: WorldActivityEntry[] = []
  const chunkSize = 3
  for (let i = 0; i < actions.length; i += chunkSize) {
    const chunk = actions.slice(i, i + chunkSize)
    const npcs = new Set<string>()
    chunk.forEach((a) => {
      npcs.add(a.npcId)
      if (a.targetNpcId) npcs.add(a.targetNpcId)
    })

    const summaries = [
      'Several students were seen socializing around campus',
      'A group of students spent time together between classes',
      'Hallways buzzed with student activity',
      'The social scene was lively this period',
    ]

    entries.push({
      id: generateEntryId(),
      timestamp: chunk[0]!.timestamp,
      period,
      description: summaries[Math.floor(Math.random() * summaries.length)]!,
      involvedNpcIds: Array.from(npcs),
      type: 'npc_interaction',
    })
  }

  return entries
}
