import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  GameState,
  Player,
  Stats,
  Currency,
  RoomItem,
  PlacedItem,
  NPC,
  NPCVisualConfig,
  Rival,
  RandomEvent,
  Achievement,
  Period,
  DailyChallenge,
  Clique,
  StoryChapter,
  SkillTree,
  SkillTreeId,
  ActiveAbility,
  CareerPath,
  LoginStreak,
  AtmosphereState,
  CalendarEntry,
  ScheduledEvent,
  SeasonalTheme,
} from '@repo/types';
import { STORY_CHAPTERS, canUnlockChapter, getCurrentScene } from './story';
import {
  SKILL_TREES,
  ACTIVE_ABILITIES,
  getAllNodes,
  canPurchaseNode,
  purchaseNode,
  getActiveAbilities,
  applySkillEffects,
  useActiveAbility,
  getSkillTreeProgress,
  getSkillPointsAvailable,
  tickAbilityCooldowns,
} from './skill-tree';
import {
  CAREER_PATHS,
  getAvailableCareers,
  getCurrentCareer,
  checkMilestoneCompletion,
  getCareerRecommendation,
} from './career-system';
import {
  getDefaultLoginStreak,
  processDailyLogin,
  claimDailyReward,
  isStreakAtRisk,
  useStreakProtection,
  getMonthlyBonus,
  getStreakStatus,
} from './daily-login';
import {
  getDefaultAtmosphere,
  shiftAtmosphere,
  decayAtmosphere,
  applySeasonalModifiers,
} from './atmosphere';
import {
  getEventsForDay,
  getCurrentSeasonalTheme,
  processEventChoice,
  generateRandomCrisis,
  getCalendarForSemester,
  getUpcomingEvents as getUpcomingEventsEngine,
} from './world-events';

const MAX_STAT = 100;
const MAX_ENERGY = 100;

const PERIODS: Period[] = ['morning', 'lunch', 'afternoon', 'evening', 'night'];

function npcVisual(seed: string, overrides?: Partial<NPCVisualConfig>): NPCVisualConfig {
  return {
    seed,
    hair: ['short01'],
    hairColor: '#4a2511',
    skinColor: '#f5d0b5',
    ...overrides,
  };
}

