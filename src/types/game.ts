export type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'VICTORY' | 'GAMEOVER';

export type GameModeId = 'SPRINT' | 'OFFICE_RUSH' | 'ENDLESS';

export interface GameModeConfig {
  id: GameModeId;
  name: string;
  tagline: string;
  description: string;
  targetDistance: number; // in meters (0 for endless)
  timeLimit: number; // in seconds (0 for endless)
  coffeeSpawnRate: number;
  obstacleSpawnRate: number;
  icon: string;
}

export interface TruckConfig {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  baseAcceleration: number; // speed gain per tap
  maxSpeed: number; // km/h
  nitroDuration: number; // seconds
  nitroMultiplier: number;
  friction: number; // speed loss per frame
  color: string;
  accentColor: string;
}

export type PartCategory = 'ENGINE' | 'NITRO' | 'GEAR' | 'TIRES';

export interface PartItem {
  id: string;
  category: PartCategory;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  icon: string;
  bonus: {
    accelMultiplier?: number; // e.g. 1.35
    maxSpeedBonus?: number; // e.g. +25 km/h
    frictionReduction?: number; // e.g. 0.35 (slides longer)
    nitroDurationBonus?: number; // e.g. +2.2s
    nitroMultiplierBonus?: number; // e.g. +0.25x
    nitroChargeRate?: number; // e.g. 1.6x faster charging
    magnetRadius?: number; // 0: none, 1: adjacent lane, 2: all lanes
    tipMultiplier?: number; // e.g. 2x tips
    shieldDrowsy?: boolean; // immune to sleep clouds
    kersCoins?: boolean; // clicks grant coins
    instantSteer?: boolean; // snappier lane shifting
  };
}

export interface EquippedParts {
  engine: string;
  nitro: string;
  gear: string;
  tires: string;
}

export type CollectibleType = 'COFFEE' | 'ENERGY_DRINK' | 'PARCEL' | 'BOOST_PAD' | 'SLUMP_CLOUD';

export interface RoadEntity {
  id: number;
  type: CollectibleType;
  lane: number; // 0: Left, 1: Middle, 2: Right
  y: number; // progress distance on track (in meters)
  xOffset?: number; // small lane jitter
  collected?: boolean;
}

export interface FloatingText {
  id: number;
  text: string;
  color: string;
  x: number;
  y: number;
  opacity: number;
  scale: number;
}

export interface GameStats {
  mode: GameModeId;
  completionTime: number; // in seconds
  totalClicks: number;
  maxCPS: number;
  averageCPS: number;
  maxSpeed: number;
  distanceCovered: number;
  coffeesCollected: number;
  parcelsDelivered: number;
  obstaclesDodgedOrSmashed: number;
  tipsEarned: number;
  alertnessScore: number; // 0 - 100%
  alertnessTitle: string;
  wakeUpFeedback: string;
}

export interface UserSaveData {
  tips: number;
  hasClaimedWelcomeBonus: boolean;
  selectedTruckId: string;
  unlockedTrucks: string[];
  equippedParts: EquippedParts;
  unlockedParts: string[];
  highScores: {
    sprintBestTime?: number;
    officeRushBestScore?: number;
    endlessBestDistance?: number;
    highestCPS?: number;
    highestSpeed?: number;
  };
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
}
