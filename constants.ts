import { Hero, Role, AppSettings } from './types';

export const HEROES: Hero[] = [
  // Tank
  { id: 'dva', name: 'D.Va', role: Role.TANK, slug: 'dva' },
  { id: 'doomfist', name: 'Doomfist', role: Role.TANK, slug: 'doomfist' },
  { id: 'junkerqueen', name: 'Junker Queen', role: Role.TANK, slug: 'junker-queen' },
  { id: 'mauga', name: 'Mauga', role: Role.TANK, slug: 'mauga' },
  { id: 'orisa', name: 'Orisa', role: Role.TANK, slug: 'orisa' },
  { id: 'ramattra', name: 'Ramattra', role: Role.TANK, slug: 'ramattra' },
  { id: 'reinhardt', name: 'Reinhardt', role: Role.TANK, slug: 'reinhardt' },
  { id: 'roadhog', name: 'Roadhog', role: Role.TANK, slug: 'roadhog' },
  { id: 'sigma', name: 'Sigma', role: Role.TANK, slug: 'sigma' },
  { id: 'winston', name: 'Winston', role: Role.TANK, slug: 'winston' },
  { id: 'wreckingball', name: 'Wrecking Ball', role: Role.TANK, slug: 'wrecking-ball' },
  { id: 'zarya', name: 'Zarya', role: Role.TANK, slug: 'zarya' },
  
  // Damage
  { id: 'ashe', name: 'Ashe', role: Role.DAMAGE, slug: 'ashe' },
  { id: 'bastion', name: 'Bastion', role: Role.DAMAGE, slug: 'bastion' },
  { id: 'cassidy', name: 'Cassidy', role: Role.DAMAGE, slug: 'cassidy' },
  { id: 'echo', name: 'Echo', role: Role.DAMAGE, slug: 'echo' },
  { id: 'genji', name: 'Genji', role: Role.DAMAGE, slug: 'genji' },
  { id: 'hanzo', name: 'Hanzo', role: Role.DAMAGE, slug: 'hanzo' },
  { id: 'junkrat', name: 'Junkrat', role: Role.DAMAGE, slug: 'junkrat' },
  { id: 'mei', name: 'Mei', role: Role.DAMAGE, slug: 'mei' },
  { id: 'pharah', name: 'Pharah', role: Role.DAMAGE, slug: 'pharah' },
  { id: 'reaper', name: 'Reaper', role: Role.DAMAGE, slug: 'reaper' },
  { id: 'sojourn', name: 'Sojourn', role: Role.DAMAGE, slug: 'sojourn' },
  { id: 'soldier76', name: 'Soldier: 76', role: Role.DAMAGE, slug: 'soldier-76' },
  { id: 'sombra', name: 'Sombra', role: Role.DAMAGE, slug: 'sombra' },
  { id: 'symmetra', name: 'Symmetra', role: Role.DAMAGE, slug: 'symmetra' },
  { id: 'torbjorn', name: 'Torbjörn', role: Role.DAMAGE, slug: 'torbjorn' },
  { id: 'tracer', name: 'Tracer', role: Role.DAMAGE, slug: 'tracer' },
  { id: 'venture', name: 'Venture', role: Role.DAMAGE, slug: 'venture' },
  { id: 'widowmaker', name: 'Widowmaker', role: Role.DAMAGE, slug: 'widowmaker' },

  // Support
  { id: 'ana', name: 'Ana', role: Role.SUPPORT, slug: 'ana' },
  { id: 'baptiste', name: 'Baptiste', role: Role.SUPPORT, slug: 'baptiste' },
  { id: 'brigitte', name: 'Brigitte', role: Role.SUPPORT, slug: 'brigitte' },
  { id: 'illari', name: 'Illari', role: Role.SUPPORT, slug: 'illari' },
  { id: 'juno', name: 'Juno', role: Role.SUPPORT, slug: 'juno' },
  { id: 'kiriko', name: 'Kiriko', role: Role.SUPPORT, slug: 'kiriko' },
  { id: 'lifeweaver', name: 'Lifeweaver', role: Role.SUPPORT, slug: 'lifeweaver' },
  { id: 'lucio', name: 'Lúcio', role: Role.SUPPORT, slug: 'lucio' },
  { id: 'mercy', name: 'Mercy', role: Role.SUPPORT, slug: 'mercy' },
  { id: 'moira', name: 'Moira', role: Role.SUPPORT, slug: 'moira' },
  { id: 'zenyatta', name: 'Zenyatta', role: Role.SUPPORT, slug: 'zenyatta' },
];

export const MAPS = [
  'All Maps',
  'Circuit Royal',
  'Dorado',
  'Havana',
  'Junkertown',
  'Rialto',
  'Route 66',
  'Shambali Monastery',
  'Watchpoint: Gibraltar',
  'Blizzard World',
  'Eichenwalde',
  'Hollywood',
  'King\'s Row',
  'Midtown',
  'Numbani',
  'Paraíso',
  'Busan',
  'Ilios',
  'Lijiang Tower',
  'Nepal',
  'Oasis',
  'Samoa',
  'Colosseo',
  'Esperança',
  'New Queen Street',
  'Runasapi',
  'New Junk City',
  'Suravasa',
  'Throne of Anubis',
  'Hanaoka'
];

export const DEFAULT_SETTINGS: AppSettings = {
  input: 'PC',
  tier: 'All',
  region: 'Americas',
  gameMode: 'Role Queue',
  heroPool: HEROES.map(h => h.id), // All heroes enabled by default
};

export const TIERS = ['All', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster', 'Champion'];
