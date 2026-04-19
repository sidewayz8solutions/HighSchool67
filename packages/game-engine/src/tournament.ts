import type { NPCVisualConfig } from '@repo/types';

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  name: string;
  score: number;
  avatarConfig: NPCVisualConfig;
  date: string;
  isPlayer?: boolean;
}

export interface TournamentReward {
  rankMin: number;
  rankMax: number;
  points: number;
  gems: number;
  itemId?: string;
  itemName?: string;
}

export type TournamentStatus = 'upcoming' | 'active' | 'completed';

export interface Tournament {
  id: string;
  name: string;
  gameType: string;
  startTime: string;
  endTime: string;
  status: TournamentStatus;
  entries: LeaderboardEntry[];
  rewards: TournamentReward[];
}

export const GAME_TYPES = [
  'Math Blitz',
  'Memory Match',
  'Dance Battle',
  'Art Studio',
  'Football Toss',
  'Word Puzzle',
  'Rhythm Game',
  'Trivia Challenge',
  'Speed Run',
  'Photo Hunt',
] as const;

export const LEADERBOARD_NPCS: LeaderboardEntry[] = [
  {
    rank: 1,
    playerId: 'npc_kai',
    name: 'Kai',
    score: 9850,
    avatarConfig: { seed: 'kai', hair: ['long21'], hairColor: '#dba3be', skinColor: '#f2d3b1' },
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    rank: 2,
    playerId: 'npc_dexter',
    name: 'Dexter',
    score: 8720,
    avatarConfig: { seed: 'dexter', hair: ['short01'], hairColor: '#0e0e0e', skinColor: '#ecad80' },
    date: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    rank: 3,
    playerId: 'npc_britney',
    name: 'Britney',
    score: 8100,
    avatarConfig: { seed: 'britney', hair: ['long01'], hairColor: '#e5d7a3', skinColor: '#f2d3b1' },
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    rank: 4,
    playerId: 'npc_tyler',
    name: 'Tyler',
    score: 7650,
    avatarConfig: { seed: 'tyler', hair: ['short08'], hairColor: '#ac6511', skinColor: '#f2d3b1' },
    date: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    rank: 5,
    playerId: 'npc_chad',
    name: 'Chad',
    score: 7200,
    avatarConfig: { seed: 'chad', hair: ['short05'], hairColor: '#e5d7a3', skinColor: '#f2d3b1' },
    date: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    rank: 6,
    playerId: 'npc_amber',
    name: 'Amber',
    score: 6800,
    avatarConfig: { seed: 'amber', hair: ['long19'], hairColor: '#cb6820', skinColor: '#f2d3b1' },
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    rank: 7,
    playerId: 'npc_leo',
    name: 'Leo',
    score: 6450,
    avatarConfig: { seed: 'leo', hair: ['short03'], hairColor: '#562306', skinColor: '#ecad80' },
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    rank: 8,
    playerId: 'npc_skyler',
    name: 'Skyler',
    score: 5900,
    avatarConfig: { seed: 'skyler', hair: ['long06'], hairColor: '#afafaf', skinColor: '#f2d3b1' },
    date: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    rank: 9,
    playerId: 'npc_zoe',
    name: 'Zoe',
    score: 5400,
    avatarConfig: { seed: 'zoe', hair: ['long22'], hairColor: '#3eac2c', skinColor: '#ecad80' },
    date: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    rank: 10,
    playerId: 'npc_maya',
    name: 'Maya',
    score: 5100,
    avatarConfig: { seed: 'maya', hair: ['long25'], hairColor: '#0e0e0e', skinColor: '#f2d3b1' },
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

const DEFAULT_REWARDS: TournamentReward[] = [
  { rankMin: 1, rankMax: 1, points: 500, gems: 50, itemName: 'Trophy of Legends' },
  { rankMin: 2, rankMax: 3, points: 350, gems: 30, itemName: 'Silver Medal' },
  { rankMin: 4, rankMax: 10, points: 200, gems: 15, itemName: 'Bronze Medal' },
  { rankMin: 11, rankMax: 50, points: 100, gems: 5 },
  { rankMin: 51, rankMax: 100, points: 50, gems: 2 },
  { rankMin: 101, rankMax: 999999, points: 25, gems: 1 },
];

function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getWeekEnd(): Date {
  const start = getWeekStart();
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function getWeeklyTournament(gameType: string): Tournament {
  const startTime = getWeekStart().toISOString();
  const endTime = getWeekEnd().toISOString();
  const now = new Date().toISOString();

  let status: TournamentStatus = 'active';
  if (now < startTime) status = 'upcoming';
  else if (now > endTime) status = 'completed';

  return {
    id: `tour_${gameType.toLowerCase().replace(/\s+/g, '_')}_${getWeekStart().toISOString().split('T')[0]}`,
    name: `${gameType} Weekly Challenge`,
    gameType,
    startTime,
    endTime,
    status,
    entries: LEADERBOARD_NPCS.map((n) => ({ ...n })),
    rewards: [...DEFAULT_REWARDS],
  };
}

export function submitScore(
  tournament: Tournament,
  playerId: string,
  name: string,
  score: number,
  avatarConfig?: NPCVisualConfig
): Tournament {
  const existingIndex = tournament.entries.findIndex((e) => e.playerId === playerId);

  const newEntry: LeaderboardEntry = {
    rank: 0,
    playerId,
    name,
    score,
    avatarConfig: avatarConfig ?? { seed: name, hair: ['short01'], hairColor: '#0e0e0e', skinColor: '#f5d0b5' },
    date: new Date().toISOString(),
    isPlayer: true,
  };

  let updatedEntries: LeaderboardEntry[];

  if (existingIndex >= 0) {
    const existing = tournament.entries[existingIndex];
    if (score > existing.score) {
      updatedEntries = [...tournament.entries];
      updatedEntries[existingIndex] = { ...newEntry, score };
    } else {
      updatedEntries = [...tournament.entries];
    }
  } else {
    updatedEntries = [...tournament.entries, newEntry];
  }

  updatedEntries.sort((a, b) => b.score - a.score);
  updatedEntries = updatedEntries.map((e, i) => ({ ...e, rank: i + 1 }));

  return {
    ...tournament,
    entries: updatedEntries,
  };
}

export function getPlayerRank(tournament: Tournament, playerId: string): number {
  const entry = tournament.entries.find((e) => e.playerId === playerId);
  return entry?.rank ?? -1;
}

export function getRewardsForRank(tournament: Tournament, rank: number): TournamentReward {
  const reward = tournament.rewards.find((r) => rank >= r.rankMin && rank <= r.rankMax);
  return reward ?? { rankMin: 999999, rankMax: 999999, points: 0, gems: 0 };
}

export function getActiveTournaments(): Tournament[] {
  return GAME_TYPES.map((gameType) => getWeeklyTournament(gameType)).filter(
    (t) => t.status === 'active' || t.status === 'upcoming'
  );
}

export function getLeaderboard(gameType: string): LeaderboardEntry[] {
  const tournament = getWeeklyTournament(gameType);
  return tournament.entries;
}

export function formatCountdown(targetDate: string): string {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const diff = Math.max(0, target - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

export function getTournamentHistory(): Array<{
  id: string;
  name: string;
  gameType: string;
  endTime: string;
  finalRank: number;
  score: number;
}> {
  return [
    {
      id: 'hist_1',
      name: 'Math Blitz Weekly Challenge',
      gameType: 'Math Blitz',
      endTime: new Date(Date.now() - 86400000 * 7).toISOString(),
      finalRank: 4,
      score: 7800,
    },
    {
      id: 'hist_2',
      name: 'Dance Battle Weekly Challenge',
      gameType: 'Dance Battle',
      endTime: new Date(Date.now() - 86400000 * 14).toISOString(),
      finalRank: 7,
      score: 6200,
    },
    {
      id: 'hist_3',
      name: 'Memory Match Weekly Challenge',
      gameType: 'Memory Match',
      endTime: new Date(Date.now() - 86400000 * 21).toISOString(),
      finalRank: 2,
      score: 9100,
    },
  ];
}
