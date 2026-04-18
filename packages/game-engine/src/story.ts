import type { StoryChapter, StoryProgress } from '@repo/types';

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 'ch1-freshman-first-day',
    title: 'The First Day',
    description: 'New school, new rules. Will you make friends or enemies on your very first day?',
    semester: 1,
    episode: 1,
    lockType: 'free',
    thumbnail: '🎒',
    scenes: [
      {
        id: 's1',
        text: 'The morning sun hits the towering gates of Westfield High. Your heart pounds as you clutch your schedule. A crowd of students rushes past you. You spot Chad, the star quarterback, holding court near the lockers.',
        choices: [
          { id: 'c1', text: 'Walk up and introduce yourself to Chad', effects: { stats: { athletics: 5, popularity: 3 }, npcRelationships: { '1': { friendship: 10 } } }, nextSceneId: 's2' },
          { id: 'c2', text: 'Head straight to the library instead', effects: { stats: { academics: 5, creativity: 3 } }, nextSceneId: 's3' },
          { id: 'c3', text: 'Find a quiet corner and observe everyone', effects: { stats: { rebellion: 5, happiness: -2 } }, nextSceneId: 's4' },
        ],
      },
      {
        id: 's2',
        text: 'Chad grins and high-fives you. "Fresh meat! I like your confidence. You should come to football tryouts after school." He punches your shoulder playfully.',
        choices: [
          { id: 'c4', text: 'Agree enthusiastically — you are born for this', effects: { stats: { athletics: 10, popularity: 5, energy: -10 } }, nextSceneId: 's5' },
          { id: 'c5', text: 'Say you will think about it', effects: { stats: { popularity: 2 } }, nextSceneId: 's5' },
        ],
      },
      {
        id: 's3',
        text: 'The library is serene. Dexter looks up from his laptop and pushes his glasses up. "Oh, a new face. You look like someone who appreciates quiet. Want to join the robotics club?"',
        choices: [
          { id: 'c6', text: 'Join the robotics club immediately', effects: { stats: { academics: 10, creativity: 5, energy: -10 }, npcRelationships: { '3': { friendship: 15 } } }, nextSceneId: 's5' },
          { id: 'c7', text: 'Politely decline but ask for book recommendations', effects: { stats: { academics: 5 } }, nextSceneId: 's5' },
        ],
      },
      {
        id: 's4',
        text: 'From the shadows of the stairwell, you watch the chaos unfold. Raven notices you before anyone else. She leans against the wall beside you. "Not a people person, huh? Neither am I."',
        choices: [
          { id: 'c8', text: 'Admit you prefer observing to participating', effects: { stats: { rebellion: 10, creativity: 3 }, npcRelationships: { '4': { friendship: 12 } } }, nextSceneId: 's5' },
          { id: 'c9', text: 'Brush her off and walk away', effects: { stats: { popularity: -3, rebellion: 5 } }, nextSceneId: 's5' },
        ],
      },
      {
        id: 's5',
        text: 'The bell rings. Your first day is over, but this is just the beginning. Whatever path you chose today, one thing is clear — high school is going to change everything.',
        choices: [
          { id: 'c10', text: 'Head home and reflect on your choices', effects: { stats: { happiness: 5, energy: -5 } } },
        ],
      },
    ],
  },
  {
    id: 'ch2-lunch-drama',
    title: 'Lunchroom Drama',
    description: 'The cafeteria is a battlefield. Where you sit defines who you are.',
    semester: 1,
    episode: 2,
    lockType: 'progress',
    requiredSemester: 1,
    thumbnail: '🍕',
    scenes: [
      {
        id: 's1',
        text: 'The cafeteria buzzes with energy. Britney waves from the popular table, Dexter saves you a seat with the nerds, and Chad is throwing fries across the room.',
        choices: [
          { id: 'c1', text: 'Sit with Britney and the popular crowd', effects: { stats: { popularity: 15, happiness: 5 }, npcRelationships: { '2': { friendship: 15 } } }, nextSceneId: 's2' },
          { id: 'c2', text: 'Join Dexter and the study group', effects: { stats: { academics: 10, creativity: 5 }, npcRelationships: { '3': { friendship: 12 } } }, nextSceneId: 's3' },
          { id: 'c3', text: 'Sit alone and draw in your notebook', effects: { stats: { creativity: 10, rebellion: 5 } }, nextSceneId: 's4' },
        ],
      },
      {
        id: 's2',
        text: 'Britney smiles as you sit down. "I knew you had taste. But watch out — the queen bee does not share her throne." The table laughs. You feel eyes on you from every direction.',
        choices: [
          { id: 'c4', text: 'Charm the table with witty jokes', statCheck: { stat: 'popularity', threshold: 25 }, effects: { stats: { popularity: 10, happiness: 10 } } },
          { id: 'c5', text: 'Stay quiet and listen', effects: { stats: { popularity: 3, happiness: -2 } } },
        ],
      },
      {
        id: 's3',
        text: 'Dexter opens his laptop. "I am building an AI that predicts cafeteria food quality. So far it is 94% accurate at predicting mystery meat days." You can not help but laugh.',
        choices: [
          { id: 'c6', text: 'Offer to help with the code', statCheck: { stat: 'academics', threshold: 25 }, effects: { stats: { academics: 10, creativity: 5, energy: -10 } } },
          { id: 'c7', text: 'Suggest adding a social media component', effects: { stats: { creativity: 5, popularity: 3 } } },
        ],
      },
      {
        id: 's4',
        text: 'Skyler slides into the seat across from you. "I saw your sketch. It is really good. Want to see my portfolio?" Their eyes light up with genuine excitement.',
        choices: [
          { id: 'c8', text: 'Show them your sketchbook', effects: { stats: { creativity: 15, happiness: 10 }, npcRelationships: { '5': { friendship: 20 } } } },
          { id: 'c9', text: 'Keep it to yourself for now', effects: { stats: { rebellion: 5, happiness: -3 } } },
        ],
      },
    ],
  },
  {
    id: 'ch3-prom-night',
    title: 'Prom Night',
    description: 'The biggest night of the semester. Who will you go with? Will you even go at all?',
    semester: 1,
    episode: 3,
    lockType: 'premium',
    cost: { gems: 15 },
    requiredSemester: 1,
    requiredStats: { popularity: 30 },
    thumbnail: '🎩',
    scenes: [
      {
        id: 's1',
        text: 'Prom posters cover every wall. The theme is "Starry Night" and the gym is being transformed into something magical. You have been asked by three different people.',
        choices: [
          { id: 'c1', text: 'Go with Chad as friends', effects: { stats: { athletics: 5, popularity: 10 }, npcRelationships: { '1': { friendship: 15, romance: 5 } } }, nextSceneId: 's2' },
          { id: 'c2', text: 'Ask Raven to go as your date', effects: { stats: { rebellion: 10, creativity: 5 }, npcRelationships: { '4': { friendship: 10, romance: 20 } } }, nextSceneId: 's3' },
          { id: 'c3', text: 'Go stag and make a statement', effects: { stats: { rebellion: 15, popularity: -5 } }, nextSceneId: 's4' },
        ],
      },
      {
        id: 's2',
        text: 'Chad shows up in a tux that is somehow too tight and too loose at the same time. "I cleaned up for you," he says with a grin. The dance floor awaits.',
        choices: [
          { id: 'c4', text: 'Dance like nobody is watching', effects: { stats: { athletics: 10, happiness: 15, energy: -15 } } },
          { id: 'c5', text: 'Slow dance and see where the night goes', effects: { stats: { happiness: 10 }, npcRelationships: { '1': { romance: 15 } } } },
        ],
      },
      {
        id: 's3',
        text: 'Raven arrives in a black dress that looks like it was made for her. She hands you a black rose. "I do not do traditional. Hope that is okay." It is more than okay.',
        choices: [
          { id: 'c6', text: 'Tell her she looks incredible', effects: { stats: { happiness: 15 }, npcRelationships: { '4': { romance: 20 } } } },
          { id: 'c7', text: 'Sneak out to the rooftop for a private moment', effects: { stats: { rebellion: 10, happiness: 20 }, npcRelationships: { '4': { romance: 25 } } } },
        ],
      },
      {
        id: 's4',
        text: 'You walk in alone, wearing something that turns every head. Britney raises an eyebrow from across the room. Chad gives you a nod of respect. You have made your point.',
        choices: [
          { id: 'c8', text: 'Crash the DJ booth and change the music', effects: { stats: { rebellion: 20, popularity: 10, energy: -20 } } },
          { id: 'c9', text: 'Dance alone in the center of the floor', effects: { stats: { popularity: 15, happiness: 15 } } },
        ],
      },
    ],
  },
  {
    id: 'ch4-senior-prank',
    title: 'The Senior Prank',
    description: 'A legendary prank that will go down in Westfield history. Are you brave enough?',
    semester: 4,
    episode: 1,
    lockType: 'premium',
    cost: { gems: 25 },
    requiredSemester: 4,
    requiredStats: { rebellion: 40 },
    thumbnail: '🎭',
    scenes: [
      {
        id: 's1',
        text: 'It is senior year and the tradition is clear: prank the school or be forgotten. Raven approaches you with a glint in her eye. "I have a plan. But I need someone fearless."',
        choices: [
          { id: 'c1', text: '"I am in. What is the plan?"', effects: { stats: { rebellion: 10, happiness: 5 }, npcRelationships: { '4': { friendship: 10 } } }, nextSceneId: 's2' },
          { id: 'c2', text: 'Suggest a less destructive prank', effects: { stats: { creativity: 10, rebellion: 5 } }, nextSceneId: 's3' },
          { id: 'c3', text: 'Report the plan to the principal', effects: { stats: { academics: 5, popularity: -20, rebellion: -15 } } },
        ],
      },
      {
        id: 's2',
        text: 'Raven pulls out blueprints. "We fill the principal\'s office with 10,000 plastic balls. At 2 AM. No cameras. No witnesses."',
        choices: [
          { id: 'c4', text: 'Recruit Chad to help carry the balls', statCheck: { stat: 'athletics', threshold: 40 }, effects: { stats: { athletics: 10, rebellion: 15 }, npcRelationships: { '1': { friendship: 15 } } } },
          { id: 'c5', text: 'Hack the camera system instead', statCheck: { stat: 'academics', threshold: 50 }, effects: { stats: { academics: 15, rebellion: 10 }, npcRelationships: { '3': { friendship: 10 } } } },
        ],
      },
      {
        id: 's3',
        text: 'You convince the group to do something harmless but legendary: every student wears a costume to school on the same day without telling the teachers.',
        choices: [
          { id: 'c6', text: 'Spread the word through social media', effects: { stats: { popularity: 20, creativity: 10 } } },
          { id: 'c7', text: 'Design the official event poster', effects: { stats: { creativity: 15, popularity: 10 } } },
        ],
      },
    ],
  },
  {
    id: 'ch5-graduation',
    title: 'Graduation Day',
    description: 'The final chapter. Four years of choices led to this moment.',
    semester: 4,
    episode: 2,
    lockType: 'season-pass',
    requiredSemester: 4,
    thumbnail: '🎓',
    scenes: [
      {
        id: 's1',
        text: 'The cap and gown feel heavier than they look. Around you, friends who became family. Enemies who became teachers. You are about to walk across that stage.',
        choices: [
          { id: 'c1', text: 'Give a valedictorian speech', statCheck: { stat: 'academics', threshold: 60 }, effects: { stats: { popularity: 20, happiness: 20 } } },
          { id: 'c2', text: 'Shout out your clique in your walk-up', effects: { stats: { popularity: 15, happiness: 15 } } },
          { id: 'c3', text: 'Walk with quiet dignity', effects: { stats: { happiness: 10, rebellion: 5 } } },
        ],
      },
      {
        id: 's2',
        text: 'After the ceremony, everyone gathers on the lawn. Chad is crying. Dexter is already planning a startup. Raven kisses your cheek. "We made it."',
        choices: [
          { id: 'c4', text: 'Promise to stay friends forever', effects: { stats: { happiness: 25 }, npcRelationships: { '1': { friendship: 20 }, '2': { friendship: 20 }, '3': { friendship: 20 }, '4': { friendship: 20 }, '5': { friendship: 20 } } } },
          { id: 'c5', text: 'Kiss Raven back', effects: { stats: { happiness: 30 }, npcRelationships: { '4': { romance: 50 } } } },
        ],
      },
    ],
  },
  {
    id: 'ch6-the-rival',
    title: 'The Rival',
    description: 'Bradley has been sabotaging you. It is time to settle this.',
    semester: 1,
    episode: 4,
    lockType: 'progress',
    requiredSemester: 1,
    requiredStats: { athletics: 35 },
    thumbnail: '⚔️',
    scenes: [
      {
        id: 's1',
        text: 'Bradley corners you after practice. "You think you are special? I have been here since freshman year. You are just a trend." The gym is empty. It is just you two.',
        choices: [
          { id: 'c1', text: 'Challenge him to a one-on-one match', statCheck: { stat: 'athletics', threshold: 35 }, effects: { stats: { athletics: 10, popularity: 5 } } },
          { id: 'c2', text: 'Walk away and let him burn himself out', effects: { stats: { popularity: 5, happiness: 5 } } },
          { id: 'c3', text: 'Outsmart him with strategy', statCheck: { stat: 'academics', threshold: 40 }, effects: { stats: { academics: 10, rebellion: 5 } } },
        ],
      },
    ],
  },
  {
    id: 'ch7-festival-of-arts',
    title: 'Festival of Arts',
    description: 'The school arts festival is here. Show the world what you are made of.',
    semester: 2,
    episode: 1,
    lockType: 'progress',
    requiredSemester: 2,
    requiredStats: { creativity: 40 },
    thumbnail: '🎭',
    scenes: [
      {
        id: 's1',
        text: 'The gym has been transformed. Canvas everywhere. A stage in the center. Skyler waves you over. "I saved you the best spot." Priya is setting up her photo exhibit nearby.',
        choices: [
          { id: 'c1', text: 'Paint something live on stage', effects: { stats: { creativity: 15, popularity: 10, energy: -15 }, npcRelationships: { '5': { friendship: 15 } } } },
          { id: 'c2', text: 'Help Priya with her photo setup', effects: { stats: { creativity: 10, popularity: 5 }, npcRelationships: { '10': { friendship: 15 } } } },
          { id: 'c3', text: 'Perform an impromptu spoken word piece', effects: { stats: { creativity: 20, rebellion: 10 } } },
        ],
      },
    ],
  },
  {
    id: 'ch8-summer-job',
    title: 'Summer Job',
    description: 'Break is over. Time to earn some cash and maybe learn something about life.',
    semester: 2,
    episode: 2,
    lockType: 'free',
    requiredSemester: 2,
    thumbnail: '💼',
    scenes: [
      {
        id: 's1',
        text: 'The local coffee shop needs help. So does the bookstore. And the arcade is hiring. Where will you spend your summer?',
        choices: [
          { id: 'c1', text: 'Coffee shop — meet everyone in town', effects: { stats: { popularity: 15, happiness: 5 }, currency: { points: 100 } } },
          { id: 'c2', text: 'Bookstore — quiet money', effects: { stats: { academics: 10, creativity: 5 }, currency: { points: 80 } } },
          { id: 'c3', text: 'Arcade — free games all summer', effects: { stats: { rebellion: 10, happiness: 10 }, currency: { points: 60 } } },
        ],
      },
    ],
  },
  {
    id: 'ch9-the-breakup',
    title: 'The Breakup',
    description: 'Relationships crack under pressure. Can yours survive?',
    semester: 3,
    episode: 1,
    lockType: 'premium',
    cost: { gems: 20 },
    requiredSemester: 3,
    requiredStats: { happiness: 30 },
    thumbnail: '💔',
    scenes: [
      {
        id: 's1',
        text: 'It started with small fights. Now it is everywhere. You find a note in your locker: "We need to talk. The rooftop. After school."',
        choices: [
          { id: 'c1', text: 'Go and try to fix things', effects: { stats: { happiness: -10, popularity: 5 } } },
          { id: 'c2', text: 'Ignore it and focus on yourself', effects: { stats: { happiness: 5, rebellion: 10 } } },
          { id: 'c3', text: 'Bring friends for moral support', effects: { stats: { popularity: 10, happiness: -5 } } },
        ],
      },
    ],
  },
  {
    id: 'ch10-senior-trip',
    title: 'Senior Trip',
    description: 'One last adventure before the real world. Make it count.',
    semester: 4,
    episode: 3,
    lockType: 'season-pass',
    requiredSemester: 4,
    thumbnail: '✈️',
    scenes: [
      {
        id: 's1',
        text: 'The bus ride to the coast takes four hours. Everyone is singing, arguing, or confessing secrets they will regret. You are squeezed between Chad and Raven.',
        choices: [
          { id: 'c1', text: 'Start a bus-wide game of truth or dare', effects: { stats: { popularity: 20, happiness: 15, energy: -10 } } },
          { id: 'c2', text: 'Write in your journal about the journey', effects: { stats: { creativity: 15, happiness: 10 } } },
          { id: 'c3', text: 'Sleep through the whole trip', effects: { stats: { energy: 30, happiness: -5 } } },
        ],
      },
    ],
  },
];

