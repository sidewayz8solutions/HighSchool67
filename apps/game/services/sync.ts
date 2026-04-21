import { supabase } from './supabase';
import type { GameState, StoryProgress } from '@repo/types';

export interface CloudSave {
  id?: string;
  user_id: string;
  player: GameState['player'];
  progress: GameState['progress'];
  npcs: GameState['npcs'];
  challenges: GameState['challenges'];
  story_progress: StoryProgress;
  last_synced_at: string;
  device_id?: string;
}

type CloudSaveRow = {
  player: GameState['player'];
  progress: GameState['progress'];
  npcs: GameState['npcs'];
  challenges: GameState['challenges'];
  story_progress: StoryProgress;
  last_synced_at: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isValidCloudSaveRow(data: unknown): data is CloudSaveRow {
  if (!isObject(data)) return false;
  return (
    isObject(data.player) &&
    isObject(data.progress) &&
    Array.isArray(data.npcs) &&
    Array.isArray(data.challenges) &&
    isObject(data.story_progress) &&
    typeof data.last_synced_at === 'string'
  );
}

export async function saveGameState(userId: string, state: GameState): Promise<boolean> {
  try {
    const saveData: CloudSave = {
      user_id: userId,
      player: state.player,
      progress: state.progress,
      npcs: state.npcs,
      challenges: state.challenges,
      story_progress: state.storyProgress,
      last_synced_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('game_saves')
      .upsert(saveData, { onConflict: 'user_id' });

    if (error) {
      console.error('Cloud save failed:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Cloud save exception:', e);
    return false;
  }
}

export async function loadGameState(userId: string): Promise<Partial<GameState> | null> {
  try {
    const { data, error } = await supabase
      .from('game_saves')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      console.error('Cloud load failed:', error);
      return null;
    }

    if (!data) return null;
    if (!isValidCloudSaveRow(data)) {
      console.warn('Cloud load returned invalid save shape');
      return null;
    }

    return {
      player: data.player,
      progress: data.progress,
      npcs: data.npcs,
      challenges: data.challenges,
      storyProgress: data.story_progress,
      lastPlayedAt: data.last_synced_at,
    };
  } catch (e) {
    console.error('Cloud load exception:', e);
    return null;
  }
}

export async function getLastSyncTime(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('game_saves')
      .select('last_synced_at')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;
    return data.last_synced_at;
  } catch {
    return null;
  }
}