export const DEFAULT_NPCS: NPC[] = [
  { id: '1', name: 'Chad', clique: 'jock', avatar: '🏈', visualConfig: npcVisual('chad-jock', { hair: ['short05'], hairColor: '#e5d7a3', skinColor: '#f2d3b1' }), relationship: 10, romance: 0, unlocked: true, bio: 'Star quarterback. Loud, loyal, and secretly writes poetry.', personality: 'friendly', schedule: { morning: 'Football field', lunch: 'Cafeteria', afternoon: 'Gym', evening: 'Locker room', night: 'Dorm' } },
  { id: '2', name: 'Britney', clique: 'popular', avatar: '💅', visualConfig: npcVisual('britney-popular', { hair: ['long01'], hairColor: '#e5d7a3', skinColor: '#f2d3b1' }), relationship: 10, romance: 0, unlocked: true, bio: 'Student council president. Sharp tongue, sharper mind.', personality: 'ambitious', schedule: { morning: 'Student Council', lunch: 'Cafeteria', afternoon: 'Library', evening: 'Mall', night: 'Home' } },
  { id: '3', name: 'Dexter', clique: 'nerd', avatar: '🤓', visualConfig: npcVisual('dexter-nerd', { hair: ['short01'], hairColor: '#0e0e0e', skinColor: '#ecad80' }), relationship: 10, romance: 0, unlocked: true, bio: 'Coding wizard. Socially awkward but will hack anything for a friend.', personality: 'loyal', schedule: { morning: 'Computer Lab', lunch: 'Library', afternoon: 'Robotics Club', evening: 'Dorm', night: 'Online' } },
  { id: '4', name: 'Raven', clique: 'goth', avatar: '🦇', visualConfig: npcVisual('raven-goth', { hair: ['long11'], hairColor: '#0e0e0e', skinColor: '#ecad80' }), relationship: 10, romance: 0, unlocked: true, bio: 'Poet who haunts the cemetery. Deeper than she lets on.', personality: 'mysterious', schedule: { morning: 'Art Room', lunch: 'Cafeteria corner', afternoon: 'Cemetery', evening: 'Coffee shop', night: 'Roof' } },
  { id: '5', name: 'Skyler', clique: 'artsy', avatar: '🎨', visualConfig: npcVisual('skyler-artsy', { hair: ['long06'], hairColor: '#afafaf', skinColor: '#f2d3b1' }), relationship: 10, romance: 0, unlocked: true, bio: 'Always sketching. Sees beauty in chaos.', personality: 'chill', schedule: { morning: 'Art Studio', lunch: 'Courtyard', afternoon: 'Gallery', evening: 'Park', night: 'Studio' } },
  { id: '6', name: 'Marcus', clique: 'jock', avatar: '🏀', visualConfig: npcVisual('marcus-jock', { hair: ['short11'], hairColor: '#0e0e0e', skinColor: '#9e5622' }), relationship: 5, romance: 0, unlocked: false, bio: 'Basketball captain. Chad\'s rival on and off the court.', personality: 'dramatic', schedule: { morning: 'Gym', lunch: 'Cafeteria', afternoon: 'Basketball court', evening: 'Weight room', night: 'Dorm' } },
  { id: '7', name: 'Amber', clique: 'popular', avatar: '✨', visualConfig: npcVisual('amber-popular', { hair: ['long19'], hairColor: '#cb6820', skinColor: '#f2d3b1' }), relationship: 5, romance: 0, unlocked: false, bio: 'Cheer captain. Britney\'s best friend and biggest competition.', personality: 'tsundere', schedule: { morning: 'Gym', lunch: 'Cafeteria', afternoon: 'Cheer practice', evening: 'Mall', night: 'Home' } },
  { id: '8', name: 'Leo', clique: 'nerd', avatar: '🔬', visualConfig: npcVisual('leo-nerd', { hair: ['short03'], hairColor: '#562306', skinColor: '#ecad80' }), relationship: 5, romance: 0, unlocked: false, bio: 'Science fair champion. Dexter\'s lab partner and occasional nemesis.', personality: 'ambitious', schedule: { morning: 'Science Lab', lunch: 'Library', afternoon: 'Lab', evening: 'Observatory', night: 'Dorm' } },
  { id: '9', name: 'Zoe', clique: 'goth', avatar: '🖤', visualConfig: npcVisual('zoe-goth', { hair: ['long22'], hairColor: '#3eac2c', skinColor: '#ecad80' }), relationship: 5, romance: 0, unlocked: false, bio: 'Band vocalist. Raven\'s cousin. Plays bass and breaks hearts.', personality: 'hyper', schedule: { morning: 'Music Room', lunch: 'Cafeteria', afternoon: 'Band practice', evening: 'Venue', night: 'Garage' } },
  { id: '10', name: 'Priya', clique: 'artsy', avatar: '📸', visualConfig: npcVisual('priya-artsy', { hair: ['long16'], hairColor: '#0e0e0e', skinColor: '#9e5622' }), relationship: 5, romance: 0, unlocked: false, bio: 'Photography genius. Captures moments others miss.', personality: 'mysterious', schedule: { morning: 'Darkroom', lunch: 'Courtyard', afternoon: 'Yearbook', evening: 'City', night: 'Rooftop' } },
  { id: '11', name: 'Tyler', clique: 'preppy', avatar: '📚', visualConfig: npcVisual('tyler-preppy', { hair: ['short08'], hairColor: '#ac6511', skinColor: '#f2d3b1' }), relationship: 5, romance: 0, unlocked: false, bio: 'Debate captain. Future politician. Always networking.', personality: 'ambitious', schedule: { morning: 'Debate Hall', lunch: 'Cafeteria', afternoon: 'Library', evening: 'Country Club', night: 'Home' } },
  { id: '12', name: 'Maya', clique: 'preppy', avatar: '🎻', visualConfig: npcVisual('maya-preppy', { hair: ['long25'], hairColor: '#0e0e0e', skinColor: '#f2d3b1' }), relationship: 5, romance: 0, unlocked: false, bio: 'Orchestra first chair. Perfect grades. Secretly loves metal.', personality: 'loyal', schedule: { morning: 'Music Room', lunch: 'Library', afternoon: 'Orchestra', evening: 'Practice room', night: 'Online forums' } },
  { id: '13', name: 'Jordan', clique: 'jock', avatar: '🏊', visualConfig: npcVisual('jordan-jock', { hair: ['short17'], hairColor: '#85c2c6', skinColor: '#f2d3b1' }), relationship: 5, romance: 0, unlocked: false, bio: 'Swim team star. Quiet, focused, unexpectedly kind.', personality: 'chill', schedule: { morning: 'Pool', lunch: 'Cafeteria', afternoon: 'Swim practice', evening: 'Beach', night: 'Dorm' } },
  { id: '14', name: 'Sasha', clique: 'popular', avatar: '📱', visualConfig: npcVisual('sasha-popular', { hair: ['long06'], hairColor: '#592454', skinColor: '#ecad80' }), relationship: 5, romance: 0, unlocked: false, bio: 'Social media queen. 50k followers. Allergic to sincerity.', personality: 'dramatic', schedule: { morning: 'Cafeteria', lunch: 'Courtyard', afternoon: 'Mall', evening: 'Party', night: 'Scrolling' } },
  { id: '15', name: 'Kai', clique: 'nerd', avatar: '🎮', visualConfig: npcVisual('kai-nerd', { hair: ['long21'], hairColor: '#dba3be', skinColor: '#f2d3b1' }), relationship: 5, romance: 0, unlocked: false, bio: 'Esports legend. Streams under a secret alias. Knows everyone\'s secrets.', personality: 'mysterious', schedule: { morning: 'Computer Lab', lunch: 'Cafeteria', afternoon: 'Gaming Club', evening: 'Streaming', night: 'Online' } },
  { id: '16', name: 'Liam', clique: 'artsy', avatar: '🌍', visualConfig: npcVisual('liam-exchange', { hair: ['short09'], hairColor: '#4a6741', skinColor: '#f5d0b5' }), relationship: 0, romance: 0, unlocked: false, bio: 'An exchange student from Ireland. Charming accent, mysterious past, and a talent for photography. Everyone wants to know his story.', personality: 'mysterious', schedule: { morning: 'Language Lab', lunch: 'Courtyard', afternoon: 'Photography Club', evening: 'Exploring town', night: 'Writing letters home' } },
  { id: '17', name: 'Olivia', clique: 'preppy', avatar: '📰', visualConfig: npcVisual('olivia-reporter', { hair: ['long08'], hairColor: '#8d5524', skinColor: '#e8b89a' }), relationship: 5, romance: 0, unlocked: true, bio: 'Editor of the school paper. Nothing happens at Westfield without her knowing. She might write about you — for better or worse.', personality: 'ambitious', schedule: { morning: 'Newsroom', lunch: 'Interviewing students', afternoon: 'Yearbook office', evening: 'Writing articles', night: 'Chasing leads' } },
  { id: '18', name: 'Noah', clique: 'jock', avatar: '🏋️', visualConfig: npcVisual('noah-coach', { hair: ['short15'], hairColor: '#0e0e0e', skinColor: '#d4a373' }), relationship: 5, romance: 0, unlocked: false, bio: 'The coach\'s son. Quiet, focused, and surprisingly kind. He\'s not just playing sports — he\'s studying them.', personality: 'chill', schedule: { morning: 'Training', lunch: 'Cafeteria', afternoon: 'Practice', evening: 'Studying game tape', night: 'Early to bed' } },
  { id: '19', name: 'Emma', clique: 'popular', avatar: '💋', visualConfig: npcVisual('emma-transfer', { hair: ['long12'], hairColor: '#cb6820', skinColor: '#f2d3b1' }), relationship: 0, romance: 0, unlocked: false, bio: 'Transferred from a rival school mid-year. Gorgeous, confident, and already shaking up the social hierarchy. Is she friend or rival?', personality: 'dramatic', schedule: { morning: 'Guidance office', lunch: 'Popular table', afternoon: 'Cheer practice', evening: 'Mall', night: 'Social media' } },
  { id: '20', name: 'Aiden', clique: 'nerd', avatar: '💻', visualConfig: npcVisual('aiden-billionaire', { hair: ['short07'], hairColor: '#ac6511', skinColor: '#f5d0b5' }), relationship: 0, romance: 0, unlocked: false, bio: 'His father runs a tech empire, but Aiden just wants to build robots in peace. Secretly generous. Publicly tsundere.', personality: 'tsundere', schedule: { morning: 'Private tutoring', lunch: 'Library', afternoon: 'Robotics Lab', evening: 'Hacking', night: 'Online' } },
];

export const DEFAULT_RIVALS: Rival[] = [
  { id: 'r1', name: 'Bradley', clique: 'jock', visualConfig: npcVisual('bradley-rival', { hair: ['short05'], hairColor: '#e5d7a3', skinColor: '#f2d3b1' }), hostility: 30, reason: 'You beat him at football tryouts', encounters: 1 },
];

