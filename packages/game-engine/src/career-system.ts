import type {
  CareerPath,
  CareerMilestone,
  Player,
  Stats,
} from '@repo/types';

const MAX_STAT = 100;

// ─── 8 Career Paths ─────────────────────────────────────────────────

export const CAREER_PATHS: CareerPath[] = [
  {
    id: 'pro_athlete',
    name: 'Pro Athlete',
    description: 'Rise from high school sports to professional glory. Dominate every field, court, and track.',
    icon: '🏆',
    requirements: { dominantStat: 'athletics', minValue: 50 },
    milestones: [
      { id: 'ath_m1', name: 'Varsity Starter', description: 'Make the varsity team', requirement: { stat: 'athletics', value: 40 }, reward: { title: 'Varsity Player', currency: { points: 100 } }, completed: false },
      { id: 'ath_m2', name: 'Team Captain', description: 'Lead your team as captain', requirement: { stat: 'athletics', value: 55 }, reward: { title: 'Captain', currency: { points: 200 } }, completed: false },
      { id: 'ath_m3', name: 'State Champion', description: 'Win the state championship', requirement: { stat: 'athletics', value: 70 }, reward: { title: 'State Champ', currency: { points: 300, gems: 5 } }, completed: false },
      { id: 'ath_m4', name: 'College Scout', description: 'Get scouted by a college team', requirement: { stat: 'athletics', value: 80 }, reward: { title: 'Scouted', currency: { points: 500, gems: 10 } }, completed: false },
      { id: 'ath_m5', name: 'Pro Contract', description: 'Sign your first professional contract', requirement: { stat: 'athletics', value: 90 }, reward: { title: 'Pro Athlete', currency: { points: 1000, gems: 25 } }, completed: false },
    ],
    currentMilestone: 0,
  },
  {
    id: 'scientist',
    name: 'Scientist',
    description: 'The path of discovery. Unlock the secrets of the universe through research and intellect.',
    icon: '🔬',
    requirements: { dominantStat: 'academics', minValue: 50 },
    milestones: [
      { id: 'sci_m1', name: 'Science Fair Winner', description: 'Win the school science fair', requirement: { stat: 'academics', value: 40 }, reward: { title: 'Science Whiz', currency: { points: 100 } }, completed: false },
      { id: 'sci_m2', name: 'Published Paper', description: 'Publish your first research paper', requirement: { stat: 'academics', value: 55 }, reward: { title: 'Researcher', currency: { points: 200 } }, completed: false },
      { id: 'sci_m3', name: 'Scholarship Award', description: 'Earn a full science scholarship', requirement: { stat: 'academics', value: 70 }, reward: { title: 'Scholar', currency: { points: 300, gems: 5 } }, completed: false },
      { id: 'sci_m4', name: 'Lab Director', description: 'Lead your own research lab', requirement: { stat: 'academics', value: 80 }, reward: { title: 'Lab Director', currency: { points: 500, gems: 10 } }, completed: false },
      { id: 'sci_m5', name: 'Noble Prize', description: 'Make a breakthrough discovery', requirement: { stat: 'academics', value: 90 }, reward: { title: 'Nobel Laureate', currency: { points: 1000, gems: 25 } }, completed: false },
    ],
    currentMilestone: 0,
  },
  {
    id: 'artist',
    name: 'Artist',
    description: 'Express yourself through creation. Paint, sculpt, and design your way to fame.',
    icon: '🎨',
    requirements: { dominantStat: 'creativity', minValue: 50 },
    milestones: [
      { id: 'art_m1', name: 'Gallery Show', description: 'Display your work at a gallery', requirement: { stat: 'creativity', value: 40 }, reward: { title: 'Exhibited Artist', currency: { points: 100 } }, completed: false },
      { id: 'art_m2', name: 'Commission Work', description: 'Get paid for your art', requirement: { stat: 'creativity', value: 55 }, reward: { title: 'Professional Artist', currency: { points: 200 } }, completed: false },
      { id: 'art_m3', name: 'Art School', description: 'Get accepted to a top art school', requirement: { stat: 'creativity', value: 70 }, reward: { title: 'Art Student', currency: { points: 300, gems: 5 } }, completed: false },
      { id: 'art_m4', name: 'Famous Piece', description: 'Create a piece that goes viral', requirement: { stat: 'creativity', value: 80 }, reward: { title: 'Famous Artist', currency: { points: 500, gems: 10 } }, completed: false },
      { id: 'art_m5', name: 'Living Legend', description: 'Become a household name in art', requirement: { stat: 'creativity', value: 90 }, reward: { title: 'Art Legend', currency: { points: 1000, gems: 25 } }, completed: false },
    ],
    currentMilestone: 0,
  },
  {
    id: 'influencer',
    name: 'Influencer',
    description: 'Build your brand, grow your following, and become a social media phenomenon.',
    icon: '📱',
    requirements: { dominantStat: 'popularity', minValue: 50 },
    milestones: [
      { id: 'inf_m1', name: 'First 1K', description: 'Reach 1,000 followers', requirement: { stat: 'popularity', value: 40 }, reward: { title: 'Micro Influencer', currency: { points: 100 } }, completed: false },
      { id: 'inf_m2', name: 'Brand Deal', description: 'Land your first sponsorship', requirement: { stat: 'popularity', value: 55 }, reward: { title: 'Brand Partner', currency: { points: 200 } }, completed: false },
      { id: 'inf_m3', name: 'Viral Moment', description: 'Create content that goes viral', requirement: { stat: 'popularity', value: 70 }, reward: { title: 'Viral Star', currency: { points: 300, gems: 5 } }, completed: false },
      { id: 'inf_m4', name: 'Celebrity Status', description: 'Get recognized everywhere you go', requirement: { stat: 'popularity', value: 80 }, reward: { title: 'Celebrity', currency: { points: 500, gems: 10 } }, completed: false },
      { id: 'inf_m5', name: 'Social Empire', description: 'Build a media empire', requirement: { stat: 'popularity', value: 90 }, reward: { title: 'Media Mogul', currency: { points: 1000, gems: 25 } }, completed: false },
    ],
    currentMilestone: 0,
  },
  {
    id: 'entrepreneur',
    name: 'Entrepreneur',
    description: 'Combine brains and charm to build a business empire from the ground up.',
    icon: '💼',
    requirements: { dominantStat: 'academics', minValue: 40, secondaryStat: 'popularity', secondaryMin: 30 },
    milestones: [
      { id: 'ent_m1', name: 'First Sale', description: 'Make your first business sale', requirement: { stat: 'academics', value: 45 }, reward: { title: 'Founder', currency: { points: 150 } }, completed: false },
      { id: 'ent_m2', name: 'Small Business', description: 'Hire your first employee', requirement: { stat: 'popularity', value: 50 }, reward: { title: 'Business Owner', currency: { points: 250 } }, completed: false },
      { id: 'ent_m3', name: 'Investor Pitch', description: 'Secure venture capital funding', requirement: { stat: 'academics', value: 65 }, reward: { title: 'Funded Founder', currency: { points: 400, gems: 5 } }, completed: false },
      { id: 'ent_m4', name: 'IPO', description: 'Take your company public', requirement: { stat: 'popularity', value: 75 }, reward: { title: 'IPO Champion', currency: { points: 600, gems: 10 } }, completed: false },
      { id: 'ent_m5', name: 'Billionaire', description: 'Reach unicorn status', requirement: { stat: 'academics', value: 85 }, reward: { title: 'Unicorn Founder', currency: { points: 1200, gems: 25 } }, completed: false },
    ],
    currentMilestone: 0,
  },
  {
    id: 'musician',
    name: 'Musician',
    description: 'Let your creativity and rebellious spirit fuel your music. Tour the world.',
    icon: '🎸',
    requirements: { dominantStat: 'creativity', minValue: 40, secondaryStat: 'rebellion', secondaryMin: 30 },
    milestones: [
      { id: 'mus_m1', name: 'First Gig', description: 'Play your first live show', requirement: { stat: 'creativity', value: 45 }, reward: { title: 'Gigging Musician', currency: { points: 150 } }, completed: false },
      { id: 'mus_m2', name: 'Band Formed', description: 'Form a band with other students', requirement: { stat: 'rebellion', value: 45 }, reward: { title: 'Band Member', currency: { points: 250 } }, completed: false },
      { id: 'mus_m3', name: 'Record Deal', description: 'Sign with a record label', requirement: { stat: 'creativity', value: 65 }, reward: { title: 'Signed Artist', currency: { points: 400, gems: 5 } }, completed: false },
      { id: 'mus_m4', name: 'Chart Topper', description: 'Hit #1 on the charts', requirement: { stat: 'popularity', value: 70 }, reward: { title: 'Chart Topper', currency: { points: 600, gems: 10 } }, completed: false },
      { id: 'mus_m5', name: 'Rock Legend', description: 'Sell out a world tour', requirement: { stat: 'creativity', value: 85 }, reward: { title: 'Rock Legend', currency: { points: 1200, gems: 25 } }, completed: false },
    ],
    currentMilestone: 0,
  },
  {
    id: 'activist',
    name: 'Activist',
    description: 'Use your voice and rebellious spirit to change the world. Lead movements.',
    icon: '✊',
    requirements: { dominantStat: 'popularity', minValue: 40, secondaryStat: 'rebellion', secondaryMin: 30 },
    milestones: [
      { id: 'act_m1', name: 'First Protest', description: 'Organize your first protest', requirement: { stat: 'rebellion', value: 40 }, reward: { title: 'Protester', currency: { points: 150 } }, completed: false },
      { id: 'act_m2', name: 'Movement Leader', description: 'Lead a student movement', requirement: { stat: 'popularity', value: 50 }, reward: { title: 'Movement Leader', currency: { points: 250 } }, completed: false },
      { id: 'act_m3', name: 'Policy Change', description: 'Influence real policy change', requirement: { stat: 'popularity', value: 65 }, reward: { title: 'Change Maker', currency: { points: 400, gems: 5 } }, completed: false },
      { id: 'act_m4', name: 'National Voice', description: 'Speak on the national stage', requirement: { stat: 'popularity', value: 80 }, reward: { title: 'National Voice', currency: { points: 600, gems: 10 } }, completed: false },
      { id: 'act_m5', name: 'Revolutionary', description: 'Lead a global movement', requirement: { stat: 'rebellion', value: 85 }, reward: { title: 'Revolutionary', currency: { points: 1200, gems: 25 } }, completed: false },
    ],
    currentMilestone: 0,
  },
  {
    id: 'detective',
    name: 'Detective',
    description: 'Combine intellect with street smarts to solve mysteries others cannot.',
    icon: '🔍',
    requirements: { dominantStat: 'academics', minValue: 40, secondaryStat: 'rebellion', secondaryMin: 30 },
    milestones: [
      { id: 'det_m1', name: 'First Case', description: 'Solve your first mystery', requirement: { stat: 'academics', value: 45 }, reward: { title: 'Junior Detective', currency: { points: 150 } }, completed: false },
      { id: 'det_m2', name: 'School Sleuth', description: 'Uncover a school conspiracy', requirement: { stat: 'rebellion', value: 45 }, reward: { title: 'School Sleuth', currency: { points: 250 } }, completed: false },
      { id: 'det_m3', name: 'Private Eye', description: 'Open your own detective agency', requirement: { stat: 'academics', value: 65 }, reward: { title: 'Private Eye', currency: { points: 400, gems: 5 } }, completed: false },
      { id: 'det_m4', name: 'Famous Investigator', description: 'Solve a high-profile case', requirement: { stat: 'popularity', value: 60 }, reward: { title: 'Famous Investigator', currency: { points: 600, gems: 10 } }, completed: false },
      { id: 'det_m5', name: 'Master Detective', description: 'Solve the impossible case', requirement: { stat: 'academics', value: 90 }, reward: { title: 'Sherlock', currency: { points: 1200, gems: 25 } }, completed: false },
    ],
    currentMilestone: 0,
  },
];

