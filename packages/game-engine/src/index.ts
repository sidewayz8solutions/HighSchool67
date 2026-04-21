import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { haptics } from './haptics';
import type { Period, SkillTreeId } from '@repo/types';
import type { Friend } from './friend-system';
import {
  addFriendByCode,
  removeFriend,
  sendGift,
  MOCK_FRIENDS,
} from './friend-system';
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

import {
  DEFAULT_NPCS,
  DEFAULT_RIVALS,
  RANDOM_EVENTS,
  DEFAULT_ACHIEVEMENTS,
  DEFAULT_CHALLENGES,
} from './data/defaults';

import { createDefaultPlayer, MAX_STAT, MAX_ENERGY } from './utils/player';

import type { GameStore } from './store/types';

const PERIODS: Period[] = ['morning', 'lunch', 'afternoon', 'evening', 'night'];

export { STORY_CHAPTERS, canUnlockChapter, getCurrentScene };

function generateDailyChallenges() {
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

function pickRandomEvent(period: Period, semester: number) {
  const eligible = RANDOM_EVENTS.filter((e) => e.period.includes(period) && e.semester.includes(semester));
  if (eligible.length === 0) return null;
  const totalWeight = eligible.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * totalWeight;
  for (const event of eligible) {
    r -= event.weight;
    if (r <= 0) return event;
  }
  return eligible[0] ?? null;
}

function buildSkillTrees(): Record<SkillTreeId, import('@repo/types').SkillTree> {
  const record = {} as Record<SkillTreeId, import('@repo/types').SkillTree>;
  for (const tree of SKILL_TREES) {
    record[tree.id] = tree;
  }
  return record;
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

      // Atmosphere & Events
      atmosphere: getDefaultAtmosphere(),
      calendar: getCalendarForSemester(1),
      activeEvents: [],
      eventHistory: [],
      currentSeasonalTheme: undefined,

      // Friends
      friends: MOCK_FRIENDS,

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
          state.friends = MOCK_FRIENDS.map((f) => ({ ...f }));
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
          state.atmosphere = getDefaultAtmosphere();
          state.calendar = getCalendarForSemester(1);
          state.activeEvents = [];
          state.eventHistory = [];
          state.currentSeasonalTheme = undefined;
        });
      },

      advanceTime: () => {
        let event: import('@repo/types').RandomEvent | null = null;
        let unlockedNpcs: import('@repo/types').NPC[] = [];

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
          (Object.keys(changes) as Array<keyof import('@repo/types').Stats>).forEach((key) => {
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
        haptics.success();
      },

      spendCurrency: (cost) => {
        const { player } = get();
        if (player.currency.points < cost.points || player.currency.gems < cost.gems) {
          haptics.error();
          return false;
        }
        set((state) => {
          state.player.currency.points -= cost.points;
          state.player.currency.gems -= cost.gems;
        });
        haptics.medium();
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
            state.player.inventory.push(baseItem as import('@repo/types').RoomItem);
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
        haptics.success();
      },

      updateChallenge: (challengeId, value) => {
        let justCompleted = false;
        set((state) => {
          const challenge = state.challenges.find((c) => c.id === challengeId);
          if (!challenge || challenge.completed) return;
          challenge.currentValue = Math.min(challenge.targetValue, challenge.currentValue + value);
          if (challenge.currentValue >= challenge.targetValue) {
            challenge.completed = true;
            state.player.currency.points += challenge.reward.points;
            state.player.currency.gems += challenge.reward.gems;
            justCompleted = true;
          }
        });
        if (justCompleted) haptics.success();
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
        haptics.medium();
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
            (Object.entries(choice.effects.stats) as Array<[keyof import('@repo/types').Stats, number]>).forEach(([key, val]) => {
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
        const newlyUnlocked: import('@repo/types').Achievement[] = [];

        state.achievements.forEach((ach) => {
          if (ach.unlocked) return;
          let met = false;
          switch (ach.condition) {
            case 'stat_reached':
              if (ach.targetKey) {
                met = state.player.stats[ach.targetKey as keyof import('@repo/types').Stats] >= ach.targetValue;
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
        haptics.success();
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
          haptics.success();
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

        const reward = result.reward;
        if (!reward) {
          haptics.error();
          return { success: false, reward: null };
        }

        set((s) => {
          s.loginStreak = result.updatedStreak;
          if (reward.reward.points) {
            s.player.currency.points += reward.reward.points;
          }
          if (reward.reward.gems) {
            s.player.currency.gems += reward.reward.gems;
          }
          if (reward.reward.energy) {
            s.player.stats.energy = Math.min(MAX_ENERGY, s.player.stats.energy + reward.reward.energy);
          }
        });

        return { success: true, reward: reward };
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

      advanceToEvent: (eventId) => {
        set((state) => {
          const event = state.calendar
            .flatMap((entry) => entry.events)
            .find((e) => e.id === eventId);
          if (event) {
            state.activeEvents.push(event);
          }
        });
      },

      makeEventChoice: (eventId, choiceId) => {
        set((state) => {
          const event = state.activeEvents.find((e) => e.id === eventId);
          if (!event) return;
          const choice = event.choices.find((c) => c.id === choiceId);
          if (!choice) return;
          if (choice.effects.stats) {
            (Object.keys(choice.effects.stats) as Array<keyof import('@repo/types').Stats>).forEach((key) => {
              const val = choice.effects.stats![key] ?? 0;
              state.player.stats[key] = Math.max(0, Math.min(MAX_STAT, state.player.stats[key] + val));
            });
          }
          if (choice.effects.npcRelationships) {
            Object.entries(choice.effects.npcRelationships).forEach(([npcId, effects]) => {
              const npc = state.npcs.find((n) => n.id === npcId);
              if (npc) {
                if (effects.friendship) npc.relationship = Math.max(0, Math.min(100, npc.relationship + effects.friendship));
                if (effects.romance) npc.romance = Math.max(0, Math.min(100, npc.romance + effects.romance));
              }
            });
          }
          state.eventHistory.push({ eventId, choiceId, day: state.progress.day });
          state.activeEvents = state.activeEvents.filter((e) => e.id !== eventId);
        });
        haptics.medium();
      },

      getUpcomingEvents: (daysAhead) => {
        const state = get();
        const currentDay = state.progress.day;
        return state.calendar.filter(
          (entry) => entry.date.day >= currentDay && entry.date.day <= currentDay + daysAhead
        );
      },

      getCurrentAtmosphere: () => {
        return get().atmosphere;
      },

      triggerCrisisEvent: () => {
        const state = get();
        const crisis = generateRandomCrisis(state.atmosphere);
        if (crisis) {
          set((s) => {
            s.activeEvents.push(crisis);
          });
          haptics.warning();
        }
        return crisis;
      },

      applySeasonalTheme: () => {
        set((state) => {
          const theme = getCurrentSeasonalTheme(state.progress.semester, state.progress.day);
          state.currentSeasonalTheme = theme;
          if (theme) {
            state.atmosphere = applySeasonalModifiers(state.atmosphere, theme);
          }
        });
      },

      addFriend: (code) => {
        const state = get();
        const result = addFriendByCode(state.friends, code, MOCK_FRIENDS);
        if (result.success && result.friend) {
          set((s) => {
            s.friends.push(result.friend!);
          });
          haptics.success();
        }
        return result;
      },

      removeFriendById: (friendId) => {
        set((state) => {
          state.friends = removeFriend(state.friends, friendId);
        });
        haptics.medium();
      },

      sendGiftToFriend: (friendId, item) => {
        const state = get();
        const friend = state.friends.find((f) => f.id === friendId);
        if (!friend) return { success: false, remainingGifts: 0 };
        const result = sendGift(friend, item);
        set((s) => {
          const idx = s.friends.findIndex((f) => f.id === friendId);
          if (idx !== -1) s.friends[idx] = result.updatedFriend;
        });
        if (result.remainingGifts >= 0) haptics.success();
        return { success: true, remainingGifts: result.remainingGifts };
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

export { haptics, setHapticsEnabled, isHapticsEnabled } from './haptics';
export type { HapticType } from './haptics';
