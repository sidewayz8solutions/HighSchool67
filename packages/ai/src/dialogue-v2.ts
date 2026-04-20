import OpenAI from 'openai'
import type {
  EmotionState,
  EmotionType,
  MemoryContext,
  NPCMemory,
} from '@repo/types'

export interface DialogueV2Context {
  playerName: string
  playerClique: string
  npcId: string
  npcName: string
  npcClique: string
  npcPersonality:
    | 'friendly'
    | 'tsundere'
    | 'mysterious'
    | 'hyper'
    | 'chill'
    | 'dramatic'
    | 'ambitious'
    | 'loyal'
  npcBio: string
  relationshipLevel: number // 0-100
  romanceLevel: number // 0-100
  dominantEmotion: EmotionType
  emotionState: EmotionState
  memoryContext: MemoryContext
  currentPeriod: string // morning, lunch, etc.
  currentLocation: string
  playerDialogueInput?: string // what the player just said (optional)
}

// ─── Relationship Tier Labels ──────────────────────────────

function getRelationshipTier(
  friendship: number,
  romance: number
): {
  label: string
  description: string
} {
  if (romance >= 70) {
    return {
      label: 'romantic_partner',
      description: 'deeply in love, intimately connected',
    }
  }
  if (romance >= 50) {
    return {
      label: 'romantic_interest',
      description: 'romantic tension and mutual attraction',
    }
  }
  if (romance >= 30) {
    return {
      label: 'flirtatious',
      description: 'playful flirtation, testing the waters',
    }
  }
  if (friendship >= 80) {
    return {
      label: 'close_friend',
      description: 'best friends who trust each other completely',
    }
  }
  if (friendship >= 60) {
    return {
      label: 'friend',
      description: 'good friends who enjoy hanging out',
    }
  }
  if (friendship >= 40) {
    return {
      label: 'acquaintance',
      description: 'familiar faces who know each other',
    }
  }
  if (friendship >= 20) {
    return {
      label: 'familiar_stranger',
      description: 'recognize each other but barely interact',
    }
  }
  return {
    label: 'stranger',
    description: 'practically strangers with no history',
  }
}

// ─── Prompt Builder ────────────────────────────────────────

function buildDialoguePrompt(context: DialogueV2Context): string {
  const tier = getRelationshipTier(
    context.relationshipLevel,
    context.romanceLevel
  )

  // Pick 3 most relevant memories
  const topMemories = selectTopMemories(context.memoryContext, 3)

  const memoryText =
    topMemories.length > 0
      ? topMemories
          .map(
            (m, i) =>
              `${i + 1}. [${m.type}] ${m.content} (importance: ${m.importance}/10)`
          )
          .join('\n  ')
      : 'No specific memories yet.'

  const emotionDescription = formatEmotionState(context.emotionState)

  return `
You are an NPC in a high school life simulation game. Respond IN CHARACTER.

# NPC Profile
- Name: ${context.npcName}
- Clique: ${context.npcClique}
- Personality: ${context.npcPersonality}
- Bio: ${context.npcBio}
- Current emotion: ${context.dominantEmotion} (${context.emotionState[context.dominantEmotion]}/100 intensity)
- Full emotional state: ${emotionDescription}

# Relationship Context
- Player: ${context.playerName} (${context.playerClique})
- Relationship: ${tier.description} (friendship ${context.relationshipLevel}/100, romance ${context.romanceLevel}/100)
- Tier: ${tier.label}

# Relevant Memories About Player
  ${memoryText}

# Current Context
- Time: ${context.currentPeriod}
- Location: ${context.currentLocation}
${context.playerDialogueInput ? `- Player just said: "${context.playerDialogueInput}"` : ''}

# Instructions
Write a SINGLE line of dialogue (max 25 words) as ${context.npcName}.
- Match the personality type perfectly
- Reflect the current dominant emotion
- Reference a memory if highly relevant (but do not force it)
- The relationship depth should be evident in the tone
- Do not break character or mention being an AI
- Keep it natural, high school authentic
- You may include a brief action in asterisks like *rolls eyes* before or after the line
`.trim()
}

function formatEmotionState(emotions: EmotionState): string {
  const entries = Object.entries(emotions)
    .sort(([, a], [, b]) => b - a)
    .map(([k, v]) => `${k}:${Math.round(v)}`)
    .join(', ')
  return entries
}

