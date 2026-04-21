import type {
  GameState,
  Player,
  Stats,
  Currency,
  RoomItem,
  PlacedItem,
  NPC,
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
import type { Friend } from '../friend-system';

export interface GameStore extends GameState {
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

  // Core Actions
  initGame: (name: string, clique: Clique, avatarConfig?: Partial<import('@repo/types').AvatarConfig>) => void;
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

  // Friends
  friends: Friend[];
  addFriend: (code: string) => { success: boolean; friend?: Friend; error?: string };
  removeFriendById: (friendId: string) => void;
  sendGiftToFriend: (friendId: string, item: RoomItem) => { success: boolean; remainingGifts: number };
}
