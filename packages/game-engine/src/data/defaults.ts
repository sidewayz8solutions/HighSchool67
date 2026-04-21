import type { NPC, Rival, RandomEvent, Achievement, DailyChallenge, NPCVisualConfig } from '@repo/types';

export function npcVisual(seed: string, overrides?: Partial<NPCVisualConfig>): NPCVisualConfig {
  return {
    seed,
    hair: ['short01'],
    hairColor: '#4a2511',
    skinColor: '#f5d0b5',
    ...overrides,
  };
}

export const DEFAULT_NPCS: NPC[] = [
  { id: '1', name: 'Chad', clique: 'jock', avatar: '🏈', visualConfig: npcVisual('chad-jock', { hair: ['short05'], hairColor: '#e5d7a3', skinColor: '#f2d3b1' }), relationship: 10, romance: 0, unlocked: true, bio: 'Star quarterback. Loud, loyal, and secretly writes poetry.', personality: 'friendly', schedule: { morning: 'Football field', lunch: 'Cafeteria', afternoon: 'Gym', evening: 'Locker room', night: 'Dorm' } },
  { id: '2', name: 'Britney', clique: 'popular', avatar: '💅', visualConfig: npcVisual('britney-popular', { hair: ['long01'], hairColor: '#e5d7a3', skinColor: '#f2d3b1' }), relationship: 10, romance: 0, unlocked: true, bio: 'Student council president. Sharp tongue, sharper mind.', personality: 'ambitious', schedule: { morning: 'Student Council', lunch: 'Cafeteria', afternoon: 'Library', evening: 'Mall', night: 'Home' } },
  { id: '3', name: 'Dexter', clique: 'nerd', avatar: '🤓', visualConfig: npcVisual('dexter-nerd', { hair: ['short01'], hairColor: '#0e0e0e', skinColor: '#ecad80' }), relationship: 10, romance: 0, unlocked: true, bio: 'Coding wizard. Socially awkward but will hack anything for a friend.', personality: 'loyal', schedule: { morning: 'Computer Lab', lunch: 'Library', afternoon: 'Robotics Club', evening: 'Dorm', night: 'Online' } },
  { id: '4', name: 'Raven', clique: 'goth', avatar: '🦇', visualConfig: npcVisual('raven-goth', { hair: ['long11'], hairColor: '#0e0e0e', skinColor: '#ecad80' }), relationship: 10, romance: 0, unlocked: true, bio: 'Poet who haunts the cemetery. Deeper than she lets on.', personality: 'mysterious', schedule: { morning: 'Art Room', lunch: 'Cafeteria corner', afternoon: 'Cemetery', evening: 'Coffee shop', night: 'Roof' } },
  { id: '5', name: 'Skyler', clique: 'artsy', avatar: '🎨', visualConfig: npcVisual('skyler-artsy', { hair: ['long06'], hairColor: '#afafaf', skinColor: '#f2d3b1' }), relationship: 10, romance: 0, unlocked: true, bio: 'Always sketching. Sees beauty in chaos.', personality: 'chill', schedule: { morning: 'Art Studio', lunch: 'Courtyard', afternoon: 'Gallery', evening: 'Park', night: 'Studio' } },
  { id: '6', name: 'Marcus', clique: 'jock', avatar: '🏀', visualConfig: npcVisual('marcus-jock', { hair: ['short11'], hairColor: '#0e0e0e', skinColor: '#9e5622' }), relationship: 5, romance: 0, unlocked: false, bio: 'Basketball captain. Chad\'s rival on and off the court.', personality: 'dramatic', schedule: { morning: 'Gym', lunch: 'Cafeteria', afternoon: 'Basketball court', evening: 'Weight room', night: 'Dorm' } },
  { id: '7', name: 'Amber', clique: 'popular', avatar: '✨', visualConfig: npcVisual('amber-popular', { hair: ['long19'], hairColor: '#cb6820', skinColor: '#f2d3b1' }), relationship: 5, romance: 0, unlocked: false, bio: 'Cheer captain. Britney\'s best friend and biggest competition.', personality: 'tsundere', schedule: { morning: 'Gym', lunch: 'Cafeteria', afternoon: 'Cheer practice', evening: 'Mall', night: 'Home' } },
  { id: '8', name: 'Leo', clique: 'nerd', avatar: '🔬', visualConfig: npcVisual('leo-nerd', { hair: ['short03'], hairColor: '#562306', skinColor: '#ecad80' }), relationship: 5, romance: 0, unlocked: false, bio: 'Science fair champion. Dexter\'s lab partner and occasional nemesis.', personality: 'ambitious', schedule: { morning: 'Science Lab', lunch: 'Library', afternoon: 'Lab', evening: 'Observatory', night: 'Dorm' } },
  { id: '9', name: 'Zoe', clique: 'goth', avatar: '🖤', visualConfig: npcVisual('zoe-goth', { hair: ['long22'], hairColor: '#3eac2c', skinColor: '#ecad80' }), relationship: 5, romance: 0, unlocked: false, bio: 'Band vocalist. Raven\'s cousin. Plays bass and breaks hearts.', personality: 'hyper', schedule: { morning: 'Music Room', lunch: 'Cafeteria', afternoon: 'Band practice', evening: 'Venue', night: 'Garage' } },
  { id: '10', name: 'Priya', clique: 'artsy', avatar: '📸', visualConfig: npcVisual('priya-artsy', { hair: ['long16'], hairColor: '#0e0e0e', skinColor: '#9e5622' }), relationship: 5, romance: 0, unlocked: false, bio: 'Photography genius. Captures moments others miss.', personality: 'mysterious', schedule: { morning: 'Darkroom', lunch: 'Courtyard', afternoon: 'Yearbook', evening: 'City', night: 'Rooftop' } },
  { id: '11', name: 'Tyler', clique: 'preppy', avatar: '📚', visualConfig: npcVisual('tyler-preppy', { hair: ['short08'], hairColor: '#ac6511', skinColor: '#f2d3b1' }), relationship: 5, romance: 0, unlocked: false, bio: 'Debate captain. Future politician. Always networking.', personality: 'ambitious', schedule: { morning: 'Debate Hall', lunch: 'Cafeteria', afternoon: 'Library', evening: 'Country Club', night: 'Home' } },
  { id: '12', name: 'Maya', clique: 'preppy', avatar: '🎻', visualConfig: npcVisual('maya-preppy', { hair: ['long25'], hairColor: '#0e0e0e', skinColor: '#f2d3b1' }), relationship: 5, romance: 0, unlocked: false, bio: 'Orchestra first chair. Perfect grades. Secretly loves metal.', personality: 'loyal', schedule: { morning: 'Music Room', lunch: 'Library', afternoon: 'Orchestra', evening: 'Practice room', night: 'Online forums' } },
  { id: '13', name: 'Jordan', clique: 'jock', avatar: '🏊', visualConfig: npcVisual('jordan-jock', { hair: ['short17'], hairColor: '#85c2c6', skinColor: '#f2d3b1' }), relationship: 5, romance: 0, unlocked: false, bio: 'Swim team star. Quiet, focused, unexpectedly kind.', personality: 'chill', schedule: { morning: 'Pool', lunch: 'Cafeteria', afternoon: 'Swim practice', evening: 'Beach', night: 'Dorm' } },
  { id: '14', name: 'Sasha', clique: 'popular', avatar: '📱', visualConfig: npcVisual('sasha-popular', { hair: ['long06'], hairColor: '#592454', skinColor: '#ecad80' }), relationship: 5, romance: 0, unlocked: false, bio: 'Social media queen. 50k followers. Allergic to sincerity.', personality: 'dramatic', schedule: { morning: 'Cafeteria', lunch: 'Courtyard', afternoon: 'Mall', evening: 'Party', night: 'Scrolling' } },
  { id: '15', name: 'Kai', clique: 'nerd', avatar: '🎮', visualConfig: npcVisual('kai-nerd', { hair: ['long21'], hairColor: '#dba3be', skinColor: '#f2d3b1' }), relationship: 5, romance: 0, unlocked: false, bio: 'Esports legend. Streams under a secret alias. Knows everyone\'s secrets.', personality: 'mysterious', schedule: { morning: 'Computer Lab', lunch: 'Cafeteria', afternoon: 'Gaming Club', evening: 'Streaming', night: 'Online' } },
  { id: '16', name: 'Liam', clique: 'artsy', avatar: '🌍', visualConfig: npcVisual('liam-exchange', { hair: ['short09'], hairColor: '#4a6741', skinColor: '#f5d0b5' }), relationship: 0, romance: 0, unlocked: false, bio: 'An exchange student from Ireland. Charming accent, mysterious past, and a talent for photography. Everyone wants to know his story.', personality: 'mysterious', schedule: { morning: 'Language Lab', lunch: 'Courtyard', afternoon: 'Photography Club', evening: 'Exploring town', night: 'Writing letters home' } },
  { id: '17', name: 'Olivia', clique: 'preppy', avatar: '📰', visualConfig: npcVisual('olivia-reporter', { hair: ['long08'], hairColor: '#8d5524', skinColor: '#e8b89a' }), relationship: 5, romance: 0, unlocked: true, bio: 'Editor of the school paper. Nothing happens at Westfield without her knowing. She might write about you — for better or worse.', personality: 'ambitious', schedule: { morning: 'Newsroom', lunch: 'Interviewing students', afternoon: 'Yearbook office', evening: 'Writing articles', night: 'Chasing leads' } },
  { id: '18', name: 'Noah', clique: 'jock', avatar: '🏋️', visualConfig: npcVisual('noah-coach', { hair: ['short15'], hairColor: '#0e0e0e', skinColor: '#d4a373' }), relationship: 5, romance: 0, unlocked: false, bio: 'The coach\'s son. Quiet, focused, and surprisingly kind. He\'s not just playing sports — he\'s studying them.', personality: 'chill', schedule: { morning: 'Training', lunch: 'Cafeteria', afternoon: 'Practice', evening: 'Studying game tape', night: 'Early to bed' } },
  { id: '19', name: 'Emma', clique: 'popular', avatar: '💋', visualConfig: npcVisual('emma-transfer', { hair: ['long12'], hairColor: '#cb6820', skinColor: '#f2d3b1' }), relationship: 0, romance: 0, unlocked: false, bio: 'Transferred from a rival school mid-year. Gorgeous, confident, and already shaking up the social hierarchy. Is she friend or rival?', personality: 'dramatic', schedule: { morning: 'Guidance office', lunch: 'Popular table', afternoon: 'Cheer practice', evening: 'Mall', night: 'Social media' } },
  { id: '20', name: 'Aiden', clique: 'nerd', avatar: '💻', visualConfig: npcVisual('aiden-billionaire', { hair: ['short07'], hairColor: '#ac6511', skinColor: '#f5d0b5' }), relationship: 0, romance: 0, unlocked: false, bio: 'His father runs a tech empire, but Aiden just wants to build robots in peace. Secretly generous. Publicly tsundere.', personality: 'tsundere', schedule: { morning: 'Private tutoring', lunch: 'Library', afternoon: 'Robotics Lab', evening: 'Hacking', night: 'Online' } },
];

