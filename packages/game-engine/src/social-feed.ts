import type { Player, NPC } from '@repo/types';

export type FeedItemType =
  | 'achievement_unlocked'
  | 'story_completed'
  | 'npc_romance'
  | 'rival_defeated'
  | 'room_redesigned'
  | 'minigame_highscore'
  | 'level_up'
  | 'friendship_milestone';

export interface SocialComment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  timestamp: string;
}

export interface SocialFeedItem {
  id: string;
  timestamp: string;
  type: FeedItemType;
  actorId: string;
  actorName: string;
  description: string;
  relatedImage?: string;
  likes: number;
  likedByPlayer: boolean;
  comments: SocialComment[];
}

const FEED_TYPE_EMOJI: Record<FeedItemType, string> = {
  achievement_unlocked: '🏆',
  story_completed: '📖',
  npc_romance: '💕',
  rival_defeated: '⚔️',
  room_redesigned: '🏠',
  minigame_highscore: '🎮',
  level_up: '⬆️',
  friendship_milestone: '💫',
};

const FEED_TYPE_COLOR: Record<FeedItemType, string> = {
  achievement_unlocked: '#f59e0b',
  story_completed: '#3b82f6',
  npc_romance: '#ec4899',
  rival_defeated: '#ef4444',
  room_redesigned: '#22c55e',
  minigame_highscore: '#a855f7',
  level_up: '#06b6d4',
  friendship_milestone: '#f472b6',
};

export function getFeedTypeEmoji(type: FeedItemType): string {
  return FEED_TYPE_EMOJI[type];
}

export function getFeedTypeColor(type: FeedItemType): string {
  return FEED_TYPE_COLOR[type];
}

