import { Platform } from 'react-native';

// ─── Track Definitions ──────────────────────────────────────────────

export enum AudioTrack {
  menu = 'menu',
  school = 'school',
  room = 'room',
  minigame_math = 'minigame_math',
  minigame_sports = 'minigame_sports',
  minigame_rhythm = 'minigame_rhythm',
  drama = 'drama',
  romance = 'romance',
  morning = 'morning',
  evening = 'evening',
  night = 'night',
  victory = 'victory',
  defeat = 'defeat',
}

// ─── SFX Library ────────────────────────────────────────────────────

export const SFX_LIBRARY = {
  // UI sounds
  ui: {
    button_click: 'ui_button_click',
    achievement_unlock: 'ui_achievement_unlock',
    currency_gain: 'ui_currency_gain',
    level_up: 'ui_level_up',
    error: 'ui_error',
    notification: 'ui_notification',
  },
  // Game sounds
  game: {
    study_complete: 'game_study_complete',
    workout_complete: 'game_workout_complete',
    social_interaction: 'game_social_interaction',
    romance_interaction: 'game_romance_interaction',
    rival_encounter: 'game_rival_encounter',
    event_trigger: 'game_event_trigger',
  },
  // Minigame sounds
  minigame: {
    correct_answer: 'mg_correct_answer',
    wrong_answer: 'mg_wrong_answer',
    combo_hit: 'mg_combo_hit',
    game_over: 'mg_game_over',
    victory_fanfare: 'mg_victory_fanfare',
  },
  // Ambient sounds
  ambient: {
    school_bell: 'amb_school_bell',
    crowd_chatter: 'amb_crowd_chatter',
    locker_slam: 'amb_locker_slam',
    footsteps: 'amb_footsteps',
  },
} as const;

export type SFXCategory = keyof typeof SFX_LIBRARY;
export type SFXId<T extends SFXCategory = SFXCategory> =
  T extends string ? (typeof SFX_LIBRARY)[T][keyof (typeof SFX_LIBRARY)[T]] & string : never;

// ─── Audio Asset Map (paths relative to audio assets) ──────────────

const TRACK_ASSET_MAP: Record<AudioTrack, string> = {
  [AudioTrack.menu]: 'music/menu_ambient.mp3',
  [AudioTrack.school]: 'music/school_day.mp3',
  [AudioTrack.room]: 'music/room_chill.mp3',
  [AudioTrack.minigame_math]: 'music/minigame_upbeat.mp3',
  [AudioTrack.minigame_sports]: 'music/minigame_intense.mp3',
  [AudioTrack.minigame_rhythm]: 'music/minigame_groove.mp3',
  [AudioTrack.drama]: 'music/drama_tension.mp3',
  [AudioTrack.romance]: 'music/romance_soft.mp3',
  [AudioTrack.morning]: 'music/morning_bright.mp3',
  [AudioTrack.evening]: 'music/evening_calm.mp3',
  [AudioTrack.night]: 'music/night_mellow.mp3',
  [AudioTrack.victory]: 'music/victory_celebration.mp3',
  [AudioTrack.defeat]: 'music/defeat_melancholy.mp3',
};

const SFX_ASSET_MAP: Record<string, string> = {
  [SFX_LIBRARY.ui.button_click]: 'sfx/ui/click.mp3',
  [SFX_LIBRARY.ui.achievement_unlock]: 'sfx/ui/achievement.mp3',
  [SFX_LIBRARY.ui.currency_gain]: 'sfx/ui/coins.mp3',
  [SFX_LIBRARY.ui.level_up]: 'sfx/ui/levelup.mp3',
  [SFX_LIBRARY.ui.error]: 'sfx/ui/error.mp3',
  [SFX_LIBRARY.ui.notification]: 'sfx/ui/notification.mp3',
  [SFX_LIBRARY.game.study_complete]: 'sfx/game/study_complete.mp3',
  [SFX_LIBRARY.game.workout_complete]: 'sfx/game/workout_complete.mp3',
  [SFX_LIBRARY.game.social_interaction]: 'sfx/game/social.mp3',
  [SFX_LIBRARY.game.romance_interaction]: 'sfx/game/romance.mp3',
  [SFX_LIBRARY.game.rival_encounter]: 'sfx/game/rival.mp3',
  [SFX_LIBRARY.game.event_trigger]: 'sfx/game/event.mp3',
  [SFX_LIBRARY.minigame.correct_answer]: 'sfx/minigame/correct.mp3',
  [SFX_LIBRARY.minigame.wrong_answer]: 'sfx/minigame/wrong.mp3',
  [SFX_LIBRARY.minigame.combo_hit]: 'sfx/minigame/combo.mp3',
  [SFX_LIBRARY.minigame.game_over]: 'sfx/minigame/gameover.mp3',
  [SFX_LIBRARY.minigame.victory_fanfare]: 'sfx/minigame/victory.mp3',
  [SFX_LIBRARY.ambient.school_bell]: 'sfx/ambient/bell.mp3',
  [SFX_LIBRARY.ambient.crowd_chatter]: 'sfx/ambient/crowd.mp3',
  [SFX_LIBRARY.ambient.locker_slam]: 'sfx/ambient/locker.mp3',
  [SFX_LIBRARY.ambient.footsteps]: 'sfx/ambient/steps.mp3',
};

