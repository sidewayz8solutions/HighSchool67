import type {
  SkillTree,
  SkillTreeId,
  SkillNode,
  ActiveAbility,
  Player,
  Stats,
} from '@repo/types';

// ─── Constants ──────────────────────────────────────────────────────

const TREE_COLORS: Record<SkillTreeId, string> = {
  academics: '#3b82f6', // blue
  athletics: '#22c55e', // green
  creativity: '#a855f7', // purple
  popularity: '#ec4899', // pink
  rebellion: '#6b7280', // gray
};

const MAX_STAT = 100;
const SKILL_POINTS_PER_LEVEL = 2;

// ─── Helpers ────────────────────────────────────────────────────────

function nodeId(tree: SkillTreeId, branch: string, tier: number): string {
  return `${tree}_${branch}_t${tier}`;
}

function createNode(
  treeId: SkillTreeId,
  tier: 1 | 2 | 3 | 4,
  branch: 'left' | 'center' | 'right',
  name: string,
  description: string,
  icon: string,
  cost: number,
  requirements: SkillNode['requirements'],
  effects: SkillNode['effects']
): SkillNode {
  const id = nodeId(treeId, branch, tier);
  return {
    id,
    treeId,
    tier,
    branch,
    name,
    description,
    icon,
    cost,
    requirements,
    effects,
    unlocked: tier === 1,
    purchased: false,
  };
}

// ─── 5 Complete Skill Trees (12 nodes each: 3 branches x 4 tiers) ──