// ─── Functions ──────────────────────────────────────────────────────

/**
 * Get all careers available to a player based on their current stats.
 */
export function getAvailableCareers(player: Player): CareerPath[] {
  return CAREER_PATHS.filter((career) => {
    const domStat = career.requirements.dominantStat as keyof Stats;
    const meetsPrimary = player.stats[domStat] >= career.requirements.minValue;

    if (career.requirements.secondaryStat && career.requirements.secondaryMin) {
      const secStat = career.requirements.secondaryStat as keyof Stats;
      const meetsSecondary = player.stats[secStat] >= career.requirements.secondaryMin;
      return meetsPrimary && meetsSecondary;
    }

    return meetsPrimary;
  }).map((career) => ({ ...career, milestones: career.milestones.map((m) => ({ ...m })) }));
}

/**
 * Get a specific career path by ID with current progress applied.
 */
export function getCurrentCareer(
  careerId: string,
  currentMilestoneIndex: number,
  completedMilestones: string[],
): CareerPath | null {
  const career = CAREER_PATHS.find((c) => c.id === careerId);
  if (!career) return null;

  const milestones = career.milestones.map((m) => ({
    ...m,
    completed: completedMilestones.includes(m.id),
  }));

  return {
    ...career,
    milestones,
    currentMilestone: currentMilestoneIndex,
  };
}

