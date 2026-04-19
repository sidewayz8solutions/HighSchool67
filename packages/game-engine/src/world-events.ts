import type {
  ScheduledEvent,
  SeasonalTheme,
  CalendarEntry,
  AtmosphereState,
  Player,
  NPC,
  EventConsequence,
  EventChoice,
} from '@repo/types';

// ------------------------------------------------------------------
// Scheduled Events (15+ events)
// ------------------------------------------------------------------

export const SCHEDULED_EVENTS: ScheduledEvent[] = [
  // ===== SEMESTER 1: Freshman Fall =====
  {
    id: 'evt-welcome-assembly',
    title: 'Welcome Assembly',
    description:
      'The entire school gathers in the auditorium. The principal gives a long speech, the cheer squad performs, and cliques stake out their seating territories.',
    category: 'social',
    scope: 'school_wide',
    semester: 1,
    day: 2,
    period: 'morning',
    choices: [
      {
        id: 'wa-sit-jocks',
        text: 'Sit with the Jocks',
        effects: { stats: { athletics: 5, popularity: 3 }, npcRelationships: { '1': { friendship: 10 } } },
      },
      {
        id: 'wa-sit-nerds',
        text: 'Sit with the Nerds',
        effects: { stats: { academics: 5, creativity: 3 }, npcRelationships: { '3': { friendship: 10 } } },
      },
      {
        id: 'wa-sit-popular',
        text: 'Sit with the Popular crowd',
        statCheck: { stat: 'popularity', threshold: 25 },
        effects: { stats: { popularity: 8 }, npcRelationships: { '2': { friendship: 10 } } },
      },
      {
        id: 'wa-sit-alone',
        text: 'Sit alone and observe',
        effects: { stats: { creativity: 5, rebellion: 3 } },
      },
    ],
    rewards: { stats: { happiness: 5 } },
  },
  {
    id: 'evt-first-football',
    title: 'First Football Game',
    description:
      'The home team takes the field for the first game of the season. The stands are packed. Spirit week culminates in this moment.',
    category: 'sports',
    scope: 'school_wide',
    semester: 1,
    day: 8,
    period: 'evening',
    duration: 2,
    choices: [
      {
        id: 'fg-cheer',
        text: 'Cheer from the front row',
        effects: { stats: { athletics: 3, popularity: 5 }, npcRelationships: { '1': { friendship: 10 }, '7': { friendship: 5 } } },
      },
      {
        id: 'fg-concessions',
        text: 'Skip the game, hang at concessions',
        effects: { stats: { rebellion: 5, happiness: 5 } },
      },
      {
        id: 'fg-study',
        text: 'Stay home and study instead',
        effects: { stats: { academics: 10 }, npcRelationships: { '3': { friendship: 5 } } },
      },
    ],
    rewards: { stats: { happiness: 5, schoolSpirit: 10 } },
  },
  {
    id: 'evt-halloween-dance',
    title: 'Halloween Dance',
    description:
      'The gym transforms into a haunted mansion. Costumes are judged, votes are cast for king and queen, and someone always spikes the punch.',
    category: 'social',
    scope: 'school_wide',
    semester: 1,
    day: 28,
    period: 'evening',
    duration: 3,
    choices: [
      {
        id: 'hd-costume',
        text: 'Go all-out on a creative costume',
        effects: { stats: { creativity: 10, popularity: 10 }, atmosphereDelta: 10 },
      },
      {
        id: 'hd-date',
        text: 'Ask someone special to go with you',
        effects: { stats: { popularity: 5, happiness: 10 }, npcRelationships: {} },
      },
      {
        id: 'hd-prank',
        text: 'Pull a spooky prank on the dance floor',
        effects: { stats: { rebellion: 10, popularity: 5 }, atmosphereDelta: 5 },
      },
      {
        id: 'hd-skip',
        text: 'Skip it and have a horror movie night',
        effects: { stats: { happiness: 5 } },
      },
    ],
    consequences: [
      {
        triggerChoiceId: 'hd-prank',
        delayedDays: 2,
        description: 'The principal calls an assembly about the prank. Tension rises.',
        effects: { stats: { popularity: -3 } },
      },
    ],
  },
  {
    id: 'evt-midterm-s1',
    title: 'Midterm Exams',
    description:
      'A week of written exams determines your academic standing. Stress is high. Study groups form in every corner of the library.',
    category: 'academic',
    scope: 'school_wide',
    semester: 1,
    day: 45,
    period: 'morning',
    duration: 5,
    choices: [
      {
        id: 'me-study-hard',
        text: 'Study every night',
        effects: { stats: { academics: 15, energy: -20, happiness: -5 } },
      },
      {
        id: 'me-cheat-sheet',
        text: 'Use a cheat sheet (risky)',
        effects: { stats: { academics: 10, rebellion: 15 }, atmosphereDelta: -5 },
      },
      {
        id: 'me-group',
        text: 'Join a study group',
        effects: { stats: { academics: 8, socialEnergy: 5 }, npcRelationships: { '3': { friendship: 5 } } },
      },
      {
        id: 'me-wing',
        text: 'Wing it and hope for the best',
        effects: { stats: { academics: -5, happiness: 5, rebellion: 5 } },
      },
    ],
    consequences: [
      {
        triggerChoiceId: 'me-cheat-sheet',
        delayedDays: 3,
        description: 'You got caught! Detention and academic probation.',
        effects: { stats: { academics: -10, popularity: -5 } },
      },
    ],
  },
  {
    id: 'evt-thanksgiving',
    title: 'Thanksgiving Break',
    description: 'A four-day weekend. No school, no homework (supposedly), just food and family drama.',
    category: 'holiday',
    scope: 'global',
    semester: 1,
    day: 60,
    period: 'morning',
    duration: 4,
    choices: [
      {
        id: 'tb-family',
        text: 'Spend time with family',
        effects: { stats: { happiness: 10, energy: 15 } },
      },
      {
        id: 'tb-friends',
        text: 'Host a Friendsgiving',
        effects: { stats: { popularity: 10, happiness: 10 }, npcRelationships: { '2': { friendship: 5 } } },
      },
      {
        id: 'tb-study',
        text: 'Catch up on homework',
        effects: { stats: { academics: 10, happiness: -5 } },
      },
    ],
  },

  // ===== SEMESTER 2: Freshman Spring =====
  {
    id: 'evt-winter-formal',
    title: 'Winter Formal',
    description:
      'The first formal dance of the year. Snowflake decorations, slow dances, and secret crushes being revealed under dim lights.',
    category: 'social',
    scope: 'school_wide',
    semester: 2,
    day: 15,
    period: 'evening',
    duration: 3,
    choices: [
      {
        id: 'wf-ask-crush',
        text: 'Work up the courage to ask your crush',
        effects: { stats: { happiness: 10, popularity: 5 } },
      },
      {
        id: 'wf-committee',
        text: 'Join the decoration committee',
        effects: { stats: { creativity: 10, popularity: 5 }, atmosphereDelta: 5 },
      },
      {
        id: 'wf-skip',
        text: 'Skip it and go to the arcade',
        effects: { stats: { rebellion: 5, happiness: 5 } },
      },
    ],
    rewards: { stats: { happiness: 5 } },
  },
  {
    id: 'evt-valentines',
    title: "Valentine's Day",
    description:
      'Candy grams are delivered, secret admirers leave notes, and the whole school smells like cheap chocolate and roses.',
    category: 'social',
    scope: 'school_wide',
    semester: 2,
    day: 35,
    period: 'lunch',
    choices: [
      {
        id: 'vd-send-gifts',
        text: 'Send anonymous gifts to someone',
        effects: { stats: { happiness: 5 }, npcRelationships: {} },
      },
      {
        id: 'vd-cynical',
        text: 'Wear black and boycott romance',
        effects: { stats: { rebellion: 10 }, npcRelationships: { '4': { friendship: 10 } } },
      },
      {
        id: 'vd-cupid',
        text: 'Play matchmaker for your friends',
        effects: { stats: { popularity: 10, happiness: 5 }, atmosphereDelta: 5 },
      },
    ],
  },
  {
    id: 'evt-science-fair',
    title: 'Science Fair',
    description:
      'Projects line the gym. Robots, volcanoes, questionable experiments — and college scouts watching from the back.',
    category: 'academic',
    scope: 'school_wide',
    semester: 2,
    day: 50,
    period: 'afternoon',
    duration: 2,
    choices: [
      {
        id: 'sf-participate',
        text: 'Enter your best project',
        effects: { stats: { academics: 15, creativity: 5, popularity: 5 }, npcRelationships: { '8': { friendship: 10 } } },
      },
      {
        id: 'sf-sabotage',
        text: 'Sabotage a rival project',
        effects: { stats: { rebellion: 15, popularity: -5 }, atmosphereDelta: -10 },
      },
      {
        id: 'sf-cheer',
        text: 'Support your friends',
        effects: { stats: { happiness: 5, popularity: 5 }, npcRelationships: { '3': { friendship: 5 } } },
      },
    ],
  },
  {
    id: 'evt-spring-break',
    title: 'Spring Break',
    description:
      'A full week off. Beach trips, parties, or finally catching up on sleep. The choice is yours.',
    category: 'holiday',
    scope: 'global',
    semester: 2,
    day: 65,
    period: 'morning',
    duration: 7,
    choices: [
      {
        id: 'sb-beach',
        text: 'Hit the beach with friends',
        effects: { stats: { popularity: 10, happiness: 10, athletics: 5 } },
      },
      {
        id: 'sb-study',
        text: 'Attend a spring prep course',
        effects: { stats: { academics: 15, happiness: -5 } },
      },
      {
        id: 'sb-chill',
        text: 'Stay home and recharge',
        effects: { stats: { happiness: 10, energy: 20, creativity: 5 } },
      },
    ],
  },
  {
    id: 'evt-talent-show',
    title: 'Talent Show',
    description:
      'The annual showcase of hidden (and not-so-hidden) talents. Music, comedy, magic tricks, and inevitable disasters.',
    category: 'arts',
    scope: 'school_wide',
    semester: 2,
    day: 82,
    period: 'evening',
    duration: 2,
    choices: [
      {
        id: 'ts-perform',
        text: 'Perform your special talent',
        effects: { stats: { creativity: 10, popularity: 15 }, atmosphereDelta: 10 },
      },
      {
        id: 'ts-backstage',
        text: 'Help backstage',
        effects: { stats: { creativity: 5, popularity: 5 } },
      },
      {
        id: 'ts-judge',
        text: 'Be a harsh critic',
        effects: { stats: { rebellion: 5, popularity: -3 } },
      },
    ],
  },

  // ===== SEMESTER 3: Sophomore Fall (Prom Year) =====
  {
    id: 'evt-promposals',
    title: 'Promposals Begin',
    description:
      'The elaborate public promposals have started. Flash mobs, decorated lockers, and grand gestures in the cafeteria.',
    category: 'social',
    scope: 'school_wide',
    semester: 3,
    day: 20,
    period: 'lunch',
    duration: 14,
    choices: [
      {
        id: 'pr-plan',
        text: 'Plan an epic promposal of your own',
        effects: { stats: { creativity: 10, popularity: 10 }, atmosphereDelta: 5 },
      },
      {
        id: 'pr-watch',
        text: 'Watch from the sidelines',
        effects: { stats: { happiness: 5 } },
      },
      {
        id: 'pr-meme',
        text: 'Make memes about the over-the-top promposals',
        effects: { stats: { creativity: 5, popularity: 5, rebellion: 3 } },
      },
    ],
  },
  {
    id: 'evt-prom',
    title: 'Prom Night',
    description:
      'The biggest night of high school. Limos, corsages, a fancy venue, and memories that last forever.',
    category: 'social',
    scope: 'school_wide',
    semester: 3,
    day: 45,
    period: 'evening',
    duration: 4,
    choices: [
      {
        id: 'prom-perfect',
        text: 'Make it a perfect fairytale evening',
        effects: { stats: { happiness: 20, popularity: 10 }, atmosphereDelta: 10 },
      },
      {
        id: 'prom-drama',
        text: 'Start some drama on the dance floor',
        effects: { stats: { popularity: 10, rebellion: 10 }, atmosphereDelta: -5 },
      },
      {
        id: 'prom-after',
        text: 'Sneak out to the afterparty',
        effects: { stats: { rebellion: 15, happiness: 10 } },
      },
    ],
    rewards: { stats: { happiness: 10 }, currency: { points: 100 } },
  },
  {
    id: 'evt-senior-prank',
    title: 'Senior Prank Planning',
    description:
      'The seniors are organizing their legendary prank. Rumors say it involves farm animals, water balloons, or something even more elaborate.',
    category: 'drama',
    scope: 'school_wide',
    semester: 3,
    day: 55,
    period: 'night',
    choices: [
      {
        id: 'sp-join',
        text: 'Join the prank crew',
        effects: { stats: { rebellion: 15, popularity: 10 }, atmosphereDelta: -5 },
      },
      {
        id: 'sp-snitch',
        text: 'Anonymously tip off the principal',
        effects: { stats: { academics: 5, popularity: -10 }, atmosphereDelta: -10 },
      },
      {
        id: 'sp-document',
        text: 'Document everything for the yearbook',
        effects: { stats: { creativity: 10, popularity: 5 } },
      },
    ],
    consequences: [
      {
        triggerChoiceId: 'sp-join',
        delayedDays: 3,
        description: 'The prank went viral! You are briefly a legend.',
        effects: { stats: { popularity: 15, rebellion: 5 } },
      },
    ],
  },
  {
    id: 'evt-finals-s3',
    title: 'Finals Week',
    description:
      'The most important exams of the year. Coffee flows like water. Sleep becomes a myth. Your future feels like it rides on every grade.',
    category: 'academic',
    scope: 'school_wide',
    semester: 3,
    day: 80,
    period: 'morning',
    duration: 5,
    choices: [
      {
        id: 'fw-grind',
        text: 'Grind every subject',
        effects: { stats: { academics: 20, energy: -30, happiness: -10 } },
      },
      {
        id: 'fw-clutch',
        text: 'Cram at the last minute',
        effects: { stats: { academics: 5, happiness: 5 } },
      },
      {
        id: 'fw-help',
        text: 'Form a study circle and help others',
        effects: { stats: { academics: 10, popularity: 5 }, npcRelationships: { '3': { friendship: 10 } } },
      },
    ],
    rewards: { stats: { happiness: 5 } },
  },

  // ===== SEMESTER 4: Senior Year / Graduation =====
  {
    id: 'evt-grad-practice',
    title: 'Graduation Practice',
    description:
      'Rehearsing walking across a stage, shaking hands, and not tripping. Somehow takes three hours.',
    category: 'academic',
    scope: 'school_wide',
    semester: 4,
    day: 10,
    period: 'morning',
    duration: 1,
    choices: [
      {
        id: 'gp-serious',
        text: 'Take it seriously',
        effects: { stats: { academics: 3, popularity: 3 } },
      },
      {
        id: 'gp-goof',
        text: 'Goof off with friends',
        effects: { stats: { happiness: 10, rebellion: 5, popularity: 5 } },
      },
    ],
  },
  {
    id: 'evt-senior-trip',
    title: 'Senior Trip',
    description:
      'An overnight trip to the mountains. Campfires, bonding, and probably someone getting lost in the woods.',
    category: 'social',
    scope: 'school_wide',
    semester: 4,
    day: 30,
    period: 'morning',
    duration: 2,
    choices: [
      {
        id: 'st-bond',
        text: 'Bond with classmates you never talked to',
        effects: { stats: { popularity: 10, happiness: 10 }, atmosphereDelta: 10 },
      },
      {
        id: 'st-nature',
        text: 'Explore the wilderness alone',
        effects: { stats: { creativity: 5, happiness: 5, rebellion: 5 } },
      },
      {
        id: 'st-prank',
        text: 'Start a campfire prank war',
        effects: { stats: { popularity: 5, rebellion: 10 } },
      },
    ],
    rewards: { stats: { happiness: 10 } },
  },
  {
    id: 'evt-final-exams',
    title: 'Final Exams',
    description:
      'The last exams of your high school career. Everything you have learned comes down to these final days.',
    category: 'academic',
    scope: 'school_wide',
    semester: 4,
    day: 60,
    period: 'morning',
    duration: 5,
    choices: [
      {
        id: 'fe-ace',
        text: 'Ace them and finish strong',
        effects: { stats: { academics: 25, happiness: 10 }, atmosphereDelta: 5 },
      },
      {
        id: 'fe-senioritis',
        text: 'Let senioritis take over',
        effects: { stats: { academics: -5, happiness: 15, rebellion: 10 } },
      },
      {
        id: 'fe-legacy',
        text: 'Leave notes for future students',
        effects: { stats: { academics: 5, creativity: 10, popularity: 5 } },
      },
    ],
    rewards: { stats: { happiness: 15 }, currency: { points: 200 } },
  },
  {
    id: 'evt-graduation',
    title: 'Graduation Ceremony',
    description:
      'Caps, gowns, tears, and cheers. Your high school journey culminates in this single moment. The future awaits.',
    category: 'academic',
    scope: 'school_wide',
    semester: 4,
    day: 75,
    period: 'morning',
    duration: 3,
    choices: [
      {
        id: 'grad-speech',
        text: 'Give the valedictorian speech',
        statCheck: { stat: 'academics', threshold: 80 },
        effects: { stats: { popularity: 20, happiness: 15 }, atmosphereDelta: 15 },
      },
      {
        id: 'grad-celebrate',
        text: 'Celebrate with everyone',
        effects: { stats: { happiness: 20, popularity: 10 }, atmosphereDelta: 10 },
      },
      {
        id: 'grad-prank',
        text: 'One final prank during the ceremony',
        effects: { stats: { rebellion: 15, popularity: 10 }, atmosphereDelta: -5 },
      },
    ],
    rewards: { stats: { happiness: 30 }, currency: { points: 500, gems: 10 } },
  },

  // ===== CRISIS EVENTS =====
  {
    id: 'evt-cheating-scandal',
    title: 'Cheating Scandal',
    description:
      'A massive cheating ring is uncovered. Fingers are pointed. Trust is shattered. The whole school is under investigation.',
    category: 'crisis',
    scope: 'school_wide',
    semester: 1,
    day: 35,
    period: 'morning',
    choices: [
      {
        id: 'cs-innocent',
        text: 'Prove your innocence publicly',
        effects: { stats: { popularity: 5, academics: 3 }, atmosphereDelta: 5 },
      },
      {
        id: 'cs-investigate',
        text: 'Investigate who is really behind it',
        effects: { stats: { creativity: 10, popularity: 5 }, atmosphereDelta: 5 },
      },
      {
        id: 'cs-deny',
        text: 'Keep your head down and deny everything',
        effects: { stats: { rebellion: 5 } },
      },
    ],
    consequences: [
      {
        triggerChoiceId: 'cs-investigate',
        delayedDays: 2,
        description: 'You exposed the truth and became a hero!',
        effects: { stats: { popularity: 10, academics: 5 } },
      },
    ],
  },
  {
    id: 'evt-budget-cuts',
    title: 'Budget Cuts Crisis',
    description:
      'The school board announces major budget cuts. Sports teams, arts programs, and clubs are all on the chopping block.',
    category: 'crisis',
    scope: 'school_wide',
    semester: 2,
    day: 25,
    period: 'afternoon',
    choices: [
      {
        id: 'bc-protest',
        text: 'Organize a student protest',
        effects: { stats: { popularity: 10, rebellion: 10 }, atmosphereDelta: -10 },
      },
      {
        id: 'bc-fundraiser',
        text: 'Start a fundraising campaign',
        effects: { stats: { creativity: 10, popularity: 5 }, atmosphereDelta: 10 },
      },
      {
        id: 'bc-petition',
        text: 'Write a petition to the school board',
        effects: { stats: { academics: 10, popularity: 5 } },
      },
    ],
  },
  {
    id: 'evt-rival-challenge',
    title: 'Rival School Challenge',
    description:
      'The rival school across town issues a challenge — academic decathlon, sports tournament, and art showcase. School pride is on the line.',
    category: 'sports',
    scope: 'school_wide',
    semester: 3,
    day: 10,
    period: 'afternoon',
    duration: 2,
    choices: [
      {
        id: 'rc-academic',
        text: 'Join the academic decathlon team',
        effects: { stats: { academics: 15, popularity: 5 }, npcRelationships: { '3': { friendship: 10 } } },
      },
      {
        id: 'rc-sports',
        text: 'Represent in the sports tournament',
        effects: { stats: { athletics: 15, popularity: 5 }, npcRelationships: { '1': { friendship: 10 } } },
      },
      {
        id: 'rc-arts',
        text: 'Showcase in the art competition',
        effects: { stats: { creativity: 15, popularity: 5 }, npcRelationships: { '5': { friendship: 10 } } },
      },
    ],
    rewards: { stats: { happiness: 10, popularity: 10 }, currency: { points: 150 } },
  },
];