export const SKILL_TREES: SkillTree[] = [
  // ─── Academics (blue) ────────────────────────────────────────────
  {
    id: 'academics',
    name: 'Academics',
    color: TREE_COLORS.academics,
    icon: '📚',
    description: 'Master the art of learning. Study harder, retain more, bend the rules.',
    nodes: [
      // Branch 1: Study Efficiency
      createNode('academics', 1, 'left', 'Efficient Note-Taking', 'Gain +5% study efficiency', '📝', 1,
        { parentNodeIds: [] },
        { actionBonus: { study_efficiency: 1.05 } }),
      createNode('academics', 2, 'left', 'Speed Reader', 'Gain +10% study efficiency, unlock Speed Study action', '📖', 2,
        { parentNodeIds: ['academics_left_t1'] },
        { actionBonus: { study_efficiency: 1.10 }, unlockAction: 'speed_study' }),
      createNode('academics', 3, 'left', 'Photographic Memory', 'Gain +20% study efficiency. Active: Double study gains for 1 period', '🧠', 3,
        { parentNodeIds: ['academics_left_t2'] },
        { actionBonus: { study_efficiency: 1.20 }, unlockFeature: 'active_photographic_memory' }),
      createNode('academics', 4, 'left', 'Academic Prodigy', 'Gain +35% study efficiency. Unlock tutor-for-hire', '👨‍🏫', 5,
        { parentNodeIds: ['academics_left_t3'] },
        { actionBonus: { study_efficiency: 1.35 }, unlockFeature: 'tutor_for_hire' }),

      // Branch 2: Knowledge Retention
      createNode('academics', 1, 'center', 'Focused Mind', '+5 to max Academics cap', '🎯', 1,
        { parentNodeIds: [] },
        { statBonus: { academics: 5 } }),
      createNode('academics', 2, 'center', 'Deep Learning', '+10 to max Academics cap, permanent +5 Academics', '🔬', 2,
        { parentNodeIds: ['academics_center_t1'] },
        { statBonus: { academics: 10 } }),
      createNode('academics', 3, 'center', 'Renaissance Scholar', '+15 to max Academics cap. Active: Instantly complete any study action', '🏛️', 3,
        { parentNodeIds: ['academics_center_t2'] },
        { statBonus: { academics: 15 }, unlockFeature: 'active_instant_study' }),
      createNode('academics', 4, 'center', 'Omniscient', '+25 to max Academics cap. All stats gain +5', '🎓', 5,
        { parentNodeIds: ['academics_center_t3'] },
        { statBonus: { academics: 25, athletics: 5, creativity: 5, popularity: 5, rebellion: 5 } }),

      // Branch 3: Cheat Mastery
      createNode('academics', 1, 'right', 'Quick Glance', '+5% cheat success rate', '👁️', 1,
        { parentNodeIds: [] },
        { actionBonus: { cheat_success: 1.05 } }),
      createNode('academics', 2, 'right', 'Hidden Notes', '+10% cheat success, reduce cheat detection by 20%', '📋', 2,
        { parentNodeIds: ['academics_right_t1'] },
        { actionBonus: { cheat_success: 1.10, cheat_detection: 0.80 } }),
      createNode('academics', 3, 'right', 'Master of Deception', '+20% cheat success. Active: Guarantee next cheat succeeds', '🎭', 3,
        { parentNodeIds: ['academics_right_t2'] },
        { actionBonus: { cheat_success: 1.20 }, unlockFeature: 'active_guaranteed_cheat' }),
      createNode('academics', 4, 'right', 'The Perfect Heist', '+35% cheat success. Unlock steal exam answers', '🕵️', 5,
        { parentNodeIds: ['academics_right_t3'] },
        { actionBonus: { cheat_success: 1.35 }, unlockFeature: 'steal_exam_answers' }),
    ],
  },

  // ─── Athletics (green) ────────────────────────────────────────────
  {
    id: 'athletics',
    name: 'Athletics',
    color: TREE_COLORS.athletics,
    icon: '🏆',
    description: 'Push your body to the limit. Build endurance, power, and technique.',
    nodes: [
      // Branch 1: Endurance
      createNode('athletics', 1, 'left', 'Morning Runner', 'Energy drains 5% slower', '🏃', 1,
        { parentNodeIds: [] },
        { actionBonus: { energy_drain: 0.95 } }),
      createNode('athletics', 2, 'left', 'Marathon Trainee', 'Energy drains 10% slower, +5 max Energy', '🏃‍♂️', 2,
        { parentNodeIds: ['athletics_left_t1'] },
        { actionBonus: { energy_drain: 0.90 }, statBonus: { energy: 5 } }),
      createNode('athletics', 3, 'left', 'Iron Lungs', 'Energy drains 20% slower. Active: Refill 50% energy', '🫁', 3,
        { parentNodeIds: ['athletics_left_t2'] },
        { actionBonus: { energy_drain: 0.80 }, unlockFeature: 'active_second_wind' }),
      createNode('athletics', 4, 'left', 'Unstoppable Force', 'Energy drains 35% slower. +15 max Energy', '💪', 5,
        { parentNodeIds: ['athletics_left_t3'] },
        { actionBonus: { energy_drain: 0.65 }, statBonus: { energy: 15 } }),

      // Branch 2: Power
      createNode('athletics', 1, 'center', 'Weight Lifter', '+5% athletics training efficiency', '🏋️', 1,
        { parentNodeIds: [] },
        { actionBonus: { athletics_training: 1.05 } }),
      createNode('athletics', 2, 'center', 'Power Builder', '+10% athletics training, +5 Athletics stat', '🏋️‍♂️', 2,
        { parentNodeIds: ['athletics_center_t1'] },
        { actionBonus: { athletics_training: 1.10 }, statBonus: { athletics: 5 } }),
      createNode('athletics', 3, 'center', 'Adrenaline Rush', '+20% athletics training. Active: Double athletics gains for 1 period', '⚡', 3,
        { parentNodeIds: ['athletics_center_t2'] },
        { actionBonus: { athletics_training: 1.20 }, unlockFeature: 'active_adrenaline_rush' }),
      createNode('athletics', 4, 'center', 'Physical Apex', '+35% athletics training. All rival confrontations auto-win', '🥇', 5,
        { parentNodeIds: ['athletics_center_t3'] },
        { actionBonus: { athletics_training: 1.35 }, unlockFeature: 'auto_win_rivals' }),

      // Branch 3: Technique
      createNode('athletics', 1, 'right', 'Stretching Routine', '+5% minigame score multiplier', '🤸', 1,
        { parentNodeIds: [] },
        { actionBonus: { minigame_score: 1.05 } }),
      createNode('athletics', 2, 'right', 'Precision Training', '+10% minigame score, unlock Advanced Training', '🎯', 2,
        { parentNodeIds: ['athletics_right_t1'] },
        { actionBonus: { minigame_score: 1.10 }, unlockAction: 'advanced_training' }),
      createNode('athletics', 3, 'right', 'Flow State', '+20% minigame score. Active: Perfect accuracy in next minigame', '🌊', 3,
        { parentNodeIds: ['athletics_right_t2'] },
        { actionBonus: { minigame_score: 1.20 }, unlockFeature: 'active_flow_state' }),
      createNode('athletics', 4, 'right', 'Legendary Athlete', '+35% minigame score. Unlock Legendary Plays', '🏅', 5,
        { parentNodeIds: ['athletics_right_t3'] },
        { actionBonus: { minigame_score: 1.35 }, unlockFeature: 'legendary_plays' }),
    ],
  },

  // ─── Creativity (purple) ───────────────────────────────────────────
  {
    id: 'creativity',
    name: 'Creativity',
    color: TREE_COLORS.creativity,
    icon: '🎨',
    description: 'Unleash your imagination. Create art, innovate, and captivate audiences.',
    nodes: [
      // Branch 1: Artistry
      createNode('creativity', 1, 'left', 'Sketch Artist', '+5% art creation efficiency', '✏️', 1,
        { parentNodeIds: [] },
        { actionBonus: { art_efficiency: 1.05 } }),
      createNode('creativity', 2, 'left', 'Painter', '+10% art efficiency, unlock Canvas Work', '🖌️', 2,
        { parentNodeIds: ['creativity_left_t1'] },
        { actionBonus: { art_efficiency: 1.10 }, unlockAction: 'canvas_work' }),
      createNode('creativity', 3, 'left', 'Master Artisan', '+20% art efficiency. Active: Create masterpiece (triple gains)', '🖼️', 3,
        { parentNodeIds: ['creativity_left_t2'] },
        { actionBonus: { art_efficiency: 1.20 }, unlockFeature: 'active_masterpiece' }),
      createNode('creativity', 4, 'left', 'Visionary', '+35% art efficiency. All created art is auto-exhibited', '🎭', 5,
        { parentNodeIds: ['creativity_left_t3'] },
        { actionBonus: { art_efficiency: 1.35 }, unlockFeature: 'auto_exhibit' }),

      // Branch 2: Innovation
      createNode('creativity', 1, 'center', 'Tinkerer', '+5% crafting success rate', '🔧', 1,
        { parentNodeIds: [] },
        { actionBonus: { crafting_success: 1.05 } }),
      createNode('creativity', 2, 'center', 'Inventor', '+10% crafting success, +5 Creativity stat', '💡', 2,
        { parentNodeIds: ['creativity_center_t1'] },
        { actionBonus: { crafting_success: 1.10 }, statBonus: { creativity: 5 } }),
      createNode('creativity', 3, 'center', 'Mad Genius', '+20% crafting success. Active: Invent double items', '🧪', 3,
        { parentNodeIds: ['creativity_center_t2'] },
        { actionBonus: { crafting_success: 1.20 }, unlockFeature: 'active_double_invent' }),
      createNode('creativity', 4, 'center', 'Renaissance Inventor', '+35% crafting success. Unlock legendary recipes', '⚗️', 5,
        { parentNodeIds: ['creativity_center_t3'] },
        { actionBonus: { crafting_success: 1.35 }, unlockFeature: 'legendary_recipes' }),

      // Branch 3: Performance
      createNode('creativity', 1, 'right', 'Street Performer', '+5% social performance gains', '🎤', 1,
        { parentNodeIds: [] },
        { actionBonus: { performance_gain: 1.05 } }),
      createNode('creativity', 2, 'right', 'Crowd Pleaser', '+10% performance gains, +3 Popularity per performance', '🎸', 2,
        { parentNodeIds: ['creativity_right_t1'] },
        { actionBonus: { performance_gain: 1.10 }, statBonus: { popularity: 3 } }),
      createNode('creativity', 3, 'right', 'Star Quality', '+20% performance gains. Active: Instant max popularity at location', '⭐', 3,
        { parentNodeIds: ['creativity_right_t2'] },
        { actionBonus: { performance_gain: 1.20 }, unlockFeature: 'active_star_quality' }),
      createNode('creativity', 4, 'right', 'Cult Icon', '+35% performance gains. Unlock underground venue', '🌟', 5,
        { parentNodeIds: ['creativity_right_t3'] },
        { actionBonus: { performance_gain: 1.35 }, unlockFeature: 'underground_venue' }),
    ],
  },

  // ─── Popularity (pink) ────────────────────────────────────────────
  {
    id: 'popularity',
    name: 'Popularity',
    color: TREE_COLORS.popularity,
    icon: '✨',
    description: 'Rule the social landscape. Charm, connect, and dominate the scene.',
    nodes: [
      // Branch 1: Charisma
      createNode('popularity', 1, 'left', 'Smooth Talker', '+5% social interaction efficiency', '💬', 1,
        { parentNodeIds: [] },
        { actionBonus: { social_efficiency: 1.05 } }),
      createNode('popularity', 2, 'left', 'Flirt Expert', '+10% social efficiency, +5% romance gain', '💋', 2,
        { parentNodeIds: ['popularity_left_t1'] },
        { actionBonus: { social_efficiency: 1.10, romance_gain: 1.05 } }),
      createNode('popularity', 3, 'left', 'Social Magnet', '+20% social efficiency. Active: Everyone in location becomes friend', '🧲', 3,
        { parentNodeIds: ['popularity_left_t2'] },
        { actionBonus: { social_efficiency: 1.20 }, unlockFeature: 'active_social_magnet' }),
      createNode('popularity', 4, 'left', 'Beloved Icon', '+35% social efficiency. All NPCs start with +20 friendship', '💖', 5,
        { parentNodeIds: ['popularity_left_t3'] },
        { actionBonus: { social_efficiency: 1.35 }, unlockFeature: 'beloved_icon' }),

      // Branch 2: Social Network
      createNode('popularity', 1, 'center', 'Networker', '+3% all currency gains', '📱', 1,
        { parentNodeIds: [] },
        { actionBonus: { currency_gain: 1.03 } }),
      createNode('popularity', 2, 'center', 'Influencer', '+6% currency gains, +5 Popularity', '📲', 2,
        { parentNodeIds: ['popularity_center_t1'] },
        { actionBonus: { currency_gain: 1.06 }, statBonus: { popularity: 5 } }),
      createNode('popularity', 3, 'center', 'Trendsetter', '+12% currency gains. Active: Double next currency reward', '📈', 3,
        { parentNodeIds: ['popularity_center_t2'] },
        { actionBonus: { currency_gain: 1.12 }, unlockFeature: 'active_double_currency' }),
      createNode('popularity', 4, 'center', 'Social Empire', '+25% currency gains. Daily passive income based on popularity', '👑', 5,
        { parentNodeIds: ['popularity_center_t3'] },
        { actionBonus: { currency_gain: 1.25 }, unlockFeature: 'passive_popularity_income' }),

      // Branch 3: Influence
      createNode('popularity', 1, 'right', 'Persuasive', '+5% reputation gain, -5% reputation loss', '🗣️', 1,
        { parentNodeIds: [] },
        { actionBonus: { reputation_gain: 1.05, reputation_loss: 0.95 } }),
      createNode('popularity', 2, 'right', 'Dealmaker', '+10% reputation gain, unlock Trade Favors', '🤝', 2,
        { parentNodeIds: ['popularity_right_t1'] },
        { actionBonus: { reputation_gain: 1.10 }, unlockAction: 'trade_favors' }),
      createNode('popularity', 3, 'right', 'Power Broker', '+20% reputation gain. Active: Force any NPC to agree', '⚖️', 3,
        { parentNodeIds: ['popularity_right_t2'] },
        { actionBonus: { reputation_gain: 1.20 }, unlockFeature: 'active_power_broker' }),
      createNode('popularity', 4, 'right', 'Kingpin', '+35% reputation gain. Control school elections and events', '🎪', 5,
        { parentNodeIds: ['popularity_right_t3'] },
        { actionBonus: { reputation_gain: 1.35 }, unlockFeature: 'control_elections' }),
    ],
  },

  // ─── Rebellion (gray) ─────────────────────────────────────────────
  {
    id: 'rebellion',
    name: 'Rebellion',
    color: TREE_COLORS.rebellion,
    icon: '🔥',
    description: 'Break the rules. Sneak, disrupt, and survive on the edge.',
    nodes: [
      // Branch 1: Stealth
      createNode('rebellion', 1, 'left', 'Light Footsteps', '-5% chance of being caught', '🐾', 1,
        { parentNodeIds: [] },
        { actionBonus: { detection_chance: 0.95 } }),
      createNode('rebellion', 2, 'left', 'Shadow Walker', '-10% detection, unlock Sneak action', '🌑', 2,
        { parentNodeIds: ['rebellion_left_t1'] },
        { actionBonus: { detection_chance: 0.90 }, unlockAction: 'sneak' }),
      createNode('rebellion', 3, 'left', 'Ghost', '-20% detection. Active: Become invisible for 1 period', '👻', 3,
        { parentNodeIds: ['rebellion_left_t2'] },
        { actionBonus: { detection_chance: 0.80 }, unlockFeature: 'active_ghost_mode' }),
      createNode('rebellion', 4, 'left', 'Phantom', '-35% detection. Access forbidden areas anytime', '🌫️', 5,
        { parentNodeIds: ['rebellion_left_t3'] },
        { actionBonus: { detection_chance: 0.65 }, unlockFeature: 'forbidden_areas' }),

      // Branch 2: Disruption
      createNode('rebellion', 1, 'center', 'Prankster', '+5% prank success rate', '🎈', 1,
        { parentNodeIds: [] },
        { actionBonus: { prank_success: 1.05 } }),
      createNode('rebellion', 2, 'center', 'Chaos Agent', '+10% prank success, +5 Rebellion stat', '💣', 2,
        { parentNodeIds: ['rebellion_center_t1'] },
        { actionBonus: { prank_success: 1.10 }, statBonus: { rebellion: 5 } }),
      createNode('rebellion', 3, 'center', 'Master Prankster', '+20% prank success. Active: School-wide prank event', '🎪', 3,
        { parentNodeIds: ['rebellion_center_t2'] },
        { actionBonus: { prank_success: 1.20 }, unlockFeature: 'active_school_prank' }),
      createNode('rebellion', 4, 'center', 'Chaos Incarnate', '+35% prank success. Control the chaos meter', '🔥', 5,
        { parentNodeIds: ['rebellion_center_t3'] },
        { actionBonus: { prank_success: 1.35 }, unlockFeature: 'chaos_meter_control' }),

      // Branch 3: Street Smarts
      createNode('rebellion', 1, 'right', 'Hustler', '+5% better shop prices', '💰', 1,
        { parentNodeIds: [] },
        { actionBonus: { shop_discount: 1.05 } }),
      createNode('rebellion', 2, 'right', 'Negotiator', '+10% shop discount, unlock Black Market', '🤜', 2,
        { parentNodeIds: ['rebellion_right_t1'] },
        { actionBonus: { shop_discount: 1.10 }, unlockFeature: 'black_market' }),
      createNode('rebellion', 3, 'right', 'Fixer', '+20% shop discount. Active: Free item from any shop', '🧰', 3,
        { parentNodeIds: ['rebellion_right_t2'] },
        { actionBonus: { shop_discount: 1.20 }, unlockFeature: 'active_free_item' }),
      createNode('rebellion', 4, 'right', 'Underground King', '+35% shop discount. Run your own operations', '🏴', 5,
        { parentNodeIds: ['rebellion_right_t3'] },
        { actionBonus: { shop_discount: 1.35 }, unlockFeature: 'underground_operations' }),
    ],
  },
];

