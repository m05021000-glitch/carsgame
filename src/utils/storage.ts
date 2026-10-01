import { TruckConfig, GameModeConfig, UserSaveData, PartItem, EquippedParts } from '../types/game';

export const NEWBIE_BONUS_AMOUNT = 1500;

export const GAME_MODES: GameModeConfig[] = [
  {
    id: 'SPRINT',
    name: '午休秒醒衝刺',
    tagline: '800m 極速配送 · 突破午後瞌睡大關',
    description: '下午 2:00 打卡鈴響起前的最後衝刺！狂擊畫面讓物流車破表狂飆，躲避瞌睡烏雲，收集特濃咖啡！',
    targetDistance: 800,
    timeLimit: 35,
    coffeeSpawnRate: 1.2,
    obstacleSpawnRate: 0.9,
    icon: '⚡'
  },
  {
    id: 'OFFICE_RUSH',
    name: '辦公室全棟外送',
    tagline: '1,500m 連鎖配送 · 拯救睡著的工程師與企劃',
    description: '橫跨商辦大道，沿途精準拾取加急包裹與冰美式，將提神能量即時送達 3 個站點！',
    targetDistance: 1500,
    timeLimit: 60,
    coffeeSpawnRate: 1.5,
    obstacleSpawnRate: 1.2,
    icon: '☕'
  },
  {
    id: 'ENDLESS',
    name: '無限極速狂飆',
    tagline: '手速極限考驗 · 看看你的 CPS 與極速能飆多高',
    description: '沒有終點線！速度隨手速持續疊加，挑戰人類午後清醒極限！',
    targetDistance: 0,
    timeLimit: 0,
    coffeeSpawnRate: 1.3,
    obstacleSpawnRate: 1.4,
    icon: '🚀'
  }
];

export const TRUCKS: TruckConfig[] = [
  {
    id: 'truck_yellow',
    name: '經典黃蜂號',
    subtitle: '敏捷平衡型 · 新人快遞首選',
    description: '均衡的起步推力與操控性，最適合新手快速找回手速與專注力。',
    price: 0,
    baseAcceleration: 3.4,
    maxSpeed: 165,
    nitroDuration: 3.2,
    nitroMultiplier: 1.5,
    friction: 0.85,
    color: '#F59E0B',
    accentColor: '#1E293B'
  },
  {
    id: 'truck_blackcat',
    name: '暗夜閃電黑貓',
    subtitle: '高極速型 · 氮氣續航翻倍',
    description: '流線型碳纖維快遞車身，氮氣加速時間延長 40%，極速可逼近 200 km/h！',
    price: 600,
    baseAcceleration: 3.6,
    maxSpeed: 195,
    nitroDuration: 4.5,
    nitroMultiplier: 1.6,
    friction: 0.78,
    color: '#0F172A',
    accentColor: '#06B6D4'
  },
  {
    id: 'truck_espresso',
    name: '義式特濃重裝車',
    subtitle: '磁吸霸體型 · 咖啡吸收半徑 +100%',
    description: '車頂搭載巨型義式濃縮萃取爐，咖啡磁吸範圍加倍，直接撞碎瞌睡蟲！',
    price: 1200,
    baseAcceleration: 3.1,
    maxSpeed: 180,
    nitroDuration: 3.5,
    nitroMultiplier: 1.7,
    friction: 0.9,
    color: '#854D0E',
    accentColor: '#FBBF24'
  },
  {
    id: 'truck_scooter',
    name: '街角極速小綿羊',
    subtitle: '爆發連擊型 · 起步加速破表',
    description: '車身輕巧如風，每一次點擊爆發力極強，最適合單指瘋狂超高頻率點擊手速王！',
    price: 2000,
    baseAcceleration: 4.8,
    maxSpeed: 175,
    nitroDuration: 2.8,
    nitroMultiplier: 1.45,
    friction: 1.1,
    color: '#10B981',
    accentColor: '#047857'
  }
];

