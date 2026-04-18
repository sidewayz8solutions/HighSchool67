import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './use-auth';
import { saveGameState, loadGameState } from '@/services/sync';
import { useGameStore } from '@repo/game-engine';
import type { GameState } from '@repo/types';

interface UseCloudSyncReturn {
  syncing: boolean;
  lastSync: string | null;
  syncError: string | null;
  syncNow: () => Promise<boolean>;
  loadFromCloud: () => Promise<boolean>;
  autoSyncEnabled: boolean;
  setAutoSyncEnabled: (enabled: boolean) => void;
}

const AUTO_SYNC_INTERVAL_MS = 60_000; // 1 minute

export function useCloudSync(): UseCloudSyncReturn {
  const { user } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const gameState = useGameStore();

  const syncNow = useCallback(async (): Promise<boolean> => {
    if (!user) {
      setSyncError('Not signed in');
      return false;
    }

    setSyncing(true);
    setSyncError(null);

    const state: GameState = {
      player: gameState.player,
      progress: gameState.progress,
      npcs: gameState.npcs,
      challenges: gameState.challenges,
      storyProgress: gameState.storyProgress,
      lastPlayedAt: gameState.lastPlayedAt,
    };

    const success = await saveGameState(user.id, state);
    if (success) {
      setLastSync(new Date().toISOString());
    } else {
      setSyncError('Save failed. Will retry.');
    }

    setSyncing(false);
    return success;
  }, [user, gameState]);

  const loadFromCloud = useCallback(async (): Promise<boolean> => {
    if (!user) {
      setSyncError('Not signed in');
      return false;
    }

    setSyncing(true);
    setSyncError(null);

    const cloudState = await loadGameState(user.id);
    if (!cloudState) {
      setSyncError('No cloud save found');
      setSyncing(false);
      return false;
    }

    // Merge cloud state into local store
    const store = useGameStore.getState();
    if (cloudState.player) store.player = cloudState.player;
    if (cloudState.progress) store.progress = cloudState.progress;
    if (cloudState.npcs) store.npcs = cloudState.npcs;
    if (cloudState.challenges) store.challenges = cloudState.challenges;
    if (cloudState.storyProgress) store.storyProgress = cloudState.storyProgress;
    if (cloudState.lastPlayedAt) store.lastPlayedAt = cloudState.lastPlayedAt;

    setLastSync(new Date().toISOString());
    setSyncing(false);
    return true;
  }, [user]);

  // Auto-sync interval
  useEffect(() => {
    if (!autoSyncEnabled || !user) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      syncNow();
    }, AUTO_SYNC_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoSyncEnabled, user, syncNow]);

  // Sync on auth change (when user logs in)
  useEffect(() => {
    if (user && autoSyncEnabled) {
      // Small delay to let everything settle
      const timer = setTimeout(() => syncNow(), 2000);
      return () => clearTimeout(timer);
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    syncing,
    lastSync,
    syncError,
    syncNow,
    loadFromCloud,
    autoSyncEnabled,
    setAutoSyncEnabled,
  };
}
