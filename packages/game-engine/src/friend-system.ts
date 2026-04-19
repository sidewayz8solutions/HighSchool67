import type { Player, Room, RoomItem, NPCVisualConfig } from '@repo/types';

export interface GiftRecord {
  itemId: string;
  itemName: string;
  sentAt: string;
  friendshipBoost: number;
}

export interface Friend {
  id: string;
  username: string;
  displayName: string;
  avatarConfig: NPCVisualConfig;
  level: number;
  currentCareer: string;
  roomSnapshot: Room;
  lastActive: string;
  friendshipLevel: number;
  giftHistory: GiftRecord[];
}

const FRIEND_CODE_PREFIX = 'HS67';
const DAILY_GIFT_LIMIT = 3;
const FRIENDSHIP_PER_GIFT = 5;

export function generateFriendCode(playerId: string): string {
  const hash = playerId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const code = `${FRIEND_CODE_PREFIX}-${String(hash % 10000).padStart(4, '0')}-${playerId.slice(-4).toUpperCase()}`;
  return code;
}

export function addFriendByCode(
  friends: Friend[],
  code: string,
  mockFriends?: Friend[]
): { success: boolean; friend?: Friend; error?: string } {
  if (!code.startsWith(FRIEND_CODE_PREFIX)) {
    return { success: false, error: 'Invalid friend code format' };
  }

  const alreadyFriends = friends.some((f) => {
    const theirCode = generateFriendCode(f.id);
    return theirCode === code;
  });

  if (alreadyFriends) {
    return { success: false, error: 'Already friends with this player' };
  }

  if (mockFriends) {
    const codeHash = code.split('-')[1];
    const mockMatch = mockFriends.find((mf) => {
      const mfCode = generateFriendCode(mf.id);
      return mfCode.split('-')[1] === codeHash;
    });
    if (mockMatch) {
      return { success: true, friend: { ...mockMatch, friendshipLevel: 1 } };
    }
  }

  return { success: false, error: 'Player not found. Try a different code.' };
}

export function removeFriend(friends: Friend[], friendId: string): Friend[] {
  return friends.filter((f) => f.id !== friendId);
}

export function visitFriendRoom(friend: Friend): Room {
  return friend.roomSnapshot;
}

export function canSendGift(friend: Friend): boolean {
  const today = new Date().toISOString().split('T')[0];
  const sentToday = friend.giftHistory.filter((g) => g.sentAt.startsWith(today)).length;
  return sentToday < DAILY_GIFT_LIMIT;
}

export function getRemainingGifts(friend: Friend): number {
  const today = new Date().toISOString().split('T')[0];
  const sentToday = friend.giftHistory.filter((g) => g.sentAt.startsWith(today)).length;
  return Math.max(0, DAILY_GIFT_LIMIT - sentToday);
}

export function sendGift(
  friend: Friend,
  item: RoomItem
): { updatedFriend: Friend; remainingGifts: number } {
  if (!canSendGift(friend)) {
    return { updatedFriend: friend, remainingGifts: 0 };
  }

  const giftRecord: GiftRecord = {
    itemId: item.id,
    itemName: item.name,
    sentAt: new Date().toISOString(),
    friendshipBoost: FRIENDSHIP_PER_GIFT,
  };

  const updatedFriend: Friend = {
    ...friend,
    friendshipLevel: Math.min(100, friend.friendshipLevel + FRIENDSHIP_PER_GIFT),
    giftHistory: [...friend.giftHistory, giftRecord],
  };

  return {
    updatedFriend,
    remainingGifts: getRemainingGifts(updatedFriend),
  };
}

export interface StatComparison {
  stat: string;
  playerValue: number;
  friendValue: number;
  diff: number;
}

export function compareStats(player: Player, friend: Player): StatComparison[] {
  const statKeys = ['academics', 'athletics', 'creativity', 'popularity', 'rebellion', 'happiness'] as const;

  return statKeys.map((key) => {
    const playerValue = player.stats[key];
    const friendValue = friend.stats[key];
    return {
      stat: key.charAt(0).toUpperCase() + key.slice(1),
      playerValue,
      friendValue,
      diff: playerValue - friendValue,
    };
  });
}

// ─── Mock Friends for Single-Player Demo ──────────────────────────────