/**
 * Check milestone completions for a career path given player stats.
 * Returns updated career with new completions and rewards.
 */
export function checkMilestoneCompletion(
  career: CareerPath,
  player: Player,
): { updatedCareer: CareerPath; newlyCompleted: CareerMilestone[] } {
  const newlyCompleted: CareerMilestone[] = [];

  const updatedMilestones = career.milestones.map((milestone, idx) => {
    if (milestone.completed) return milestone;

    const statKey = milestone.requirement.stat as keyof Stats;
    const statValue = player.stats[statKey] ?? 0;

    if (statValue >= milestone.requirement.value) {
      const completed: CareerMilestone = {
        ...milestone,
        completed: true,
        completedAt: new Date().toISOString(),
      };
      newlyCompleted.push(completed);
      return completed;
    }

    return milestone;
  });

  // Advance current milestone index to the first incomplete one
  let nextMilestone = career.currentMilestone;
  while (
    nextMilestone < updatedMilestones.length &&
    updatedMilestones[nextMilestone]?.completed
  ) {
    nextMilestone++;
  }

  return {
    updatedCareer: {
      ...career,
      milestones: updatedMilestones,
      currentMilestone: nextMilestone,
    },
    newlyCompleted,
  };
}

/**
 * Get a career recommendation based on the player's highest stats.
 */