// ------------------------------------------------------------------
// Seasonal Themes
// ------------------------------------------------------------------

export const SEASONAL_THEMES: SeasonalTheme[] = [
  {
    name: 'Fall Semester Start',
    startDay: { semester: 1, day: 1 },
    endDay: { semester: 1, day: 30 },
    atmosphereModifier: {
      overall: 10,
      academicPressure: 5,
      socialEnergy: 15,
      excitementLevel: 20,
    },
    specialEvents: ['evt-welcome-assembly', 'evt-first-football'],
    decoration: 'Golden leaves, warm lighting, back-to-school banners',
  },
  {
    name: 'Winter Holidays',
    startDay: { semester: 1, day: 55 },
    endDay: { semester: 2, day: 20 },
    atmosphereModifier: {
      overall: 15,
      socialEnergy: 10,
      excitementLevel: 15,
      academicPressure: -10,
    },
    specialEvents: ['evt-winter-formal', 'evt-valentines'],
    decoration: 'Snowflakes, twinkling lights, evergreen garlands, warm cocoa theme',
  },
  {
    name: 'Spring Renewal',
    startDay: { semester: 2, day: 45 },
    endDay: { semester: 3, day: 40 },
    atmosphereModifier: {
      overall: 10,
      socialEnergy: 15,
      excitementLevel: 20,
      dramaLevel: 10,
      academicPressure: -5,
    },
    specialEvents: ['evt-spring-break', 'evt-promposals', 'evt-prom'],
    decoration: 'Cherry blossoms, fresh green, pastel colors, renewal motifs',
  },
  {
    name: 'Senior Year End',
    startDay: { semester: 4, day: 1 },
    endDay: { semester: 4, day: 90 },
    atmosphereModifier: {
      overall: 5,
      excitementLevel: 30,
      socialEnergy: 20,
      academicPressure: 10,
      dramaLevel: 15,
    },
    specialEvents: ['evt-grad-practice', 'evt-senior-trip', 'evt-final-exams', 'evt-graduation'],
    decoration: 'Nostalgic photo collages, cap-and-gown motifs, golden hour lighting',
  },
];