// ========================================================
// CUSTOMIZABLE MODULAR PARTS CATALOG (自由零件庫)
// ========================================================
export const PARTS_CATALOG: PartItem[] = [
  // 1. ENGINE MODULES (動力核心)
  {
    id: 'engine_stock',
    category: 'ENGINE',
    name: '原廠標準引擎',
    subtitle: '基礎入門 · 平衡推力',
    description: '配送中心標配引擎，輸出平順，適合熟悉基本節奏。',
    price: 0,
    icon: '🔧',
    bonus: { accelMultiplier: 1.0, maxSpeedBonus: 0 }
  },
  {
    id: 'engine_turbo',
    category: 'ENGINE',
    name: '雙渦輪超壓增壓機',
    subtitle: '極速爆發 · 突破音速',
    description: '點擊推力暴增 40%，車速上限直接增加 30 km/h，狂擊爽感十足！',
    price: 500,
    icon: '🚀',
    bonus: { accelMultiplier: 1.4, maxSpeedBonus: 30 }
  },
  {
    id: 'engine_electric',
    category: 'ENGINE',
    name: '超頻高壓直驅電機',
    subtitle: '極致手速響應 · 超狂 CPS',
    description: '專為極速連點玩家打造，點擊回饋延遲降為零，每次點擊推力提升 25%。',
    price: 450,
    icon: '⚡',
    bonus: { accelMultiplier: 1.25, maxSpeedBonus: 15 }
  },
  {
    id: 'engine_cruiser',
    category: 'ENGINE',
    name: '低摩阻慣性巡航器',
    subtitle: '超長滑行 · 輕鬆省力',
    description: '大幅減少鬆手時的車速衰減（降低 50% 阻力），稍微放慢點擊也能維持高速！',
    price: 380,
    icon: '🌊',
    bonus: { frictionReduction: 0.5, maxSpeedBonus: 10 }
  },

  // 2. NITRO MODULES (氮氣系統)
  {
    id: 'nitro_stock',
    category: 'NITRO',
    name: '原廠標準氮氣瓶',
    subtitle: '基礎蓄氣 · 標準噴射',
    description: '出廠自帶的氮氣瓶，蓄滿後可提供短暫加速。',
    price: 0,
    icon: '💨',
    bonus: { nitroDurationBonus: 0, nitroChargeRate: 1.0 }
  },
  {
    id: 'nitro_rapid',
    category: 'NITRO',
    name: '特濃雙倍蓄氣閥',
    subtitle: '極速充填 · 咖啡即刻滿管',
    description: '點擊充氣速度加快 80%，每喝一杯特濃咖啡即可恢復近半管氮氣！',
    price: 420,
    icon: '☕',
    bonus: { nitroChargeRate: 1.8 }
  },
  {
    id: 'nitro_hyper',
    category: 'NITRO',
    name: '瞬間超頻爆發噴嘴',
    subtitle: '狂暴加速 · 撞碎障礙',
    description: '釋放氮氣時速度倍增為 1.85 倍，並在車頭形成衝擊波，直接撞碎瞌睡蟲！',
    price: 520,
    icon: '💥',
    bonus: { nitroMultiplierBonus: 0.35 }
  },
  {
    id: 'nitro_cryo',
    category: 'NITRO',
    name: '液態低溫超長延長艙',
    subtitle: '超長推進 · 持續飛馳',
    description: '氮氣持續噴射時間延長 2.5 秒，享受宛如高鐵般的超持久狂飆感！',
    price: 460,
    icon: '❄️',
    bonus: { nitroDurationBonus: 2.5 }
  },

  // 3. GEAR MODULES (智慧配備 / 雷達)
  {
    id: 'gear_stock',
    category: 'GEAR',
    name: '原廠後視鏡',
    subtitle: '基本視野 · 標準導航',
    description: '標準配送裝備，無特殊輔助效果。',
    price: 0,
    icon: '🧭',
    bonus: {}
  },
  {
    id: 'gear_magnet',
    category: 'GEAR',
    name: '量子咖啡強效磁吸',
    subtitle: '全車道吸附 · 咖啡收割機',
    description: '形成強大磁場，即使不在同一個車道，也能將所有咖啡與包裹瞬間吸附過來！',
    price: 480,
    icon: '🧲',
    bonus: { magnetRadius: 2 }
  },
  {
    id: 'gear_tips',
    category: 'GEAR',
    name: 'VIP 加急件雷達',
    subtitle: '小費雙倍 · 財源滾滾',
    description: '精密標註高級客戶外送件，每拾取一個加急包裹和小費獎勵直接翻倍（+100%）！',
    price: 450,
    icon: '💰',
    bonus: { tipMultiplier: 2.0 }
  },
  {
    id: 'gear_shield',
    category: 'GEAR',
    name: '瞌睡衝擊波力場',
    subtitle: '免疫瞌睡 · 反彈獎勵',
    description: '完全免疫瞌睡蟲的減速懲罰，迎面撞上瞌睡蟲時甚至能將其震碎並獲得額外小費！',
    price: 500,
    icon: '🛡️',
    bonus: { shieldDrowsy: true }
  },

  // 4. TIRES MODULES (底盤車胎)
  {
    id: 'tire_stock',
    category: 'TIRES',
    name: '原廠耐磨胎',
    subtitle: '耐用穩定 · 日常配送',
    description: '一般公路用輪胎，反應平衡。',
    price: 0,
    icon: '🛞',
    bonus: {}
  },
  {
    id: 'tire_slick',
    category: 'TIRES',
    name: '競技熱熔賽車胎',
    subtitle: '極速轉向 · 毫秒變道',
    description: '提供極限抓地力，切換車道瞬間到位無延遲，閃避障礙如有神助！',
    price: 380,
    icon: '🏎️',
    bonus: { instantSteer: true }
  },
  {
    id: 'tire_kers',
    category: 'TIRES',
    name: '動能回收發電輪 (KERS)',
    subtitle: '點擊生財 · 手速即小費',
    description: '安裝動能發電技術，每一次點擊螢幕加速，都將手速轉換為 +1 💰 外送小費！',
    price: 520,
    icon: '⚡',
    bonus: { kersCoins: true }
  },
  {
    id: 'tire_heavy',
    category: 'TIRES',
    name: '防震全地形越野懸吊',
    subtitle: '平穩如磐石 · 顛簸無視',
    description: '經過任何不良路況或減速帶時保持平穩，極大提高高速行駛時的清醒度加成。',
    price: 360,
    icon: '🏔️',
    bonus: { frictionReduction: 0.2 }
  }
];