export const RANDOM_EVENTS: RandomEvent[] = [
  {
    id: 'ev1',
    title: 'Locker Prank',
    description: 'Someone stuffed your locker with glitter. Students are laughing. You spot Bradley smirking nearby.',
    choices: [
      { id: 'ev1-a', text: 'Laugh it off and clean it up', effects: { popularity: 5, happiness: -5 } },
      { id: 'ev1-b', text: 'Confront Bradley publicly', effects: { rebellion: 10, popularity: -3 }, npcEffects: { 'r1': { friendship: -10 } } },
      { id: 'ev1-c', text: 'Plan elaborate revenge', effects: { creativity: 10, rebellion: 5 } },
    ],
    period: ['morning', 'lunch'],
    semester: [1, 2, 3, 4],
    weight: 15,
  },
  {
    id: 'ev2',
    title: 'Found Money',
    description: 'You find a wallet in the hallway with $50 and a student ID. No one is around.',
    choices: [
      { id: 'ev2-a', text: 'Turn it in to the office', effects: { popularity: 5, happiness: 5 } },
      { id: 'ev2-b', text: 'Keep the cash, drop the wallet', effects: { rebellion: 10, happiness: 5 }, currency: { points: 50 } },
      { id: 'ev2-c', text: 'Track down the owner and return it', effects: { popularity: 10, academics: 3 } },
    ],
    period: ['morning', 'afternoon'],
    semester: [1, 2, 3, 4],
    weight: 10,
  },
  {
    id: 'ev3',
    title: 'Teacher\'s Pet Moment',
    description: 'The teacher asks a question no one knows. You do — but answering might make you a target.',
    choices: [
      { id: 'ev3-a', text: 'Raise your hand confidently', effects: { academics: 10, popularity: -3 } },
      { id: 'ev3-b', text: 'Whisper the answer to a friend', effects: { academics: 5, popularity: 5 } },
      { id: 'ev3-c', text: 'Stay silent and watch the chaos', effects: { rebellion: 5 } },
    ],
    period: ['morning', 'afternoon'],
    semester: [1, 2, 3, 4],
    weight: 12,
  },
  {
    id: 'ev4',
    title: 'Unexpected Concert',
    description: 'Zoe\'s band is playing an underground show tonight. The crowd is electric.',
    choices: [
      { id: 'ev4-a', text: 'Dive into the mosh pit', effects: { athletics: 5, rebellion: 10, happiness: 10 }, npcEffects: { '9': { friendship: 10 } } },
      { id: 'ev4-b', text: 'Film it for social media', effects: { creativity: 5, popularity: 5 }, npcEffects: { '14': { friendship: 5 } } },
      { id: 'ev4-c', text: 'Critique the sound mixing', effects: { creativity: 10, popularity: -3 } },
    ],
    period: ['evening', 'night'],
    semester: [2, 3, 4],
    weight: 8,
  },
  {
    id: 'ev5',
    title: 'Rumor Mill',
    description: 'A vicious rumor about Britney is spreading. She looks shaken in the hallway.',
    choices: [
      { id: 'ev5-a', text: 'Defend her publicly', effects: { popularity: 5, happiness: 5 }, npcEffects: { '2': { friendship: 15 } } },
      { id: 'ev5-b', text: 'Spread it further anonymously', effects: { popularity: 10, rebellion: 5, happiness: -5 }, npcEffects: { '2': { friendship: -20 } } },
      { id: 'ev5-c', text: 'Investigate who started it', effects: { academics: 5, creativity: 5 } },
    ],
    period: ['lunch', 'afternoon'],
    semester: [1, 2, 3, 4],
    weight: 10,
  },
  {
    id: 'ev6',
    title: 'Midnight Study Session',
    description: 'The library is empty except for Dexter, who waves you over with a stack of notes.',
    choices: [
      { id: 'ev6-a', text: 'Study together all night', effects: { academics: 15, energy: -20 }, npcEffects: { '3': { friendship: 10 } } },
      { id: 'ev6-b', text: 'Share snacks and gossip instead', effects: { happiness: 10, popularity: 3 }, npcEffects: { '3': { friendship: 15 } } },
      { id: 'ev6-c', text: 'Sneak out for a late-night walk', effects: { rebellion: 5, happiness: 5 } },
    ],
    period: ['night'],
    semester: [1, 2, 3, 4],
    weight: 8,
  },
  {
    id: 'ev7',
    title: 'Sports Injury',
    description: 'Chad twisted his ankle during practice. He\'s sitting alone, furious.',
    choices: [
      { id: 'ev7-a', text: 'Help him to the nurse', effects: { athletics: 3, popularity: 5 }, npcEffects: { '1': { friendship: 15 } } },
      { id: 'ev7-b', text: 'Offer to take his starting spot', effects: { athletics: 5, popularity: -5 }, npcEffects: { '1': { friendship: -10 } } },
      { id: 'ev7-c', text: 'Bring him homework and memes', effects: { happiness: 5, academics: 3 }, npcEffects: { '1': { friendship: 10, romance: 5 } } },
    ],
    period: ['afternoon', 'evening'],
    semester: [1, 2, 3, 4],
    weight: 10,
  },
];

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'ach1', title: 'First Steps', description: 'Complete your first day', icon: '🎒', unlocked: false, condition: 'days_played', targetValue: 1 },
  { id: 'ach2', title: 'Scholar', description: 'Reach 80 Academics', icon: '📚', unlocked: false, condition: 'stat_reached', targetKey: 'academics', targetValue: 80 },
  { id: 'ach3', title: 'Athlete', description: 'Reach 80 Athletics', icon: '🏆', unlocked: false, condition: 'stat_reached', targetKey: 'athletics', targetValue: 80 },
  { id: 'ach4', title: 'Artist', description: 'Reach 80 Creativity', icon: '🎨', unlocked: false, condition: 'stat_reached', targetKey: 'creativity', targetValue: 80 },
  { id: 'ach5', title: 'Icon', description: 'Reach 80 Popularity', icon: '⭐', unlocked: false, condition: 'stat_reached', targetKey: 'popularity', targetValue: 80 },
  { id: 'ach6', title: 'Rebel', description: 'Reach 80 Rebellion', icon: '🔥', unlocked: false, condition: 'stat_reached', targetKey: 'rebellion', targetValue: 80 },
  { id: 'ach7', title: 'Best Friend', description: 'Max friendship with any NPC', icon: '💫', unlocked: false, condition: 'npc_max', targetValue: 100 },
  { id: 'ach8', title: 'True Love', description: 'Max romance with any NPC', icon: '💕', unlocked: false, condition: 'npc_max', targetValue: 100 },
  { id: 'ach9', title: 'Storyteller', description: 'Complete 5 story chapters', icon: '📖', unlocked: false, condition: 'chapter_complete', targetValue: 5 },
  { id: 'ach10', title: 'Minigame Master', description: 'Score 500+ in any minigame', icon: '🎯', unlocked: false, condition: 'minigame_score', targetValue: 500 },
  { id: 'ach11', title: 'Rival Slayer', description: 'Defeat your rival in a confrontation', icon: '⚔️', unlocked: false, condition: 'rival_defeated', targetValue: 1 },
  { id: 'ach12', title: 'Semester Survivor', description: 'Reach Semester 2', icon: '📅', unlocked: false, condition: 'days_played', targetValue: 30 },
];