// ─── Active Abilities ───────────────────────────────────────────────

export const ACTIVE_ABILITIES: ActiveAbility[] = [
  // Academics
  { id: 'ability_photographic_memory', name: 'Photographic Memory', description: 'Double study gains for the current period', icon: '🧠', cooldownPeriods: 3, currentCooldown: 0, effect: 'double_study', unlocked: false, relatedNodeId: 'academics_left_t3', treeId: 'academics' },
  { id: 'ability_instant_study', name: 'Instant Study', description: 'Instantly complete any ongoing study action', icon: '⚡', cooldownPeriods: 4, currentCooldown: 0, effect: 'instant_study', unlocked: false, relatedNodeId: 'academics_center_t3', treeId: 'academics' },
  { id: 'ability_guaranteed_cheat', name: 'Perfect Cheat', description: 'Your next cheat attempt is guaranteed to succeed', icon: '✅', cooldownPeriods: 3, currentCooldown: 0, effect: 'guaranteed_cheat', unlocked: false, relatedNodeId: 'academics_right_t3', treeId: 'academics' },

  // Athletics
  { id: 'ability_second_wind', name: 'Second Wind', description: 'Refill 50% of your energy instantly', icon: '💨', cooldownPeriods: 3, currentCooldown: 0, effect: 'refill_energy_half', unlocked: false, relatedNodeId: 'athletics_left_t3', treeId: 'athletics' },
  { id: 'ability_adrenaline_rush', name: 'Adrenaline Rush', description: 'Double athletics gains for 1 period', icon: '🔥', cooldownPeriods: 3, currentCooldown: 0, effect: 'double_athletics', unlocked: false, relatedNodeId: 'athletics_center_t3', treeId: 'athletics' },
  { id: 'ability_flow_state', name: 'Flow State', description: 'Perfect accuracy in your next minigame', icon: '🎯', cooldownPeriods: 4, currentCooldown: 0, effect: 'perfect_minigame', unlocked: false, relatedNodeId: 'athletics_right_t3', treeId: 'athletics' },

  // Creativity
  { id: 'ability_masterpiece', name: 'Create Masterpiece', description: 'Your next art creation gives triple gains', icon: '🖼️', cooldownPeriods: 3, currentCooldown: 0, effect: 'triple_art', unlocked: false, relatedNodeId: 'creativity_left_t3', treeId: 'creativity' },
  { id: 'ability_double_invent', name: 'Double Invent', description: 'Your next invention creates double items', icon: '⚗️', cooldownPeriods: 4, currentCooldown: 0, effect: 'double_invent', unlocked: false, relatedNodeId: 'creativity_center_t3', treeId: 'creativity' },
  { id: 'ability_star_quality', name: 'Star Quality', description: 'Max out popularity at your current location', icon: '⭐', cooldownPeriods: 4, currentCooldown: 0, effect: 'max_location_popularity', unlocked: false, relatedNodeId: 'creativity_right_t3', treeId: 'creativity' },

  // Popularity
  { id: 'ability_social_magnet', name: 'Social Magnet', description: 'Everyone in your location becomes your friend', icon: '🧲', cooldownPeriods: 4, currentCooldown: 0, effect: 'location_friendship', unlocked: false, relatedNodeId: 'popularity_left_t3', treeId: 'popularity' },
  { id: 'ability_double_currency', name: 'Double or Nothing', description: 'Double your next currency reward', icon: '💰', cooldownPeriods: 3, currentCooldown: 0, effect: 'double_currency', unlocked: false, relatedNodeId: 'popularity_center_t3', treeId: 'popularity' },
  { id: 'ability_power_broker', name: 'Power Broker', description: 'Force any NPC to agree to your request', icon: '⚖️', cooldownPeriods: 5, currentCooldown: 0, effect: 'force_agree', unlocked: false, relatedNodeId: 'popularity_right_t3', treeId: 'popularity' },

  // Rebellion
  { id: 'ability_ghost_mode', name: 'Ghost Mode', description: 'Become invisible for 1 period. No detection possible', icon: '👻', cooldownPeriods: 4, currentCooldown: 0, effect: 'invisibility', unlocked: false, relatedNodeId: 'rebellion_left_t3', treeId: 'rebellion' },
  { id: 'ability_school_prank', name: 'School-wide Prank', description: 'Trigger a school-wide prank event for massive gains', icon: '🎪', cooldownPeriods: 5, currentCooldown: 0, effect: 'school_prank', unlocked: false, relatedNodeId: 'rebellion_center_t3', treeId: 'rebellion' },
  { id: 'ability_free_item', name: 'Five Finger Discount', description: 'Get a free item from any shop', icon: '🛍️', cooldownPeriods: 5, currentCooldown: 0, effect: 'free_shop_item', unlocked: false, relatedNodeId: 'rebellion_right_t3', treeId: 'rebellion' },
];

