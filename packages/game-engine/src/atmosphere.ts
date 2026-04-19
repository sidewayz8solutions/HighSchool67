import type { AtmosphereState, SeasonalTheme } from '@repo/types';

export function getDefaultAtmosphere(): AtmosphereState {
  return {
    overall: 0,
    academicPressure: 30,
    socialEnergy: 50,
    dramaLevel: 20,
    excitementLevel: 40,
    recentEvents: [],
  };
}

export function shiftAtmosphere(
  current: AtmosphereState,
  event: { type: string; impact: number }
): AtmosphereState {
  const next = { ...current, recentEvents: [...current.recentEvents] };

  switch (event.type) {
    case 'crisis':
      next.overall = clamp(next.overall - Math.abs(event.impact) * 1.5, -100, 100);
      next.dramaLevel = clamp(next.dramaLevel + Math.abs(event.impact), 0, 100);
      next.academicPressure = clamp(next.academicPressure + Math.abs(event.impact) * 0.5, 0, 100);
      next.excitementLevel = clamp(next.excitementLevel + Math.abs(event.impact) * 0.3, 0, 100);
      break;
    case 'social_event':
      next.overall = clamp(next.overall + Math.abs(event.impact) * 0.8, -100, 100);
      next.socialEnergy = clamp(next.socialEnergy + Math.abs(event.impact), 0, 100);
      next.excitementLevel = clamp(next.excitementLevel + Math.abs(event.impact) * 0.5, 0, 100);
      break;
    case 'academic':
      next.academicPressure = clamp(next.academicPressure + Math.abs(event.impact), 0, 100);
      next.overall = clamp(next.overall - Math.abs(event.impact) * 0.3, -100, 100);
      break;
    case 'sports':
      next.excitementLevel = clamp(next.excitementLevel + Math.abs(event.impact), 0, 100);
      next.socialEnergy = clamp(next.socialEnergy + Math.abs(event.impact) * 0.5, 0, 100);
      next.overall = clamp(next.overall + Math.abs(event.impact) * 0.4, -100, 100);
      break;
    case 'romance':
      next.socialEnergy = clamp(next.socialEnergy + Math.abs(event.impact) * 0.5, 0, 100);
      next.dramaLevel = clamp(next.dramaLevel + Math.abs(event.impact) * 0.3, 0, 100);
      next.overall = clamp(next.overall + Math.abs(event.impact) * 0.3, -100, 100);
      break;
    case 'drama':
      next.dramaLevel = clamp(next.dramaLevel + Math.abs(event.impact), 0, 100);
      next.overall = clamp(next.overall - Math.abs(event.impact) * 0.5, -100, 100);
      next.socialEnergy = clamp(next.socialEnergy + Math.abs(event.impact) * 0.3, 0, 100);
      break;
    case 'holiday':
      next.overall = clamp(next.overall + Math.abs(event.impact), -100, 100);
      next.socialEnergy = clamp(next.socialEnergy + Math.abs(event.impact) * 0.5, 0, 100);
      next.excitementLevel = clamp(next.excitementLevel + Math.abs(event.impact) * 0.5, 0, 100);
      next.academicPressure = clamp(next.academicPressure - Math.abs(event.impact) * 0.3, 0, 100);
      break;
    case 'opportunity':
      next.overall = clamp(next.overall + Math.abs(event.impact) * 0.6, -100, 100);
      next.excitementLevel = clamp(next.excitementLevel + Math.abs(event.impact) * 0.4, 0, 100);
      break;
    default:
      next.overall = clamp(next.overall + event.impact, -100, 100);
  }

  // Keep recent events bounded
  next.recentEvents = [
    { eventId: event.type, impact: event.impact, timestamp: Date.now() },
    ...next.recentEvents.slice(0, 19),
  ];

  return next;
}

export function decayAtmosphere(current: AtmosphereState): AtmosphereState {
  const DECAY_RATE = 0.15; // 15% decay toward neutral per application

  return {
    ...current,
    recentEvents: current.recentEvents,
    overall: driftToNeutral(current.overall, 0, DECAY_RATE),
    academicPressure: driftToNeutral(current.academicPressure, 30, DECAY_RATE),
    socialEnergy: driftToNeutral(current.socialEnergy, 50, DECAY_RATE),
    dramaLevel: driftToNeutral(current.dramaLevel, 20, DECAY_RATE),
    excitementLevel: driftToNeutral(current.excitementLevel, 40, DECAY_RATE),
  };
}

export function getAtmosphereDescription(atmosphere: AtmosphereState): string {
  const { overall, academicPressure, socialEnergy, dramaLevel, excitementLevel } = atmosphere;

  const descriptors: string[] = [];

  // Overall mood
  if (overall >= 60) descriptors.push('harmonious');
  else if (overall >= 30) descriptors.push('positive');
  else if (overall >= 10) descriptors.push('calm');
  else if (overall >= -10) descriptors.push('neutral');
  else if (overall >= -30) descriptors.push('uneasy');
  else if (overall >= -60) descriptors.push('tense');
  else descriptors.push('volatile');

  // Academic modifier
  if (academicPressure >= 70) descriptors.push('stressful');
  else if (academicPressure >= 50) descriptors.push('focused');

  // Social modifier
  if (socialEnergy >= 70) descriptors.push('buzzing');
  else if (socialEnergy <= 20) descriptors.push('quiet');

  // Drama modifier
  if (dramaLevel >= 70) descriptors.push('drama-filled');
  else if (dramaLevel >= 40) descriptors.push('gossipy');

  // Excitement modifier
  if (excitementLevel >= 70) descriptors.push('electric');
  else if (excitementLevel >= 50) descriptors.push('exciting');

  if (descriptors.length === 1) return descriptors[0]!;
  if (descriptors.length === 2) return `${descriptors[0]} and ${descriptors[1]}`;

  // Return most relevant 2-3 descriptors
  const primary = descriptors.slice(0, 2).join(' and ');
  return primary;
}

export function getAtmosphereEffects(atmosphere: AtmosphereState): {
  eventModifier: number;
  npcInteractionBonus: number;
} {
  // Overall atmosphere affects event outcomes (-10% to +10%)
  const eventModifier = clamp(atmosphere.overall / 1000, -0.1, 0.1);

  // Social energy affects NPC interactions (0 to +15%)
  const npcInteractionBonus = clamp(atmosphere.socialEnergy / 500, 0, 0.15);

  return { eventModifier, npcInteractionBonus };
}

export function applySeasonalModifiers(
  atmosphere: AtmosphereState,
  theme: SeasonalTheme
): AtmosphereState {
  const mod = theme.atmosphereModifier;

  return {
    ...atmosphere,
    recentEvents: [...atmosphere.recentEvents],
    overall: clamp(
      atmosphere.overall + (mod.overall ?? 0),
      -100,
      100
    ),
    academicPressure: clamp(
      atmosphere.academicPressure + (mod.academicPressure ?? 0),
      0,
      100
    ),
    socialEnergy: clamp(
      atmosphere.socialEnergy + (mod.socialEnergy ?? 0),
      0,
      100
    ),
    dramaLevel: clamp(atmosphere.dramaLevel + (mod.dramaLevel ?? 0), 0, 100),
    excitementLevel: clamp(
      atmosphere.excitementLevel + (mod.excitementLevel ?? 0),
      0,
      100
    ),
  };
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function driftToNeutral(value: number, neutral: number, rate: number): number {
  const diff = neutral - value;
  return value + diff * rate;
}
