export type Gender = 'male' | 'female' | 'nonbinary';

export interface AvatarConfig {
  gender: Gender;
  skinTone: string;
  hairStyle: number;
  hairColor: string;
  eyeColor: string;
  outfit: number;
  accessory: number;
}

export const SKIN_TONES = [
  '#f5d0b5', '#e8b89a', '#d4a373', '#c68642',
  '#a0522d', '#8d5524', '#6f3c1e', '#4a2511',
];

export const HAIR_COLORS = [
  '#0a0a0a', '#2c1a0b', '#4a2511', '#8d5524',
  '#c9a227', '#e8d44d', '#d4553a', '#e84a5f',
  '#7c3aed', '#3b82f6', '#22c55e', '#f0f0f0',
];

export const EYE_COLORS = [
  '#3b6e28', '#5d8a48', '#8b6914', '#4a2511',
  '#1e3a5f', '#3b82f6', '#7c3aed', '#a855f7',
  '#94a3b8', '#e2e8f0',
];

export const HAIR_STYLES = [
  { name: 'Short', icon: '✂️' },
  { name: 'Long', icon: '💇' },
  { name: 'Curly', icon: '🌀' },
  { name: 'Braids', icon: '🧬' },
  { name: 'Bald', icon: '👤' },
  { name: 'Bun', icon: '🍡' },
  { name: 'Ponytail', icon: '🎀' },
  { name: 'Mohawk', icon: '🦔' },
];

export const OUTFITS = [
  { name: 'Casual', emoji: '👕', color: '#3b82f6' },
  { name: 'Jock', emoji: '🏈', color: '#ef4444' },
  { name: 'Nerd', emoji: '👔', color: '#8b5cf6' },
  { name: 'Goth', emoji: '🖤', color: '#1e293b' },
  { name: 'Preppy', emoji: '🎾', color: '#22c55e' },
  { name: 'Artsy', emoji: '🎨', color: '#f59e0b' },
  { name: 'Street', emoji: '👟', color: '#ec4899' },
  { name: 'Vintage', emoji: '👗', color: '#a855f7' },
];

export const ACCESSORIES = [
  { name: 'None', emoji: '' },
  { name: 'Glasses', emoji: '👓' },
  { name: 'Sunglasses', emoji: '🕶️' },
  { name: 'Headphones', emoji: '🎧' },
  { name: 'Hat', emoji: '🧢' },
  { name: 'Beanie', emoji: '🧶' },
  { name: 'Crown', emoji: '👑' },
  { name: 'Mask', emoji: '😷' },
];