// ─── Functions ──────────────────────────────────────────────────────

/**
 * Calculate how many skill points a player has available.
 * Based on player level (derived from total stats + semester).
 */
export function getSkillPointsAvailable(player: Player): number {
  const totalStats = Object.values(player.stats).reduce((s, v) => s + v, 0);
  const semesterBonus = (player as any).progress?.semester ?? 1 * 5;
  const level = Math.floor(totalStats / 50) + semesterBonus;
  const totalEarned = level * SKILL_POINTS_PER_LEVEL;
  // Purchased points are tracked on the player object
  const purchased = (player as any).purchasedSkillNodeCount ?? 0;
  return Math.max(0, totalEarned - purchased);
}

/**
 * Check if a node can be purchased by the player.
 */
export function canPurchaseNode(
  node: SkillNode,
  purchasedNodes: string[],
  player: Player,
): boolean {
  if (node.purchased) return false;

  // Check parent prerequisites
  const parentsMet = node.requirements.parentNodeIds.every((pid) =>
    purchasedNodes.includes(pid)
  );
  if (!parentsMet) return false;

  // Check minimum stat requirement
  if (node.requirements.minStat) {
    const statKey = node.treeId as keyof Stats;
    if (player.stats[statKey] < node.requirements.minStat) return false;
  }

  // Check minimum semester
  if (node.requirements.minSemester) {
    const semester = (player as any).progress?.semester ?? 1;
    if (semester < node.requirements.minSemester) return false;
  }

  // Check skill points
  const availablePoints = getSkillPointsAvailable(player);
  if (availablePoints < node.cost) return false;

  return true;
}

