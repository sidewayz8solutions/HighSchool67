import type { Player, Stats, Clique, AvatarConfig } from '@repo/types';

export const MAX_STAT = 100;
export const MAX_ENERGY = 100;

const DEFAULT_AVATAR = {
  gender: 'nonbinary' as const,
  skinTone: '#d4a373',
  hairStyle: 0,
  hairColor: '#0a0a0a',
  eyeColor: '#3b6e28',
  outfit: 0,
  accessory: 0,
};

export function createDefaultPlayer(name: string, clique: Clique, avatarConfig?: Partial<AvatarConfig>): Player {
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
