import type { StoryChapter, StoryProgress } from '@repo/types';

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 'ch1-freshman-first-day',
    title: 'The First Day',
    description: 'New school, new rules. Will you make friends or enemies on your very first day?',
    semester: 1,
    episode: 1,
    lockType: 'free',
    thumbnail: '🎒',
    scenes: [
      {
        id: 's1',
        text: 'The morning sun hits the towering gates of Westfield High. Your heart pounds as you clutch your schedule. A crowd of students rushes past you. You spot Chad, the star quarterback, holding court near the lockers.',
        choices: [
          { id: 'c1', text: 'Walk up and introduce yourself to Chad', effects: { stats: { athletics: 5, popularity: 3 }, npcRelationships: { '1': { friendship: 10 } } }, nextSceneId: 's2' },
          { id: 'c2', text: 'Head straight to the library instead', effects: { stats: { academics: 5, creativity: 3 } }, nextSceneId: 's3' },
          { id: 'c3', text: 'Find a quiet corner and observe everyone', effects: { stats: { rebellion: 5, happiness: -2 } }, nextSceneId: 's4' },
        ],
      },
      {
        id: 's2',
        text: 'Chad grins and high-fives you. "Fresh meat! I like your confidence. You should come to football tryouts after school." He punches your shoulder playfully.',
        choices: [
          { id: 'c4', text: 'Agree enthusiastically — you are born for this', effects: { stats: { athletics: 10, popularity: 5, energy: -10 } }, nextSceneId: 's5' },
          { id: 'c5', text: 'Say you will think about it', effects: { stats: { popularity: 2 } }, nextSceneId: 's5' },
        ],
      },
      {
        id: 's3',
        text: 'The library is serene. Dexter looks up from his laptop and pushes his glasses up. "Oh, a new face. You look like someone who appreciates quiet. Want to join the robotics club?"',
        choices: [
          { id: 'c6', text: 'Join the robotics club immediately', effects: { stats: { academics: 10, creativity: 5, energy: -10 }, npcRelationships: { '3': { friendship: 15 } } }, nextSceneId: 's5' },
          { id: 'c7', text: 'Politely decline but ask for book recommendations', effects: { stats: { academics: 5 } }, nextSceneId: 's5' },
        ],
      },
      {
        id: 's4',
        text: 'From the shadows of the stairwell, you watch the chaos unfold. Raven notices you before anyone else. She leans against the wall beside you. "Not a people person, huh? Neither am I."',
        choices: [
          { id: 'c8', text: 'Admit you prefer observing to participating', effects: { stats: { rebellion: 10, creativity: 3 }, npcRelationships: { '4': { friendship: 12 } } }, nextSceneId: 's5' },
          { id: 'c9', text: 'Brush her off and walk away', effects: { stats: { popularity: -3, rebellion: 5 } }, nextSceneId: 's5' },
        ],
      },
      {
        id: 's5',
        text: 'The bell rings. Your first day is over, but this is just the beginning. Whatever path you chose today, one thing is clear — high school is going to change everything.',
        choices: [
          { id: 'c10', text: 'Head home and reflect on your choices', effects: { stats: { happiness: 5, energy: -5 } } },
        ],
      },
    ],
  },
  {
    id: 'ch2-lunch-drama',
    title: 'Lunchroom Drama',
    description: 'The cafeteria is a battlefield. Where you sit defines who you are.',
    semester: 1,
    episode: 2,
    lockType: 'progress',
    requiredSemester: 1,
    thumbnail: '🍕',
    scenes: [
      {
        id: 's1',
        text: 'The cafeteria buzzes with energy. Britney waves from the popular table, Dexter saves you a seat with the nerds, and Chad is throwing fries across the room.',
        choices: [
          { id: 'c1', text: 'Sit with Britney and the popular crowd', effects: { stats: { popularity: 15, happiness: 5 }, npcRelationships: { '2': { friendship: 15 } } }, nextSceneId: 's2' },
          { id: 'c2', text: 'Join Dexter and the study group', effects: { stats: { academics: 10, creativity: 5 }, npcRelationships: { '3': { friendship: 12 } } }, nextSceneId: 's3' },
          { id: 'c3', text: 'Sit alone and draw in your notebook', effects: { stats: { creativity: 10, rebellion: 5 } }, nextSceneId: 's4' },
        ],
      },
      {
        id: 's2',
        text: 'Britney smiles as you sit down. "I knew you had taste. But watch out — the queen bee does not share her throne." The table laughs. You feel eyes on you from every direction.',
        choices: [
          { id: 'c4', text: 'Charm the table with witty jokes', statCheck: { stat: 'popularity', threshold: 25 }, effects: { stats: { popularity: 10, happiness: 10 } } },
          { id: 'c5', text: 'Stay quiet and listen', effects: { stats: { popularity: 3, happiness: -2 } } },
        ],
      },
      {
        id: 's3',
        text: 'Dexter opens his laptop. "I am building an AI that predicts cafeteria food quality. So far it is 94% accurate at predicting mystery meat days." You can not help but laugh.',
        choices: [
          { id: 'c6', text: 'Offer to help with the code', statCheck: { stat: 'academics', threshold: 25 }, effects: { stats: { academics: 10, creativity: 5, energy: -10 } } },
          { id: 'c7', text: 'Suggest adding a social media component', effects: { stats: { creativity: 5, popularity: 3 } } },
        ],
      },
      {
        id: 's4',
        text: 'Skyler slides into the seat across from you. "I saw your sketch. It is really good. Want to see my portfolio?" Their eyes light up with genuine excitement.',
        choices: [
          { id: 'c8', text: 'Show them your sketchbook', effects: { stats: { creativity: 15, happiness: 10 }, npcRelationships: { '5': { friendship: 20 } } } },
          { id: 'c9', text: 'Keep it to yourself for now', effects: { stats: { rebellion: 5, happiness: -3 } } },
        ],
      },
    ],
  },
  {
    id: 'ch3-prom-night',
    title: 'Prom Night',
    description: 'The biggest night of the semester. Who will you go with? Will you even go at all?',
    semester: 1,
    episode: 3,
    lockType: 'premium',
    cost: { gems: 15 },
    requiredSemester: 1,
    requiredStats: { popularity: 30 },
    thumbnail: '🎩',
    scenes: [
      {
        id: 's1',
        text: 'Prom posters cover every wall. The theme is "Starry Night" and the gym is being transformed into something magical. You have been asked by three different people.',
        choices: [
          { id: 'c1', text: 'Go with Chad as friends', effects: { stats: { athletics: 5, popularity: 10 }, npcRelationships: { '1': { friendship: 15, romance: 5 } } }, nextSceneId: 's2' },
          { id: 'c2', text: 'Ask Raven to go as your date', effects: { stats: { rebellion: 10, creativity: 5 }, npcRelationships: { '4': { friendship: 10, romance: 20 } } }, nextSceneId: 's3' },
          { id: 'c3', text: 'Go stag and make a statement', effects: { stats: { rebellion: 15, popularity: -5 } }, nextSceneId: 's4' },
        ],
      },
      {
        id: 's2',
        text: 'Chad shows up in a tux that is somehow too tight and too loose at the same time. "I cleaned up for you," he says with a grin. The dance floor awaits.',
        choices: [
          { id: 'c4', text: 'Dance like nobody is watching', effects: { stats: { athletics: 10, happiness: 15, energy: -15 } } },
          { id: 'c5', text: 'Slow dance and see where the night goes', effects: { stats: { happiness: 10 }, npcRelationships: { '1': { romance: 15 } } } },
        ],
      },
      {
        id: 's3',
        text: 'Raven arrives in a black dress that looks like it was made for her. She hands you a black rose. "I do not do traditional. Hope that is okay." It is more than okay.',
        choices: [
          { id: 'c6', text: 'Tell her she looks incredible', effects: { stats: { happiness: 15 }, npcRelationships: { '4': { romance: 20 } } } },
          { id: 'c7', text: 'Sneak out to the rooftop for a private moment', effects: { stats: { rebellion: 10, happiness: 20 }, npcRelationships: { '4': { romance: 25 } } } },
        ],
      },
      {
        id: 's4',
        text: 'You walk in alone, wearing something that turns every head. Britney raises an eyebrow from across the room. Chad gives you a nod of respect. You have made your point.',
        choices: [
          { id: 'c8', text: 'Crash the DJ booth and change the music', effects: { stats: { rebellion: 20, popularity: 10, energy: -20 } } },
          { id: 'c9', text: 'Dance alone in the center of the floor', effects: { stats: { popularity: 15, happiness: 15 } } },
        ],
      },
    ],
  },
  {
    id: 'ch4-senior-prank',
    title: 'The Senior Prank',
    description: 'A legendary prank that will go down in Westfield history. Are you brave enough?',
    semester: 4,
    episode: 1,
    lockType: 'premium',
    cost: { gems: 25 },
    requiredSemester: 4,
    requiredStats: { rebellion: 40 },
    thumbnail: '🎭',
    scenes: [
      {
        id: 's1',
        text: 'It is senior year and the tradition is clear: prank the school or be forgotten. Raven approaches you with a glint in her eye. "I have a plan. But I need someone fearless."',
        choices: [
          { id: 'c1', text: '"I am in. What is the plan?"', effects: { stats: { rebellion: 10, happiness: 5 }, npcRelationships: { '4': { friendship: 10 } } }, nextSceneId: 's2' },
          { id: 'c2', text: 'Suggest a less destructive prank', effects: { stats: { creativity: 10, rebellion: 5 } }, nextSceneId: 's3' },
          { id: 'c3', text: 'Report the plan to the principal', effects: { stats: { academics: 5, popularity: -20, rebellion: -15 } } },
        ],
      },
      {
        id: 's2',
        text: 'Raven pulls out blueprints. "We fill the principal\'s office with 10,000 plastic balls. At 2 AM. No cameras. No witnesses."',
        choices: [
          { id: 'c4', text: 'Recruit Chad to help carry the balls', statCheck: { stat: 'athletics', threshold: 40 }, effects: { stats: { athletics: 10, rebellion: 15 }, npcRelationships: { '1': { friendship: 15 } } } },
          { id: 'c5', text: 'Hack the camera system instead', statCheck: { stat: 'academics', threshold: 50 }, effects: { stats: { academics: 15, rebellion: 10 }, npcRelationships: { '3': { friendship: 10 } } } },
        ],
      },
      {
        id: 's3',
        text: 'You convince the group to do something harmless but legendary: every student wears a costume to school on the same day without telling the teachers.',
        choices: [
          { id: 'c6', text: 'Spread the word through social media', effects: { stats: { popularity: 20, creativity: 10 } } },
          { id: 'c7', text: 'Design the official event poster', effects: { stats: { creativity: 15, popularity: 10 } } },
        ],
      },
    ],
  },
  {
    id: 'ch5-graduation',
    title: 'Graduation Day',
    description: 'The final chapter. Four years of choices led to this moment.',
    semester: 4,
    episode: 2,
    lockType: 'season-pass',
    requiredSemester: 4,
    thumbnail: '🎓',
    scenes: [
      {
        id: 's1',
        text: 'The cap and gown feel heavier than they look. Around you, friends who became family. Enemies who became teachers. You are about to walk across that stage.',
        choices: [
          { id: 'c1', text: 'Give a valedictorian speech', statCheck: { stat: 'academics', threshold: 60 }, effects: { stats: { popularity: 20, happiness: 20 } } },
          { id: 'c2', text: 'Shout out your clique in your walk-up', effects: { stats: { popularity: 15, happiness: 15 } } },
          { id: 'c3', text: 'Walk with quiet dignity', effects: { stats: { happiness: 10, rebellion: 5 } } },
        ],
      },
      {
        id: 's2',
        text: 'After the ceremony, everyone gathers on the lawn. Chad is crying. Dexter is already planning a startup. Raven kisses your cheek. "We made it."',
        choices: [
          { id: 'c4', text: 'Promise to stay friends forever', effects: { stats: { happiness: 25 }, npcRelationships: { '1': { friendship: 20 }, '2': { friendship: 20 }, '3': { friendship: 20 }, '4': { friendship: 20 }, '5': { friendship: 20 } } } },
          { id: 'c5', text: 'Kiss Raven back', effects: { stats: { happiness: 30 }, npcRelationships: { '4': { romance: 50 } } } },
        ],
      },
    ],
  },
  {
    id: 'ch6-the-rival',
    title: 'The Rival',
    description: 'Bradley has been sabotaging you. It is time to settle this.',
    semester: 1,
    episode: 4,
    lockType: 'progress',
    requiredSemester: 1,
    requiredStats: { athletics: 35 },
    thumbnail: '⚔️',
    scenes: [
      {
        id: 's1',
        text: 'Bradley corners you after practice. "You think you are special? I have been here since freshman year. You are just a trend." The gym is empty. It is just you two.',
        choices: [
          { id: 'c1', text: 'Challenge him to a one-on-one match', statCheck: { stat: 'athletics', threshold: 35 }, effects: { stats: { athletics: 10, popularity: 5 } } },
          { id: 'c2', text: 'Walk away and let him burn himself out', effects: { stats: { popularity: 5, happiness: 5 } } },
          { id: 'c3', text: 'Outsmart him with strategy', statCheck: { stat: 'academics', threshold: 40 }, effects: { stats: { academics: 10, rebellion: 5 } } },
        ],
      },
    ],
  },
  {
    id: 'ch7-festival-of-arts',
    title: 'Festival of Arts',
    description: 'The school arts festival is here. Show the world what you are made of.',
    semester: 2,
    episode: 1,
    lockType: 'progress',
    requiredSemester: 2,
    requiredStats: { creativity: 40 },
    thumbnail: '🎭',
    scenes: [
      {
        id: 's1',
        text: 'The gym has been transformed. Canvas everywhere. A stage in the center. Skyler waves you over. "I saved you the best spot." Priya is setting up her photo exhibit nearby.',
        choices: [
          { id: 'c1', text: 'Paint something live on stage', effects: { stats: { creativity: 15, popularity: 10, energy: -15 }, npcRelationships: { '5': { friendship: 15 } } } },
          { id: 'c2', text: 'Help Priya with her photo setup', effects: { stats: { creativity: 10, popularity: 5 }, npcRelationships: { '10': { friendship: 15 } } } },
          { id: 'c3', text: 'Perform an impromptu spoken word piece', effects: { stats: { creativity: 20, rebellion: 10 } } },
        ],
      },
    ],
  },
  {
    id: 'ch8-summer-job',
    title: 'Summer Job',
    description: 'Break is over. Time to earn some cash and maybe learn something about life.',
    semester: 2,
    episode: 2,
    lockType: 'free',
    requiredSemester: 2,
    thumbnail: '💼',
    scenes: [
      {
        id: 's1',
        text: 'The local coffee shop needs help. So does the bookstore. And the arcade is hiring. Where will you spend your summer?',
        choices: [
          { id: 'c1', text: 'Coffee shop — meet everyone in town', effects: { stats: { popularity: 15, happiness: 5 }, currency: { points: 100 } } },
          { id: 'c2', text: 'Bookstore — quiet money', effects: { stats: { academics: 10, creativity: 5 }, currency: { points: 80 } } },
          { id: 'c3', text: 'Arcade — free games all summer', effects: { stats: { rebellion: 10, happiness: 10 }, currency: { points: 60 } } },
        ],
      },
    ],
  },
  {
    id: 'ch9-the-breakup',
    title: 'The Breakup',
    description: 'Relationships crack under pressure. Can yours survive?',
    semester: 3,
    episode: 1,
    lockType: 'premium',
    cost: { gems: 20 },
    requiredSemester: 3,
    requiredStats: { happiness: 30 },
    thumbnail: '💔',
    scenes: [
      {
        id: 's1',
        text: 'It started with small fights. Now it is everywhere. You find a note in your locker: "We need to talk. The rooftop. After school."',
        choices: [
          { id: 'c1', text: 'Go and try to fix things', effects: { stats: { happiness: -10, popularity: 5 } } },
          { id: 'c2', text: 'Ignore it and focus on yourself', effects: { stats: { happiness: 5, rebellion: 10 } } },
          { id: 'c3', text: 'Bring friends for moral support', effects: { stats: { popularity: 10, happiness: -5 } } },
        ],
      },
    ],
  },
  {
    id: 'ch10-senior-trip',
    title: 'Senior Trip',
    description: 'One last adventure before the real world. Make it count.',
    semester: 4,
    episode: 3,
    lockType: 'season-pass',
    requiredSemester: 4,
    thumbnail: '✈️',
    scenes: [
      {
        id: 's1',
        text: 'The bus ride to the coast takes four hours. Everyone is singing, arguing, or confessing secrets they will regret. You are squeezed between Chad and Raven.',
        choices: [
          { id: 'c1', text: 'Start a bus-wide game of truth or dare', effects: { stats: { popularity: 20, happiness: 15, energy: -10 } } },
          { id: 'c2', text: 'Write in your journal about the journey', effects: { stats: { creativity: 15, happiness: 10 } } },
          { id: 'c3', text: 'Sleep through the whole trip', effects: { stats: { energy: 30, happiness: -5 } } },
        ],
      },
    ],
  },
  {
    id: 'ch11-exchange-student',
    title: 'The Exchange Student',
    description: 'A mysterious stranger from overseas arrives. Will you be their guide, their rival, or something more?',
    semester: 2,
    episode: 6,
    lockType: 'progress',
    requiredSemester: 2,
    thumbnail: '🌍',
    scenes: [
      {
        id: 's1',
        text: 'The morning announcements crackle to life. "Please welcome Liam O\'Brien, joining us from Dublin, Ireland." A hush falls over the classroom as the door opens. A boy with tousled greenish-brown hair and an easy smile steps in, camera hanging from his neck like an extra limb. His eyes scan the room and lock on yours with unsettling intensity.',
        choices: [
          { id: 'c1', text: 'Wave him over to the empty seat beside you', effects: { stats: { popularity: 5, happiness: 3 }, npcRelationships: { '16': { friendship: 15 } } }, nextSceneId: 's2' },
          { id: 'c2', text: 'Stay quiet and observe the new guy', effects: { stats: { rebellion: 5, creativity: 3 } }, nextSceneId: 's3' },
          { id: 'c3', text: 'Introduce yourself with your best Irish greeting', effects: { stats: { popularity: 10, creativity: 5 }, npcRelationships: { '16': { friendship: 10, romance: 10 } } }, nextSceneId: 's2' },
        ],
      },
      {
        id: 's2',
        text: 'Liam slides into the seat next to you, that easy smile never wavering. "You\'re the first person who didn\'t look through me," he says in an accent that makes every word sound like music. "Back home, I\'d buy you a pint for that. Here, I\'ll settle for showing you my photographs." He opens his camera roll and the images take your breath away — abandoned factories bathed in golden light, rain-slicked cobblestones, faces full of stories.',
        choices: [
          { id: 'c4', text: 'Ask about the stories behind the photos', effects: { stats: { creativity: 10, happiness: 5 }, npcRelationships: { '16': { friendship: 15, romance: 10 } } }, nextSceneId: 's4' },
          { id: 'c5', text: 'Offer to show him around town after school', effects: { stats: { popularity: 8, energy: -5 }, npcRelationships: { '16': { friendship: 10, romance: 15 } } }, nextSceneId: 's4' },
        ],
      },
      {
        id: 's3',
        text: 'You watch from the back row as Liam navigates the introduction with practiced charm. But you notice something others miss — the way his fingers tighten around his camera strap, the flicker of uncertainty behind the smile. At lunch, you find him standing alone in the courtyard, staring at the oak tree like it holds the secrets of the universe.',
        choices: [
          { id: 'c6', text: 'Approach silently and ask what he sees through the lens', effects: { stats: { creativity: 10, rebellion: 5 }, npcRelationships: { '16': { friendship: 12, romance: 8 } } }, nextSceneId: 's4' },
          { id: 'c7', text: 'Take his photo without warning — a taste of his own medicine', effects: { stats: { creativity: 15, popularity: 5 }, npcRelationships: { '16': { friendship: 5, romance: 20 } } }, nextSceneId: 's4' },
        ],
      },
      {
        id: 's4',
        text: 'The sun dips below the Westfield skyline, painting everything in shades of amber and violet. Liam stands beside you on the old bridge overlooking the river, camera forgotten in his hands. "I came here running from something," he admits softly. "But maybe I found something better." The moment hangs between you, fragile and infinite, as the water rushes below.',
        choices: [
          { id: 'c8', text: 'Take his hand and tell him he belongs here now', effects: { stats: { happiness: 15, popularity: 5 }, npcRelationships: { '16': { friendship: 10, romance: 25 } } } },
          { id: 'c9', text: 'Pull out your phone and take a photo of him — your first story together', effects: { stats: { creativity: 15, happiness: 10 }, npcRelationships: { '16': { friendship: 15, romance: 15 } } } },
          { id: 'c10', text: 'Challenge him to a photography contest around town', statCheck: { stat: 'creativity', threshold: 35 }, effects: { stats: { creativity: 20, popularity: 10, energy: -10 }, npcRelationships: { '16': { friendship: 20 } } } },
        ],
      },
    ],
  },
  {
    id: 'ch12-the-scandal',
    title: 'The Scandal',
    description: 'A cheating ring rocks Westfield High. The school paper is about to publish names. Will you help expose the truth or protect your friends?',
    semester: 2,
    episode: 7,
    lockType: 'progress',
    requiredSemester: 2,
    thumbnail: '📰',
    scenes: [
      {
        id: 's1',
        text: 'The newsroom smells like burnt coffee and deadlines. Olivia slams a folder on the desk between you, her brown eyes blazing with the fire of a journalist on the verge of the biggest story of the year. "Names, dates, test answers. We\'ve got a cheating ring operating out of the library basement. And tomorrow\'s edition goes to press with everything." She studies your face. "I need to know whose side you\'re on."',
        choices: [
          { id: 'c1', text: 'Tell her to publish everything — the truth matters', effects: { stats: { academics: 10, popularity: -5, rebellion: 5 }, npcRelationships: { '17': { friendship: 20 } } }, nextSceneId: 's2' },
          { id: 'c2', text: 'Beg her to consider the lives she\'ll destroy', effects: { stats: { popularity: 5, happiness: -5 }, npcRelationships: { '17': { friendship: -10 } } }, nextSceneId: 's3' },
          { id: 'c3', text: 'Offer to help her investigate deeper before publishing', effects: { stats: { academics: 8, creativity: 5, energy: -5 }, npcRelationships: { '17': { friendship: 15, romance: 10 } } }, nextSceneId: 's4' },
        ],
      },
      {
        id: 's2',
        text: 'The headline hits like a thunderclap: CHEATING EXPOSED: TWELVE STUDENTS NAMED. By noon, the hallway is a warzone. You watch Britney walk past with her head held high, but her hands shake. Chad throws his phone against a locker. "Thanks for the loyalty," he spits, not knowing it was you. But Olivia catches your eye across the hall and nods — a silent acknowledgment that you chose principle over popularity.',
        choices: [
          { id: 'c4', text: 'Stand by Olivia when the backlash comes', effects: { stats: { popularity: -10, academics: 15, happiness: 10 }, npcRelationships: { '17': { friendship: 25, romance: 15 }, '1': { friendship: -15 }, '2': { friendship: -10 } } }, nextSceneId: 's5' },
          { id: 'c5', text: 'Try to quietly help the accused students', effects: { stats: { popularity: 5, academics: -5 }, npcRelationships: { '1': { friendship: 10 }, '17': { friendship: -5 } } }, nextSceneId: 's5' },
        ],
      },
      {
        id: 's3',
        text: 'Olivia\'s expression hardens. "You want me to bury the truth because it\'s uncomfortable?" She paces the newsroom, her reporter\'s instincts warring with something you did not expect — doubt. "I became a journalist to tell the stories that matter. Not to ruin lives." She stops pacing and looks at you differently, like she\'s really seeing you for the first time. "Convince me there\'s another way."',
        choices: [
          { id: 'c6', text: 'Suggest publishing the systemic problem without naming names', effects: { stats: { creativity: 10, academics: 10, popularity: 5 }, npcRelationships: { '17': { friendship: 20, romance: 20 } } }, nextSceneId: 's5' },
          { id: 'c7', text: 'Propose an anonymous editorial about academic pressure instead', effects: { stats: { creativity: 15, popularity: 10 }, npcRelationships: { '17': { friendship: 15 } } }, nextSceneId: 's5' },
        ],
      },
      {
        id: 's4',
        text: 'Together, you spend three days tracing the cheating ring to its source. Late nights in the archives. Whispered conversations in empty classrooms. And somewhere between the second pot of coffee and the discovery that the ring leader is a scholarship student facing deportation if they fail, something shifts between you and Olivia. She looks up from her notes one night, hair disheveled, and smiles — not the predatory grin of a reporter, but something real.',
        choices: [
          { id: 'c8', text: 'Tell her this story matters because of how she tells it', effects: { stats: { creativity: 10, happiness: 10 }, npcRelationships: { '17': { friendship: 10, romance: 25 } } }, nextSceneId: 's5' },
          { id: 'c9', text: 'Suggest focusing the story on why students cheat instead of who cheated', effects: { stats: { academics: 15, creativity: 10, popularity: 5 }, npcRelationships: { '17': { friendship: 20 } } }, nextSceneId: 's5' },
        ],
      },
      {
        id: 's5',
        text: 'The final edition of the semester lands on every desk. Whatever path you chose, Westfield High will never be the same. Olivia stands on the front steps, watching students read her words. "Every story has a cost," she says quietly. "But maybe this one was worth it." She turns to you, and for a moment the ambitious reporter is gone, replaced by a girl who just wants to do the right thing. "Thank you for being part of it." The autumn wind carries the scent of change.',
        choices: [
          { id: 'c10', text: 'Tell her she\'s the kind of journalist the world needs', effects: { stats: { happiness: 15, academics: 5 }, npcRelationships: { '17': { friendship: 15, romance: 15 } } } },
          { id: 'c11', text: 'Say the truth always wins in the end', effects: { stats: { popularity: 5, rebellion: 5, happiness: 10 }, npcRelationships: { '17': { friendship: 10 } } } },
          { id: 'c12', text: 'Kiss her — some stories are better felt than told', effects: { stats: { happiness: 20, popularity: 5 }, npcRelationships: { '17': { friendship: 10, romance: 30 } } } },
        ],
      },
    ],
  },
  {
    id: 'ch13-sports-championship',
    title: 'Sports Championship',
    description: 'The district championship is here. Lead your team to victory or suffer defeat in front of the whole school.',
    semester: 3,
    episode: 8,
    lockType: 'progress',
    requiredSemester: 3,
    requiredStats: { athletics: 40 },
    thumbnail: '🏆',
    scenes: [
      {
        id: 's1',
        text: 'The locker room vibrates with tension. Chad is pacing like a caged animal, his game face cracked by the pressure of what comes next. "District finals. My dad won this twenty years ago. I need this." He looks at you with unexpected vulnerability. Then the door opens and Noah walks in — the coach\'s son, quiet and steady, carrying a clipboard covered in play diagrams. "I studied their defense. I know how we beat them." Two leaders. One goal. The room goes silent, waiting for you to choose.',
        choices: [
          { id: 'c1', text: 'Back Chad and rally the team with emotion', effects: { stats: { athletics: 5, popularity: 5 }, npcRelationships: { '1': { friendship: 15 }, '18': { friendship: -5 } } }, nextSceneId: 's2' },
          { id: 'c2', text: 'Support Noah\'s strategic approach', effects: { stats: { athletics: 5, academics: 5 }, npcRelationships: { '18': { friendship: 20 }, '1': { friendship: -5 } } }, nextSceneId: 's2' },
          { id: 'c3', text: 'Propose combining Chad\'s fire with Noah\'s strategy', effects: { stats: { athletics: 10, creativity: 5, energy: -10 }, npcRelationships: { '1': { friendship: 10 }, '18': { friendship: 15 } } }, nextSceneId: 's3' },
        ],
      },
      {
        id: 's2',
        text: 'The whistle blows and the game is a brutal war of attrition. The rival team is bigger, faster, and playing dirty. Chad takes a hard hit in the second quarter and goes down clutching his shoulder. The crowd gasps. Noah is at your side instantly. "I can take his position, but I need you to lead. The quarterback trusts you. Make him believe." The score is tied. Five minutes remain. Everything rides on the next play.',
        choices: [
          { id: 'c4', text: 'Call an audacious play — risk everything for glory', statCheck: { stat: 'athletics', threshold: 50 }, effects: { stats: { athletics: 20, popularity: 15, energy: -20 }, npcRelationships: { '1': { friendship: 20 }, '18': { friendship: 15 } } }, nextSceneId: 's4' },
          { id: 'c5', text: 'Trust Noah\'s playbook and play it safe', effects: { stats: { athletics: 10, popularity: 5 }, npcRelationships: { '18': { friendship: 20 } } }, nextSceneId: 's4' },
        ],
      },
      {
        id: 's3',
        text: 'Chad and Noah stand side by side in the huddle, and something clicks. Chad\'s raw power. Noah\'s precision timing. The team feeds off their combined energy. But the rivals respond with a dirty hit that sends Chad sprawling. Noah freezes for half a second — his father, the coach, is watching from the stands. Then he steps forward, calm as still water. "We finish this. Together."',
        choices: [
          { id: 'c6', text: 'Take the ball yourself and run for the end zone', statCheck: { stat: 'athletics', threshold: 45 }, effects: { stats: { athletics: 25, popularity: 20, energy: -25 }, npcRelationships: { '1': { friendship: 25 }, '18': { friendship: 20 } } }, nextSceneId: 's4' },
          { id: 'c7', text: 'Set up Noah for the game-winning throw', effects: { stats: { athletics: 15, popularity: 10, happiness: 10 }, npcRelationships: { '18': { friendship: 25, romance: 10 } } }, nextSceneId: 's4' },
        ],
      },
      {
        id: 's4',
        text: 'The final whistle echoes through the stadium. Whether you won or lost, the scoreboard tells only part of the story. In the center of the field, Chad pulls Noah into a hug that transcends rivalry. The crowd erupts. Later, beneath the bleachers, the team gathers around a cooler of victory — or consolation — drinks. Noah pulls you aside, his quiet intensity replaced by something warmer. "I never understood what my dad saw in this sport until today. It\'s not about winning. It\'s about who you become trying."',
        choices: [
          { id: 'c8', text: 'Tell him his father is proud — and so are you', effects: { stats: { happiness: 20, athletics: 5 }, npcRelationships: { '18': { friendship: 20, romance: 20 } } } },
          { id: 'c9', text: 'Propose celebrating with the whole team', effects: { stats: { popularity: 15, happiness: 15 }, npcRelationships: { '1': { friendship: 15 }, '18': { friendship: 15 } } } },
          { id: 'c10', text: 'Challenge Chad and Noah to a rematch — just the three of you', effects: { stats: { athletics: 15, energy: -10, happiness: 10 }, npcRelationships: { '1': { friendship: 20 }, '18': { friendship: 20 } } } },
        ],
      },
    ],
  },
  {
    id: 'ch14-talent-show',
    title: 'Talent Show',
    description: 'The annual talent show is calling. Will you shine on stage or help someone else steal the spotlight?',
    semester: 3,
    episode: 9,
    lockType: 'progress',
    requiredSemester: 3,
    requiredStats: { creativity: 35 },
    thumbnail: '🎤',
    scenes: [
      {
        id: 's1',
        text: 'The auditorium buzzes with anticipation. Backstage is a kaleidoscope of costumes, nervous energy, and last-minute rehearsals. Skyler is setting up an easel for a live painting performance, their hands steady despite the chaos. Raven leans against a pillar in a long black dress, clutching a notebook of poems. And Zoe — electric in studded leather — is tuning her bass with the focus of a surgeon. Each of them catches your eye, silently asking you to choose.',
        choices: [
          { id: 'c1', text: 'Join Skyler and paint live on stage', effects: { stats: { creativity: 10 }, npcRelationships: { '5': { friendship: 15 } } }, nextSceneId: 's2' },
          { id: 'c2', text: 'Support Raven\'s spoken word performance', effects: { stats: { creativity: 10 }, npcRelationships: { '4': { friendship: 15, romance: 10 } } }, nextSceneId: 's3' },
          { id: 'c3', text: 'Perform alongside Zoe and her band', effects: { stats: { creativity: 10, rebellion: 5 }, npcRelationships: { '9': { friendship: 15 } } }, nextSceneId: 's4' },
          { id: 'c4', text: 'Go solo — this is your moment', effects: { stats: { creativity: 10, popularity: 5 }, npcRelationships: { '5': { friendship: -5 }, '4': { friendship: -5 }, '9': { friendship: -5 } } }, nextSceneId: 's5' },
        ],
      },
      {
        id: 's2',
        text: 'Skyler\'s canvas is massive — six feet of white space waiting to become something extraordinary. "I\'m painting the audience as I see them," they explain, squeezing crimson onto their palette. "Not their faces. Their souls." As the music swells, Skyler\'s brush dances across the canvas and you find yourself drawn into the rhythm, adding your own strokes to the emerging masterpiece. The crowd watches, breathless.',
        choices: [
          { id: 'c5', text: 'Paint something that represents your friendship', effects: { stats: { creativity: 20, happiness: 15 }, npcRelationships: { '5': { friendship: 25, romance: 20 } } }, nextSceneId: 's5' },
          { id: 'c6', text: 'Let Skyler take the lead and support their vision', effects: { stats: { creativity: 15, happiness: 10 }, npcRelationships: { '5': { friendship: 20 } } }, nextSceneId: 's5' },
        ],
      },
      {
        id: 's3',
        text: 'Raven\'s poems are not the flowery verses you expected — they are raw, jagged things that cut straight to the bone. "I wrote this one last night," she whispers, not looking at you. "It\'s about... someone." She takes the stage and the spotlight finds her like it was made for her. Her voice starts low, almost a whisper, then builds to a storm of words that leaves the auditorium in stunned silence. Then, one person claps. Then another. Then thunder.',
        choices: [
          { id: 'c7', text: 'Whisper that you know the poem is about you', effects: { stats: { creativity: 10, happiness: 20 }, npcRelationships: { '4': { friendship: 10, romance: 30 } } }, nextSceneId: 's5' },
          { id: 'c8', text: 'Lead the standing ovation from the front row', effects: { stats: { popularity: 10, creativity: 10 }, npcRelationships: { '4': { friendship: 20, romance: 15 } } }, nextSceneId: 's5' },
        ],
      },
      {
        id: 's4',
        text: 'The stage lights up in violet and crimson. Zoe\'s band launches into a cover of a song you have never heard but instantly feel in your bones. The bass line throbs through the floorboards and up your spine. Zoe catches your eye from across the stage and grins — wild, free, alive. "Jump in whenever you\'re ready!" she shouts over the roar of amplifiers. The crowd is moving now, bodies swaying as one.',
        choices: [
          { id: 'c9', text: 'Grab a microphone and sing with everything you have', statCheck: { stat: 'creativity', threshold: 45 }, effects: { stats: { creativity: 25, popularity: 20, rebellion: 10 }, npcRelationships: { '9': { friendship: 20, romance: 15 } } }, nextSceneId: 's5' },
          { id: 'c10', text: 'Dance like the music is the only thing that exists', effects: { stats: { creativity: 15, happiness: 15, athletics: 5 }, npcRelationships: { '9': { friendship: 15 } } }, nextSceneId: 's5' },
        ],
      },
      {
        id: 's5',
        text: 'The judges announce the winner but nobody really cares. Backstage, the real prize is the electricity in the air, the sweat and laughter, the feeling that something magical happened tonight. Skyler, Raven, and Zoe surround you — rivals on paper, family in this moment. "We should do this every year," Zoe says, still breathless. Raven almost smiles. "We just might." The lights dim, but the memory will burn bright forever.',
        choices: [
          { id: 'c11', text: 'Propose starting a performing arts collective', effects: { stats: { creativity: 15, popularity: 10 }, npcRelationships: { '5': { friendship: 15 }, '4': { friendship: 15 }, '9': { friendship: 15 } } } },
          { id: 'c12', text: 'Celebrate with everyone at the all-night diner', effects: { stats: { happiness: 20, popularity: 10, energy: -10 }, npcRelationships: { '5': { friendship: 10 }, '4': { friendship: 10, romance: 10 }, '9': { friendship: 10 } } } },
          { id: 'c13', text: 'Steal a quiet moment with your closest confidant', effects: { stats: { happiness: 25 }, npcRelationships: { '5': { romance: 20 }, '4': { romance: 20 }, '9': { romance: 20 } } } },
        ],
      },
    ],
  },
  {
    id: 'ch15-the-election',
    title: 'The Election',
    description: 'Student council elections divide the school. Run for office, back a candidate, or manipulate the outcome from the shadows.',
    semester: 4,
    episode: 10,
    lockType: 'premium',
    cost: { gems: 20 },
    requiredSemester: 4,
    requiredStats: { popularity: 45 },
    thumbnail: '🗳️',
    scenes: [
      {
        id: 's1',
        text: 'The quad has been transformed into a political battleground. Red banners for Britney\'s "Experience and Excellence" campaign flutter next to Tyler\'s blue "Change Now" signs. But the real earthquake is Emma — the transfer student who announced her candidacy yesterday and is already drawing crowds that dwarf both established campaigns. She catches you watching from the library window and waves, that million-dollar smile hiding intentions you can not quite read.',
        choices: [
          { id: 'c1', text: 'Enter the race yourself — this is your moment', effects: { stats: { popularity: 15, rebellion: 5 }, npcRelationships: { '2': { friendship: -15 }, '11': { friendship: -10 }, '19': { friendship: -10 } } }, nextSceneId: 's2' },
          { id: 'c2', text: 'Offer to manage Britney\'s campaign', effects: { stats: { popularity: 10, academics: 5 }, npcRelationships: { '2': { friendship: 20 } } }, nextSceneId: 's3' },
          { id: 'c3', text: 'Secretly support Tyler while publicly staying neutral', effects: { stats: { popularity: 5, creativity: 10, rebellion: 5 }, npcRelationships: { '11': { friendship: 20 } } }, nextSceneId: 's4' },
          { id: 'c4', text: 'Investigate Emma\'s sudden popularity', effects: { stats: { academics: 10, creativity: 5 }, npcRelationships: { '19': { friendship: 10, romance: 5 } } }, nextSceneId: 's5' },
        ],
      },
      {
        id: 's2',
        text: 'The podium feels different when you are standing behind it instead of watching from the crowd. Your hands grip the edges as three hundred faces turn toward you expectantly. Britney\'s smile is a weapon. Tyler\'s handshake is a trap. And Emma — Emma looks genuinely delighted to have new competition. "The more the merrier," she says, and you almost believe her. Almost.',
        choices: [
          { id: 'c5', text: 'Deliver a speech about real student issues', statCheck: { stat: 'popularity', threshold: 55 }, effects: { stats: { popularity: 25, academics: 10 }, npcRelationships: { '2': { friendship: -10 }, '11': { friendship: -10 }, '19': { friendship: -5 } } }, nextSceneId: 's6' },
          { id: 'c6', text: 'Charm the crowd with charisma and bold promises', effects: { stats: { popularity: 15, rebellion: 10 }, npcRelationships: { '19': { friendship: 10 } } }, nextSceneId: 's6' },
        ],
      },
      {
        id: 's3',
        text: 'Britney\'s campaign headquarters is a war room of color-coded spreadsheets and volunteer schedules. "I have been planning this since sophomore year," she admits, pushing a binder toward you. "But Emma came out of nowhere with something I do not have — mystery. People love what they can not predict." She leans forward, the ambitious president showing a rare crack of vulnerability. "Help me win this. Please."',
        choices: [
          { id: 'c7', text: 'Organize a debate that highlights Britney\'s experience', effects: { stats: { academics: 15, popularity: 10 }, npcRelationships: { '2': { friendship: 25, romance: 15 } } }, nextSceneId: 's6' },
          { id: 'c8', text: 'Dig up dirt on Emma to use against her', effects: { stats: { rebellion: 15, popularity: 5 }, npcRelationships: { '2': { friendship: 15 }, '19': { friendship: -20 } } }, nextSceneId: 's6' },
        ],
      },
      {
        id: 's4',
        text: 'Tyler\'s campaign runs on a shoestring budget and pure idealism. "The student council should matter," he tells you over lukewarm coffee in the debate hall. "Not just plan dances. Advocate for real change. Mental health funding. Better food. A voice." His passion is infectious, and you find yourself sketching campaign posters late into the night. But Britney\'s machine is relentless, and Emma\'s star is rising. Can idealism win?',
        choices: [
          { id: 'c9', text: 'Create a viral social media campaign for Tyler', effects: { stats: { creativity: 20, popularity: 15 }, npcRelationships: { '11': { friendship: 25, romance: 15 } } }, nextSceneId: 's6' },
          { id: 'c10', text: 'Negotiate an alliance between Tyler and Britney against Emma', effects: { stats: { academics: 15, popularity: 10 }, npcRelationships: { '2': { friendship: 10 }, '11': { friendship: 20 } } }, nextSceneId: 's6' },
        ],
      },
      {
        id: 's5',
        text: 'Emma\'s campaign office is a converted supply closet that smells like fresh paint and ambition. She shuts the door behind you and the act drops — just slightly. "You want to know why I\'m really running," she says. It is not a question. She pulls out a file. "The principal is cutting arts funding to pay for a new football scoreboard. I found out at my old school before I transferred." Her eyes meet yours. "Someone needs to stop it."',
        choices: [
          { id: 'c11', text: 'Promise to expose the funding cuts together', effects: { stats: { academics: 10, creativity: 10, popularity: 5 }, npcRelationships: { '19': { friendship: 25, romance: 20 } } }, nextSceneId: 's6' },
          { id: 'c12', text: 'Convince her to drop out and endorse Tyler instead', effects: { stats: { popularity: 10, academics: 5 }, npcRelationships: { '19': { friendship: 10 }, '11': { friendship: 15 } } }, nextSceneId: 's6' },
        ],
      },
      {
        id: 's6',
        text: 'Election day arrives like a thunderclap. The gymnasium fills with every student in Westfield, buzzing with anticipation and divided loyalties. The votes are cast, counted, and recounted. When the winner is announced — whether it is you, Britney, Tyler, or Emma — the crowd\'s reaction tells the real story. Some cheer. Some weep. Some plot their revenge. But in the end, high school elections are never really about who wins. They are about who shows up. And you showed up.',
        choices: [
          { id: 'c13', text: 'Accept the result with grace and work toward unity', effects: { stats: { popularity: 20, happiness: 20 }, npcRelationships: { '2': { friendship: 10 }, '11': { friendship: 10 }, '19': { friendship: 10 } } } },
          { id: 'c14', text: 'Celebrate your victory wildly — you earned it', effects: { stats: { popularity: 15, happiness: 25, rebellion: 10 } } },
          { id: 'c15', text: 'Whisper to your closest ally that this is only the beginning', effects: { stats: { popularity: 10, creativity: 10 }, npcRelationships: { '2': { romance: 15 }, '11': { romance: 15 }, '19': { romance: 15 } } } },
        ],
      },
    ],
  },
];