// ------------------------------------------------------------------
// Queries
// ------------------------------------------------------------------

export function getEventsForDay(semester: number, day: number): ScheduledEvent[] {
  return SCHEDULED_EVENTS.filter(
    (e) => e.semester === semester && e.day === day
  );
}

export function canParticipateInEvent(
  event: ScheduledEvent,
  player: Player
): boolean {
  const req = event.requirements;
  if (!req) return true;

  // Check minimum stats
  if (req.minStats) {
    for (const [key, val] of Object.entries(req.minStats)) {
      const playerStat = player.stats[key as keyof typeof player.stats] as number | undefined;
      if (playerStat === undefined || playerStat < val) return false;
    }
  }

  // Check clique requirement
  if (req.clique && player.clique !== req.clique) return false;

  // Check NPC friendships
  if (req.npcFriendships) {
    for (const [npcId, minFriendship] of Object.entries(req.npcFriendships)) {
      // npcFriendships stored elsewhere or simple check
      // This is a simplified implementation
      void npcId;
      void minFriendship;
    }
  }

  return true;
}

export function processEventChoice(
  event: ScheduledEvent,
  choiceId: string,
  player: Player,
  npcs: NPC[]
): { updatedPlayer: Player; updatedNpcs: NPC[]; atmosphereShift: number } {
  const choice = event.choices.find((c) => c.id === choiceId);
  if (!choice) {
    return { updatedPlayer: player, updatedNpcs: npcs, atmosphereShift: 0 };
  }

  // Deep clone
  const updatedPlayer: Player = JSON.parse(JSON.stringify(player));
  const updatedNpcs: NPC[] = JSON.parse(JSON.stringify(npcs));

  // Apply stat effects
  if (choice.effects.stats) {
    for (const [key, val] of Object.entries(choice.effects.stats)) {
      if (val === undefined) continue;
      const current = updatedPlayer.stats[key as keyof typeof updatedPlayer.stats] as number;
      (updatedPlayer.stats as Record<string, number>)[key] = clamp((current ?? 0) + val, 0, 100);
    }
  }

  // Apply NPC relationship effects
  if (choice.effects.npcRelationships) {
    for (const [npcId, delta] of Object.entries(choice.effects.npcRelationships)) {
      const npc = updatedNpcs.find((n) => n.id === npcId);
      if (npc && delta) {
        if (delta.friendship !== undefined) {
          npc.relationship = clamp(npc.relationship + delta.friendship, 0, 100);
        }
        if (delta.romance !== undefined) {
          npc.romance = clamp(npc.romance + delta.romance, 0, 100);
        }
      }
    }
  }

  // Apply rewards
  if (event.rewards?.stats) {
    for (const [key, val] of Object.entries(event.rewards.stats)) {
      if (val === undefined) continue;
      const current = updatedPlayer.stats[key as keyof typeof updatedPlayer.stats] as number;
      (updatedPlayer.stats as Record<string, number>)[key] = clamp((current ?? 0) + val, 0, 100);
    }
  }
  if (event.rewards?.currency) {
    if (event.rewards.currency.points) {
      updatedPlayer.currency.points += event.rewards.currency.points;
    }
    if (event.rewards.currency.gems) {
      updatedPlayer.currency.gems += event.rewards.currency.gems;
    }
  }

  const atmosphereShift = choice.effects.atmosphereDelta ?? 0;

  return { updatedPlayer, updatedNpcs, atmosphereShift };
}

