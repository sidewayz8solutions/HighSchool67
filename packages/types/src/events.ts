export type EventCategory = 'academic' | 'social' | 'sports' | 'arts' | 'drama' | 'holiday' | 'crisis' | 'opportunity';
export type EventScope = 'personal' | 'clique' | 'school_wide' | 'global';
export type EventFrequency = 'once' | 'daily' | 'weekly' | 'semester' | 'annual';

export interface EventChoice {
  id: string;
  text: string;
  statCheck?: { stat: string; threshold: number };
  effects: {
    stats?: Partial<Record<string, number>>;
    npcRelationships?: Record<string, { friendship?: number; romance?: number }>;
    atmosphereDelta?: number;
  };
}

export interface EventConsequence {
  triggerChoiceId: string;
  delayedDays: number;
  description: string;
  effects: {
    stats?: Partial<Record<string, number>>;
    npcRelationships?: Record<string, { friendship?: number; romance?: number }>;
  };
}

export interface ScheduledEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  scope: EventScope;
  semester: 1 | 2 | 3 | 4;
  day: number; // day within semester (1-90)
  period: 'morning' | 'lunch' | 'afternoon' | 'evening' | 'night';
  duration?: number; // periods it lasts
  requirements?: {
    minStats?: Partial<Record<string, number>>;
    clique?: string;
    npcFriendships?: Record<string, number>;
  };
  choices: EventChoice[];
  rewards?: {
    stats?: Partial<Record<string, number>>;
    currency?: { points?: number; gems?: number };
    items?: string[];
  };
  consequences?: EventConsequence[];
}

export interface CalendarEntry {
  date: { semester: number; day: number };
  events: ScheduledEvent[];
  isHoliday?: boolean;
  holidayName?: string;
}

export interface AtmosphereState {
  overall: number; // -100 to 100 (tense to harmonious)
  academicPressure: number; // 0-100
  socialEnergy: number; // 0-100
  dramaLevel: number; // 0-100
  excitementLevel: number; // 0-100
  dominant?: string; // e.g. 'chill', 'tense', 'energetic'
  recentEvents: Array<{ eventId: string; impact: number; timestamp: number }>;
}

export interface SeasonalTheme {
  name: string;
  startDay: { semester: number; day: number };
  endDay: { semester: number; day: number };
  atmosphereModifier: Partial<AtmosphereState>;
  specialEvents: string[]; // event IDs
  decoration: string; // description of visual theme
}