export const DEFAULT_CHALLENGES: DailyChallenge[] = [
  { id: 'c1', title: 'Math Whiz', description: 'Score 80+ in Math Blitz', reward: { points: 50, gems: 0 }, completed: false, type: 'minigame', targetValue: 80, currentValue: 0 },
  { id: 'c2', title: 'Social Butterfly', description: 'Talk to 3 NPCs', reward: { points: 30, gems: 0 }, completed: false, type: 'social', targetValue: 3, currentValue: 0 },
  { id: 'c3', title: 'Gainz', description: 'Train Athletics twice', reward: { points: 40, gems: 0 }, completed: false, type: 'stat', targetValue: 2, currentValue: 0 },
  { id: 'c4', title: 'Artistic Soul', description: 'Score 70+ in Art Studio', reward: { points: 40, gems: 1 }, completed: false, type: 'minigame', targetValue: 70, currentValue: 0 },
  { id: 'c5', title: 'Rumor Crusher', description: 'Win a rival confrontation', reward: { points: 60, gems: 2 }, completed: false, type: 'rival', targetValue: 1, currentValue: 0 },
  { id: 'c6', title: 'Explorer', description: 'Trigger 2 random events', reward: { points: 35, gems: 1 }, completed: false, type: 'explore', targetValue: 2, currentValue: 0 },
];

const DEFAULT_AVATAR = {
  gender: 'nonbinary' as const,
  skinTone: '#d4a373',
  hairStyle: 0,
  hairColor: '#0a0a0a',
  eyeColor: '#3b6e28',
  outfit: 0,
  accessory: 0,
};

export function createDefaultPlayer(name: string, clique: Clique, avatarConfig?: Partial<any>): Player {
  const baseStats: Stats = {
    academics: 20, athletics: 20, creativity: 20, popularity: 20, rebellion: 20, happiness: 50, energy: MAX_ENERGY,
  };
  const cliqueBonuses: Record<Clique, Partial<Stats>> = {
    jock: { athletics: 15, popularity: 10 },
    nerd: { academics: 20, creativity: 5 },
    popular: { popularity: 20, happiness: 10 },
    goth: { rebellion: 20, creativity: 10 },
    artsy: { creativity: 20, rebellion: 5 },
    preppy: { academics: 10, popularity: 10, happiness: 10 },
  };
  const bonuses = cliqueBonuses[clique];
  const stats: Stats = {
    ...baseStats,
    ...bonuses,
    academics: Math.min(MAX_STAT, baseStats.academics + (bonuses.academics ?? 0)),
    athletics: Math.min(MAX_STAT, baseStats.athletics + (bonuses.athletics ?? 0)),
    creativity: Math.min(MAX_STAT, baseStats.creativity + (bonuses.creativity ?? 0)),
    popularity: Math.min(MAX_STAT, baseStats.popularity + (bonuses.popularity ?? 0)),
    rebellion: Math.min(MAX_STAT, baseStats.rebellion + (bonuses.rebellion ?? 0)),
    happiness: Math.min(MAX_STAT, baseStats.happiness + (bonuses.happiness ?? 0)),
    energy: MAX_ENERGY,
  };

  return {
    id: `player_${Date.now()}`,
    name,
    avatar: '🧑',
    avatarConfig: { ...DEFAULT_AVATAR, ...avatarConfig },
    clique,
    stats,
    currency: { points: 100, gems: 10 },
    room: { width: 8, height: 8, wallColor: '#64748b', floorType: 'wood', items: [] },
    inventory: [],
    equipped: { outfit: null, accessory: null },
  };
}

// ─── Skill Tree Helpers ─────────────────────────────────────────────

function buildSkillTrees(): Record<SkillTreeId, SkillTree> {
  const record = {} as Record<SkillTreeId, SkillTree>;
  for (const tree of SKILL_TREES) {
    record[tree.id] = tree;
  }
  return record;
}

// ─── Extended Store Interface ───────────────────────────────────────

interface GameStore extends GameState {
  hasHydrated: boolean;

  // Skill Tree
  skillTrees: Record<SkillTreeId, SkillTree>;
  purchasedSkillNodes: string[];
  activeAbilities: ActiveAbility[];

  // Career
  careerPaths: CareerPath[];
  currentCareerId: string | undefined;
  careerMilestonesCompleted: string[];

  // Login Streak
  loginStreak: LoginStreak;

  // Audio
  audioEnabled: boolean;
  audioVolumes: { master: number; music: number; sfx: number };

  // ─── Existing Actions ────────────────────────────────────────────
  initGame: (name: string, clique: Clique, avatarConfig?: Partial<any>) => void;
  advanceTime: () => { event: RandomEvent | null; unlockedNpcs: NPC[] };
  modifyStats: (changes: Partial<Stats>) => void;
  spendEnergy: (amount: number) => boolean;
  addCurrency: (currency: Partial<Currency>) => void;
  spendCurrency: (cost: Currency) => boolean;
  addToInventory: (item: RoomItem) => void;
  placeRoomItem: (item: PlacedItem) => void;
  removeRoomItem: (itemId: string, position?: { x: number; y: number }) => void;
  changeNPCRelationship: (npcId: string, delta: number, type?: 'friendship' | 'romance') => void;
  unlockNPC: (npcId: string) => void;
  updateChallenge: (challengeId: string, value: number) => void;
  resetDailyChallenges: () => void;
  refillEnergy: (amount?: number) => void;

  // Story
  unlockChapter: (chapterId: string, hasSeasonPass?: boolean) => boolean;
  makeStoryChoice: (chapterId: string, choiceId: string, sceneId: string) => void;
  resetChapter: (chapterId: string) => void;
  getChapterStatus: (chapter: StoryChapter, hasSeasonPass?: boolean) => { unlocked: boolean; reason?: string; completed: boolean };

