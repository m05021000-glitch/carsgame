import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MultiplayerRoom, socketClient } from '../utils/socket';
import { PARTS_CATALOG, TRUCKS } from '../utils/storage';
import { PartCategory, PartItem } from '../types/game';
import { TruckSvg } from './TruckSvg';
import { soundManager } from '../utils/audio';
import {
  Clock,
  Check,
  Zap,
  Flame,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Trophy,
  Coffee,
  RotateCcw,
  Compass,
  Disc,
  Lock
} from 'lucide-react';

interface PlayerMobileScreenProps {
  initialRoomCode?: string;
  onExitPlayer: () => void;
}

export const PlayerMobileScreen: React.FC<PlayerMobileScreenProps> = ({
  initialRoomCode = '',
  onExitPlayer
}) => {
  const [roomCode, setRoomCode] = useState<string>(initialRoomCode);
  const [playerName, setPlayerName] = useState<string>('');
  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const [room, setRoom] = useState<MultiplayerRoom | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Mobile Player Customization State (with starting 1,500 💰 funds!)
  const [funds, setFunds] = useState<number>(1500);
  const [selectedTruckId, setSelectedTruckId] = useState<string>('truck_yellow');
  const [unlockedParts, setUnlockedParts] = useState<string[]>([
    'engine_stock',
    'nitro_stock',
    'gear_stock',
    'tire_stock'
  ]);
  const [equippedParts, setEquippedParts] = useState<{
    engine: string;
    nitro: string;
    gear: string;
    tires: string;
  }>({
    engine: 'engine_stock',
    nitro: 'nitro_stock',
    gear: 'gear_stock',
    tires: 'tire_stock'
  });
  const [isReady, setIsReady] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<PartCategory>('ENGINE');

  // Live Race Controls & Physics State
  const [speed, setSpeed] = useState<number>(30);
  const [distance, setDistance] = useState<number>(0);
  const [cps, setCps] = useState<number>(0);
  const [nitroGauge, setNitroGauge] = useState<number>(30);
  const [isNitro, setIsNitro] = useState<boolean>(false);
  const [lane, setLane] = useState<number>(1);
  const [alertness, setAlertness] = useState<number>(50);

  const clickTimestampsRef = useRef<number[]>([]);
  const lastTelemetrySendRef = useRef<number>(0);
  const raceLoopRef = useRef<number | null>(null);

  // Subscribe to room events
  useEffect(() => {
    const unsubscribe = socketClient.subscribe((data) => {
      if (data.type === 'JOINED_SUCCESS') {
        setRoom(data.room);
        setPlayerId(data.playerId);
        setHasJoined(true);
        setErrorMessage('');
      } else if (data.type === 'ROOM_UPDATED' || data.type === 'PLAYER_LOADOUT_CHANGED') {
        setRoom(data.room);
      } else if (data.type === 'TIMER_TICK') {
        setRoom((prev) => (prev ? { ...prev, configTimerRemaining: data.timer } : prev));
      } else if (data.type === 'COUNTDOWN_START') {
        setRoom(data.room);
        soundManager.playTurbo();
      } else if (data.type === 'COUNTDOWN_TICK') {
        setRoom((prev) => (prev ? { ...prev, countdownSeconds: data.countdown } : prev));
        soundManager.playTap(0.7);
      } else if (data.type === 'RACE_START') {
        setRoom(data.room);
        setSpeed(35);
        setDistance(0);
        setCps(0);
        setNitroGauge(30);
        setIsNitro(false);
        soundManager.startMusic(50);
      } else if (data.type === 'PLAYER_FINISHED') {
        setRoom(data.room);
      } else if (data.type === 'ROUND_FINISHED') {
        setRoom(data.room);
        soundManager.stopMusic();
        soundManager.playVictory();
      } else if (data.type === 'NEXT_ROUND_STARTED') {
        setRoom(data.room);
        setIsReady(false);
        setDistance(0);
        setSpeed(0);
      } else if (data.type === 'ERROR') {
        setErrorMessage(data.message);
      }
    });

    return () => unsubscribe();
  }, []);

  // Join Room Action
  const handleJoin = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!roomCode.trim()) {
      setErrorMessage('請輸入 4 位數房間 PIN 碼');
      return;
    }
    const name = playerName.trim() || `快遞員 #${Math.floor(10 + Math.random() * 90)}`;
    socketClient.send('JOIN_ROOM', roomCode.trim(), {
      name,
      truckId: selectedTruckId,
      equippedParts,
      isHost: false
    });
  };

  // Sync loadout changes to server in real time
  const syncLoadout = (newParts: typeof equippedParts, newReady: boolean) => {
    socketClient.send('UPDATE_LOADOUT', room?.code, {
      truckId: selectedTruckId,
      equippedParts: newParts,
      isReady: newReady
    });
  };

  // Buy or Equip Part
  const handleSelectOrBuyPart = (part: PartItem) => {
    const slotKey =
      part.category === 'ENGINE'
        ? 'engine'
        : part.category === 'NITRO'
        ? 'nitro'
        : part.category === 'GEAR'
        ? 'gear'
        : 'tires';

    if (unlockedParts.includes(part.id)) {
      // Equip
      const updated = { ...equippedParts, [slotKey]: part.id };
      setEquippedParts(updated);
      syncLoadout(updated, isReady);
      soundManager.playTap(0.4);
    } else if (funds >= part.price) {
      // Buy & Equip
      setFunds((f) => f - part.price);
      setUnlockedParts((prev) => [...prev, part.id]);
      const updated = { ...equippedParts, [slotKey]: part.id };
      setEquippedParts(updated);
      syncLoadout(updated, isReady);
      soundManager.playParcel();
    }
  };

  const toggleReady = () => {
    const next = !isReady;
    setIsReady(next);
    syncLoadout(equippedParts, next);
    soundManager.playTap(0.8);
  };

  // Calculate Active Part Bonuses
  const currentEngine = PARTS_CATALOG.find((p) => p.id === equippedParts.engine);
  const currentNitro = PARTS_CATALOG.find((p) => p.id === equippedParts.nitro);
  const currentTires = PARTS_CATALOG.find((p) => p.id === equippedParts.tires);

  const engineMultiplier = currentEngine?.bonus.accelMultiplier || 1.0;
  const maxSpeedBonus = currentEngine?.bonus.maxSpeedBonus || 0;
  const nitroDurationExtra = currentNitro?.bonus.nitroDurationBonus || 0;
  const nitroChargeMultiplier = currentNitro?.bonus.nitroChargeRate || 1.0;
  const hasKersCoins = currentTires?.bonus.kersCoins || false;

  const currentTruck = TRUCKS.find((t) => t.id === selectedTruckId) || TRUCKS[0];
  const effectiveMaxSpeed = currentTruck.maxSpeed + maxSpeedBonus;

  // Dash Tap in Multi-player Race
  const handleDashTap = useCallback(() => {
    if (room?.status !== 'RACING') return;

    const now = performance.now();
    clickTimestampsRef.current.push(now);

    clickTimestampsRef.current = clickTimestampsRef.current.filter((t) => now - t <= 1000);
    const curCps = clickTimestampsRef.current.length;
    setCps(curCps);

    // Speed boost per tap
    const tapGain = currentTruck.baseAcceleration * engineMultiplier * (isNitro ? 1.4 : 1.0);
    const topLimit = isNitro ? effectiveMaxSpeed * 1.5 : effectiveMaxSpeed;

    setSpeed((s) => Math.min(topLimit, s + tapGain));

    // Fill nitro
    setNitroGauge((g) => {
      const gain = isNitro ? 0 : (2.5 + curCps * 0.4) * nitroChargeMultiplier;
      return Math.min(100, g + gain);
    });

    setAlertness((a) => Math.min(100, a + 0.5));

    soundManager.playTap(speed / effectiveMaxSpeed);
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {}
    }
  }, [room?.status, currentTruck, engineMultiplier, isNitro, effectiveMaxSpeed, speed, nitroChargeMultiplier]);

  // Lane Change
  const handleLaneChange = (dir: 'left' | 'right') => {
    setLane((cur) => {
      let next = cur;
      if (dir === 'left' && cur > 0) next = cur - 1;
      if (dir === 'right' && cur < 2) next = cur + 1;
      if (next !== cur) {
        soundManager.playLaneShift();
        if ('vibrate' in navigator) navigator.vibrate(18);
      }
      return next;
    });
  };

  // Trigger Nitro
  const triggerNitro = () => {
    if (room?.status !== 'RACING' || isNitro || nitroGauge < 100) return;

    setIsNitro(true);
    setNitroGauge(0);
    soundManager.playTurbo();
    if ('vibrate' in navigator) navigator.vibrate([40, 50, 60]);

    const duration = (currentTruck.nitroDuration + nitroDurationExtra) * 1000;
    setTimeout(() => {
      setIsNitro(false);
    }, duration);
  };

  // Main Race Physics & Server Streaming Loop
  useEffect(() => {
    if (room?.status !== 'RACING') return;

    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Friction
      setSpeed((s) => {
        const dec = isNitro ? 0.2 : currentTruck.friction;
        const newS = Math.max(25, s - dec * dt * 25);
        soundManager.updateMusicTempo(newS);
        return newS;
      });

      // Distance
      setDistance((d) => {
        const speedMs = speed / 3.6;
        return d + speedMs * dt;
      });

      // CPS decay
      clickTimestampsRef.current = clickTimestampsRef.current.filter((t) => now - t <= 1000);
      setCps(clickTimestampsRef.current.length);

      // Stream to server at 12Hz
      if (now - lastTelemetrySendRef.current >= 85) {
        lastTelemetrySendRef.current = now;
        socketClient.send('PLAYER_TELEMETRY', room.code, {
          distance,
          speed,
          cps,
          alertness,
          nitroActive: isNitro,
          finishTime: distance >= room.raceTargetDistance ? Date.now() : null
        });
      }

      raceLoopRef.current = requestAnimationFrame(tick);
    };

    raceLoopRef.current = requestAnimationFrame(tick);
    return () => {
      if (raceLoopRef.current) cancelAnimationFrame(raceLoopRef.current);
    };
  }, [room?.status, room?.code, room?.raceTargetDistance, speed, distance, cps, alertness, isNitro, currentTruck]);

  // Format 5-min timer
  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ========================================================
  // VIEW 1: JOIN SCREEN (If not joined room yet)
  // ========================================================
  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 max-w-md mx-auto relative select-none">
        <div className="flex items-center justify-between py-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <span className="font-racing font-extrabold text-lg text-white">午後神速物流 · 選手端</span>
          </div>
          <button
            onClick={onExitPlayer}
            className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            返回
          </button>
        </div>

        <div className="my-auto py-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl mx-auto mb-3">
              📱
            </div>
            <h1 className="font-racing font-extrabold text-2xl text-white">加入大螢幕多人群戰</h1>
            <p className="text-xs text-slate-400 mt-1">
              輸入大螢幕 PIN 碼，立領 1,500 💰 新人基金自選配車！
            </p>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">大螢幕房間 PIN 碼</label>
              <input
                type="text"
                maxLength={6}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="例如: 8826"
                className="w-full py-3.5 px-4 rounded-xl bg-slate-900 border border-slate-700 text-center font-racing font-bold text-2xl text-amber-400 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">您的賽車暱稱</label>
              <input
                type="text"
                maxLength={10}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="例如: 極速小陳 / 狂飆企劃"
                className="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {errorMessage && (
              <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/60 rounded-xl p-2.5 text-center">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-racing font-extrabold text-lg flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
            >
              <span>進入配車工坊 (拿 1,500 💰)</span>
            </button>
          </form>
        </div>

        <div className="text-center text-xs text-slate-500 py-2">
          配好車輛後等待主持人發動開戰倒數
        </div>
      </div>
    );
  }

  // ========================================================
  // VIEW 2: PHASE 1 CONFIGURING (5-MIN TIME LIMIT CUSTOMIZER)
  // ========================================================
  if (room?.status === 'CONFIGURING') {
    const categoryParts = PARTS_CATALOG.filter((p) => p.category === activeCategory);

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-3.5 max-w-lg mx-auto select-none">
        {/* Top Header */}
        <div className="flex items-center justify-between py-2 border-b border-slate-800">
          <div>
            <div className="text-[10px] text-slate-400 font-medium">選手: {playerName || '快遞員'}</div>
            <div className="font-racing font-bold text-sm text-white flex items-center gap-1.5">
              <span>第 {room.currentRound} 回合配車</span>
              <span className="text-[10px] text-amber-400 font-mono">PIN: {room.code}</span>
            </div>
          </div>

          {/* Synced 5:00 Timer */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-900 border border-amber-500/30 rounded-xl px-2.5 py-1 text-xs text-amber-400 font-mono-num font-bold">
              <span>💰</span>
              <span>{funds}</span>
            </div>

            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-racing font-bold border ${
                room.configTimerRemaining <= 30
                  ? 'bg-rose-950/70 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-slate-900 border-slate-700 text-amber-400'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimer(room.configTimerRemaining)}</span>
            </div>
          </div>
        </div>

        {/* Funds Grant Callout */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 my-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span>🎁</span>
            <span className="text-amber-300 font-semibold">新人基金 1,500 💰 自由選配零件！</span>
          </div>
          <span className="font-mono-num font-bold text-amber-400">{funds} 💰</span>
        </div>

        {/* 4 Category Tabs */}
        <div className="grid grid-cols-4 gap-1.5 mb-2">
          {(['ENGINE', 'NITRO', 'GEAR', 'TIRES'] as PartCategory[]).map((cat) => {
            const isSelected = activeCategory === cat;
            const labels = { ENGINE: '動力', NITRO: '氮氣', GEAR: '裝備', TIRES: '車胎' };

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`py-2 px-1 text-center rounded-xl text-xs font-bold font-racing transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-400'
                }`}
              >
                {labels[cat]}
              </button>
            );
          })}
        </div>

        {/* Parts Selection List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[360px]">
          {categoryParts.map((part) => {
            const isUnlocked = unlockedParts.includes(part.id);
            const isEquipped =
              (part.category === 'ENGINE' && equippedParts.engine === part.id) ||
              (part.category === 'NITRO' && equippedParts.nitro === part.id) ||
              (part.category === 'GEAR' && equippedParts.gear === part.id) ||
              (part.category === 'TIRES' && equippedParts.tires === part.id);

            const canAfford = funds >= part.price;

            return (
              <div
                key={part.id}
                className={`p-3 rounded-2xl border transition-all ${
                  isEquipped
                    ? 'bg-emerald-950/30 border-emerald-500/80 shadow-md shadow-emerald-500/10'
                    : isUnlocked
                    ? 'bg-slate-900/60 border-slate-700'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{part.icon}</span>
                    <div>
                      <div className="font-racing font-bold text-sm text-white">{part.name}</div>
                      <div className="text-[10px] text-amber-400">{part.subtitle}</div>
                    </div>
                  </div>

                  {isEquipped ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/40">
                      ✓ 裝配中
                    </span>
                  ) : isUnlocked ? (
                    <span className="text-[10px] text-slate-400 font-medium">已擁有</span>
                  ) : (
                    <span className="text-xs font-mono-num font-bold text-amber-400">
                      💰 {part.price}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 mt-1">{part.description}</p>

                <div className="mt-2.5">
                  {isEquipped ? (
                    <div className="text-center text-[10px] text-emerald-400 font-bold py-0.5">
                      當前已生效
                    </div>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => handleSelectOrBuyPart(part)}
                      className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold font-racing transition-colors cursor-pointer"
                    >
                      裝配此零件
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelectOrBuyPart(part)}
                      disabled={!canAfford}
                      className={`w-full py-1.5 rounded-xl text-xs font-bold font-racing transition-all ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-md'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      購買並裝配 ({part.price} 💰)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Ready Button */}
        <div className="pt-2">
          <button
            onClick={toggleReady}
            className={`w-full py-3.5 rounded-2xl font-racing font-extrabold text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl ${
              isReady
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-amber-500/25 active:scale-98'
            }`}
          >
            <Check className="w-5 h-5" />
            <span>{isReady ? '✓ 我已準備就緒！(等待開戰)' : '改裝完成 · 鎖定配件出戰！'}</span>
          </button>
        </div>
      </div>
    );
  }

  // ========================================================
  // VIEW 3: PHASE 2 COUNTDOWN (3... 2... 1... GO!)
  // ========================================================
  if (room?.status === 'COUNTDOWN') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="text-xs uppercase tracking-widest text-amber-400 font-bold mb-2">
          ROUND {room.currentRound} · GET READY!
        </div>
        <div className="font-racing font-extrabold text-8xl text-amber-400 drop-shadow-[0_0_30px_rgba(245,158,11,0.5)] animate-bounce">
          {room.countdownSeconds > 0 ? room.countdownSeconds : 'GO!!'}
        </div>
        <div className="text-sm text-slate-300 font-bold font-racing mt-3">
          手指狂點踏板準備起跑！
        </div>
      </div>
    );
  }

  // ========================================================
  // VIEW 4: PHASE 3 RACING (MOBILE DASH PEDAL CONTROLLER)
  // ========================================================
  if (room?.status === 'RACING') {
    const progressPercent = Math.min(100, (distance / (room.raceTargetDistance || 1000)) * 100);
    const distRemaining = Math.max(0, Math.round((room.raceTargetDistance || 1000) - distance));

    return (
      <div
        className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-3.5 max-w-lg mx-auto select-none touch-manipulation cursor-pointer"
        onClick={handleDashTap}
      >
        {/* Top Mini HUD */}
        <div className="flex items-center justify-between py-1">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-400">距離終點: </span>
            <span className="font-mono-num font-bold text-amber-400">{distRemaining}m</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-400">手速: </span>
            <span className="font-mono-num font-bold text-cyan-400">{cps.toFixed(1)} CPS</span>
          </div>
        </div>

        {/* Center Speedometer */}
        <div className="flex flex-col items-center justify-center my-auto pointer-events-none">
          <div className="text-center">
            {isNitro && (
              <div className="text-cyan-300 font-racing font-bold text-xs animate-pulse tracking-wider mb-1">
                ⚡ NITRO OVERDRIVE · 氮氣超頻中！
              </div>
            )}
            <div className="flex items-baseline justify-center gap-1">
              <span
                className={`font-racing font-extrabold text-6xl tracking-tight ${
                  isNitro ? 'text-cyan-300 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]' : 'text-white'
                }`}
              >
                {Math.round(speed)}
              </span>
              <span className="font-racing text-sm text-slate-400 font-bold">KM/H</span>
            </div>
            {/* Progress bar */}
            <div className="w-56 bg-slate-800 rounded-full h-2 mt-2 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-100"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Thumb Zone Controls */}
        <div className="space-y-2 pt-2 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
          {/* Nitro Button */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl p-2">
            <Flame className={`w-4 h-4 ${nitroGauge >= 100 ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
            <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-cyan-400 h-full rounded-full transition-all duration-150"
                style={{ width: `${nitroGauge}%` }}
              />
            </div>
            <button
              onClick={triggerNitro}
              disabled={nitroGauge < 100 || isNitro}
              className={`px-3 py-1 rounded-lg text-xs font-racing font-bold transition-all cursor-pointer ${
                nitroGauge >= 100 && !isNitro
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isNitro ? '衝刺中!!' : nitroGauge >= 100 ? '⚡ 釋放氮氣' : `${Math.round(nitroGauge)}%`}
            </button>
          </div>

          {/* Steering + Main Tap Pedal */}
          <div className="grid grid-cols-12 gap-2 h-24">
            <button
              onClick={() => handleLaneChange('left')}
              className="col-span-3 bg-slate-800 active:bg-amber-500/30 border border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-200 active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-7 h-7" />
              <span className="text-[10px] text-slate-400 mt-0.5">左道</span>
            </button>

            {/* GIANT TAP PEDAL */}
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                handleDashTap();
              }}
              className={`col-span-6 rounded-2xl border-2 font-racing font-extrabold text-2xl flex flex-col items-center justify-center shadow-xl active:scale-[0.96] transition-all cursor-pointer ${
                isNitro
                  ? 'bg-gradient-to-b from-cyan-500 to-blue-600 border-cyan-300 text-white shadow-cyan-500/40'
                  : 'bg-gradient-to-b from-amber-500 to-orange-600 border-amber-300 text-white shadow-amber-500/30'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Zap className="w-6 h-6 fill-current animate-bounce" />
                <span>狂點衝刺！</span>
              </div>
              <span className="text-[10px] text-amber-100 font-normal">快速連擊加速</span>
            </button>

            <button
              onClick={() => handleLaneChange('right')}
              className="col-span-3 bg-slate-800 active:bg-amber-500/30 border border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-200 active:scale-95 transition-all cursor-pointer"
            >
              <ArrowRight className="w-7 h-7" />
              <span className="text-[10px] text-slate-400 mt-0.5">右道</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // VIEW 5: PHASE 4 PODIUM & RESULTS
  // ========================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 max-w-md mx-auto text-center select-none">
      <div className="my-auto">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-4xl mx-auto mb-4 animate-bounce">
          🏆
        </div>
        <div className="text-xs uppercase tracking-widest text-amber-400 font-bold">
          ROUND {room?.currentRound} FINISHED!
        </div>
        <h1 className="font-racing font-extrabold text-3xl text-white mt-1">本回合競速結束！</h1>
        <p className="text-xs text-slate-400 mt-2">
          大螢幕正在進行冠軍頒獎！請查看大螢幕即時戰況與本回合冠軍！
        </p>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 my-6 text-left space-y-2">
          <div className="text-xs font-bold text-amber-400 font-racing">賽後準備提示</div>
          <p className="text-xs text-slate-400 leading-relaxed">
            主持人開啟下一回合後，您將有時間重新配裝更強大的零件，爭奪下一個回合的冠軍！
          </p>
        </div>
      </div>

      <div className="text-xs text-slate-500">等待主持人啟動下一回合爭霸...</div>
    </div>
  );
};