export function canUnlockChapter(
  chapter: StoryChapter,
  progress: StoryProgress,
  semester: number,
  stats: Record<string, number>,
  currency: { points: number; gems: number },
  hasSeasonPass?: boolean
): { unlocked: boolean; reason?: string } {
  if (progress.unlockedChapters.includes(chapter.id)) {
    return { unlocked: true };
  }

  if (chapter.lockType === 'free') {
    return { unlocked: true };
  }

  if (chapter.requiredSemester && semester < chapter.requiredSemester) {
    return { unlocked: false, reason: `Requires Semester ${chapter.requiredSemester}` };
  }

  if (chapter.requiredStats) {
    for (const [stat, threshold] of Object.entries(chapter.requiredStats)) {
      if ((stats[stat] ?? 0) < threshold) {
        return { unlocked: false, reason: `Requires ${stat} ${threshold}` };
      }
    }
  }

  if (chapter.lockType === 'season-pass') {
    if (hasSeasonPass) return { unlocked: true };
    return { unlocked: false, reason: 'Requires Season Pass' };
  }

  if (chapter.lockType === 'premium' && chapter.cost) {
    if (currency.gems < (chapter.cost.gems ?? 0) || currency.points < (chapter.cost.points ?? 0)) {
      return { unlocked: false, reason: `Costs 💎${chapter.cost.gems ?? 0} 🪙${chapter.cost.points ?? 0}` };
    }
  }

  return { unlocked: true };
}

export function getCurrentScene(chapter: StoryChapter, progress: StoryProgress): string {
  const current = progress.currentSceneByChapter[chapter.id];
  if (current) {
    const scene = chapter.scenes.find((s) => s.id === current);
    if (scene) return scene.id;
  }
  return chapter.scenes[0]?.id ?? '';
}