  // Rivals
  increaseHostility: (rivalId: string, amount: number) => void;
  decreaseHostility: (rivalId: string, amount: number) => void;

  // Achievements
  checkAchievements: () => Achievement[];

  // ─── New Actions ─────────────────────────────────────────────────

  // Skill Tree
  purchaseSkillNode: (nodeId: string, treeId: SkillTreeId) => { success: boolean; message: string };
  useActiveAbility: (abilityId: string) => { success: boolean; message: string };
  tickCooldowns: () => void;

  // Career
  selectCareer: (careerId: string) => void;
  checkCareerMilestones: () => { newlyCompleted: string[]; rewards: Partial<Currency> };
  getCareerRecommendation: () => CareerPath | null;

  // Daily Login
  processDailyLogin: () => { reward: import('@repo/types').DailyReward | null; streakContinued: boolean; isNewStreak: boolean };
  claimDailyReward: (day: number) => { success: boolean; reward: import('@repo/types').DailyReward | null };
  useStreakProtection: () => boolean;

  // Audio
  setAudioEnabled: (enabled: boolean) => void;
  setAudioVolume: (channel: 'master' | 'music' | 'sfx', volume: number) => void;

  // Atmosphere & Events
  atmosphere: AtmosphereState;
  calendar: CalendarEntry[];
  activeEvents: ScheduledEvent[];
  eventHistory: Array<{ eventId: string; choiceId: string; day: number }>;
  currentSeasonalTheme?: SeasonalTheme;
  advanceToEvent: (eventId: string) => void;
  makeEventChoice: (eventId: string, choiceId: string) => void;
  getUpcomingEvents: (daysAhead: number) => CalendarEntry[];
  getCurrentAtmosphere: () => AtmosphereState;
  triggerCrisisEvent: () => ScheduledEvent | null;
  applySeasonalTheme: () => void;
}

export { STORY_CHAPTERS, canUnlockChapter, getCurrentScene };

function generateDailyChallenges(): DailyChallenge[] {
  const pool = [
    { title: 'Math Whiz', description: 'Score 80+ in Math Blitz', reward: { points: 50, gems: 0 }, type: 'minigame' as const, targetValue: 80 },
    { title: 'Social Butterfly', description: 'Talk to 3 NPCs', reward: { points: 30, gems: 0 }, type: 'social' as const, targetValue: 3 },
    { title: 'Gainz', description: 'Train Athletics twice', reward: { points: 40, gems: 0 }, type: 'stat' as const, targetValue: 2 },
    { title: 'Artistic Soul', description: 'Score 70+ in Art Studio', reward: { points: 40, gems: 1 }, type: 'minigame' as const, targetValue: 70 },
    { title: 'Rumor Crusher', description: 'Win a rival confrontation', reward: { points: 60, gems: 2 }, type: 'rival' as const, targetValue: 1 },
    { title: 'Explorer', description: 'Trigger 2 random events', reward: { points: 35, gems: 1 }, type: 'explore' as const, targetValue: 2 },
    { title: 'Brainiac', description: 'Reach 60+ Academics today', reward: { points: 45, gems: 1 }, type: 'stat' as const, targetValue: 60 },
    { title: 'Party Animal', description: 'Flirt with 2 NPCs', reward: { points: 40, gems: 1 }, type: 'social' as const, targetValue: 2 },
    { title: 'Speed Demon', description: 'Score 400+ in Dance Battle', reward: { points: 55, gems: 2 }, type: 'minigame' as const, targetValue: 400 },
    { title: 'Memory Master', description: 'Complete Memory Match under 30s', reward: { points: 50, gems: 1 }, type: 'minigame' as const, targetValue: 1 },
  ];
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 4);
  return shuffled.map((c, i) => ({
    id: `c-${Date.now()}-${i}`,
    ...c,
    completed: false,
    currentValue: 0,
  }));
}

function pickRandomEvent(period: Period, semester: number): RandomEvent | null {
  const eligible = RANDOM_EVENTS.filter((e) => e.period.includes(period) && e.semester.includes(semester));
  if (eligible.length === 0) return null;
  const totalWeight = eligible.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * totalWeight;
  for (const event of eligible) {
    r -= event.weight;
    if (r <= 0) return event;
  }
  return eligible[0];
}

