import OpenAI from 'openai'

export interface NarrativeContext {
  playerName: string
  clique: string
  npcName: string
  npcClique: string
  relationship: number
  currentScene: string
}

export async function generateDialogue(context: NarrativeContext, apiKey?: string): Promise<string> {
  if (!apiKey) {
    return `Hey ${context.playerName}, what's up?`
  }

  const client = new OpenAI({ apiKey })

  const prompt = `
You are an NPC named ${context.npcName} (${context.npcClique}) in a high school life sim game.
The player is ${context.playerName} (${context.clique}).
Relationship level: ${context.relationship}/100.
Current scene: ${context.currentScene}.
Write a single line of dialogue (max 20 words) that fits this context.
`

  const response = await client.chat.completions.create({
    model: 'o4-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 60,
  })

  return response.choices[0]?.message?.content?.trim() ?? '...'
}

// ── NEW: V2 Enhanced Dialogue System ──────────────────────

export {
  generateDialogueV2,
  type DialogueV2Context,
} from './dialogue-v2'