export function canUnlockChapter(
  chapter: StoryChapter,
  progress: StoryProgress,
  semester: number,
  stats: Record<string, number>,
  currency: { points: number; gems: number },
  hasSeasonPass?: boolean
): { unlocked: boolean; reason?: string } {
  if (progress.unlockedChapters.includes(chapter.id)) {
    return { unlocked: true };
  }

  if (chapter.lockType === 'free') {
    return { unlocked: true };
  }

  if (chapter.requiredSemester && semester < chapter.requiredSemester) {
    return { unlocked: false, reason: `Requires Semester ${chapter.requiredSemester}` };
  }

  if (chapter.requiredStats) {
    for (const [stat, threshold] of Object.entries(chapter.requiredStats)) {
      if ((stats[stat] ?? 0) < threshold) {
        return { unlocked: false, reason: `Requires ${stat} ${threshold}` };
      }
    }
  }

  if (chapter.lockType === 'season-pass') {
    if (hasSeasonPass) return { unlocked: true };
    return { unlocked: false, reason: 'Requires Season Pass' };
  }

  if (chapter.lockType === 'premium' && chapter.cost) {
    if (currency.gems < (chapter.cost.gems ?? 0) || currency.points < (chapter.cost.points ?? 0)) {
      return { unlocked: false, reason: `Costs 💎${chapter.cost.gems ?? 0} 🪙${chapter.cost.points ?? 0}` };
    }
  }

  return { unlocked: true };
}

export function getCurrentScene(chapter: StoryChapter, progress: StoryProgress): string {
  const current = progress.currentSceneByChapter[chapter.id];
  if (current) {
    const scene = chapter.scenes.find((s) => s.id === current);
    if (scene) return scene.id;
  }
  return chapter.scenes[0]?.id ?? '';
}