export const useGameStore = create<GameStore>()(
  persist(
    immer((set, get) => ({
      // ─── State ──────────────────────────────────────────────────
      player: createDefaultPlayer('Player', 'nerd'),
      progress: { semester: 1, day: 1, period: 'morning' },
      npcs: DEFAULT_NPCS.slice(0, 5),
      rivals: DEFAULT_RIVALS,
      challenges: generateDailyChallenges(),
      achievements: DEFAULT_ACHIEVEMENTS,
      lastPlayedAt: new Date().toISOString(),
      hasHydrated: false,
      storyProgress: {
        completedChapters: [],
        unlockedChapters: [],
        currentSceneByChapter: {},
        choiceHistory: {},
      },

      // Skill Tree
      skillTrees: buildSkillTrees(),
      purchasedSkillNodes: [],
      activeAbilities: ACTIVE_ABILITIES.map((a) => ({ ...a })),

      // Career
      careerPaths: CAREER_PATHS.map((c) => ({ ...c, milestones: c.milestones.map((m) => ({ ...m })) })),
      currentCareerId: undefined,
      careerMilestonesCompleted: [],

      // Login Streak
      loginStreak: getDefaultLoginStreak(),

      // Audio
      audioEnabled: true,
      audioVolumes: { master: 0.8, music: 0.7, sfx: 1.0 },

      // ─── Actions ────────────────────────────────────────────────

      initGame: (name, clique, avatarConfig) => {
        set((state) => {
          state.player = createDefaultPlayer(name, clique, avatarConfig);
          state.progress = { semester: 1, day: 1, period: 'morning' };
          state.npcs = DEFAULT_NPCS.map((n) => ({ ...n }));
          state.rivals = DEFAULT_RIVALS.map((r) => ({ ...r }));
          state.challenges = generateDailyChallenges();
          state.achievements = DEFAULT_ACHIEVEMENTS.map((a) => ({ ...a, unlocked: false }));
          state.lastPlayedAt = new Date().toISOString();
          state.storyProgress = {
            completedChapters: [],
            unlockedChapters: [],
            currentSceneByChapter: {},
            choiceHistory: {},
          };
          state.purchasedSkillNodes = [];
          state.activeAbilities = ACTIVE_ABILITIES.map((a) => ({ ...a, unlocked: false, currentCooldown: 0 }));
          state.careerPaths = CAREER_PATHS.map((c) => ({
            ...c,
            milestones: c.milestones.map((m) => ({ ...m, completed: false })),
            currentMilestone: 0,
          }));
          state.currentCareerId = undefined;
          state.careerMilestonesCompleted = [];
          state.loginStreak = getDefaultLoginStreak();
          state.audioEnabled = true;
          state.audioVolumes = { master: 0.8, music: 0.7, sfx: 1.0 };
        });
      },

      advanceTime: () => {
        let event: RandomEvent | null = null;
        let unlockedNpcs: NPC[] = [];

        set((state) => {
          const currentIndex = PERIODS.indexOf(state.progress.period);
          if (currentIndex < PERIODS.length - 1) {
            state.progress.period = PERIODS[currentIndex + 1]!;
          } else {
            state.progress.period = 'morning';
            state.progress.day += 1;
            if (state.progress.day > 30) {
              state.progress.day = 1;
              state.progress.semester = Math.min(4, state.progress.semester + 1) as 1 | 2 | 3 | 4;
            }
            state.challenges = generateDailyChallenges();
            state.player.stats.energy = MAX_ENERGY;
          }
          state.lastPlayedAt = new Date().toISOString();

          event = pickRandomEvent(state.progress.period, state.progress.semester);

          const unlockRequirements: Record<string, { semester?: number; day?: number; npcFriendship?: { id: string; min: number } }> = {
            '6': { semester: 1, day: 3 },
            '7': { semester: 1, day: 5, npcFriendship: { id: '2', min: 20 } },
            '8': { semester: 1, day: 7, npcFriendship: { id: '3', min: 20 } },
            '9': { semester: 1, day: 10 },
            '10': { semester: 2, day: 1 },
            '11': { semester: 2, day: 5 },
            '12': { semester: 2, day: 10 },
            '13': { semester: 3, day: 1 },
            '14': { semester: 3, day: 5, npcFriendship: { id: '2', min: 40 } },
            '15': { semester: 3, day: 10, npcFriendship: { id: '3', min: 40 } },
            '16': { semester: 2, day: 1 },
            '18': { semester: 1, day: 7, npcFriendship: { id: '1', min: 30 } },
            '19': { semester: 3, day: 1 },
            '20': { semester: 2, day: 5 },
          };

          unlockedNpcs = [];
          state.npcs.forEach((npc) => {
            if (npc.unlocked) return;
            const req = unlockRequirements[npc.id];
            if (!req) return;
            if (req.semester && state.progress.semester < req.semester) return;
            if (req.day && state.progress.day < req.day) return;
            if (req.npcFriendship) {
              const friend = state.npcs.find((n) => n.id === req.npcFriendship!.id);
              if (!friend || friend.relationship < req.npcFriendship.min) return;
            }
            npc.unlocked = true;
            unlockedNpcs.push(npc);
          });

          // Tick ability cooldowns when period advances
          state.activeAbilities = tickAbilityCooldowns(state.activeAbilities);
        });

        return { event, unlockedNpcs };
      },

      modifyStats: (changes) => {
        set((state) => {
          (Object.keys(changes) as Array<keyof Stats>).forEach((key) => {
            const value = changes[key] ?? 0;
            state.player.stats[key] = Math.max(0, Math.min(MAX_STAT, state.player.stats[key] + value));
          });
        });
      },

      spendEnergy: (amount) => {
        const { player } = get();
        if (player.stats.energy < amount) return false;
        set((state) => {
          state.player.stats.energy = Math.max(0, state.player.stats.energy - amount);
        });
        return true;
      },

      addCurrency: (currency) => {
        set((state) => {
          if (currency.points) state.player.currency.points += currency.points;
          if (currency.gems) state.player.currency.gems += currency.gems;
        });
      },

      spendCurrency: (cost) => {
        const { player } = get();
        if (player.currency.points < cost.points || player.currency.gems < cost.gems) return false;
        set((state) => {
          state.player.currency.points -= cost.points;
          state.player.currency.gems -= cost.gems;
        });
        return true;
      },

      addToInventory: (item) => {
        set((state) => {
          state.player.inventory.push(item);
        });
      },

      placeRoomItem: (item) => {
        set((state) => {
          state.player.room.items.push(item);
          const invIndex = state.player.inventory.findIndex((i) => i.id === item.id);
          if (invIndex >= 0) state.player.inventory.splice(invIndex, 1);
        });
      },

      removeRoomItem: (itemId, position) => {
        set((state) => {
          const idx = state.player.room.items.findIndex((i) => {
            if (position) {
              return i.id === itemId && i.position.x === position.x && i.position.y === position.y;
            }
            return i.id === itemId;
          });
          if (idx >= 0) {
            const item = state.player.room.items[idx]!;
            state.player.room.items.splice(idx, 1);
            const { position: _p, rotation: _r, ...baseItem } = item;
            state.player.inventory.push(baseItem as RoomItem);
          }
        });
      },

      changeNPCRelationship: (npcId, delta, type = 'friendship') => {
        set((state) => {
          const npc = state.npcs.find((n) => n.id === npcId);
          if (!npc) return;
          if (type === 'friendship') {
            npc.relationship = Math.max(0, Math.min(100, npc.relationship + delta));
          } else {
            npc.romance = Math.max(0, Math.min(100, npc.romance + delta));
          }
        });
      },

      unlockNPC: (npcId) => {
        set((state) => {
          const npc = state.npcs.find((n) => n.id === npcId);
          if (npc) npc.unlocked = true;
        });
      },

      updateChallenge: (challengeId, value) => {
        set((state) => {
          const challenge = state.challenges.find((c) => c.id === challengeId);
          if (!challenge || challenge.completed) return;
          challenge.currentValue = Math.min(challenge.targetValue, challenge.currentValue + value);
          if (challenge.currentValue >= challenge.targetValue) {
            challenge.completed = true;
            state.player.currency.points += challenge.reward.points;
            state.player.currency.gems += challenge.reward.gems;
          }
        });
      },

      resetDailyChallenges: () => {
        set((state) => {
          state.challenges = generateDailyChallenges();
        });
      },

      refillEnergy: (amount = MAX_ENERGY) => {
        set((state) => {
          state.player.stats.energy = Math.min(MAX_ENERGY, state.player.stats.energy + amount);
        });
      },

      unlockChapter: (chapterId, hasSeasonPass) => {
        const chapter = STORY_CHAPTERS.find((c) => c.id === chapterId);
        if (!chapter) return false;
        const { player, progress, storyProgress } = get();
        const check = canUnlockChapter(chapter, storyProgress, progress.semester, player.stats as unknown as Record<string, number>, player.currency, hasSeasonPass);
        if (!check.unlocked) return false;
        if (chapter.cost) {
          if (player.currency.points < (chapter.cost.points ?? 0)) return false;
          if (player.currency.gems < (chapter.cost.gems ?? 0)) return false;
          set((state) => {
            state.player.currency.points -= chapter.cost!.points ?? 0;
            state.player.currency.gems -= chapter.cost!.gems ?? 0;
          });
        }
        set((state) => {
          if (!state.storyProgress.unlockedChapters.includes(chapterId)) {
            state.storyProgress.unlockedChapters.push(chapterId);
          }
        });
        return true;
      },

      makeStoryChoice: (chapterId, choiceId, sceneId) => {
        const chapter = STORY_CHAPTERS.find((c) => c.id === chapterId);
        if (!chapter) return;
        const scene = chapter.scenes.find((s) => s.id === sceneId);
        if (!scene) return;
        const choice = scene.choices.find((c) => c.id === choiceId);
        if (!choice) return;

        set((state) => {
          if (choice.effects.stats) {
            (Object.entries(choice.effects.stats) as Array<[keyof Stats, number]>).forEach(([key, val]) => {
              if (key === 'energy') {
                state.player.stats.energy = Math.max(0, Math.min(MAX_ENERGY, state.player.stats.energy + val));
              } else {
                state.player.stats[key] = Math.max(0, Math.min(MAX_STAT, state.player.stats[key] + val));
              }
            });
          }
          if (choice.effects.npcRelationships) {
            Object.entries(choice.effects.npcRelationships).forEach(([npcId, delta]) => {
              const npc = state.npcs.find((n) => n.id === npcId);
              if (npc) {
                if (delta.friendship) npc.relationship = Math.max(0, Math.min(100, npc.relationship + delta.friendship));
                if (delta.romance) npc.romance = Math.max(0, Math.min(100, npc.romance + delta.romance));
              }
            });
          }
          if (choice.effects.currency) {
            if (choice.effects.currency.points) state.player.currency.points += choice.effects.currency.points;
            if (choice.effects.currency.gems) state.player.currency.gems += choice.effects.currency.gems;
          }
          if (!state.storyProgress.choiceHistory[chapterId]) {
            state.storyProgress.choiceHistory[chapterId] = [];
          }
          state.storyProgress.choiceHistory[chapterId].push(choiceId);
          if (choice.nextSceneId) {
            state.storyProgress.currentSceneByChapter[chapterId] = choice.nextSceneId;
          } else {
            state.storyProgress.completedChapters.push(chapterId);
            delete state.storyProgress.currentSceneByChapter[chapterId];
          }
        });
      },

      resetChapter: (chapterId) => {
        set((state) => {
          state.storyProgress.completedChapters = state.storyProgress.completedChapters.filter((id) => id !== chapterId);
          delete state.storyProgress.currentSceneByChapter[chapterId];
          delete state.storyProgress.choiceHistory[chapterId];
        });
      },

      getChapterStatus: (chapter, hasSeasonPass) => {
        const { storyProgress, progress, player } = get();
        const completed = storyProgress.completedChapters.includes(chapter.id);
        const check = canUnlockChapter(chapter, storyProgress, progress.semester, player.stats as unknown as Record<string, number>, player.currency, hasSeasonPass);
        return { unlocked: check.unlocked, reason: check.reason, completed };
      },

      increaseHostility: (rivalId, amount) => {
        set((state) => {
          const rival = state.rivals.find((r) => r.id === rivalId);
          if (rival) {
            rival.hostility = Math.min(100, rival.hostility + amount);
            rival.encounters += 1;
          }
        });
      },

      decreaseHostility: (rivalId, amount) => {
        set((state) => {
          const rival = state.rivals.find((r) => r.id === rivalId);
          if (rival) {
            rival.hostility = Math.max(0, rival.hostility - amount);
            rival.encounters += 1;
          }
        });
      },

      checkAchievements: () => {
        const state = get();
        const newlyUnlocked: Achievement[] = [];

        state.achievements.forEach((ach) => {
          if (ach.unlocked) return;
          let met = false;
          switch (ach.condition) {
            case 'stat_reached':
              if (ach.targetKey) {
                met = state.player.stats[ach.targetKey as keyof Stats] >= ach.targetValue;
              }
              break;
            case 'npc_max':
              met = state.npcs.some((n) => n.relationship >= ach.targetValue || n.romance >= ach.targetValue);
              break;
            case 'chapter_complete':
              met = state.storyProgress.completedChapters.length >= ach.targetValue;
              break;
            case 'days_played':
              met = (state.progress.semester - 1) * 30 + state.progress.day >= ach.targetValue;
              break;
            case 'rival_defeated':
              met = state.rivals.some((r) => r.hostility <= 10 && r.encounters > 1);
              break;
          }
          if (met) {
            ach.unlocked = true;
            ach.unlockedAt = new Date().toISOString();
            if (ach.reward) {
              state.player.currency.points += ach.reward.points ?? 0;
              state.player.currency.gems += ach.reward.gems ?? 0;
            }
            newlyUnlocked.push(ach);
          }
        });

        return newlyUnlocked;
      },

      // ─── Skill Tree Actions ─────────────────────────────────────

      purchaseSkillNode: (nodeId, treeId) => {
        const state = get();
        const allNodes = getAllNodes();
        const node = allNodes.find((n) => n.id === nodeId && n.treeId === treeId);

        if (!node) {
          return { success: false, message: 'Skill node not found' };
        }

        const canPurchaseResult = canPurchaseNode(
          node,
          state.purchasedSkillNodes,
          state.player,
        );

        if (!canPurchaseResult) {
          return { success: false, message: 'Requirements not met for this skill' };
        }

        const availablePoints = getSkillPointsAvailable(state.player);
        if (availablePoints < node.cost) {
          return { success: false, message: `Need ${node.cost} skill points (have ${availablePoints})` };
        }

        set((s) => {
          s.purchasedSkillNodes.push(nodeId);
          const tree = s.skillTrees[treeId];
          if (tree) {
            const treeNode = tree.nodes.find((n) => n.id === nodeId);
            if (treeNode) {
              treeNode.purchased = true;
            }
          }
          if (node.effects.statBonus) {
            for (const [key, val] of Object.entries(node.effects.statBonus)) {
              if (val && key in s.player.stats) {
                (s.player.stats as any)[key] = Math.min(MAX_STAT, (s.player.stats as any)[key] + val);
              }
            }
          }
          s.activeAbilities = getActiveAbilities(s.purchasedSkillNodes);
        });

        return { success: true, message: `Unlocked: ${node.name}` };
      },

      useActiveAbility: (abilityId) => {
        const state = get();
        const result = useActiveAbility(
          abilityId,
          state.purchasedSkillNodes,
          state.activeAbilities,
        );

        if (result.success) {
          set((s) => {
            s.activeAbilities = result.updatedAbilities;
          });
        }

        return { success: result.success, message: result.message };
      },

      tickCooldowns: () => {
        set((state) => {
          state.activeAbilities = tickAbilityCooldowns(state.activeAbilities);
        });
      },

      // ─── Career Actions ───────────────────────────────────────────

      selectCareer: (careerId) => {
        set((state) => {
          state.currentCareerId = careerId;
          const career = state.careerPaths.find((c) => c.id === careerId);
          if (career) {
            career.currentMilestone = 0;
            career.milestones.forEach((m) => {
              m.completed = false;
              delete m.completedAt;
            });
          }
          state.careerMilestonesCompleted = [];
        });
      },

      checkCareerMilestones: () => {
        const state = get();
        if (!state.currentCareerId) {
          return { newlyCompleted: [], rewards: { points: 0, gems: 0 } };
        }

        const career = state.careerPaths.find((c) => c.id === state.currentCareerId);
        if (!career) return { newlyCompleted: [], rewards: { points: 0, gems: 0 } };

        const { updatedCareer, newlyCompleted } = checkMilestoneCompletion(career, state.player);
        const totalRewards = { points: 0, gems: 0 };

        for (const mc of newlyCompleted) {
          if (mc.reward.currency?.points) totalRewards.points += mc.reward.currency.points;
          if (mc.reward.currency?.gems) totalRewards.gems += mc.reward.currency.gems;
        }

        if (newlyCompleted.length > 0) {
          set((s) => {
            const idx = s.careerPaths.findIndex((c) => c.id === state.currentCareerId);
            if (idx >= 0) {
              s.careerPaths[idx] = updatedCareer;
            }
            for (const mc of newlyCompleted) {
              if (!s.careerMilestonesCompleted.includes(mc.id)) {
                s.careerMilestonesCompleted.push(mc.id);
              }
              if (mc.reward.currency?.points) s.player.currency.points += mc.reward.currency.points;
              if (mc.reward.currency?.gems) s.player.currency.gems += mc.reward.currency.gems;
            }
          });
        }

        return { newlyCompleted: newlyCompleted.map((m) => m.id), rewards: totalRewards };
      },

      getCareerRecommendation: () => {
        const state = get();
        return getCareerRecommendation(state.player);
      },

      // ─── Daily Login Actions ─────────────────────────────────────

      processDailyLogin: () => {
        const state = get();
        const today = new Date().toISOString();

        const result = processDailyLogin(state.loginStreak, today);

        set((s) => {
          s.loginStreak = result.updatedStreak;
        });

        return {
          reward: result.reward,
          streakContinued: result.streakContinued,
          isNewStreak: result.isNewStreak,
        };
      },

      claimDailyReward: (day) => {
        const state = get();
        const result = claimDailyReward(state.loginStreak, day);

        if (!result.reward) {
          return { success: false, reward: null };
        }

        set((s) => {
          s.loginStreak = result.updatedStreak;
          if (result.reward.reward.points) {
            s.player.currency.points += result.reward.reward.points;
          }
          if (result.reward.reward.gems) {
            s.player.currency.gems += result.reward.reward.gems;
          }
          if (result.reward.reward.energy) {
            s.player.stats.energy = Math.min(MAX_ENERGY, s.player.stats.energy + result.reward.reward.energy);
          }
        });

        return { success: true, reward: result.reward };
      },

      useStreakProtection: () => {
        const state = get();
        if (state.loginStreak.streakProtectionUsed) return false;

        const updated = useStreakProtection(state.loginStreak);
        set((s) => {
          s.loginStreak = updated;
        });
        return true;
      },

      // ─── Audio Actions ────────────────────────────────────────────

      setAudioEnabled: (enabled) => {
        set((state) => {
          state.audioEnabled = enabled;
        });
      },

      setAudioVolume: (channel, volume) => {
        set((state) => {
          state.audioVolumes[channel] = Math.max(0, Math.min(1, volume));
        });
      },
    })),
    {
      name: 'highschool-sim-storage-v2',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          (state as GameStore).hasHydrated = true;
        }
      },
    }
  )
);