/**
 * Purchase a skill node. Returns the updated node.
 */
export function purchaseNode(
  nodeId: string,
  treeId: SkillTreeId,
  allNodes: SkillNode[] = getAllNodes(),
): SkillNode {
  const node = allNodes.find((n) => n.id === nodeId && n.treeId === treeId);
  if (!node) {
    throw new Error(`Node ${nodeId} not found in tree ${treeId}`);
  }

  const updated: SkillNode = {
    ...node,
    purchased: true,
    unlocked: true,
  };

  return updated;
}

/**
 * Get all nodes across all skill trees as a flat array.
 */
export function getAllNodes(): SkillNode[] {
  return SKILL_TREES.flatMap((tree) => tree.nodes);
}

/**
 * Get active abilities that are unlocked based on purchased nodes.
 */
export function getActiveAbilities(purchasedNodes: string[]): ActiveAbility[] {
  return ACTIVE_ABILITIES.map((ability) => {
    const unlocked = purchasedNodes.includes(ability.relatedNodeId);
    return {
      ...ability,
      unlocked,
      // Reset cooldown when ability becomes unlocked
      currentCooldown: unlocked ? ability.currentCooldown : 0,
    };
  });
}

/**
 * Apply all passive skill effects from purchased nodes to base stats.
 */