export const DEFAULT_RIVALS: Rival[] = [
  { id: 'r1', name: 'Bradley', clique: 'jock', visualConfig: npcVisual('bradley-rival', { hair: ['short05'], hairColor: '#e5d7a3', skinColor: '#f2d3b1' }), hostility: 30, reason: 'You beat him at football tryouts', encounters: 1 },
];

export const RANDOM_EVENTS: RandomEvent[] = [
  {
    id: 'ev1',
    title: 'Locker Prank',
    description: 'Someone stuffed your locker with glitter. Students are laughing. You spot Bradley smirking nearby.',
    choices: [
      { id: 'ev1-a', text: 'Laugh it off and clean it up', effects: { popularity: 5, happiness: -5 } },
      { id: 'ev1-b', text: 'Confront Bradley publicly', effects: { rebellion: 10, popularity: -3 }, npcEffects: { 'r1': { friendship: -10 } } },
      { id: 'ev1-c', text: 'Plan elaborate revenge', effects: { creativity: 10, rebellion: 5 } },
    ],
    period: ['morning', 'lunch'],
    semester: [1, 2, 3, 4],
    weight: 15,
  },
  {
    id: 'ev2',
    title: 'Found Money',
    description: 'You find a wallet in the hallway with $50 and a student ID. No one is around.',
    choices: [
      { id: 'ev2-a', text: 'Turn it in to the office', effects: { popularity: 5, happiness: 5 } },
      { id: 'ev2-b', text: 'Keep the cash, drop the wallet', effects: { rebellion: 10, happiness: 5 }, currency: { points: 50 } },
      { id: 'ev2-c', text: 'Track down the owner and return it', effects: { popularity: 10, academics: 3 } },
    ],
    period: ['morning', 'afternoon'],
    semester: [1, 2, 3, 4],
    weight: 10,
  },
  {
    id: 'ev3',
    title: 'Teacher\'s Pet Moment',
    description: 'The teacher asks a question no one knows. You do — but answering might make you a target.',
    choices: [
      { id: 'ev3-a', text: 'Raise your hand confidently', effects: { academics: 10, popularity: -3 } },
      { id: 'ev3-b', text: 'Whisper the answer to a friend', effects: { academics: 5, popularity: 5 } },
      { id: 'ev3-c', text: 'Stay silent and watch the chaos', effects: { rebellion: 5 } },
    ],
    period: ['morning', 'afternoon'],
    semester: [1, 2, 3, 4],
    weight: 12,
  },
  {
    id: 'ev4',
    title: 'Unexpected Concert',
    description: 'Zoe\'s band is playing an underground show tonight. The crowd is electric.',
    choices: [
      { id: 'ev4-a', text: 'Dive into the mosh pit', effects: { athletics: 5, rebellion: 10, happiness: 10 }, npcEffects: { '9': { friendship: 10 } } },
      { id: 'ev4-b', text: 'Film it for social media', effects: { creativity: 5, popularity: 5 }, npcEffects: { '14': { friendship: 5 } } },
      { id: 'ev4-c', text: 'Critique the sound mixing', effects: { creativity: 10, popularity: -3 } },
    ],
    period: ['evening', 'night'],
    semester: [2, 3, 4],
    weight: 8,
  },
  {
    id: 'ev5',
    title: 'Rumor Mill',
    description: 'A vicious rumor about Britney is spreading. She looks shaken in the hallway.',
    choices: [
      { id: 'ev5-a', text: 'Defend her publicly', effects: { popularity: 5, happiness: 5 }, npcEffects: { '2': { friendship: 15 } } },
      { id: 'ev5-b', text: 'Spread it further anonymously', effects: { popularity: 10, rebellion: 5, happiness: -5 }, npcEffects: { '2': { friendship: -20 } } },
      { id: 'ev5-c', text: 'Investigate who started it', effects: { academics: 5, creativity: 5 } },
    ],
    period: ['lunch', 'afternoon'],
    semester: [1, 2, 3, 4],
    weight: 10,
  },
  {
    id: 'ev6',
    title: 'Midnight Study Session',
    description: 'The library is empty except for Dexter, who waves you over with a stack of notes.',
    choices: [
      { id: 'ev6-a', text: 'Study together all night', effects: { academics: 15, energy: -20 }, npcEffects: { '3': { friendship: 10 } } },
      { id: 'ev6-b', text: 'Share snacks and gossip instead', effects: { happiness: 10, popularity: 3 }, npcEffects: { '3': { friendship: 15 } } },
      { id: 'ev6-c', text: 'Sneak out for a late-night walk', effects: { rebellion: 5, happiness: 5 } },
    ],
    period: ['night'],
    semester: [1, 2, 3, 4],
    weight: 8,
  },
  {
    id: 'ev7',
    title: 'Sports Injury',
    description: 'Chad twisted his ankle during practice. He\'s sitting alone, furious.',
    choices: [
      { id: 'ev7-a', text: 'Help him to the nurse', effects: { athletics: 3, popularity: 5 }, npcEffects: { '1': { friendship: 15 } } },
      { id: 'ev7-b', text: 'Offer to take his starting spot', effects: { athletics: 5, popularity: -5 }, npcEffects: { '1': { friendship: -10 } } },
      { id: 'ev7-c', text: 'Bring him homework and memes', effects: { happiness: 5, academics: 3 }, npcEffects: { '1': { friendship: 10, romance: 5 } } },
    ],
    period: ['afternoon', 'evening'],
    semester: [1, 2, 3, 4],
    weight: 10,
  },
];

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'ach1', title: 'First Steps', description: 'Complete your first day', icon: '🎒', unlocked: false, condition: 'days_played', targetValue: 1 },
  { id: 'ach2', title: 'Scholar', description: 'Reach 80 Academics', icon: '📚', unlocked: false, condition: 'stat_reached', targetKey: 'academics', targetValue: 80 },
  { id: 'ach3', title: 'Athlete', description: 'Reach 80 Athletics', icon: '🏆', unlocked: false, condition: 'stat_reached', targetKey: 'athletics', targetValue: 80 },
  { id: 'ach4', title: 'Artist', description: 'Reach 80 Creativity', icon: '🎨', unlocked: false, condition: 'stat_reached', targetKey: 'creativity', targetValue: 80 },
  { id: 'ach5', title: 'Icon', description: 'Reach 80 Popularity', icon: '⭐', unlocked: false, condition: 'stat_reached', targetKey: 'popularity', targetValue: 80 },
  { id: 'ach6', title: 'Rebel', description: 'Reach 80 Rebellion', icon: '🔥', unlocked: false, condition: 'stat_reached', targetKey: 'rebellion', targetValue: 80 },
  { id: 'ach7', title: 'Best Friend', description: 'Max friendship with any NPC', icon: '💫', unlocked: false, condition: 'npc_max', targetValue: 100 },
  { id: 'ach8', title: 'True Love', description: 'Max romance with any NPC', icon: '💕', unlocked: false, condition: 'npc_max', targetValue: 100 },
  { id: 'ach9', title: 'Storyteller', description: 'Complete 5 story chapters', icon: '📖', unlocked: false, condition: 'chapter_complete', targetValue: 5 },
  { id: 'ach10', title: 'Minigame Master', description: 'Score 500+ in any minigame', icon: '🎯', unlocked: false, condition: 'minigame_score', targetValue: 500 },
  { id: 'ach11', title: 'Rival Slayer', description: 'Defeat your rival in a confrontation', icon: '⚔️', unlocked: false, condition: 'rival_defeated', targetValue: 1 },
  { id: 'ach12', title: 'Semester Survivor', description: 'Reach Semester 2', icon: '📅', unlocked: false, condition: 'days_played', targetValue: 30 },
];

