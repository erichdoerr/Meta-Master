export enum Role {
  TANK = 'Tank',
  DAMAGE = 'Damage',
  SUPPORT = 'Support'
}

export interface Hero {
  id: string;
  name: string;
  role: Role;
  slug: string; // For image URLs
}

export interface AppSettings {
  input: 'PC' | 'Console';
  tier: 'All' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master' | 'Grandmaster' | 'Champion';
  region: 'Americas' | 'Europe' | 'Asia';
  gameMode: 'Role Queue' | 'Open Queue';
  heroPool: string[]; // List of Hero IDs
}

export interface Recommendation {
  heroName: string;
  winRate: string;
  pickRate: string;
  reason: string; // Kept in type for safety, but will not be displayed
}

export interface BanRecommendation {
  heroName: string;
  winRate: string;
  pickRate: string;
  role: string;
  reason: string;
}

export interface ApiResponse {
  recommendations: Recommendation[];
  bans: BanRecommendation[];
}

export interface FullMapStrategy {
  tankRecommendations: Recommendation[];
  damageRecommendations: Recommendation[];
  supportRecommendations: Recommendation[];
  bans: BanRecommendation[];
}

export interface MapStat {
  mapName: string;
  winRate: string;
  reason: string;
}

export interface HeroAnalysisResponse {
  heroName: string;
  maps: MapStat[];
}