export function applySkillEffects(
  purchasedNodes: string[],
  baseStats: Stats,
): Stats {
  const allNodes = getAllNodes();
  const purchased = allNodes.filter((n) => purchasedNodes.includes(n.id));

  const result: Stats = { ...baseStats };

  // Apply stat bonuses additively (but cap at MAX_STAT)
  for (const node of purchased) {
    if (node.effects.statBonus) {
      for (const [key, val] of Object.entries(node.effects.statBonus)) {
        if (val && key in result) {
          (result as any)[key] = Math.min(MAX_STAT, (result as any)[key] + val);
        }
      }
    }
  }

  return result;
}

/**
 * Get action multipliers from purchased skill nodes.
 */
export function getActionBonuses(
  purchasedNodes: string[],
): Record<string, number> {
  const allNodes = getAllNodes();
  const purchased = allNodes.filter((n) => purchasedNodes.includes(n.id));

  const bonuses: Record<string, number> = {};

  for (const node of purchased) {
    if (node.effects.actionBonus) {
      for (const [key, val] of Object.entries(node.effects.actionBonus)) {
        if (val) {
          bonuses[key] = (bonuses[key] ?? 1) * val;
        }
      }
    }
  }

  return bonuses;
}

/**
 * Use an active ability by ID. Returns result and updated ability state.
 */
