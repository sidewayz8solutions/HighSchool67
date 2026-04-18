export interface StoryChoice {
  id: string;
  text: string;
  statCheck?: {
    stat: 'academics' | 'athletics' | 'creativity' | 'popularity' | 'rebellion';
    threshold: number;
  };
  effects: {
    stats?: Partial<Record<'academics' | 'athletics' | 'creativity' | 'popularity' | 'rebellion' | 'happiness' | 'energy', number>>;
    npcRelationships?: Record<string, { friendship?: number; romance?: number }>;
    currency?: { points?: number; gems?: number };
  };
  nextSceneId?: string;
}

export interface StoryScene {
  id: string;
  text: string;
  aiGenerated?: boolean;
  choices: StoryChoice[];
}

export type ChapterLockType = 'free' | 'progress' | 'premium' | 'season-pass';

export interface StoryChapter {
  id: string;
  title: string;
  description: string;
  semester: 1 | 2 | 3 | 4;
  episode: number;
  lockType: ChapterLockType;
  cost?: { points?: number; gems?: number };
  requiredSemester?: number;
  requiredStats?: Partial<Record<'academics' | 'athletics' | 'creativity' | 'popularity' | 'rebellion', number>>;
  scenes: StoryScene[];
  thumbnail: string;
}

export interface StoryProgress {
  completedChapters: string[];
  unlockedChapters: string[];
  currentSceneByChapter: Record<string, string>;
  choiceHistory: Record<string, string[]>; // chapterId -> choiceIds
}