export function getUpcomingEvents(
  semester: number,
  currentDay: number,
  daysAhead: number
): CalendarEntry[] {
  const entries: CalendarEntry[] = [];

  for (let offset = 1; offset <= daysAhead; offset++) {
    let targetSemester = semester;
    let targetDay = currentDay + offset;

    // Handle semester boundary (90 days per semester)
    while (targetDay > 90) {
      targetDay -= 90;
      targetSemester += 1;
    }
    if (targetSemester > 4) break;

    const events = getEventsForDay(targetSemester, targetDay);
    if (events.length > 0) {
      entries.push({
        date: { semester: targetSemester, day: targetDay },
        events,
      });
    }
  }

  return entries;
}

export function getEventConsequences(
  eventId: string,
  choiceId: string,
  currentDay: number
): EventConsequence[] {
  const event = SCHEDULED_EVENTS.find((e) => e.id === eventId);
  if (!event?.consequences) return [];

  return event.consequences.filter(
    (c) => c.triggerChoiceId === choiceId && c.delayedDays <= currentDay + 7
  );
}

export function generateRandomCrisis(
  atmosphere: AtmosphereState
): ScheduledEvent | null {
  // Small base chance + increased chance when drama/tension is high
  const dramaBonus = atmosphere.dramaLevel / 200; // 0 to 0.5
  const tensionBonus = atmosphere.overall < 0 ? Math.abs(atmosphere.overall) / 200 : 0; // 0 to 0.5
  const roll = Math.random();

  if (roll < 0.02 + dramaBonus * 0.03 + tensionBonus * 0.03) {
    // Clone a crisis event and randomize its day slightly
    const crisisEvents = SCHEDULED_EVENTS.filter((e) => e.category === 'crisis');
    if (crisisEvents.length === 0) return null;

    const base = crisisEvents[Math.floor(Math.random() * crisisEvents.length)]!;
    return {
      ...base,
      id: `${base.id}-crisis-${Date.now()}`,
      day: base.day + Math.floor(Math.random() * 5) - 2,
    };
  }

  return null;
}

