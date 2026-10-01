import React from 'react';
import { GameModeId, TruckConfig, UserSaveData } from '../types/game';
import { GAME_MODES, PARTS_CATALOG } from '../utils/storage';
import { TruckSvg } from './TruckSvg';
import {
  Play,
  Wrench,
  Volume2,
  VolumeX,
  Trophy,
  Coffee,
  Sparkles,
  Tv,
  Smartphone
} from 'lucide-react';

interface TitleScreenProps {
  selectedMode: GameModeId;
  selectedTruck: TruckConfig;
  saveData: UserSaveData;
  onSelectMode: (mode: GameModeId) => void;
  onStartGame: () => void;
  onOpenGarage: () => void;
  onOpenHost: () => void;
  onOpenPlayer: () => void;
  onToggleSound: () => void;
  onOpenSettings: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  selectedMode,
  selectedTruck,
  saveData,
  onSelectMode,
  onStartGame,
  onOpenGarage,
  onOpenHost,
  onOpenPlayer,
  onToggleSound,
  onOpenSettings
}) => {
  const equippedEngine = PARTS_CATALOG.find((p) => p.id === saveData.equippedParts.engine);
  const equippedNitro = PARTS_CATALOG.find((p) => p.id === saveData.equippedParts.nitro);
  const equippedGear = PARTS_CATALOG.find((p) => p.id === saveData.equippedParts.gear);
  const equippedTires = PARTS_CATALOG.find((p) => p.id === saveData.equippedParts.tires);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background Decorative Grid and Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(245,158,11,0.15),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-slate-800/80 relative z-10 backdrop-blur-md bg-slate-950/70">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            ⚡
          </div>
          <span className="font-racing font-extrabold text-xl tracking-tight text-white">
            午後神速物流
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button onClick={onOpenHost} className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer text-amber-300">
            <Tv className="w-4 h-4" />
            <span>主持人大螢幕</span>
          </button>
          <button onClick={onOpenGarage} className="hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer">
            <Wrench className="w-4 h-4" />
            <span>自選改裝工坊</span>
          </button>
          <button onClick={onOpenSettings} className="hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer">
            <Trophy className="w-4 h-4" />
            <span>排行榜 & 設定</span>
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenGarage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/40 hover:border-amber-400 text-xs text-amber-400 font-mono-num font-bold cursor-pointer transition-colors"
            title="點擊前往零件工坊"
          >
            <span>💰</span>
            <span>{saveData.tips}</span>
            <span className="text-[10px] text-amber-200/80 hidden xs:inline ml-0.5">配零件</span>
          </button>

          <button
            onClick={onToggleSound}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={saveData.soundEnabled ? '靜音' : '開啟聲音'}
          >
            {saveData.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-5 md:py-7 flex flex-col justify-center relative z-10">
        {/* Newbie Grant Prominent Callout Banner */}
        <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-transparent border border-amber-500/40 rounded-2xl p-3 mb-4 flex items-center justify-between gap-3 shadow-lg shadow-amber-500/5">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-bounce">🎁</span>
            <div>
              <div className="text-xs font-bold text-amber-300">
                新人專屬 1,500 💰 改裝基金已發放！
              </div>
              <div className="text-[11px] text-slate-400">
                全體玩家皆可自由自選「雙渦輪、超頻氮氣、全車道咖啡磁吸、動能發電輪」！
              </div>
            </div>
          </div>
          <button
            onClick={onOpenGarage}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-racing font-bold text-xs shrink-0 cursor-pointer shadow-md shadow-amber-500/20 active:scale-95 transition-all"
          >
            前往自己配零件 →
          </button>
        </div>

        {/* Wake-Up Catchphrase */}
        <div className="text-center max-w-2xl mx-auto mb-4">
          <div className="inline-flex items-center gap-2 text-xs md:text-sm text-amber-400 font-medium mb-1.5">
            <Coffee className="w-4 h-4 inline" />
            <span>告別飯後昏睡 · 掃碼開戰 · 爭奪每輪冠軍</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white text-balance font-racing">
            午休後提神競速大衝刺！
          </h1>
          <p className="mt-2 text-slate-400 text-xs md:text-sm leading-relaxed text-balance">
            支援主持人開啟大螢幕，讓全體同事手機掃描 QR 碼進入配車，限時 5 分鐘配好開戰，多回合決出最強冠軍！
          </p>
        </div>

        {/* MULTIPLAYER / HOST FEATURED ACTION CARD */}
        <div className="bg-gradient-to-br from-amber-950/40 via-slate-900/90 to-slate-900 border border-amber-500/50 rounded-3xl p-5 mb-5 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl shrink-0">
                📺
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-racing font-bold text-lg text-white">
                    辦公室大螢幕爭霸模式 (主持人畫面)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                    推薦多人同樂
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  投放至大螢幕！顯示專屬 QR 碼與 4 位數 PIN，限時 5 分鐘讓大家拿 1,500 💰 配車，主持人掌控多回合賽事並加冕每輪冠軍！
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto shrink-0">
              <button
                onClick={onOpenHost}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-racing font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <Tv className="w-4 h-4" />
                <span>開啟主持人大螢幕</span>
              </button>

              <button
                onClick={onOpenPlayer}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>以選手手機加入</span>
              </button>
            </div>
          </div>
        </div>

        {/* Selected Truck & Equipped Parts Preview Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-4 shadow-xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-24 h-16 flex items-center justify-center bg-slate-950/60 rounded-xl border border-slate-800/80 p-2 shrink-0">
                <TruckSvg truckId={selectedTruck.id} isNitro={false} speed={80} className="w-full h-full" />
              </div>
              <div>
                <div className="text-xs text-amber-400 font-medium">{selectedTruck.subtitle}</div>
                <div className="text-base font-bold text-white font-racing">{selectedTruck.name}</div>
                <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{selectedTruck.description}</div>
              </div>
            </div>

            <button
              onClick={onOpenGarage}
              className="w-full md:w-auto px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold font-racing flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>自選配件工坊</span>
            </button>
          </div>

          {/* Equipped Parts Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-[11px]">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-1.5 flex items-center gap-2">
              <span className="text-base">{equippedEngine?.icon || '🔧'}</span>
              <div className="truncate">
                <div className="text-[10px] text-slate-400">動力核心</div>
                <div className="font-bold text-slate-200 truncate">{equippedEngine?.name}</div>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-1.5 flex items-center gap-2">
              <span className="text-base">{equippedNitro?.icon || '💨'}</span>
              <div className="truncate">
                <div className="text-[10px] text-slate-400">氮氣噴射</div>
                <div className="font-bold text-cyan-300 truncate">{equippedNitro?.name}</div>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-1.5 flex items-center gap-2">
              <span className="text-base">{equippedGear?.icon || '🧭'}</span>
              <div className="truncate">
                <div className="text-[10px] text-slate-400">智慧配備</div>
                <div className="font-bold text-emerald-300 truncate">{equippedGear?.name}</div>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-1.5 flex items-center gap-2">
              <span className="text-base">{equippedTires?.icon || '🛞'}</span>
              <div className="truncate">
                <div className="text-[10px] text-slate-400">底盤輪胎</div>
                <div className="font-bold text-amber-300 truncate">{equippedTires?.name}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Solo Practice Mode Action */}
        <div className="flex flex-col items-center pt-1">
          <button
            onClick={onStartGame}
            className="w-full md:w-72 py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-racing font-bold text-base flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current text-amber-400" />
            <span>單人試駕練習跑</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-3 px-6 text-center text-xs text-slate-500 relative z-10">
        午後神速物流 · 專為打工人午休提神設計 · 大螢幕多回合競速爭霸系統
      </footer>
    </div>
  );
};
