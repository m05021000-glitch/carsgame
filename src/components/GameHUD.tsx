import React, { useRef } from 'react';
import { TruckConfig } from '../types/game';
import { ArrowLeft, ArrowRight, Zap, Coffee, Pause, Gauge, Flame } from 'lucide-react';

interface GameHUDProps {
  truck: TruckConfig;
  speed: number;
  maxSpeed: number;
  cps: number;
  nitroGauge: number; // 0 - 100
  isNitro: boolean;
  distanceTraveled: number;
  targetDistance: number;
  timeRemaining: number;
  alertness: number; // 0 - 100
  tipsEarned: number;
  coffeesCollected: number;
  onDashTap: (e?: React.MouseEvent | React.TouchEvent) => void;
  onLaneChange: (direction: 'left' | 'right') => void;
  onTriggerNitro: () => void;
  onPause: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  speed,
  maxSpeed,
  cps,
  nitroGauge,
  isNitro,
  distanceTraveled,
  targetDistance,
  timeRemaining,
  alertness,
  tipsEarned,
  coffeesCollected,
  onDashTap,
  onLaneChange,
  onTriggerNitro,
  onPause
}) => {
  const dashBtnRef = useRef<HTMLButtonElement | null>(null);

  // Speed percentage for meter
  const speedRatio = Math.min(1, speed / maxSpeed);

  // Alertness level title
  const getAlertnessLabel = (score: number) => {
    if (score >= 95) return '🔥 靈魂超頻 200%';
    if (score >= 80) return '⚡ 精神抖擻';
    if (score >= 50) return '☕ 漸入佳境';
    if (score >= 25) return '🥱 瞌睡消退中';
    return '💤 午休昏睡';
  };

  const getCpsLabel = (val: number) => {
    if (val >= 9) return '神速幻影手!';
    if (val >= 6.5) return '超狂飆手速!';
    if (val >= 4) return '節奏正好!';
    return '快點擊提神!';
  };

  const progressPercent = targetDistance > 0 ? Math.min(100, (distanceTraveled / targetDistance) * 100) : 0;
  const distLeft = targetDistance > 0 ? Math.max(0, Math.round(targetDistance - distanceTraveled)) : Math.round(distanceTraveled);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 md:p-6 overflow-hidden">
      {/* ========================================================
          1. TOP STATUS BAR (Time, Target Distance, Tip coins)
         ======================================================== */}
      <div className="flex items-center justify-between gap-2 md:gap-4 pointer-events-auto">
        {/* Distance / Progress Card */}
        <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-2 text-left min-w-[130px] md:min-w-[190px] shadow-lg">
          <div className="flex items-center justify-between text-[11px] md:text-xs text-slate-400 font-medium">
            <span>{targetDistance > 0 ? '剩餘距離' : '已行駛'}</span>
            <span className="font-mono-num text-amber-400 font-bold">
              {distLeft} <span className="text-[10px] text-slate-400">m</span>
            </span>
          </div>
          {targetDistance > 0 && (
            <div className="w-full bg-slate-800 rounded-full h-2 mt-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-150"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>

        {/* Center: Wake-Up Alertness Meter */}
        <div className="flex-1 max-w-xs bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-2 shadow-lg text-center hidden sm:block">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1">
              <Coffee className="w-3.5 h-3.5 text-amber-400 inline" />
              <span>醒腦指數</span>
            </span>
            <span className="text-amber-300 font-bold font-racing">{getAlertnessLabel(alertness)}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 mt-1.5 overflow-hidden border border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-200 ${
                alertness > 80 ? 'bg-gradient-to-r from-amber-400 via-rose-500 to-cyan-400' : 'bg-gradient-to-r from-amber-600 to-amber-400'
              }`}
              style={{ width: `${alertness}%` }}
            />
          </div>
        </div>

        {/* Right: Time Remaining & Pause */}
        <div className="flex items-center gap-2">
          {timeRemaining > 0 && (
            <div
              className={`bg-slate-900/85 backdrop-blur-md border rounded-xl px-3 py-2 text-center shadow-lg transition-colors ${
                timeRemaining <= 10
                  ? 'border-rose-500 bg-rose-950/70 text-rose-300 animate-pulse'
                  : 'border-slate-700/80 text-slate-200'
              }`}
            >
              <div className="text-[10px] text-slate-400">午休倒數</div>
              <div className="font-mono-num font-extrabold text-base md:text-lg">
                {timeRemaining.toFixed(1)}s
              </div>
            </div>
          )}

          <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-2 shadow-lg hidden xs:flex items-center gap-1.5">
            <span className="text-xs text-amber-400">💰</span>
            <span className="font-mono-num font-bold text-sm text-slate-100">{tipsEarned}</span>
          </div>

          <button
            onClick={onPause}
            className="p-2.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer active:scale-95"
            title="暫停遊戲 (Esc)"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ========================================================
          2. SPEEDOMETER & REAL-TIME CPS DASHBOARD
         ======================================================== */}
      <div className="flex flex-col items-center justify-center my-auto pointer-events-none select-none">
        <div
          className={`flex flex-col items-center p-3 md:p-4 rounded-2xl border backdrop-blur-md transition-all duration-150 ${
            isNitro
              ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)] scale-105'
              : speed > 130
              ? 'bg-slate-900/75 border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
              : 'bg-slate-900/60 border-slate-800'
          }`}
        >
          {/* Top Nitro Status Badge */}
          {isNitro ? (
            <div className="flex items-center gap-1.5 text-cyan-300 font-racing text-xs md:text-sm font-bold animate-pulse tracking-wider">
              <Zap className="w-4 h-4 fill-cyan-300" />
              <span>NITRO OVERDRIVE · 提神超頻加速</span>
            </div>
          ) : (
            <div className="text-[11px] md:text-xs text-slate-400 font-racing">
              AFTERNOON COURIER VELOCITY
            </div>
          )}

          {/* Speed Digital Readout */}
          <div className="flex items-baseline gap-1 my-0.5">
            <span
              className={`font-racing font-extrabold text-4xl md:text-6xl tracking-tight transition-colors ${
                isNitro
                  ? 'text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]'
                  : speed > 140
                  ? 'text-amber-400'
                  : 'text-white'
              }`}
            >
              {Math.round(speed)}
            </span>
            <span className="font-racing text-xs md:text-sm text-slate-400 font-bold">KM/H</span>
          </div>

          {/* Speed Arc Bar */}
          <div className="w-36 md:w-52 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/80 mt-1">
            <div
              className={`h-full rounded-full transition-all duration-100 ${
                isNitro
                  ? 'bg-gradient-to-r from-cyan-400 to-sky-200'
                  : speedRatio > 0.8
                  ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-red-500'
                  : 'bg-gradient-to-r from-emerald-500 via-amber-500 to-orange-500'
              }`}
              style={{ width: `${speedRatio * 100}%` }}
            />
          </div>

          {/* Live CPS / Hand Speed Counter */}
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className="text-slate-400">手速:</span>
            <span className="font-mono-num font-bold text-amber-300 text-sm">{cps.toFixed(1)} CPS</span>
            <span className="text-[11px] text-emerald-400 font-medium">({getCpsLabel(cps)})</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. ERGONOMIC BOTTOM CONTROLS (Lanes + HUGE Dash Pedal)
         ======================================================== */}
      <div className="flex flex-col gap-2.5 max-w-lg mx-auto w-full pointer-events-auto">
        {/* Nitro Ready Quick-Bar */}
        <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-md">
          <Flame
            className={`w-4 h-4 transition-colors ${
              nitroGauge >= 100 ? 'text-amber-400 animate-bounce' : 'text-slate-500'
            }`}
          />
          <div className="flex-1 bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-150 ${
                nitroGauge >= 100 ? 'bg-gradient-to-r from-amber-400 to-cyan-400 animate-pulse' : 'bg-amber-500'
              }`}
              style={{ width: `${nitroGauge}%` }}
            />
          </div>
          <button
            onClick={onTriggerNitro}
            disabled={nitroGauge < 100 || isNitro}
            className={`px-3 py-1 rounded-lg text-xs font-racing font-bold tracking-wider transition-all cursor-pointer ${
              nitroGauge >= 100 && !isNitro
                ? 'bg-gradient-to-r from-amber-500 to-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isNitro ? '衝刺中!!' : nitroGauge >= 100 ? '⚡ 釋放氮氣 (N)' : `${Math.round(nitroGauge)}%`}
          </button>
        </div>

        {/* Steering + Main Tap Accelerator Area */}
        <div className="grid grid-cols-12 gap-2 h-20 md:h-24">
          {/* Left Lane Shift Button */}
          <button
            onClick={() => onLaneChange('left')}
            className="col-span-3 bg-slate-800/90 hover:bg-slate-700/90 active:bg-amber-500/30 border border-slate-700/90 rounded-2xl flex flex-col items-center justify-center text-slate-200 transition-all cursor-pointer active:scale-95 shadow-md select-none touch-manipulation"
            title="往左車道 (← 或 A)"
          >
            <ArrowLeft className="w-6 h-6 md:w-8 md:h-8" />
            <span className="text-[10px] md:text-xs text-slate-400 mt-0.5 font-medium">左道 (A)</span>
          </button>

          {/* MAIN MASSIVE DASH PEDAL / TAP ZONE */}
          <button
            ref={dashBtnRef}
            onPointerDown={(e) => {
              e.preventDefault();
              onDashTap(e);
            }}
            className={`col-span-6 relative overflow-hidden rounded-2xl border-2 transition-all cursor-pointer active:scale-[0.96] shadow-xl select-none touch-manipulation flex flex-col items-center justify-center ${
              isNitro
                ? 'bg-gradient-to-b from-cyan-500 via-sky-600 to-blue-700 border-cyan-300 text-white shadow-cyan-500/40'
                : 'bg-gradient-to-b from-amber-500 via-amber-600 to-orange-700 border-amber-300 text-white shadow-amber-500/30'
            }`}
          >
            {/* Speed streak lines inside button */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
            <div className="relative flex items-center gap-1.5 md:gap-2">
              <Zap className="w-5 h-5 md:w-6 md:h-6 fill-current animate-bounce" />
              <span className="font-racing font-extrabold text-lg md:text-2xl tracking-wider">
                狂擊衝刺！
              </span>
            </div>
            <span className="text-[10px] md:text-xs text-amber-100/90 font-medium">
              連續點擊或按空白鍵加速
            </span>
          </button>

          {/* Right Lane Shift Button */}
          <button
            onClick={() => onLaneChange('right')}
            className="col-span-3 bg-slate-800/90 hover:bg-slate-700/90 active:bg-amber-500/30 border border-slate-700/90 rounded-2xl flex flex-col items-center justify-center text-slate-200 transition-all cursor-pointer active:scale-95 shadow-md select-none touch-manipulation"
            title="往右車道 (→ 或 D)"
          >
            <ArrowRight className="w-6 h-6 md:w-8 md:h-8" />
            <span className="text-[10px] md:text-xs text-slate-400 mt-0.5 font-medium">右道 (D)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