export function useActiveAbility(
  abilityId: string,
  purchasedNodes: string[],
  currentAbilities: ActiveAbility[] = getActiveAbilities(purchasedNodes),
): { success: boolean; message: string; updatedAbilities: ActiveAbility[] } {
  const abilityIndex = currentAbilities.findIndex((a) => a.id === abilityId);
  if (abilityIndex === -1) {
    return { success: false, message: 'Ability not found', updatedAbilities: currentAbilities };
  }

  const ability = currentAbilities[abilityIndex]!;
  if (!ability.unlocked) {
    return { success: false, message: 'Ability is locked', updatedAbilities: currentAbilities };
  }
  if (ability.currentCooldown > 0) {
    return { success: false, message: `Ability on cooldown for ${ability.currentCooldown} more periods`, updatedAbilities: currentAbilities };
  }

  const updated = currentAbilities.map((a, i) =>
    i === abilityIndex ? { ...a, currentCooldown: a.cooldownPeriods } : a
  );

  const effectDescriptions: Record<string, string> = {
    double_study: 'Study gains doubled for this period!',
    instant_study: 'Study action completed instantly!',
    guaranteed_cheat: 'Your next cheat is guaranteed to succeed!',
    refill_energy_half: '50% energy restored!',
    double_athletics: 'Athletics gains doubled for this period!',
    perfect_minigame: 'Perfect accuracy in your next minigame!',
    triple_art: 'Next art creation gives triple gains!',
    double_invent: 'Next invention creates double items!',
    max_location_popularity: 'Popularity maxed at current location!',
    location_friendship: 'Everyone at your location is now your friend!',
    double_currency: 'Your next currency reward will be doubled!',
    force_agree: 'NPC will agree to your next request!',
    invisibility: 'You are invisible for 1 period!',
    school_prank: 'School-wide prank triggered!',
    free_shop_item: 'Your next shop item is free!',
  };

  return {
    success: true,
    message: effectDescriptions[ability.effect] ?? `Used ${ability.name}!`,
    updatedAbilities: updated,
  };
}

