import type {
  GroupScene,
  GroupSceneChoice,
  NPC,
  GameProgress,
} from '@repo/types'

// ─── Predefined Group Scenes ───────────────────────────────

export const GROUP_SCENES: GroupScene[] = [
  // ── Scene 1: Cafeteria Love Triangle ────────────────────
  {
    id: 'gs1-cafeteria-drama',
    title: 'Cafeteria Confrontation',
    description:
      'Tension boils over in the lunchroom when two NPCs realize they have feelings for the same person.',
    involvedNpcIds: ['2', '7', '1'], // Britney, Amber, Chad
    requiredRelationships: {
      '2': { minFriendship: 25 },
      '7': { minFriendship: 15 },
    },
    dialogueSequence: [
      {
        speakerId: '2',
        text: 'So I heard you were telling everyone Chad asked you to prom, Amber. Cute.',
        emotion: 'anger',
        delay: 2000,
      },
      {
        speakerId: '7',
        text: 'He DID ask me! Maybe if you were not so busy bossing everyone around, he would have asked you too.',
        emotion: 'anger',
        delay: 2000,
      },
      {
        speakerId: '1',
        text: 'Uh... hey... I am literally sitting right here...',
        emotion: 'surprise',
        delay: 1500,
      },
      {
        speakerId: '2',
        text: 'This has nothing to do with Chad. This is about you copying everything I do.',
        emotion: 'anger',
        delay: 2000,
      },
      {
        speakerId: 'player',
        text: '(The entire cafeteria is watching. What do you do?)',
        delay: 1000,
      },
    ],
    playerChoices: [
      {
        id: 'gs1-calm',
        text: 'Defuse the situation with humor',
        effects: {
          npcEmotions: {
            '2': { joy: 15, anger: -20 },
            '7': { joy: 10, anger: -15 },
            '1': { joy: 10 },
          },
          npcRelationships: {
            '2': { friendship: 10 },
            '7': { friendship: 8 },
          },
          playerStats: { popularity: 10, creativity: 5 },
        },
      },
      {
        id: 'gs1-take-sides',
        text: 'Side with Britney — Amber is out of line',
        effects: {
          npcEmotions: {
            '2': { joy: 20, trust: 10 },
            '7': { anger: 25, sadness: 15 },
          },
          npcRelationships: {
            '2': { friendship: 15 },
            '7': { friendship: -15 },
          },
          playerStats: { popularity: -5 },
        },
      },
      {
        id: 'gs1-distract',
        text: 'Knock over a tray to create a diversion',
        effects: {
          npcEmotions: {
            '2': { surprise: 20, anger: -10 },
            '7': { surprise: 20, anger: -10 },
            '1': { surprise: 15, joy: 10 },
          },
          npcRelationships: {
            '2': { friendship: 5 },
            '7': { friendship: 5 },
          },
          playerStats: { rebellion: 10, popularity: 5 },
        },
      },
      {
        id: 'gs1-ignore',
        text: 'Stay out of it and watch',
        effects: {
          npcEmotions: {
            '2': { anger: 10 },
            '7': { anger: 10 },
          },
          playerStats: { rebellion: 5 },
        },
      },
    ],
    unlockConditions: {
      semester: 1,
      minStats: { popularity: 20 },
      npcIdsUnlocked: ['2', '7'],
    },
  },

  // ── Scene 2: Study Group ────────────────────────────────
  {
    id: 'gs2-study-group',
    title: 'The Study Circle',
    description:
      'An impromptu study group forms in the library. Bonds are forged over textbooks and coffee.',
    involvedNpcIds: ['3', '8', '12'], // Dexter, Leo, Maya
    requiredRelationships: {
      '3': { minFriendship: 20 },
    },
    dialogueSequence: [
      {
        speakerId: '3',
        text: 'Okay, so if we apply the quadratic formula here — Maya, are you even listening?',
        emotion: 'anticipation',
        delay: 2000,
      },
      {
        speakerId: '12',
        text: 'Sorry! I was just... this melody came to me and I had to write it down.',
        emotion: 'joy',
        delay: 2000,
      },
      {
        speakerId: '8',
        text: 'A melody? We are studying for the physics final, not composing an opera.',
        emotion: 'anger',
        delay: 1500,
      },
      {
        speakerId: '12',
        text: 'Actually, music IS physics. Vibrations, frequencies, wave patterns...',
        emotion: 'anticipation',
        delay: 2000,
      },
      {
        speakerId: '3',
        text: 'She has a point. Also, I wrote an algorithm that converts equations to sheet music. Want to see?',
        emotion: 'joy',
        delay: 2000,
      },
      {
        speakerId: '8',
        text: 'I hate that I am actually interested in this.',
        emotion: 'surprise',
        delay: 1500,
      },
      {
        speakerId: 'player',
        text: '(The nerds are bonding. How do you contribute?)',
        delay: 1000,
      },
    ],
    playerChoices: [
      {
        id: 'gs2-math-help',
        text: 'Help Leo with the difficult problems',
        effects: {
          npcEmotions: {
            '8': { joy: 15, trust: 10 },
            '3': { trust: 10 },
          },
          npcRelationships: {
            '8': { friendship: 12 },
          },
          playerStats: { academics: 15 },
        },
      },
      {
        id: 'gs2-music',
        text: 'Collaborate with Maya on the melody',
        effects: {
          npcEmotions: {
            '12': { joy: 20 },
            '3': { joy: 10 },
          },
          npcRelationships: {
            '12': { friendship: 15 },
          },
          playerStats: { creativity: 15, academics: 5 },
        },
      },
      {
        id: 'gs2-tech',
        text: 'Test Dexter\'s algorithm',
        effects: {
          npcEmotions: {
            '3': { joy: 25, trust: 15 },
            '8': { surprise: 10 },
          },
          npcRelationships: {
            '3': { friendship: 15 },
          },
          playerStats: { academics: 10, creativity: 10 },
        },
      },
      {
        id: 'gs2-snack',
        text: 'Bring everyone coffee and snacks',
        effects: {
          npcEmotions: {
            '3': { joy: 10 },
            '8': { joy: 10 },
            '12': { joy: 10 },
          },
          npcRelationships: {
            '3': { friendship: 8 },
            '8': { friendship: 8 },
            '12': { friendship: 8 },
          },
          playerStats: { happiness: 10, popularity: 5 },
        },
      },
    ],
    unlockConditions: {
      semester: 1,
      minStats: { academics: 30 },
      npcIdsUnlocked: ['3'],
    },
  },

  // ── Scene 3: Locker Room Drama ──────────────────────────
  {
    id: 'gs3-locker-room',
    title: 'Locker Room Showdown',
    description:
      'The jocks have a tense confrontation about team captaincy and loyalty.',
    involvedNpcIds: ['1', '6', '13'], // Chad, Marcus, Jordan
    requiredRelationships: {
      '1': { minFriendship: 20 },
      '6': { minFriendship: 10 },
    },
    dialogueSequence: [
      {
        speakerId: '6',
        text: 'I have been carrying this team all season while you were writing poems, Chad.',
        emotion: 'anger',
        delay: 2000,
      },
      {
        speakerId: '1',
        text: 'Poems? Who told you — that is not — look, I am still the captain for a reason.',
        emotion: 'anger',
        delay: 2000,
      },
      {
        speakerId: '13',
        text: 'Guys. We have a championship game tomorrow. Can this wait?',
        emotion: 'sadness',
        delay: 1500,
      },
      {
        speakerId: '6',
        text: 'Jordan stays out of this. This is between me and the quarterback.',
        emotion: 'anger',
        delay: 1500,
      },
      {
        speakerId: '1',
        text: 'You want to be captain so bad? Beat me in a one-on-one. Right now.',
        emotion: 'anticipation',
        delay: 2000,
      },
      {
        speakerId: 'player',
        text: '(The locker room is about to explode. What do you do?)',
        delay: 1000,
      },
    ],
    playerChoices: [
      {
        id: 'gs3-mediate',
        text: 'Remind them the team needs unity',
        effects: {
          npcEmotions: {
            '1': { trust: 15, anger: -15 },
            '6': { trust: 10, anger: -10 },
            '13': { joy: 15 },
          },
          npcRelationships: {
            '1': { friendship: 10 },
            '6': { friendship: 8 },
            '13': { friendship: 12 },
          },
          playerStats: { athletics: 5, popularity: 10 },
        },
      },
      {
        id: 'gs3-challenge',
        text: 'Challenge both of them to a skills contest',
        effects: {
          npcEmotions: {
            '1': { anticipation: 20, anger: -5 },
            '6': { anticipation: 20, anger: -5 },
            '13': { surprise: 10 },
          },
          npcRelationships: {
            '1': { friendship: 10 },
            '6': { friendship: 5 },
          },
          playerStats: { athletics: 15, popularity: 10 },
        },
      },
      {
        id: 'gs3-support-chad',
        text: 'Back Chad up — he is the captain',
        effects: {
          npcEmotions: {
            '1': { joy: 20, trust: 20 },
            '6': { anger: 25, sadness: 10 },
            '13': { fear: 5 },
          },
          npcRelationships: {
            '1': { friendship: 15 },
            '6': { friendship: -10 },
          },
          playerStats: { popularity: 5 },
        },
      },
      {
        id: 'gs3-betray',
        text: 'Secretly agree with Marcus that Chad has lost focus',
        effects: {
          npcEmotions: {
            '1': { anger: 20, sadness: 15 },
            '6': { joy: 15, trust: 15 },
          },
          npcRelationships: {
            '1': { friendship: -15 },
            '6': { friendship: 20 },
          },
          playerStats: { rebellion: 10 },
        },
      },
    ],
    unlockConditions: {
      semester: 1,
      minStats: { athletics: 30 },
      npcIdsUnlocked: ['1', '6'],
    },
  },

  // ── Scene 4: Art Show ───────────────────────────────────
  {
    id: 'gs4-art-show',
    title: 'Gallery Night',
    description:
      'The artsy clique hosts an underground exhibition. Creativity collides with controversy.',
    involvedNpcIds: ['5', '10', '4'], // Skyler, Priya, Raven
    requiredRelationships: {
      '5': { minFriendship: 20 },
    },
    dialogueSequence: [
      {
        speakerId: '5',
        text: 'Welcome to our gallery! Every piece here is a piece of our soul.',
        emotion: 'joy',
        delay: 2000,
      },
      {
        speakerId: '10',
        text: 'I set up a photo series in the back — portraits of strangers, captured without them knowing.',
        emotion: 'anticipation',
        delay: 2000,
      },
      {
        speakerId: '4',
        text: 'Art should disturb the comfortable. My installation is... an experience.',
        emotion: 'anticipation',
        delay: 2000,
      },
      {
        speakerId: '5',
        text: 'Raven, you did NOT bring actual grave dirt into the gallery.',
        emotion: 'surprise',
        delay: 1500,
      },
      {
        speakerId: '4',
        text: 'Death is part of life. This piece is about embracing the inevitable.',
        emotion: 'trust',
        delay: 2000,
      },
      {
        speakerId: '10',
        text: 'People are starting to arrive. Quick, player — what do you think of my portraits?',
        emotion: 'anticipation',
        delay: 1500,
      },
    ],
    playerChoices: [
      {
        id: 'gs4-praise',
        text: 'Praise the boldness of the exhibition',
        effects: {
          npcEmotions: {
            '5': { joy: 20 },
            '10': { joy: 15, trust: 10 },
            '4': { joy: 15 },
          },
          npcRelationships: {
            '5': { friendship: 12 },
            '10': { friendship: 10 },
            '4': { friendship: 10 },
          },
          playerStats: { creativity: 15, popularity: 5 },
        },
      },
      {
        id: 'gs4-critique',
        text: 'Offer thoughtful artistic critique',
        effects: {
          npcEmotions: {
            '5': { surprise: 10, trust: 10 },
            '10': { surprise: 10 },
            '4': { trust: 15 },
          },
          npcRelationships: {
            '5': { friendship: 8 },
            '4': { friendship: 15 },
          },
          playerStats: { creativity: 20, academics: 5 },
        },
      },
      {
        id: 'gs4-create',
        text: 'Create an impromptu piece to add to the show',
        effects: {
          npcEmotions: {
            '5': { joy: 25, surprise: 15 },
            '10': { joy: 15 },
            '4': { surprise: 10, joy: 10 },
          },
          npcRelationships: {
            '5': { friendship: 20, romance: 5 },
            '10': { friendship: 10 },
            '4': { friendship: 10 },
          },
          playerStats: { creativity: 25, popularity: 10 },
        },
      },
      {
        id: 'gs4-question',
        text: 'Question the ethics of Priya\'s secret photos',
        effects: {
          npcEmotions: {
            '10': { anger: 20, surprise: 15 },
            '5': { surprise: 10 },
            '4': { joy: 10 },
          },
          npcRelationships: {
            '10': { friendship: -10 },
            '4': { friendship: 15 },
          },
          playerStats: { rebellion: 10, popularity: -5 },
        },
      },
    ],
    unlockConditions: {
      semester: 2,
      minStats: { creativity: 35 },
      npcIdsUnlocked: ['5'],
    },
  },

  // ── Scene 5: Prom Court Drama ───────────────────────────
  {
    id: 'gs5-prom-court',
    title: 'Royal Court',
    description:
      'Prom nominations are announced. The popular clique scrambles for votes and alliances.',
    involvedNpcIds: ['2', '14', '11'], // Britney, Sasha, Tyler
    requiredRelationships: {
      '2': { minFriendship: 30 },
      '14': { minFriendship: 20 },
    },
    dialogueSequence: [
      {
        speakerId: '2',
        text: 'The prom court nominations are out. And surprise, surprise — I am nominated for queen.',
        emotion: 'joy',
        delay: 2000,
      },
      {
        speakerId: '14',
        text: 'Along with me. Let us not forget that part, Britney.',
        emotion: 'anger',
        delay: 1500,
      },
      {
        speakerId: '11',
        text: 'Ladies, I would like to point out that I am running for king and would prefer my queen not be a human tornado.',
        emotion: 'anticipation',
        delay: 2000,
      },
      {
        speakerId: '2',
        text: 'Tyler, you are only running because your mom made campaign posters for you.',
        emotion: 'disgust',
        delay: 1500,
      },
      {
        speakerId: '14',
        text: 'This is perfect. Two queens, one crown. The drama writes itself. My followers are going to EAT this up.',
        emotion: 'joy',
        delay: 2000,
      },
      {
        speakerId: '2',
        text: 'Player, you have influence around here. Who are you voting for?',
        emotion: 'anticipation',
        delay: 1500,
      },
    ],
    playerChoices: [
      {
        id: 'gs5-britney',
        text: 'Campaign for Britney — she has earned it',
        effects: {
          npcEmotions: {
            '2': { joy: 25, trust: 15 },
            '14': { anger: 20, sadness: 10 },
            '11': { surprise: 10 },
          },
          npcRelationships: {
            '2': { friendship: 20, romance: 5 },
            '14': { friendship: -15 },
          },
          playerStats: { popularity: 15 },
        },
      },
      {
        id: 'gs5-sasha',
        text: 'Back Sasha — she knows how to work a crowd',
        effects: {
          npcEmotions: {
            '14': { joy: 20 },
            '2': { anger: 20, sadness: 10 },
            '11': { surprise: 10 },
          },
          npcRelationships: {
            '14': { friendship: 20 },
            '2': { friendship: -15 },
          },
          playerStats: { popularity: 15 },
        },
      },
      {
        id: 'gs5-tyler',
        text: 'Support Tyler and suggest he pick his own queen',
        effects: {
          npcEmotions: {
            '11': { joy: 20, trust: 10 },
            '2': { anger: 15 },
            '14': { anger: 15 },
          },
          npcRelationships: {
            '11': { friendship: 20 },
            '2': { friendship: -5 },
            '14': { friendship: -5 },
          },
          playerStats: { popularity: 10, rebellion: 5 },
        },
      },
      {
        id: 'gs5-sabotage',
        text: 'Sabotage the whole thing — prom court is a stupid tradition',
        effects: {
          npcEmotions: {
            '2': { anger: 15, surprise: 10 },
            '14': { anger: 15, surprise: 10 },
            '11': { surprise: 20, joy: 10 },
          },
          npcRelationships: {
            '2': { friendship: -10 },
            '14': { friendship: -10 },
            '11': { friendship: 15 },
          },
          playerStats: { rebellion: 20, popularity: -10 },
        },
      },
    ],
    unlockConditions: {
      semester: 2,
      minStats: { popularity: 40 },
      npcIdsUnlocked: ['2', '14'],
    },
  },
]