function selectTopMemories(
  memoryContext: MemoryContext,
  limit: number
): NPCMemory[] {
  const all = [
    ...memoryContext.relationshipMemories,
    ...memoryContext.significantMemories,
    ...memoryContext.recentMemories,
  ]

  // Deduplicate by id
  const seen = new Set<string>()
  const unique: NPCMemory[] = []
  for (const m of all) {
    if (!seen.has(m.id)) {
      seen.add(m.id)
      unique.push(m)
    }
  }

  // Sort by importance descending
  unique.sort((a, b) => b.importance - a.importance)

  return unique.slice(0, limit)
}

// ─── Main Export ───────────────────────────────────────────

export async function generateDialogueV2(
  context: DialogueV2Context,
  apiKey?: string
): Promise<{
  text: string
  meta: {
    dominantEmotion: EmotionType
    relationshipTier: string
    memoryCount: number
    usedMemoryIds: string[]
  }
}> {
  const tier = getRelationshipTier(
    context.relationshipLevel,
    context.romanceLevel
  )

  const topMemories = selectTopMemories(context.memoryContext, 3)

  // No API key → fallback responses
  if (!apiKey) {
    const fallback = pickFallbackResponse(context)
    return {
      text: fallback,
      meta: {
        dominantEmotion: context.dominantEmotion,
        relationshipTier: tier.label,
        memoryCount: topMemories.length,
        usedMemoryIds: [],
      },
    }
  }

  try {
    const client = new OpenAI({ apiKey })
    const prompt = buildDialoguePrompt(context)

    const response = await client.chat.completions.create({
      model: 'o4-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 80,
      temperature: 0.85,
    })

    const text =
      response.choices[0]?.message?.content?.trim() ??
      pickFallbackResponse(context)

    return {
      text,
      meta: {
        dominantEmotion: context.dominantEmotion,
        relationshipTier: tier.label,
        memoryCount: topMemories.length,
        usedMemoryIds: topMemories.map((m) => m.id),
      },
    }
  } catch {
    // On any error, return fallback
    const fallback = pickFallbackResponse(context)
    return {
      text: fallback,
      meta: {
        dominantEmotion: context.dominantEmotion,
        relationshipTier: tier.label,
        memoryCount: topMemories.length,
        usedMemoryIds: [],
      },
    }
  }
}

// ─── Fallback Responses ────────────────────────────────────

const FALLBACK_RESPONSES: Record<
  DialogueV2Context['npcPersonality'],
  Record<string, string[]>
