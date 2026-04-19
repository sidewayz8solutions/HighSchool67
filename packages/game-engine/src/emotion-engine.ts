import type {
  EmotionState,
  EmotionType,
  EmotionModifiers,
  MemoryType,
} from '@repo/types'

const EMOTION_BASELINE = 15 // emotions drift toward this value
const DECAY_RATE_PER_MINUTE = 0.05 // how fast emotions decay

export function getDefaultEmotions(): EmotionState {
  return {
    joy: EMOTION_BASELINE,
    anger: EMOTION_BASELINE,
    sadness: EMOTION_BASELINE,
    fear: EMOTION_BASELINE,
    trust: EMOTION_BASELINE,
    disgust: EMOTION_BASELINE,
    anticipation: EMOTION_BASELINE,
    surprise: EMOTION_BASELINE,
  }
}

// Map personality type to base emotional tendencies
export function getPersonalityEmotionBase(
  personality: string
): EmotionModifiers {
  const bases: Record<string, EmotionModifiers> = {
    friendly: {
      baseWeights: {
        joy: 35,
        trust: 40,
        anticipation: 25,
        anger: 5,
        sadness: 10,
      },
      triggers: [
        {
          condition: 'player is kind',
          emotion: 'joy',
          intensityDelta: 15,
          cooldown: 60000,
        },
        {
          condition: 'player insults',
          emotion: 'sadness',
          intensityDelta: 10,
          cooldown: 120000,
        },
      ],
    },
    tsundere: {
      baseWeights: {
        trust: 8,
        anger: 30,
        joy: 20,
        anticipation: 20,
        sadness: 15,
      },
      triggers: [
        {
          condition: 'player shows affection',
          emotion: 'anger',
          intensityDelta: 12,
          cooldown: 60000,
        },
        {
          condition: 'player helps them',
          emotion: 'joy',
          intensityDelta: 20,
          cooldown: 120000,
        },
        {
          condition: 'player ignores them',
          emotion: 'sadness',
          intensityDelta: 15,
          cooldown: 180000,
        },
      ],
    },
    mysterious: {
      baseWeights: {
        anticipation: 35,
        trust: 10,
        fear: 15,
        joy: 15,
        surprise: 15,
      },
      triggers: [
        {
          condition: 'player asks personal question',
          emotion: 'fear',
          intensityDelta: 10,
          cooldown: 90000,
        },
        {
          condition: 'player shares a secret',
          emotion: 'trust',
          intensityDelta: 15,
          cooldown: 120000,
        },
      ],
    },
    hyper: {
      baseWeights: {
        joy: 40,
        surprise: 30,
        anticipation: 30,
        anger: 5,
        sadness: 5,
      },
      triggers: [
        {
          condition: 'anything exciting happens',
          emotion: 'joy',
          intensityDelta: 20,
          cooldown: 30000,
        },
        {
          condition: 'something unexpected',
          emotion: 'surprise',
          intensityDelta: 25,
          cooldown: 30000,
        },
      ],
    },
    chill: {
      baseWeights: {
        joy: 25,
        trust: 25,
        sadness: 15,
        anger: 5,
        fear: 5,
        anticipation: 10,
        surprise: 5,
        disgust: 5,
      },
      triggers: [
        {
          condition: 'conflict arises',
          emotion: 'sadness',
          intensityDelta: 5,
          cooldown: 180000,
        },
        {
          condition: 'peaceful moment',
          emotion: 'joy',
          intensityDelta: 10,
          cooldown: 60000,
        },
      ],
    },
    dramatic: {
      baseWeights: {
        joy: 40,
        anger: 35,
        sadness: 35,
        trust: 10,
        surprise: 30,
        anticipation: 30,
        fear: 20,
        disgust: 20,
      },
      triggers: [
        {
          condition: 'any emotional event',
          emotion: 'surprise',
          intensityDelta: 15,
          cooldown: 30000,
        },
        {
          condition: 'player betrays them',
          emotion: 'anger',
          intensityDelta: 30,
          cooldown: 300000,
        },
        {
          condition: 'romantic moment',
          emotion: 'joy',
          intensityDelta: 35,
          cooldown: 60000,
        },
      ],
    },
    ambitious: {
      baseWeights: {
        anticipation: 40,
        joy: 25,
        trust: 20,
        anger: 15,
        fear: 10,
      },
      triggers: [
        {
          condition: 'competition starts',
          emotion: 'anticipation',
          intensityDelta: 25,
          cooldown: 60000,
        },
        {
          condition: 'player wins against them',
          emotion: 'anger',
          intensityDelta: 20,
          cooldown: 120000,
        },
        {
          condition: 'goal is achieved',
          emotion: 'joy',
          intensityDelta: 25,
          cooldown: 90000,
        },
      ],
    },
    loyal: {
      baseWeights: {
        trust: 45,
        joy: 30,
        anticipation: 15,
        sadness: 10,
        anger: 5,
      },
      triggers: [
        {
          condition: 'player is loyal to them',
          emotion: 'trust',
          intensityDelta: 20,
          cooldown: 120000,
        },
        {
          condition: 'player betrays trust',
          emotion: 'sadness',
          intensityDelta: 25,
          cooldown: 300000,
        },
        {
          condition: 'friend is threatened',
          emotion: 'anger',
          intensityDelta: 30,
          cooldown: 60000,
        },
      ],
    },
  }

  return (
    bases[personality] ?? {
      baseWeights: {},
      triggers: [],
    }
  )
}