// ─── Volume Settings ────────────────────────────────────────────────

interface VolumeSettings {
  master: number;
  music: number;
  sfx: number;
}

const DEFAULT_VOLUMES: VolumeSettings = {
  master: 0.8,
  music: 0.7,
  sfx: 1.0,
};

// ─── Audio Manager Singleton ────────────────────────────────────────

class AudioManager {
  private static instance: AudioManager;
  private initialized = false;
  private isNative: boolean;

  // Native audio (expo-av)
  private nativeSoundModule: any = null;
  private musicPlayer: any = null;
  private sfxPlayers: Map<string, any> = new Map();

  // Web audio (Web Audio API)
  private audioContext: AudioContext | null = null;
  private musicGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;
  private masterGainNode: GainNode | null = null;
  private musicBufferSource: AudioBufferSourceNode | null = null;
  private musicBuffer: AudioBuffer | null = null;
  private sfxBuffers: Map<string, AudioBuffer> = new Map();

  // State
  private currentTrack: AudioTrack | null = null;
  private volumes: VolumeSettings = { ...DEFAULT_VOLUMES };
  private muted = false;
  private preMuteVolumes: VolumeSettings = { ...DEFAULT_VOLUMES };
  private isPlaying = false;

  private constructor() {
    this.isNative = Platform.OS !== 'web';
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  // ─── Initialization ─────────────────────────────────────────────

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      if (this.isNative) {
        await this.initializeNative();
      } else {
        await this.initializeWeb();
      }
      this.initialized = true;
    } catch (error) {
      console.warn('[AudioManager] Initialization failed:', error);
    }
  }

  private async initializeNative(): Promise<void> {
    try {
      const { Audio } = await import('expo-av');
      this.nativeSoundModule = Audio.Sound;

      // Create gain nodes for volume control
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    } catch {
      console.warn('[AudioManager] expo-av not available, audio disabled');
    }
  }

  private async initializeWeb(): Promise<void> {
    try {
      this.audioContext = new AudioContext();

      this.masterGainNode = this.audioContext.createGain();
      this.masterGainNode.connect(this.audioContext.destination);
      this.masterGainNode.gain.value = this.volumes.master;

      this.musicGainNode = this.audioContext.createGain();
      this.musicGainNode.connect(this.masterGainNode);
      this.musicGainNode.gain.value = this.volumes.music;

      this.sfxGainNode = this.audioContext.createGain();
      this.sfxGainNode.connect(this.masterGainNode);
      this.sfxGainNode.gain.value = this.volumes.sfx;
    } catch (error) {
      console.warn('[AudioManager] Web Audio API not available:', error);
    }
  }

  // ─── Track Loading ────────────────────────────────────────────────

  private async loadTrackNative(track: AudioTrack): Promise<any> {
    if (!this.nativeSoundModule) return null;
    try {
      const { sound } = await this.nativeSoundModule.createAsync(
        { uri: TRACK_ASSET_MAP[track] },
        { shouldPlay: false, isLooping: true, volume: this.getEffectiveMusicVolume() }
      );
      return sound;
    } catch {
      return null;
    }
  }

  private async loadTrackWeb(track: AudioTrack): Promise<AudioBuffer | null> {
    if (!this.audioContext) return null;
    try {
      // In a real app, fetch the actual audio file
      const response = await fetch(TRACK_ASSET_MAP[track]);
      if (!response.ok) return null;
      const arrayBuffer = await response.arrayBuffer();
      return await this.audioContext.decodeAudioData(arrayBuffer);
    } catch {
      // Return null if loading fails - audio is non-critical
      return null;
    }
  }

  // ─── Music Playback ───────────────────────────────────────────────

  /**
   * Play a music track with optional crossfade.
   */
  async playTrack(track: AudioTrack, fadeDuration = 1000): Promise<void> {
    if (!this.initialized) await this.initialize();
    if (this.currentTrack === track && this.isPlaying) return;

    if (this.isNative) {
      await this.playTrackNative(track, fadeDuration);
    } else {
      await this.playTrackWeb(track, fadeDuration);
    }

    this.currentTrack = track;
    this.isPlaying = true;
  }

  private async playTrackNative(track: AudioTrack, fadeDuration: number): Promise<void> {
    try {
      const { Audio } = await import('expo-av');

      // Fade out current
      if (this.musicPlayer) {
        await this.fadeNative(this.musicPlayer, 0, fadeDuration / 2);
        await this.musicPlayer.unloadAsync();
        this.musicPlayer = null;
      }

      // Load and play new track
      const { sound } = await Audio.Sound.createAsync(
        { uri: TRACK_ASSET_MAP[track] },
        { shouldPlay: true, isLooping: true, volume: 0 },
      );
      this.musicPlayer = sound;

      // Fade in
      await this.fadeNative(sound, this.getEffectiveMusicVolume(), fadeDuration / 2);
    } catch (error) {
      console.warn('[AudioManager] Native track playback failed:', error);
    }
  }

  private async playTrackWeb(track: AudioTrack, fadeDuration: number): Promise<void> {
    if (!this.audioContext || !this.musicGainNode) return;

    try {
      // Resume context if suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Fade out current
      if (this.musicBufferSource && this.musicBuffer) {
        await this.fadeWeb(this.musicGainNode, 0, fadeDuration / 2);
        try {
          this.musicBufferSource.stop();
        } catch {
          // already stopped
        }
        this.musicBufferSource = null;
      }

      // Load and play new track
      const buffer = await this.loadTrackWeb(track);
      if (!buffer) return;

      this.musicBuffer = buffer;
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(this.musicGainNode);
      source.start(0);
      this.musicBufferSource = source;

      // Fade in
      await this.fadeWeb(this.musicGainNode, this.volumes.music, fadeDuration / 2);
    } catch (error) {
      console.warn('[AudioManager] Web track playback failed:', error);
    }
  }

  /**
   * Stop the current music track with optional fade out.
   */
  async stopTrack(fadeDuration = 1000): Promise<void> {
    if (!this.isPlaying) return;

    if (this.isNative) {
      await this.stopTrackNative(fadeDuration);
    } else {
      await this.stopTrackWeb(fadeDuration);
    }

    this.currentTrack = null;
    this.isPlaying = false;
  }

  private async stopTrackNative(fadeDuration: number): Promise<void> {
    if (!this.musicPlayer) return;
    try {
      await this.fadeNative(this.musicPlayer, 0, fadeDuration);
      await this.musicPlayer.stopAsync();
      await this.musicPlayer.unloadAsync();
      this.musicPlayer = null;
    } catch {
      // ignore
    }
  }

  private async stopTrackWeb(fadeDuration: number): Promise<void> {
    if (!this.musicGainNode || !this.musicBufferSource) return;
    try {
      await this.fadeWeb(this.musicGainNode, 0, fadeDuration);
      this.musicBufferSource.stop();
      this.musicBufferSource = null;
      this.musicBuffer = null;
    } catch {
      // ignore
    }
  }

  // ─── SFX Playback ─────────────────────────────────────────────────

  /**
   * Play a one-shot sound effect.
   */
  async playSFX(sfx: string): Promise<void> {
    if (!this.initialized) await this.initialize();
    if (this.muted || this.volumes.sfx <= 0) return;

    const sfxId = SFX_ASSET_MAP[sfx];
    if (!sfxId) {
      console.warn(`[AudioManager] Unknown SFX: ${sfx}`);
      return;
    }

    if (this.isNative) {
      await this.playSFXNative(sfxId);
    } else {
      await this.playSFXWeb(sfxId);
    }
  }

  private async playSFXNative(sfxId: string): Promise<void> {
    try {
      const { Audio } = await import('expo-av');
      const { sound } = await Audio.Sound.createAsync(
        { uri: sfxId },
        { shouldPlay: true, volume: this.getEffectiveSFXVolume() },
      );

      // Auto-unload when done
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch {
      // ignore
    }
  }

  private async playSFXWeb(sfxId: string): Promise<void> {
    if (!this.audioContext || !this.sfxGainNode) return;

    try {
      // Resume context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Check cached buffer
      let buffer = this.sfxBuffers.get(sfxId);
      if (!buffer) {
        try {
          const response = await fetch(sfxId);
          if (!response.ok) return;
          const arrayBuffer = await response.arrayBuffer();
          buffer = await this.audioContext.decodeAudioData(arrayBuffer);
          this.sfxBuffers.set(sfxId, buffer);
        } catch {
          return;
        }
      }

      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.sfxGainNode);
      source.start(0);
    } catch {
      // ignore
    }
  }

  // ─── Volume Control ───────────────────────────────────────────────

  setMasterVolume(volume: number): void {
    this.volumes.master = Math.max(0, Math.min(1, volume));
    this.applyVolumes();
  }

  setMusicVolume(volume: number): void {
    this.volumes.music = Math.max(0, Math.min(1, volume));
    this.applyVolumes();
  }

  setSFXVolume(volume: number): void {
    this.volumes.sfx = Math.max(0, Math.min(1, volume));
    this.applyVolumes();
  }

  private applyVolumes(): void {
    if (!this.initialized) return;

    const master = this.muted ? 0 : this.volumes.master;

    if (this.isNative) {
      if (this.musicPlayer) {
        this.musicPlayer.setVolumeAsync(this.getEffectiveMusicVolume());
      }
    } else {
      if (this.masterGainNode) {
        this.masterGainNode.gain.value = master;
      }
      if (this.musicGainNode) {
        this.musicGainNode.gain.value = this.volumes.music;
      }
      if (this.sfxGainNode) {
        this.sfxGainNode.gain.value = this.volumes.sfx;
      }
    }
  }

  private getEffectiveMusicVolume(): number {
    if (this.muted) return 0;
    return this.volumes.master * this.volumes.music;
  }

  private getEffectiveSFXVolume(): number {
    if (this.muted) return 0;
    return this.volumes.master * this.volumes.sfx;
  }

  // ─── Mute Control ─────────────────────────────────────────────────

  muteAll(): void {
    if (this.muted) return;
    this.preMuteVolumes = { ...this.volumes };
    this.muted = true;
    this.applyVolumes();
  }

  unmuteAll(): void {
    if (!this.muted) return;
    this.muted = false;
    this.applyVolumes();
  }

  isMuted(): boolean {
    return this.muted;
  }

  toggleMute(): boolean {
    if (this.muted) {
      this.unmuteAll();
    } else {
      this.muteAll();
    }
    return this.muted;
  }

  // ─── Fade Helpers ─────────────────────────────────────────────────

  private async fadeNative(player: any, targetVolume: number, duration: number): Promise<void> {
    if (!player) return;
    try {
      // For native, we just set volume directly for simplicity
      // A real implementation would use setInterval for smooth fading
      await player.setVolumeAsync(targetVolume);
    } catch {
      // ignore
    }
  }

  private fadeWeb(gainNode: GainNode, targetVolume: number, duration: number): Promise<void> {
    return new Promise((resolve) => {
      if (!this.audioContext || !gainNode) {
        resolve();
        return;
      }

      const startVolume = gainNode.gain.value;
      const startTime = this.audioContext.currentTime;
      const endTime = startTime + duration / 1000;

      gainNode.gain.setValueAtTime(startVolume, startTime);
      gainNode.gain.linearRampToValueAtTime(targetVolume, endTime);

      setTimeout(resolve, duration);
    });
  }

  // ─── Getters ──────────────────────────────────────────────────────

  getCurrentTrack(): AudioTrack | null {
    return this.currentTrack;
  }

  getVolumes(): VolumeSettings {
    return { ...this.volumes };
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

// ─── Export Singleton ───────────────────────────────────────────────

export const audioManager = AudioManager.getInstance();

/**
 * Convenience hook to play a track when a component mounts,
 * and optionally stop it on unmount.
 */
export async function playSceneTrack(track: AudioTrack): Promise<void> {
  await audioManager.playTrack(track);
}

/**
 * Play a sound effect by its library ID.
 */
export async function playSound(sfxId: string): Promise<void> {
  await audioManager.playSFX(sfxId);
}