// ─── Scene Logic ───────────────────────────────────────────

export function canTriggerGroupScene(
  scene: GroupScene,
  npcs: NPC[],
  progress: GameProgress
): boolean {
  // Check unlock conditions
  if (scene.unlockConditions) {
    if (
      scene.unlockConditions.semester &&
      progress.semester < scene.unlockConditions.semester
    ) {
      return false
    }

    if (scene.unlockConditions.minStats) {
      // Player stats check — we need the player from the store
      // This is checked at call site with player stats
    }

    if (scene.unlockConditions.npcIdsUnlocked) {
      const unlocked = npcs
        .filter((n) => n.unlocked)
        .map((n) => n.id)
      const allUnlocked = scene.unlockConditions.npcIdsUnlocked.every((id) =>
        unlocked.includes(id)
      )
      if (!allUnlocked) return false
    }
  }

  // Check required relationships
  if (scene.requiredRelationships) {
    for (const [npcId, req] of Object.entries(scene.requiredRelationships)) {
      const npc = npcs.find((n) => n.id === npcId)
      if (!npc || !npc.unlocked) return false
      if (req.minFriendship && npc.relationship < req.minFriendship)
        return false
      if (req.minRomance && npc.romance < req.minRomance) return false
    }
  }

  return true
}

export function getAvailableGroupScenes(
  npcs: NPC[],
  progress: GameProgress,
  playerStats?: Record<string, number>
): GroupScene[] {
  return GROUP_SCENES.filter((scene) => {
    const baseCheck = canTriggerGroupScene(scene, npcs, progress)
    if (!baseCheck) return false

    // Additional player stats check
    if (scene.unlockConditions?.minStats && playerStats) {
      for (const [stat, minVal] of Object.entries(
        scene.unlockConditions.minStats
      )) {
        if (minVal !== undefined && (playerStats[stat] ?? 0) < minVal) return false
      }
    }

    return true
  })
}

