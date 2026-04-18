import { Video, Heart, Shield, Zap, Swords, Crown, MapPin } from 'lucide-react';

export const STORY_CHARACTERS = {
  OAK: {
    id: 'oak',
    name: 'Prof. Eich',
    role: 'Mentor',
    avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/oak.png', // Placeholder URL or local asset
    color: 'from-slate-400 to-slate-600'
  },
  ASH: {
    id: 'ash',
    name: 'Ash Ketchum',
    role: 'Rivale',
    avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/red.png', // Using Red as proxy for Ash style
    color: 'from-red-500 to-red-700'
  },
  MISTY: {
    id: 'misty',
    name: 'Misty',
    role: 'Arenaleiterin',
    avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/misty.png',
    color: 'from-cyan-400 to-blue-500'
  },
  GIOVANNI: {
    id: 'giovanni',
    name: 'Giovanni',
    role: 'Team Rocket Boss',
    avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/giovanni.png',
    color: 'from-gray-800 to-black'
  },
  AURA: {
    id: 'aura',
    name: 'Wächterin Aura',
    role: 'Riss-Forscherin',
    avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/448.png',
    color: 'from-blue-500 to-indigo-700'
  },
  N: {
    id: 'n',
    name: 'N',
    role: 'Grenzgänger',
    avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/570.png',
    color: 'from-emerald-400 to-teal-600'
  },
  LANCE: {
    id: 'lance',
    name: 'Lance',
    role: 'Drachenmeister',
    avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png',
    color: 'from-amber-400 to-rose-600'
  }
};

export const STORY_CHAPTERS = [
  {
    id: 'chapter_1',
    title: 'Kapitel 1: Der Anfang',
    description: 'Deine Reise beginnt hier. Lerne die Grundlagen und stärke dein erstes Pokémon.',
    bgImage: 'linear-gradient(to bottom right, #1a2e05, #0f172a)',
    missions: [
      {
        id: 'mission_1_1',
        title: 'Erste Schritte',
        character: STORY_CHARACTERS.OAK,
        description: 'Willkommen in der Welt der Pokémon! Um ein großer Trainer zu werden, musst du lernen, von anderen zu lernen.',
        taskLabel: 'Sieh dir 3 Videos an',
        type: 'watch_videos',
        targetAmount: 3,
        rewards: {
          xp: 100,
          tokens: 50,
          item: 'Trank'
        },
        icon: Video
      },
      {
        id: 'mission_1_2',
        title: 'Kampfgeist zeigen',
        character: STORY_CHARACTERS.ASH,
        description: 'Hey! Zeig mir, dass du das Zeug zum Champion hast. Unterstütze andere Trainer!',
        taskLabel: 'Like 5 Beiträge',
        type: 'like_content',
        targetAmount: 5,
        rewards: {
          xp: 150,
          tokens: 75,
          unlocks: 'Schnellangriff' // New move unlock
        },
        icon: Heart
      }
    ]
  },
  {
    id: 'chapter_2',
    title: 'Kapitel 2: Die Arena-Herausforderung',
    description: 'Stelle dich stärkeren Gegnern und beweise dein taktisches Geschick.',
    bgImage: 'linear-gradient(to bottom right, #0c4a6e, #0f172a)',
    missions: [
      {
        id: 'mission_2_1',
        title: 'Training am Wasser',
        character: STORY_CHARACTERS.MISTY,
        description: 'Meine Wasser-Pokémon sind anmutig und stark. Kann dein Partner mithalten?',
        taskLabel: 'Erreiche Level 10 mit deinem Partner',
        type: 'reach_level',
        targetAmount: 10,
        rewards: {
          xp: 300,
          tokens: 150,
          item: 'Wasserstein-Splitter'
        },
        icon: Swords
      },
      {
        id: 'mission_2_2',
        title: 'Team Rocket schlägt zu',
        character: STORY_CHARACTERS.GIOVANNI,
        description: 'Wir übernehmen diesen Ort. Versuch nicht, uns aufzuhalten... oder tritt uns bei.',
        taskLabel: 'Gewinne 3 Neon-Dash Rennen', // Cross-game integration
        type: 'play_neondash',
        targetAmount: 3,
        rewards: {
          xp: 500,
          tokens: 300,
          evolution: true // Triggers evolution chance
        },
        icon: Crown
      }
    ]
  },
  {
    id: 'chapter_3',
    title: 'Kapitel 3: Nebelkante Erwacht',
    description: 'Zeitanomalien reißen neue Wege auf. Reise durch die Nebelkante und sichere seltene Begegnungen für dein Team.',
    bgImage: 'linear-gradient(to bottom right, #052e16, #172554)',
    missions: [
      {
        id: 'mission_3_1',
        title: 'Aufbruch in den Nebel',
        character: STORY_CHARACTERS.AURA,
        description: 'Die Region Nebelkante reagiert auf mutige Trainer. Untersuche ihre Biome und sammle Hinweise auf die Rissenergie.',
        taskLabel: 'Erkunde 4 Story-Orte',
        type: 'story_explore',
        targetAmount: 4,
        rewards: {
          xp: 650,
          tokens: 350,
          unlocks: 'Nebelkanten-Pass'
        },
        icon: MapPin
      },
      {
        id: 'mission_3_2',
        title: 'Schatten im Riss',
        character: STORY_CHARACTERS.N,
        description: 'Zwischen den Welten treiben wilde Energien. Besiege starke Gegner, bevor die Anomalie außer Kontrolle geraet.',
        taskLabel: 'Gewinne 5 Arena-Kaempfe',
        type: 'arena_wins',
        targetAmount: 5,
        rewards: {
          xp: 900,
          tokens: 500,
          item: 'Nebelkompass'
        },
        icon: Shield
      }
    ]
  },
  {
    id: 'chapter_4',
    title: 'Kapitel 4: Der Legendenpfad',
    description: 'Nur die staerksten Trainer duerfen die letzte Pruefung antreten. Stelle dein Team gegen Drachen, Champions und uralte Maechte.',
    bgImage: 'linear-gradient(to bottom right, #431407, #312e81)',
    missions: [
      {
        id: 'mission_4_1',
        title: 'Aura des Champions',
        character: STORY_CHARACTERS.LANCE,
        description: 'Ein Champion wird nicht geboren, sondern in schweren Kaempfen geformt. Trainiere dein Vorzeige-Pokemon bis zur Spitze.',
        taskLabel: 'Erreiche Level 20 mit deinem Partner',
        type: 'reach_level',
        targetAmount: 20,
        rewards: {
          xp: 1200,
          tokens: 750,
          unlocks: 'Champion-Aura'
        },
        icon: Zap
      },
      {
        id: 'mission_4_2',
        title: 'Klinge der Legenden',
        character: STORY_CHARACTERS.AURA,
        description: 'Der letzte Test vereint Strategie, Ausdauer und Mut. Gewinne genug Duelle, um den Eingang zur Legendenkammer zu oeffnen.',
        taskLabel: 'Gewinne 7 Duelle',
        type: 'battle_wins',
        targetAmount: 7,
        rewards: {
          xp: 1500,
          tokens: 1000,
          evolution: true
        },
        icon: Swords
      }
    ]
  }
];
