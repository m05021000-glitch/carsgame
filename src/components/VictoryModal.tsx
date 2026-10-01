import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameStats } from '../types/game';
import { Trophy, Zap, Coffee, RotateCcw, Home, Wrench, Share2 } from 'lucide-react';

interface VictoryModalProps {
  stats: GameStats;
  isVictory: boolean;
  onPlayAgain: () => void;
  onBackToTitle: () => void;
  onOpenGarage: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  stats,
  isVictory,
  onPlayAgain,
  onBackToTitle,
  onOpenGarage
}) => {
  useEffect(() => {
    if (isVictory) {
      // Fire confetti bursts!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });
        }, 250);
      } catch {}
    }
  }, [isVictory]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative overflow-hidden my-auto">
        {/* Top Glow Accent */}
        <div
          className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${
            isVictory ? 'from-amber-400 via-emerald-400 to-cyan-400' : 'from-rose-500 to-amber-500'
          }`}
        />

        {/* Header Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-3xl mb-3">
            {isVictory ? '🏆' : '⏰'}
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white font-racing">
            {isVictory ? '午後神速送達！' : '午休時間到！'}
          </h2>
          <div className="text-sm font-semibold text-amber-400 mt-1 font-racing">
            {stats.alertnessTitle}
          </div>
          <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto">
            {stats.wakeUpFeedback}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Max Speed */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 text-center">
            <div className="text-[11px] text-slate-400 font-medium">最高時速</div>
            <div className="font-racing font-bold text-2xl text-amber-400 mt-0.5">
              {Math.round(stats.maxSpeed)} <span className="text-xs font-normal text-slate-400">km/h</span>
            </div>
          </div>

          {/* Peak Hand CPS */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 text-center">
            <div className="text-[11px] text-slate-400 font-medium">巔峰點擊手速</div>
            <div className="font-racing font-bold text-2xl text-cyan-400 mt-0.5">
              {stats.maxCPS.toFixed(1)} <span className="text-xs font-normal text-slate-400">CPS</span>
            </div>
          </div>

          {/* Coffee & Parcels */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 text-center">
            <div className="text-[11px] text-slate-400 font-medium">拾取咖啡 / 包裹</div>
            <div className="font-racing font-bold text-xl text-emerald-400 mt-0.5">
              {stats.coffeesCollected} 杯 · {stats.parcelsDelivered} 件
            </div>
          </div>

          {/* Tips Earned */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 text-center">
            <div className="text-[11px] text-slate-400 font-medium">本輪獲得外送小費</div>
            <div className="font-racing font-bold text-xl text-amber-400 mt-0.5">
              + {stats.tipsEarned} 💰
            </div>
          </div>
        </div>

        {/* Alertness Progress Meter */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>醒腦程度評價</span>
            </span>
            <span className="font-racing font-bold text-amber-400">{Math.round(stats.alertnessScore)}% 精神飽滿</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${stats.alertnessScore}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onPlayAgain}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-racing font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>再來一局提神！</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={onOpenGarage}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span>升級物流車</span>
            </button>

            <button
              onClick={onBackToTitle}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-slate-400" />
              <span>返回首頁</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