export function getFeedTypeLabel(type: FeedItemType): string {
  return type.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function generateFeedItems(
  player: Player,
  npcs: NPC[],
  recentEvents: Array<{
    type: FeedItemType;
    description?: string;
    actorId?: string;
    actorName?: string;
    relatedImage?: string;
    timestamp?: string;
  }>
): SocialFeedItem[] {
  const items: SocialFeedItem[] = [];

  for (const event of recentEvents) {
    const actorName = event.actorName ?? player.name;
    const description = event.description ?? generateDefaultDescription(event.type, actorName);

    items.push({
      id: `feed_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: event.timestamp ?? new Date().toISOString(),
      type: event.type,
      actorId: event.actorId ?? player.id,
      actorName,
      description,
      relatedImage: event.relatedImage,
      likes: Math.floor(Math.random() * 20),
      likedByPlayer: false,
      comments: [],
    });
  }

  return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function generateDefaultDescription(type: FeedItemType, actorName: string): string {
  switch (type) {
    case 'achievement_unlocked':
      return `${actorName} unlocked a new achievement!`;
    case 'story_completed':
      return `${actorName} completed a story chapter.`;
    case 'npc_romance':
      return `${actorName} is getting closer to someone special...`;
    case 'rival_defeated':
      return `${actorName} won a confrontation!`;
    case 'room_redesigned':
      return `${actorName} redecorated their room.`;
    case 'minigame_highscore':
      return `${actorName} set a new high score!`;
    case 'level_up':
      return `${actorName} leveled up!`;
    case 'friendship_milestone':
      return `${actorName} reached a friendship milestone!`;
    default:
      return `${actorName} did something noteworthy.`;
  }
}

export function addFeedItem(
  items: SocialFeedItem[],
  item: Omit<SocialFeedItem, 'id' | 'timestamp'> & { timestamp?: string }
): SocialFeedItem[] {
  const newItem: SocialFeedItem = {
    ...item,
    id: `feed_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: item.timestamp ?? new Date().toISOString(),
    likedByPlayer: false,
    comments: item.comments ?? [],
  };
  return [newItem, ...items];
}

export function likeFeedItem(items: SocialFeedItem[], itemId: string): SocialFeedItem[] {
  return items.map((item) => {
    if (item.id !== itemId) return item;
    return {
      ...item,
      likes: item.likedByPlayer ? Math.max(0, item.likes - 1) : item.likes + 1,
      likedByPlayer: !item.likedByPlayer,
    };
  });
}

export function addComment(
  items: SocialFeedItem[],
  itemId: string,
  comment: Omit<SocialComment, 'id' | 'timestamp'> & { id?: string; timestamp?: string }
): SocialFeedItem[] {
  return items.map((item) => {
    if (item.id !== itemId) return item;
    const newComment: SocialComment = {
      ...comment,
      id: comment.id ?? `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: comment.timestamp ?? new Date().toISOString(),
    };
    return {
      ...item,
      comments: [...item.comments, newComment],
    };
  });
}

// ─── Pre-populated Mock Feed Items ────────────────────────────────────

export const MOCK_FEED_ITEMS: SocialFeedItem[] = [
  {
    id: 'feed_001',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    type: 'level_up',
    actorId: 'player',
    actorName: 'You',
    description: 'You reached Level 7! New areas unlocked.',
    likes: 12,
    likedByPlayer: false,
    comments: [
      { id: 'c1', authorId: 'f_sam_k', authorName: 'Sam Kim', text: 'Congrats! 🎉', timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString() },
    ],
  },
  {
    id: 'feed_002',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    type: 'minigame_highscore',
    actorId: 'f_alex_m',
    actorName: 'Alex Ramos',
    description: 'Alex Ramos scored 1,250 in Math Blitz! Can you beat it?',
    likes: 8,
    likedByPlayer: false,
    comments: [],
  },
  {
    id: 'feed_003',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    type: 'npc_romance',
    actorId: 'f_riley_p',
    actorName: 'Riley Parker',
    description: 'Riley Parker and Raven are officially a thing! 💕',
    likes: 24,
    likedByPlayer: false,
    comments: [
      { id: 'c2', authorId: 'f_casey_w', authorName: 'Casey Williams', text: 'About time!!', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
      { id: 'c3', authorId: 'f_sam_k', authorName: 'Sam Kim', text: 'So happy for you both 💖', timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString() },
    ],
  },
  {
    id: 'feed_004',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    type: 'achievement_unlocked',
    actorId: 'f_jordan_t',
    actorName: 'Jordan Taylor',
    description: 'Jordan Taylor unlocked "Scholar" - Reach 80 Academics!',
    likes: 15,
    likedByPlayer: false,
    comments: [
      { id: 'c4', authorId: 'f_alex_m', authorName: 'Alex Ramos', text: 'Nerd alert 🤓', timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
    ],
  },
  {
    id: 'feed_005',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    type: 'room_redesigned',
    actorId: 'f_casey_w',
    actorName: 'Casey Williams',
    description: 'Casey Williams gave their room a complete glow-up!',
    likes: 18,
    likedByPlayer: false,
    comments: [],
  },
  {
    id: 'feed_006',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    type: 'rival_defeated',
    actorId: 'player',
    actorName: 'You',
    description: 'You defeated Bradley in an epic hallway showdown!',
    likes: 31,
    likedByPlayer: false,
    comments: [
      { id: 'c5', authorId: 'f_riley_p', authorName: 'Riley Parker', text: 'Legendary! 🏆', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() },
      { id: 'c6', authorId: 'f_jordan_t', authorName: 'Jordan Taylor', text: 'He had it coming', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() },
    ],
  },
  {
    id: 'feed_007',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    type: 'story_completed',
    actorId: 'f_sam_k',
    actorName: 'Sam Kim',
    description: 'Sam Kim completed "The Art of Rebellion" chapter!',
    likes: 10,
    likedByPlayer: false,
    comments: [],
  },
  {
    id: 'feed_008',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    type: 'friendship_milestone',
    actorId: 'f_alex_m',
    actorName: 'Alex Ramos',
    description: 'Alex Ramos and Chad became Best Friends! 100/100 friendship!',
    likes: 20,
    likedByPlayer: false,
    comments: [
      { id: 'c7', authorId: 'f_casey_w', authorName: 'Casey Williams', text: 'Bromance of the century', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString() },
    ],
  },
];