export function getCalendarForSemester(semester: number): CalendarEntry[] {
  const entries: CalendarEntry[] = [];
  const HOLIDAYS: Record<number, Array<{ day: number; name: string }>> = {
    1: [
      { day: 60, name: 'Thanksgiving Break' },
      { day: 88, name: 'Winter Break Start' },
    ],
    2: [
      { day: 35, name: "Valentine's Day" },
      { day: 65, name: 'Spring Break' },
      { day: 88, name: 'Easter Break' },
    ],
    3: [
      { day: 1, name: 'New Semester' },
      { day: 88, name: 'Senior Skip Day' },
    ],
    4: [
      { day: 1, name: 'Senior Year Begins' },
      { day: 75, name: 'Graduation Day' },
    ],
  };

  const semesterHolidays = HOLIDAYS[semester] ?? [];

  for (let day = 1; day <= 90; day++) {
    const events = getEventsForDay(semester, day);
    const holiday = semesterHolidays.find((h) => h.day === day);

    entries.push({
      date: { semester, day },
      events,
      isHoliday: !!holiday,
      holidayName: holiday?.name,
    });
  }

  return entries;
}

// ------------------------------------------------------------------
// Helper to get current seasonal theme
// ------------------------------------------------------------------

export function getCurrentSeasonalTheme(
  semester: number,
  day: number
): SeasonalTheme | undefined {
  return SEASONAL_THEMES.find((theme) => {
    const afterStart =
      theme.startDay.semester < semester ||
      (theme.startDay.semester === semester && theme.startDay.day <= day);
    const beforeEnd =
      theme.endDay.semester > semester ||
      (theme.endDay.semester === semester && theme.endDay.day >= day);
    return afterStart && beforeEnd;
  });
}

// ------------------------------------------------------------------
// Internal
// ------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