const STORAGE_KEY = 'afternoon_rush_save_v2';

export const DEFAULT_EQUIPPED_PARTS: EquippedParts = {
  engine: 'engine_stock',
  nitro: 'nitro_stock',
  gear: 'gear_stock',
  tires: 'tire_stock'
};

export const DEFAULT_SAVE_DATA: UserSaveData = {
  tips: NEWBIE_BONUS_AMOUNT, // 1500 starting funds for every new player!
  hasClaimedWelcomeBonus: true,
  selectedTruckId: 'truck_yellow',
  unlockedTrucks: ['truck_yellow'],
  equippedParts: DEFAULT_EQUIPPED_PARTS,
  unlockedParts: ['engine_stock', 'nitro_stock', 'gear_stock', 'tire_stock'],
  highScores: {},
  soundEnabled: true,
  hapticsEnabled: true,
  musicVolume: 0.6,
  sfxVolume: 0.8
};

export function loadSaveData(): UserSaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SAVE_DATA,
        ...parsed,
        equippedParts: { ...DEFAULT_EQUIPPED_PARTS, ...(parsed.equippedParts || {}) },
        unlockedParts: parsed.unlockedParts || DEFAULT_SAVE_DATA.unlockedParts,
        highScores: { ...DEFAULT_SAVE_DATA.highScores, ...(parsed.highScores || {}) }
      };
    }

    // Check v1 save data for migration
    const oldRaw = localStorage.getItem('afternoon_rush_save_v1');
    if (oldRaw) {
      const oldParsed = JSON.parse(oldRaw);
      return {
        ...DEFAULT_SAVE_DATA,
        tips: Math.max(NEWBIE_BONUS_AMOUNT, (oldParsed.tips || 0) + NEWBIE_BONUS_AMOUNT),
        hasClaimedWelcomeBonus: true,
        selectedTruckId: oldParsed.selectedTruckId || 'truck_yellow',
        unlockedTrucks: oldParsed.unlockedTrucks || ['truck_yellow'],
        highScores: oldParsed.highScores || {}
      };
    }
  } catch {}
  return DEFAULT_SAVE_DATA;
}

export function saveGameData(data: UserSaveData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}
