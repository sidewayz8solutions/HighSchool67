export type SkillTreeId = 'academics' | 'athletics' | 'creativity' | 'popularity' | 'rebellion';

export interface SkillNode {
  id: string;
  treeId: SkillTreeId;
  tier: 1 | 2 | 3 | 4;
  branch: 'left' | 'center' | 'right';
  name: string;
  description: string;
  icon: string;
  cost: number; // skill points
  requirements: {
    parentNodeIds: string[];
    minStat?: number;
    minSemester?: number;
  };
  effects: {
    statBonus?: Partial<Record<string, number>>;
    actionBonus?: Partial<Record<string, number>>; // e.g., study_efficiency: 1.5
    unlockAction?: string;
    unlockFeature?: string;
  };
  unlocked: boolean;
  purchased: boolean;
}

export interface SkillTree {
  id: SkillTreeId;
  name: string;
  color: string;
  icon: string;
  description: string;
  nodes: SkillNode[];
}

export interface ActiveAbility {
  id: string;
  name: string;
  description: string;
  icon: string;
  cooldownPeriods: number;
  currentCooldown: number;
  effect: string;
  unlocked: boolean;
  relatedNodeId: string;
  treeId: SkillTreeId;
}

export interface CareerMilestone {
  id: string;
  name: string;
  description: string;
  requirement: {
    stat: string;
    value: number;
  };
  reward: {
    title: string;
    currency?: { points?: number; gems?: number };
    unlockFeature?: string;
  };
  completed: boolean;
  completedAt?: string;
}

export interface CareerPath {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirements: {
    dominantStat: string;
    minValue: number;
    secondaryStat?: string;
    secondaryMin?: number;
  };
  milestones: CareerMilestone[];
  currentMilestone: number;
}

export interface CareerProgress {
  careerId: string;
  currentMilestone: number;
  milestonesCompleted: string[];
  startedAt: string;
}

export interface DailyReward {
  day: number; // 1-7
  reward: {
    points?: number;
    gems?: number;
    energy?: number;
    itemId?: string;
  };
  claimed: boolean;
  isBonus?: boolean; // day 7 is bonus
}

export interface LoginStreak {
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string; // ISO date
  dailyRewards: DailyReward[];
  streakProtectionUsed: boolean;
  monthlyBonusClaimed: boolean;
}