export const MOCK_FRIENDS: Friend[] = [
  {
    id: 'f_alex_m',
    username: 'alex_ramos',
    displayName: 'Alex Ramos',
    avatarConfig: { seed: 'alex', hair: ['short05'], hairColor: '#4a2511', skinColor: '#f5d0b5', glasses: [] },
    level: 12,
    currentCareer: 'Sports Star',
    lastActive: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    friendshipLevel: 45,
    giftHistory: [
      { itemId: 'poster-1', itemName: 'Band Poster', sentAt: new Date(Date.now() - 86400000).toISOString(), friendshipBoost: 5 },
    ],
    roomSnapshot: {
      width: 8, height: 8, wallColor: '#3b82f6', floorType: 'wood',
      items: [
        { id: 'desk-mock', name: 'Gaming Desk', category: 'furniture', rarity: 'epic', cost: { points: 200, gems: 10 }, statBonuses: { academics: 3, creativity: 3 }, position: { x: 1, y: 1 }, rotation: 0 },
        { id: 'poster-mock', name: 'Band Poster', category: 'poster', rarity: 'common', cost: { points: 50, gems: 0 }, statBonuses: { creativity: 2 }, position: { x: 2, y: 0 }, rotation: 0 },
      ],
    },
  },
  {
    id: 'f_sam_k',
    username: 'sam_kim',
    displayName: 'Sam Kim',
    avatarConfig: { seed: 'sam', hair: ['long01'], hairColor: '#0e0e0e', skinColor: '#ecad80', glasses: [] },
    level: 8,
    currentCareer: 'Artist',
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    friendshipLevel: 62,
    giftHistory: [
      { itemId: 'plant-1', itemName: 'Monstera', sentAt: new Date(Date.now() - 172800000).toISOString(), friendshipBoost: 5 },
      { itemId: 'lamp-1', itemName: 'Neon Lamp', sentAt: new Date(Date.now() - 86400000).toISOString(), friendshipBoost: 5 },
    ],
    roomSnapshot: {
      width: 8, height: 8, wallColor: '#a855f7', floorType: 'carpet',
      items: [
        { id: 'easel-mock', name: 'Art Easel', category: 'furniture', rarity: 'rare', cost: { points: 150, gems: 5 }, statBonuses: { creativity: 5 }, position: { x: 3, y: 2 }, rotation: 0 },
      ],
    },
  },
  {
    id: 'f_jordan_t',
    username: 'jordan_t',
    displayName: 'Jordan Taylor',
    avatarConfig: { seed: 'jordan', hair: ['short11'], hairColor: '#e5d7a3', skinColor: '#f2d3b1', glasses: ['round'] },
    level: 15,
    currentCareer: 'Valedictorian',
    lastActive: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    friendshipLevel: 30,
    giftHistory: [],
    roomSnapshot: {
      width: 8, height: 8, wallColor: '#22c55e', floorType: 'tile',
      items: [
        { id: 'bookshelf-mock', name: 'Bookshelf', category: 'furniture', rarity: 'common', cost: { points: 60, gems: 0 }, statBonuses: { academics: 3 }, position: { x: 0, y: 0 }, rotation: 0 },
      ],
    },
  },
  {
    id: 'f_riley_p',
    username: 'riley_p',
    displayName: 'Riley Parker',
    avatarConfig: { seed: 'riley', hair: ['long06'], hairColor: '#d4553a', skinColor: '#f5d0b5', glasses: [] },
    level: 6,
    currentCareer: 'Musician',
    lastActive: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    friendshipLevel: 78,
    giftHistory: [
      { itemId: 'speaker-1', itemName: 'Subwoofer', sentAt: new Date(Date.now() - 86400000 * 3).toISOString(), friendshipBoost: 5 },
      { itemId: 'rug-1', itemName: 'Shag Rug', sentAt: new Date(Date.now() - 86400000 * 2).toISOString(), friendshipBoost: 5 },
      { itemId: 'mirror-1', itemName: 'LED Mirror', sentAt: new Date(Date.now() - 86400000).toISOString(), friendshipBoost: 5 },
    ],
    roomSnapshot: {
      width: 8, height: 8, wallColor: '#ec4899', floorType: 'wood',
      items: [
        { id: 'speaker-mock', name: 'Subwoofer', category: 'furniture', rarity: 'rare', cost: { points: 120, gems: 5 }, statBonuses: { rebellion: 3, popularity: 2 }, position: { x: 5, y: 5 }, rotation: 0 },
      ],
    },
  },
  {
    id: 'f_casey_w',
    username: 'casey_w',
    displayName: 'Casey Williams',
    avatarConfig: { seed: 'casey', hair: ['short03'], hairColor: '#acafaf', skinColor: '#ecad80', glasses: [] },
    level: 20,
    currentCareer: 'Game Developer',
    lastActive: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    friendshipLevel: 55,
    giftHistory: [
      { itemId: 'desk-1', itemName: 'Gaming Desk', sentAt: new Date(Date.now() - 86400000 * 2).toISOString(), friendshipBoost: 5 },
    ],
    roomSnapshot: {
      width: 8, height: 8, wallColor: '#0e0e0e', floorType: 'carpet',
      items: [
        { id: 'desk-mock2', name: 'Gaming Desk', category: 'furniture', rarity: 'epic', cost: { points: 200, gems: 10 }, statBonuses: { academics: 3, creativity: 3 }, position: { x: 2, y: 2 }, rotation: 0 },
        { id: 'lamp-mock', name: 'Neon Lamp', category: 'lighting', rarity: 'rare', cost: { points: 0, gems: 5 }, statBonuses: { creativity: 3, happiness: 2 }, position: { x: 4, y: 1 }, rotation: 0 },
      ],
    },
  },
];

export function getMockPlayerFromFriend(friend: Friend): Player {
  return {
    id: friend.id,
    name: friend.displayName,
    avatar: '👤',
    avatarConfig: {
      gender: 'nonbinary',
      skinTone: friend.avatarConfig.skinColor,
      hairStyle: 0,
      hairColor: friend.avatarConfig.hairColor,
      eyeColor: '#3b6e28',
      outfit: 0,
      accessory: 0,
    },
    clique: 'nerd',
    stats: {
      academics: 40 + Math.floor(Math.random() * 40),
      athletics: 30 + Math.floor(Math.random() * 50),
      creativity: 35 + Math.floor(Math.random() * 45),
      popularity: 25 + Math.floor(Math.random() * 55),
      rebellion: 20 + Math.floor(Math.random() * 40),
      happiness: 50 + Math.floor(Math.random() * 40),
      energy: 80 + Math.floor(Math.random() * 20),
    },
    currency: { points: 500, gems: 25 },
    room: friend.roomSnapshot,
    inventory: [],
    equipped: { outfit: null, accessory: null },
  };
}