export function processGroupSceneChoice(
  scene: GroupScene,
  choiceId: string,
  npcs: NPC[]
): {
  updatedNpcs: NPC[]
  rewards: { stats?: Record<string, number>; description: string }
} {
  const choice = scene.playerChoices?.find((c) => c.id === choiceId)
  if (!choice) {
    return {
      updatedNpcs: npcs,
      rewards: { description: 'No valid choice was made.' },
    }
  }

  const updatedNpcs = npcs.map((npc) => {
    // Apply emotion changes
    if (choice.effects.npcEmotions?.[npc.id]) {
      const emotionChanges = choice.effects.npcEmotions[npc.id]!
      npc = {
        ...npc,
        // We can't directly set emotions on NPC type, but we track relationship changes
      }
    }

    // Apply relationship changes
    if (choice.effects.npcRelationships?.[npc.id]) {
      const relChanges = choice.effects.npcRelationships[npc.id]!
      const newRelationship = Math.max(
        0,
        Math.min(100, npc.relationship + (relChanges.friendship ?? 0))
      )
      const newRomance = Math.max(
        0,
        Math.min(100, npc.romance + (relChanges.romance ?? 0))
      )
      npc = {
        ...npc,
        relationship: newRelationship,
        romance: newRomance,
      }
    }

    return npc
  })

  const description = buildRewardDescription(choice.effects)

  return {
    updatedNpcs,
    rewards: {
      stats: choice.effects.playerStats as Record<string, number> | undefined,
      description,
    },
  }
}