export function getCareerRecommendation(player: Player): CareerPath | null {
  const stats = player.stats;
  const statEntries: [string, number][] = [
    ['academics', stats.academics],
    ['athletics', stats.athletics],
    ['creativity', stats.creativity],
    ['popularity', stats.popularity],
    ['rebellion', stats.rebellion],
  ];

  // Sort by stat value descending
  statEntries.sort((a, b) => b[1] - a[1]);
  const [primaryStat, primaryValue] = statEntries[0]!;
  const [secondaryStat, secondaryValue] = statEntries[1]!;

  // Find careers that match the primary stat first
  const matching = CAREER_PATHS.filter((c) => {
    const meetsPrimary = c.requirements.dominantStat === primaryStat &&
      primaryValue >= c.requirements.minValue;
    if (!meetsPrimary) return false;
    if (c.requirements.secondaryStat && c.requirements.secondaryMin) {
      return stats[c.requirements.secondaryStat as keyof Stats] >= c.requirements.secondaryMin;
    }
    return true;
  });

  if (matching.length > 0) {
    // Pick the one whose secondary stat best matches
    matching.sort((a, b) => {
      const aSecMatch = a.requirements.secondaryStat === secondaryStat ? 1 : 0;
      const bSecMatch = b.requirements.secondaryStat === secondaryStat ? 1 : 0;
      return bSecMatch - aSecMatch;
    });
    const match = matching[0]!;
    return { ...match, milestones: match.milestones.map((m) => ({ ...m })) };
  }

  // Fallback: return the first available career
  const available = getAvailableCareers(player);
  return available.length > 0 ? available[0]! : null;
}

/**
 * Get the total rewards earned from completed milestones in a career.
 */
export function getCareerRewards(career: CareerPath): { totalPoints: number; totalGems: number } {
  return career.milestones.reduce(
    (acc, m) => {
      if (!m.completed) return acc;
      return {
        totalPoints: acc.totalPoints + (m.reward.currency?.points ?? 0),
        totalGems: acc.totalGems + (m.reward.currency?.gems ?? 0),
      };
    },
    { totalPoints: 0, totalGems: 0 }
  );
}

/**
 * Get career progress percentage.
 */
export function getCareerProgressPercentage(career: CareerPath): number {
  const completed = career.milestones.filter((m) => m.completed).length;
  return Math.round((completed / career.milestones.length) * 100);
}