> = {
  friendly: {
    stranger: [
      'Hey there! I do not think we have met. I am {{name}}!',
      'Oh, hey! New face? Welcome to the chaos.',
      'Hi! You look like you need a friend. I am {{name}}.',
      'Hey! I am {{name}}. Let me know if you need the cafeteria tour.',
    ],
    acquaintance: [
      'Hey {{player}}! How is it going?',
      'Oh hey, I was just thinking about you! How are classes?',
      '{{player}}! Come sit with us, we saved you a spot.',
      'Hey! I heard you did something cool recently. Spill the tea!',
    ],
    friend: [
      '{{player}}! My favorite person. What is up?',
      'Hey bestie! You are literally the only one I wanted to see today.',
      '*hugs* I am so glad you are here. I need to tell you something.',
      'You know what? You are the reason this school is bearable.',
    ],
    close_friend: [
      '{{player}}... I mean it when I say you are my person.',
      'I got you a snack because I saw it and thought of you.',
      'No one gets me like you do. Want to skip last period?',
      'I was just defending you to someone. You are my ride or die.',
    ],
    romantic_interest: [
      '{{player}}... hey. You look really good today.',
      '*blushes* I was hoping I would run into you.',
      'I made you a playlist. It is... it is probably stupid.',
      'Do you want to maybe get food after school? Just us?',
    ],
    romantic_partner: [
      'Hey you. *smiles* Every day with you is the best day.',
      'I wrote something about you. I am too embarrassed to show you though.',
      'You are my favorite notification.',
      'I would choose you in every timeline, every universe.',
    ],
    default: [
      'Hey {{player}}! Good to see you!',
      'What is up? Things are pretty good on my end.',
      'Oh hey! I was just telling someone about you.',
    ],
  },
  tsundere: {
    stranger: [
      'Hmph. Who are you supposed to be?',
      'Do not get the wrong idea. I am not interested in you.',
      'Whatever. I am {{name}}. Not that you care.',
      'Are you lost? Because I definitely do not have time to help you.',
    ],
    acquaintance: [
      'Oh. It is you. ...What? I am just stating a fact.',
      'Do not think this means anything, but... you are not the worst.',
      '*looks away* I was NOT waiting for you. Obviously.',
      'Hmph. You are late. Not that I was counting or anything.',
    ],
    friend: [
      'Idiot! You made me worry when you did not show up!',
      'I... I made extra food. Do not get weird about it.',
      '*blushes and turns away* You are staring. Stop it.',
      'I guess you are tolerable. Today.',
    ],
    close_friend: [
      'You are such a dummy... but you are MY dummy.',
      'I will deny this if you tell anyone, but... you matter to me. A lot.',
      '*punches your arm lightly* Do not ever change, okay?',
      'I hate how much I care about you. It is annoying.',
    ],
    romantic_interest: [
      'I-it is not like I dressed up for you or anything!',
      '*fidgets* Why are you so close? ...Not that I mind.',
      'You are unusually warm today. ...Idiot.',
      'If you tell anyone I am blushing, I will end you.',
    ],
    romantic_partner: [
      'I love you, okay? There. I said it. Do not make it weird.',
      'You are the only one who can make me this... this soft.',
      'I will always be by your side. Not that I have a choice or anything.',
      '*rests head on your shoulder* ...Shut up. I am comfortable.',
    ],
    default: [
      'Tch. What do you want?',
      'Do not get the wrong idea.',
      'Hmph. Fine. I will talk to you.',
    ],
  },
  mysterious: {
    stranger: [
      '...You have interesting eyes. They tell a story.',
      'We have not met. But I have seen you before.',
      '*studies you silently* ...{{name}}.',
      'The universe brings people together for reasons. Why do you think we met?',
    ],
    acquaintance: [
      'There is something different about you today.',
      'I was reading about quantum entanglement. It made me think of... never mind.',
      '*smiles faintly* You are one of the few who notices the small things.',
      'The cards suggested I would see you today.',
    ],
    friend: [
      'I do not open up to many people. But you... you are an exception.',
      'I wrote something. It is about shadows and light. Want to hear it?',
      'You make the silence feel comfortable. That is rare.',
      'I had a dream about you last night. It felt... significant.',
    ],
    close_friend: [
      'You are the only one who knows where I go when I disappear.',
      'I keep secrets for a living. But from you, I want to share them.',
      'There is a place I go to think. I want to show it to you.',
      'You see through my masks. That terrifies and comforts me.',
    ],
    romantic_interest: [
      '...I have been thinking about you more than I should.',
      'The space between us feels charged. Do you feel it too?',
      'I do not believe in fate. But then there is you.',
      '*touches your hand briefly* ...That meant something.',
    ],
    romantic_partner: [
      'In a world of noise, you are my silence.',
      'I would unravel every mystery in the universe... except the one of loving you.',
      'You are my favorite secret and my loudest truth.',
      'I do not need to read the stars anymore. I have you.',
    ],
    default: [
      '...Interesting.',
      'There is more to you than meets the eye.',
      'We should talk. Somewhere quiet.',
    ],
  },
  hyper: {
    stranger: [
      'OH MY GOD HI I AM {{name}} WHAT IS YOUR NAME?!',
      'NEW PERSON ALERT! Hey! Hey! I am {{name}}!',
      'AHHH I HAVE NEVER SEEN YOU BEFORE! LET US BE FRIENDS!',
      '*bounces excitedly* Hi hi hi! I am {{name}}! What is your deal?!',
    ],
    acquaintance: [
      '{{PLAYER}}! {{PLAYER}}! GUESS WHAT GUESS WHAT!',
      'I SAW A DOG TODAY AND IT MADE ME THINK OF YOU!',
      'AHHH THERE YOU ARE! I HAVE SO MUCH TO TELL YOU!',
      'OKAY OKAY SO LISTEN TO THIS WILD THING THAT HAPPENED!',
    ],
    friend: [
      'BEST FRIEND ALERT! {{player}} IS HERE EVERYONE!',
      'I GOT US MATCHING STICKERS! WE ARE OFFICIALLY BESTIES!',
      'I COULD NOT STOP TALKING ABOUT YOU YESTERDAY! IS THAT WEIRD?',
      'YOU ARE MY FAVORITE HUMAN! YES I RANKED THEM! YOU WON!',
    ],
    close_friend: [
      'YOU! ME! ADVENTURE! RIGHT NOW! I HAVE A PLAN!',
      'I MADE A FRIENDSHIP BRACELET! IT HAS YOUR INITIALS AND GLITTER!',
      'NO ONE MAKES ME LAUGH LIKE YOU! I AM LITERALLY CRYING!',
      'WE ARE GOING TO TAKE OVER THE WORLD! BUT FIRST, SNACKS!',
    ],
    romantic_interest: [
      'MY HEART IS DOING THE THING AGAIN! YOU KNOW THE THING!',
      'I WROTE YOUR NAME IN MY NOTEBOOK! ...THAT IS NORMAL, RIGHT?!',
      'YOU ARE SO PRETTY TODAY! I MEAN! ALWAYS! EVERY DAY!',
      '*spontaneously hugs you* SORRY! I COULD NOT HELP IT!',
    ],
    romantic_partner: [
      'MY PERSON! MY LOVE! MY FAVORITE EVERYTHING!',
      'I LOVE YOU I LOVE YOU I LOVE YOU! OKAY BYE! *runs away*',
      'EVERY SONG IS ABOUT YOU NOW! EVERY SINGLE ONE!',
      'WE ARE THE CUTEST COUPLE IN EXISTENCE! I WILL FIGHT ANYONE WHO DISAGREES!',
    ],
    default: [
      'OH HI! I AM SO EXCITED TO SEE YOU!',
      'GUESS WHAT?! I HAVE NEWS!',
      'YOU ARE HERE! TODAY JUST GOT 1000X BETTER!',
    ],
  },
  chill: {
    stranger: [
      'Hey. I am {{name}}. Nice to meet you.',
      'Oh, hey. Did not see you there. I am {{name}}.',
      'Sup. Welcome to the school. It is pretty chill here.',
      '*nods* Hey. I am {{name}}. You seem cool.',
    ],
    acquaintance: [
      'Hey {{player}}. How is life treating you?',
      '*peace sign* Sup. Good day so far?',
      'Yo. I was just vibing and thought of you.',
      'Hey. Want to grab a smoothie later? No pressure.',
    ],
    friend: [
      'Hey, my friend. Come vibe with me.',
      'You are easy to be around. That is a compliment.',
      '*passes you headphones* This track reminded me of you.',
      'Life is better with people like you in it. Simple as that.',
    ],
    close_friend: [
      'You get me. No pretenses, no drama. Just... real.',
      'I do not say it enough, but you are my anchor.',
      'Want to just sit on the roof and watch the sunset?',
      'Being around you is like hitting the reset button. Thanks.',
    ],
    romantic_interest: [
      '...You look really peaceful today. I like it.',
      '*soft smile* I think about you when I listen to slow songs.',
      'You make my heart do that calm flutter thing.',
      'I do not rush things. But with you... I am not scared to try.',
    ],
    romantic_partner: [
      'Hey, love. Every day with you feels like Sunday morning.',
      'You are my calm in the chaos. Always.',
      'I do not need much. Just you, a blanket, and the stars.',
      'Loving you is the easiest thing I have ever done.',
    ],
    default: [
      'Hey. All good?',
      'Cool seeing you here.',
      'Sup. Hope you are vibing today.',
    ],
  },
  dramatic: {
    stranger: [
      'Oh. A new character enters the stage. I am {{name}}.',
      'Who is THIS? The plot thickens!',
      'Darling, we simply MUST know each other. I am {{name}}.',
      'Fate has brought us together. I can feel it in my soul.',
    ],
    acquaintance: [
      '{{player}}! The drama never stops when you are around!',
      'You! I have been WAITING for someone interesting to talk to!',
      'Oh, the TEA I have for you. Sit down. This is WILD.',
      'My life is a soap opera and you are my favorite guest star.',
    ],
    friend: [
      'You are the only one who understands my DRAMA!',
      'I was LITERALLY just telling everyone about our friendship!',
      'OUR BOND IS WRITTEN IN THE STARS! I checked!',
      'I would write a tragic romance about us. It would win awards!',
    ],
    close_friend: [
      'If you EVER left my life, I would write the SADDEST poem!',
      'You are my soulmate friend! My platonic life partner!',
      'I CRIED thinking about how much you mean to me!',
      'OUR FRIENDSHIP IS THE GREATEST LOVE STORY NEVER TOLD!',
    ],
    romantic_interest: [
      'My heart! It BEATS for you! Can you not hear it?!',
      'Every love song ever written? About YOU!',
      'I am DROWNING in feelings and I do not want to be saved!',
      'Kiss me or kill me! There is no in-between!',
    ],
    romantic_partner: [
      'You! You are my EVERYTHING! My BEGINNING and END!',
      'I would cross oceans! Fight dragons! All for your smile!',
      'Our love story puts Shakespeare to SHAME!',
      'I love you so much it physically HURTS! Is this normal?!',
    ],
    default: [
      'OH the DRAMA!',
      'My heart cannot take this!',
      'You are the main character, obviously!',
    ],
  },
  ambitious: {
    stranger: [
      '{{name}}. You should remember that name. I am going places.',
      'Oh, a new face. I am {{name}}. What do you do?',
      'Hi. I am {{name}}. Let us connect — networking is everything.',
      'I do not waste time. But for you, I will make an exception.',
    ],
    acquaintance: [
      '{{player}}. I have been observing your progress. Impressive.',
      'We should collaborate. I see potential in you.',
      'Time is money, but talking to you? Worth the investment.',
      'I like your energy. Let us build something together.',
    ],
    friend: [
      'You are one of the few people who match my drive.',
      'I need your input on something big I am planning.',
      'Success is better with friends like you beside me.',
      'I nominated you for the honors committee. You are welcome.',
    ],
    close_friend: [
      'We are going to run this school. Then the world.',
      'I trust your judgment more than my own sometimes.',
      'When I make it big, you are coming with me. Promise.',
      'You are my secret weapon. Do not tell anyone.',
    ],
    romantic_interest: [
      'You distract me. And I do not let anything distract me.',
      'I have calculated every variable. Except how you make me feel.',
      'You are the only thing I want that I cannot strategize for.',
      '...Want to grab coffee and discuss our five-year plan?',
    ],
    romantic_partner: [
      'You are my greatest achievement. And I aim for excellence.',
      'Together? We are unstoppable. Power couple status confirmed.',
      'I had goals before you. Now you are the goal.',
      'Every success I have, I want to share with you.',
    ],
    default: [
      'I have been strategizing. You?',
      'We should discuss your goals.',
      'Time to level up. You in?',
    ],
  },
  loyal: {
    stranger: [
      'I am {{name}}. If you are good people, we will get along.',
      'Hey. I am {{name}}. I do not forget faces. Or favors.',
      'Hi. I watch out for my own. Are you one of my own?',
      '{{name}}. If you ever need someone who has your back... that is me.',
    ],
    acquaintance: [
      '{{player}}. I heard someone talking about you. Good things.',
      'I noticed you were not at lunch yesterday. Everything okay?',
      'Hey. I saved you a seat. No reason. Just... habit.',
      'You seem solid. I appreciate solid people.',
    ],
    friend: [
      'I would fight anyone for you. Just say the word.',
      'You are my people. That means something to me.',
      'I made you something. It is not much. But I thought of you.',
      'No matter what happens, I am on your side. Always.',
    ],
    close_friend: [
      'You are family to me. Blood could not make us closer.',
      'I would take a bullet for you. No hesitation.',
      'When you hurt, I hurt. That is how this works.',
      'You are stuck with me. Forever. I do not do temporary.',
    ],
    romantic_interest: [
      '...I get nervous around you. And I do not get nervous.',
      'You make me want to be even better than I am.',
      'I do not trust easy. But I trust you. With everything.',
      'You are my safe place. In a world that is not.',
    ],
    romantic_partner: [
      'I am yours. Completely. That is not something I say lightly.',
      'Every day I choose you. And I will keep choosing you.',
      'You are my home. Wherever you are.',
      'I do not have much. But what I have is yours. Always.',
    ],
    default: [
      'Hey. I have got your back.',
      'I was thinking about you. Wanted to check in.',
      'You are one of the good ones.',
    ],
  },
}

function pickFallbackResponse(context: DialogueV2Context): string {
  const tier = getRelationshipTier(
    context.relationshipLevel,
    context.romanceLevel
  )
  const responses = FALLBACK_RESPONSES[context.npcPersonality]

  if (!responses) {
    return `Hey ${context.playerName}, what is up?`
  }

  // Pick the right tier, fallback to default
  let pool = responses[tier.label] ?? responses['default'] ?? ['Hey!']

  // Pick random response
  const raw = pool[Math.floor(Math.random() * pool.length)]!

  // Substitute variables
  return raw
    .replace(/\{\{name\}\}/g, context.npcName)
    .replace(/\{\{player\}\}/g, context.playerName)
    .replace(/\{\{PLAYER\}\}/g, context.playerName.toUpperCase())
    .replace(/\{\{Player\}\}/g, context.playerName)
}