// Emotional impact matrix: memory type -> emotion shifts
const EVENT_EMOTION_SHIFTS: Record<
  MemoryType,
  Partial<Record<EmotionType, number>>
> = {
  conversation: { trust: 3, joy: 2 },
  event: { surprise: 5, anticipation: 3 },
  gift: { joy: 10, trust: 8 },
  insult: { anger: 15, trust: -10, sadness: 5 },
  romance: { joy: 15, trust: 10, anticipation: 10 },
  betrayal: { anger: 20, trust: -20, sadness: 15 },
  achievement: { joy: 15, anticipation: 10 },
  shared_activity: { joy: 10, trust: 8 },
  observation: { anticipation: 3, surprise: 2 },
}

export function shiftEmotions(
  current: EmotionState,
  event: { type: MemoryType; intensity: number }
): EmotionState {
  const shifts = EVENT_EMOTION_SHIFTS[event.type]
  if (!shifts) return current

  const next = { ...current }
  const multiplier = Math.max(0.5, Math.min(2, event.intensity / 5))

  ;(Object.entries(shifts) as Array<[EmotionType, number]>).forEach(
    ([emotion, delta]) => {
      const adjusted = Math.round(delta * multiplier)
      next[emotion] = Math.max(0, Math.min(100, next[emotion] + adjusted))
    }
  )

  return next
}

export function getDominantEmotion(emotions: EmotionState): EmotionType {
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

export function getEmotionDescription(emotions: EmotionState): string {
  const dominant = getDominantEmotion(emotions)
  const val = emotions[dominant]

  if (val < 20) return 'neutral'

  const intensity = val < 40 ? 'slightly ' : val < 60 ? '' : val < 80 ? 'very ' : 'extremely '

  const descriptors: Record<EmotionType, string> = {
    joy: 'joyful',
    anger: 'angry',
    sadness: 'melancholic',
    fear: 'anxious',
    trust: 'trusting',
    disgust: 'disgusted',
    anticipation: 'excited',
    surprise: 'surprised',
  }

  return intensity + descriptors[dominant]
}

export function decayEmotions(
  current: EmotionState,
  timeMs: number
): EmotionState {
  // Convert time to minutes for decay calculation
  const minutes = timeMs / 60000
  const decayFactor = Math.min(1, minutes * DECAY_RATE_PER_MINUTE)

  const next = { ...current }

  ;(Object.keys(next) as EmotionType[]).forEach((emotion) => {
    const currentVal = next[emotion]
    // Drift toward baseline
    if (currentVal > EMOTION_BASELINE) {
      next[emotion] = Math.max(
        EMOTION_BASELINE,
        currentVal - (currentVal - EMOTION_BASELINE) * decayFactor
      )
    } else if (currentVal < EMOTION_BASELINE) {
      next[emotion] = Math.min(
        EMOTION_BASELINE,
        currentVal + (EMOTION_BASELINE - currentVal) * decayFactor
      )
    }
    // Round to clean numbers
    next[emotion] = Math.round(next[emotion] * 10) / 10
  })

  return next
}