export const DEFAULT_CHALLENGES: DailyChallenge[] = [
  { id: 'c1', title: 'Math Whiz', description: 'Score 80+ in Math Blitz', reward: { points: 50, gems: 0 }, completed: false, type: 'minigame', targetValue: 80, currentValue: 0 },
  { id: 'c2', title: 'Social Butterfly', description: 'Talk to 3 NPCs', reward: { points: 30, gems: 0 }, completed: false, type: 'social', targetValue: 3, currentValue: 0 },
  { id: 'c3', title: 'Gainz', description: 'Train Athletics twice', reward: { points: 40, gems: 0 }, completed: false, type: 'stat', targetValue: 2, currentValue: 0 },
  { id: 'c4', title: 'Artistic Soul', description: 'Score 70+ in Art Studio', reward: { points: 40, gems: 1 }, completed: false, type: 'minigame', targetValue: 70, currentValue: 0 },
  { id: 'c5', title: 'Rumor Crusher', description: 'Win a rival confrontation', reward: { points: 60, gems: 2 }, completed: false, type: 'rival', targetValue: 1, currentValue: 0 },
  { id: 'c6', title: 'Explorer', description: 'Trigger 2 random events', reward: { points: 35, gems: 1 }, completed: false, type: 'explore', targetValue: 2, currentValue: 0 },
];