// ─── Re-exports ─────────────────────────────────────────────────────

export {
  SKILL_TREES,
  ACTIVE_ABILITIES,
  CAREER_PATHS,
  getAllNodes,
  canPurchaseNode,
  getActiveAbilities,
  applySkillEffects,
  getSkillTreeProgress,
  getSkillPointsAvailable,
  getAvailableCareers,
  getCurrentCareer,
  checkMilestoneCompletion,
  getCareerRecommendation,
  getDefaultLoginStreak,
  processDailyLogin,
  claimDailyReward as claimDailyRewardUtil,
  isStreakAtRisk,
  useStreakProtection as useStreakProtectionUtil,
  getMonthlyBonus,
  getStreakStatus,
};

// ─── Social & Tournament Exports ────────────────────────────────────

export type {
  Friend,
  GiftRecord,
  StatComparison,
} from './friend-system';

export {
  generateFriendCode,
  addFriendByCode,
  removeFriend,
  visitFriendRoom,
  canSendGift,
  getRemainingGifts,
  sendGift,
  compareStats,
  MOCK_FRIENDS,
  getMockPlayerFromFriend,
} from './friend-system';

export type {
  SocialFeedItem,
  SocialComment,
  FeedItemType,
} from './social-feed';

export {
  generateFeedItems,
  addFeedItem,
  likeFeedItem,
  addComment,
  getFeedTypeEmoji,
  getFeedTypeColor,
  getFeedTypeLabel,
  MOCK_FEED_ITEMS,
} from './social-feed';

export type {
  LeaderboardEntry,
  TournamentReward,
  Tournament,
  TournamentStatus,
} from './tournament';

export {
  GAME_TYPES,
  LEADERBOARD_NPCS,
  getWeeklyTournament,
  submitScore,
  getPlayerRank,
  getRewardsForRank,
  getActiveTournaments,
  getLeaderboard,
  formatCountdown,
  getTournamentHistory,
} from './tournament';