/**
 * Decrement cooldowns on all active abilities by 1 period.
 */
export function tickAbilityCooldowns(abilities: ActiveAbility[]): ActiveAbility[] {
  return abilities.map((a) => ({
    ...a,
    currentCooldown: Math.max(0, a.currentCooldown - 1),
  }));
}

/**
 * Get completion progress for a skill tree.
 */
export function getSkillTreeProgress(
  treeId: SkillTreeId,
  purchasedNodes: string[],
): { total: number; purchased: number; percentage: number } {
  const tree = SKILL_TREES.find((t) => t.id === treeId);
  if (!tree) return { total: 0, purchased: 0, percentage: 0 };

  const total = tree.nodes.length;
  const purchased = tree.nodes.filter((n) => purchasedNodes.includes(n.id)).length;
  const percentage = Math.round((purchased / total) * 100);

  return { total, purchased, percentage };
}

/**
 * Get the tree data with node unlock/purchase state applied.
 */
export function getTreeWithState(
  treeId: SkillTreeId,
  purchasedNodes: string[],
  player: Player,
): SkillTree {
  const tree = SKILL_TREES.find((t) => t.id === treeId);
  if (!tree) throw new Error(`Tree ${treeId} not found`);

  const nodes = tree.nodes.map((node) => {
    const isPurchased = purchasedNodes.includes(node.id);

    // Determine if node is unlocked: either purchased, or has all parents purchased
    // Tier 1 nodes are always unlocked
    let isUnlocked = node.tier === 1;
    if (!isUnlocked) {
      isUnlocked = node.requirements.parentNodeIds.every((pid) =>
        purchasedNodes.includes(pid)
      );
    }

    // Additional stat/semester checks for display
    const meetsRequirements = (() => {
      if (node.requirements.minStat) {
        const statKey = node.treeId as keyof Stats;
        if (player.stats[statKey] < node.requirements.minStat) return false;
      }
      if (node.requirements.minSemester) {
        const semester = (player as any).progress?.semester ?? 1;
        if (semester < node.requirements.minSemester) return false;
      }
      return true;
    })();

    return {
      ...node,
      purchased: isPurchased,
      unlocked: isUnlocked && meetsRequirements,
    };
  });

  return { ...tree, nodes };
}

/**
 * Get total skill points earned based on player state.
 */
export function getTotalSkillPoints(player: Player): number {
  const totalStats = Object.values(player.stats).reduce((s, v) => s + v, 0);
  const semesterBonus = ((player as any).progress?.semester ?? 1) * 5;
  const level = Math.floor(totalStats / 50) + semesterBonus;
  return level * SKILL_POINTS_PER_LEVEL;
}