// ─── Helpers ───────────────────────────────────────────────

function buildRewardDescription(
  effects: GroupSceneChoice['effects']
): string {
  const parts: string[] = []

  if (effects.playerStats) {
    const statEntries = Object.entries(effects.playerStats)
      .filter(([, v]) => typeof v === 'number' && v !== 0)
      .map(([k, v]) => `${k} ${(v as number) > 0 ? '+' : ''}${v}`)
    if (statEntries.length > 0) {
      parts.push(`Stats: ${statEntries.join(', ')}`)
    }
  }

  if (effects.npcRelationships) {
    const relEntries = Object.entries(effects.npcRelationships)
      .filter(([, v]) => v && (v.friendship || v.romance))
      .map(([k, v]) => {
        const bits: string[] = []
        const rel = v as { friendship?: number; romance?: number }
        if (rel.friendship) bits.push(`friendship ${rel.friendship > 0 ? '+' : ''}${rel.friendship}`)
        if (rel.romance) bits.push(`romance ${rel.romance > 0 ? '+' : ''}${rel.romance}`)
        return `${k}: ${bits.join(', ')}`
      })
    if (relEntries.length > 0) {
      parts.push(`Relationships: ${relEntries.join('; ')}`)
    }
  }

  return parts.length > 0 ? parts.join('. ') : 'The scene concluded.'
}
