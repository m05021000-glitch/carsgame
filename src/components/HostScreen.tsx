import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { MultiplayerRoom, RemotePlayer, socketClient } from '../utils/socket';
import { TruckSvg } from './TruckSvg';
import { PARTS_CATALOG } from '../utils/storage';
import { soundManager } from '../utils/audio';
import {
  Trophy,
  Users,
  Clock,
  Play,
  Copy,
  Check,
  Zap,
  RotateCcw,
  Sparkles,
  Bot,
  Flame,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface HostScreenProps {
  onExitHost: () => void;
}

export const HostScreen: React.FC<HostScreenProps> = ({ onExitHost }) => {
  const [room, setRoom] = useState<MultiplayerRoom | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Initialize or create room
  useEffect(() => {
    socketClient.send('CREATE_ROOM');

    const unsubscribe = socketClient.subscribe((data) => {
      if (data.type === 'ROOM_CREATED' || data.type === 'ROOM_UPDATED' || data.type === 'NEXT_ROUND_STARTED') {
        setRoom(data.room);
      } else if (data.type === 'PLAYER_LOADOUT_CHANGED') {
        setRoom(data.room);
        soundManager.playParcel();
      } else if (data.type === 'TIMER_TICK') {
        setRoom((prev) => (prev ? { ...prev, configTimerRemaining: data.timer } : prev));
      } else if (data.type === 'COUNTDOWN_START') {
        setRoom(data.room);
        soundManager.playTurbo();
      } else if (data.type === 'COUNTDOWN_TICK') {
        setRoom((prev) => (prev ? { ...prev, countdownSeconds: data.countdown } : prev));
        soundManager.playTap(0.8);
      } else if (data.type === 'RACE_START') {
        setRoom(data.room);
        soundManager.startMusic(60);
      } else if (data.type === 'TELEMETRY_UPDATE') {
        setRoom((prev) => {
          if (!prev) return prev;
          const p = prev.players[data.playerId];
          if (!p) return prev;
          return {
            ...prev,
            players: {
              ...prev.players,
              [data.playerId]: {
                ...p,
                distance: data.distance,
                speed: data.speed,
                cps: data.cps,
                alertness: data.alertness,
                nitroActive: data.nitroActive
              }
            }
          };
        });
      } else if (data.type === 'PLAYER_FINISHED') {
        setRoom(data.room);
        soundManager.playVictory();
      } else if (data.type === 'ROUND_FINISHED') {
        setRoom(data.room);
        soundManager.stopMusic();
        soundManager.playVictory();
        try {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
        } catch {}
      }
    });

    return () => unsubscribe();
  }, []);

  // Generate QR Code once room code exists
  useEffect(() => {
    if (!room?.code) return;
    const origin = window.location.origin;
    const joinUrl = `${origin}/?room=${room.code}&role=player`;

    QRCode.toDataURL(joinUrl, {
      width: 260,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch(() => {});
  }, [room?.code]);

  const joinUrl = room ? `${window.location.origin}/?room=${room.code}&role=player` : '';

  const copyJoinLink = () => {
    if (!joinUrl) return;
    navigator.clipboard.writeText(joinUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const startRaceEarly = () => {
    socketClient.send('START_RACE_EARLY', room?.code);
  };

  const addBotColleague = () => {
    socketClient.send('ADD_BOT_RACER', room?.code);
  };

  const startNextRound = () => {
    socketClient.send('NEXT_ROUND', room?.code);
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <div className="font-racing text-lg font-bold">正在建立多人大螢幕賽事房間...</div>
      </div>
    );
  }

  const playersList = Object.values(room.players);
  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Sort players for leaderboard during race or podium
  const sortedPlayers = [...playersList].sort((a, b) => {
    if (a.finished && b.finished) {
      return (a.roundRank || 999) - (b.roundRank || 999);
    }
    if (a.finished) return -1;
    if (b.finished) return 1;
    return b.distance - a.distance;
  });

  const roundChampion = sortedPlayers.find((p) => p.roundRank === 1) || sortedPlayers[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between select-none relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(245,158,11,0.12),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* ========================================================
          1. TOP BAR (ROOM PIN, ROUND, EXIT)
         ======================================================== */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-extrabold text-xl">
            🏆
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-racing font-extrabold text-xl text-white tracking-tight">
                午後神速物流 · 辦公室全員爭霸賽
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold font-racing">
                大螢幕主持人端
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              第 <span className="text-amber-400 font-bold">{room.currentRound}</span> 回合 · 爭奪午後最強醒腦冠軍！
            </div>
          </div>
        </div>

        {/* Room PIN & Quick Link */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-1.5 flex items-center gap-3">
            <span className="text-xs text-slate-400">房間 PIN 碼:</span>
            <span className="font-racing font-extrabold text-2xl text-amber-400 tracking-widest">
              {room.code}
            </span>
          </div>

          <button
            onClick={copyJoinLink}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
            <span>{copied ? '已複製選手網址！' : '複製加入連結'}</span>
          </button>

          <button
            onClick={onExitHost}
            className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/80 text-xs font-medium transition-colors cursor-pointer"
          >
            返回主選單
          </button>
        </div>
      </header>

      {/* ========================================================
          2. PHASE 1: CONFIGURING (5-MINUTE TIME LIMIT TO EQUIP PARTS)
         ======================================================== */}
      {room.status === 'CONFIGURING' && (
        <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-8 flex flex-col justify-between relative z-10">
          {/* Top Banner & Countdown Timer */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Clock className="w-8 h-8" />
              </div>
              <div>
                <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                  ROUND {room.currentRound} · 賽前自選配車倒數
                </div>
                <h1 className="text-3xl font-extrabold text-white font-racing mt-0.5">
                  所有選手請掃描 QR Code · 拿 1,500 💰 配零件！
                </h1>
                <div className="text-xs text-slate-400 mt-1">
                  倒數結束或全員就緒後將立即吹響開戰號角，爭奪本回合冠軍！
                </div>
              </div>
            </div>

            {/* Giant Countdown Clock */}
            <div className="flex items-center gap-4">
              <div className="text-center bg-slate-950/80 border border-amber-500/40 rounded-2xl px-6 py-2.5 shadow-lg">
                <div className="text-[10px] text-slate-400 uppercase font-medium">配車剩餘時間</div>
                <div
                  className={`font-racing font-extrabold text-4xl tracking-wider ${
                    room.configTimerRemaining <= 30 ? 'text-rose-400 animate-pulse' : 'text-amber-400'
                  }`}
                >
                  {formatTimer(room.configTimerRemaining)}
                </div>
              </div>

              {/* Host Control Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={startRaceEarly}
                  disabled={playersList.length === 0}
                  className={`px-5 py-2.5 rounded-xl font-racing font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                    playersList.length > 0
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/20 active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>全員就緒 · 立即開戰！</span>
                </button>

                <button
                  onClick={addBotColleague}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Bot className="w-4 h-4 text-cyan-400" />
                  <span>+ 添加辦公室 AI 同事</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Grid: Left QR Code Scanner, Right Joined Racers & Equipped Parts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
            {/* Left QR Code Card (4 Cols) */}
            <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-xl backdrop-blur-md">
              <div className="bg-white p-3 rounded-2xl shadow-xl mb-4">
                {qrCodeDataUrl ? (
                  <img src={qrCodeDataUrl} alt="Join QR Code" className="w-52 h-52 block rounded-lg" />
                ) : (
                  <div className="w-52 h-52 flex items-center justify-center text-slate-400">產生中...</div>
                )}
              </div>
              <div className="font-racing font-bold text-lg text-white">用手機相機掃描 QR Code</div>
              <div className="text-xs text-amber-400 font-medium mt-1">
                領取 1,500 💰 自選「雙渦輪、超頻氮氣、量子磁吸」
              </div>
              <div className="text-[11px] text-slate-500 mt-2 font-mono break-all px-2">
                {joinUrl}
              </div>
            </div>

            {/* Right Joined Racers Grid (8 Cols) */}
            <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <span className="font-racing font-bold text-base text-white">已就緒選手名單</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 text-xs font-mono font-bold">
                    {playersList.length} 人
                  </span>
                </div>
                <div className="text-xs text-slate-400">零件更動將即時同步顯示於大螢幕</div>
              </div>

              {playersList.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-3xl mb-3 animate-pulse">
                    📱
                  </div>
                  <div className="text-sm font-semibold text-slate-300">等待選手加入中...</div>
                  <div className="text-xs text-slate-500 mt-1 max-w-xs">
                    請大家拿起手機掃描左側 QR 碼，或點擊「添加辦公室同事」進行測試！
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
                  {playersList.map((player) => {
                    const enginePart = PARTS_CATALOG.find((p) => p.id === player.equippedParts.engine);
                    const nitroPart = PARTS_CATALOG.find((p) => p.id === player.equippedParts.nitro);
                    const gearPart = PARTS_CATALOG.find((p) => p.id === player.equippedParts.gear);
                    const tiresPart = PARTS_CATALOG.find((p) => p.id === player.equippedParts.tires);

                    return (
                      <div
                        key={player.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          player.isReady
                            ? 'bg-emerald-950/20 border-emerald-500/50'
                            : 'bg-slate-950/60 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{player.avatar}</span>
                            <span className="font-racing font-bold text-sm text-white truncate max-w-[140px]">
                              {player.name}
                            </span>
                          </div>
                          {player.isReady ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>已裝配就緒</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-400 font-medium animate-pulse">
                              挑選改裝中...
                            </span>
                          )}
                        </div>

                        {/* Truck & Equipped Parts Badges */}
                        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                          <div className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 flex items-center gap-1.5 truncate">
                            <span>{enginePart?.icon || '🔧'}</span>
                            <span className="text-slate-300 truncate">{enginePart?.name}</span>
                          </div>
                          <div className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 flex items-center gap-1.5 truncate">
                            <span>{nitroPart?.icon || '💨'}</span>
                            <span className="text-cyan-300 truncate">{nitroPart?.name}</span>
                          </div>
                          <div className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 flex items-center gap-1.5 truncate">
                            <span>{gearPart?.icon || '🧭'}</span>
                            <span className="text-emerald-300 truncate">{gearPart?.name}</span>
                          </div>
                          <div className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 flex items-center gap-1.5 truncate">
                            <span>{tiresPart?.icon || '🛞'}</span>
                            <span className="text-amber-300 truncate">{tiresPart?.name}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* ========================================================
          3. PHASE 2: COUNTDOWN (3... 2... 1... GO!)
         ======================================================== */}
      {room.status === 'COUNTDOWN' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-50 duration-200">
          <div className="text-xs uppercase tracking-widest text-amber-400 font-bold mb-2">
            ROUND {room.currentRound} · READY?
          </div>
          <div className="font-racing font-extrabold text-9xl text-amber-400 drop-shadow-[0_0_40px_rgba(245,158,11,0.6)] animate-bounce">
            {room.countdownSeconds > 0 ? room.countdownSeconds : 'GO!!'}
          </div>
          <div className="text-lg text-slate-300 font-bold font-racing mt-4">
            全體選手手機狂點準備衝刺！！
          </div>
        </div>
      )}

      {/* ========================================================
          4. PHASE 3: RACING (LIVE BIG SCREEN SPECTATOR ARENA)
         ======================================================== */}
      {room.status === 'RACING' && (
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 flex flex-col gap-4 relative z-10">
          {/* Header Status during Race */}
          <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl px-6 py-3 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="animate-spin text-xl">⚡</span>
              <span className="font-racing font-bold text-lg text-white">
                全場 1,000m 狂飆競速實況！
              </span>
            </div>
            <div className="text-xs text-amber-400 font-mono font-bold">
              目標終點: {room.raceTargetDistance} 公尺
            </div>
          </div>

          {/* Panoramic Highway Visual for all racers */}
          <div className="flex-1 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            {/* Road Lanes */}
            <div className="space-y-4 my-auto">
              {sortedPlayers.map((player, idx) => {
                const progress = Math.min(100, (player.distance / room.raceTargetDistance) * 100);

                return (
                  <div key={player.id} className="relative">
                    {/* Player Info Row */}
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-racing font-bold px-2 py-0.5 rounded-md ${
                            idx === 0
                              ? 'bg-amber-500 text-slate-950'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-950'
                              : idx === 2
                              ? 'bg-amber-700 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          #{idx + 1}
                        </span>
                        <span className="font-racing font-bold text-white text-sm">{player.name}</span>
                        {player.nitroActive && (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/40 animate-pulse">
                            ⚡ 氮氣超頻中！
                          </span>
                        )}
                        {player.finished && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/40">
                            🏆 已抵達終點！
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 font-mono-num text-xs">
                        <span className="text-amber-400 font-bold">{Math.round(player.speed)} km/h</span>
                        <span className="text-cyan-400 font-bold">{player.cps.toFixed(1)} CPS</span>
                        <span className="text-slate-400">{Math.round(player.distance)}m / 1000m</span>
                      </div>
                    </div>

                    {/* Track Asphalt Bar */}
                    <div className="relative w-full h-12 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-inner flex items-center px-2">
                      {/* Checkered Finish Line at 100% */}
                      <div className="absolute right-0 top-0 bottom-0 w-8 bg-[repeating-conic-gradient(#fff_0_90deg,#000_0_180deg)] [background-size:8px_8px] opacity-40" />

                      {/* Moving Truck on Track */}
                      <div
                        className="absolute transition-all duration-150 flex items-center gap-2"
                        style={{ left: `calc(${progress}% - 40px)` }}
                      >
                        <div className="w-16 h-10">
                          <TruckSvg
                            truckId={player.truckId}
                            isNitro={player.nitroActive}
                            speed={player.speed}
                            className="w-full h-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      )}

      {/* ========================================================
          5. PHASE 4: ROUND_PODIUM (ROUND CHAMPION CROWNING)
         ======================================================== */}
      {room.status === 'ROUND_PODIUM' && (
        <main className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-8 flex flex-col justify-center relative z-10 animate-in zoom-in-95 duration-300">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-center">
            {/* Top Accent */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400" />

            {/* Crown Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-5xl mb-4 animate-bounce">
              👑
            </div>

            <div className="text-xs uppercase tracking-widest text-amber-400 font-bold">
              ROUND {room.currentRound} CHAMPION
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white font-racing mt-1">
              第 {room.currentRound} 回合冠軍：{roundChampion?.name || '無人稱霸'}！
            </h1>
            <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
              狂飆手速徹底擊碎午後瞌睡！成為全辦公室最清醒的傳奇車手！
            </p>

            {/* Podium Grid (Top 3) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-6 text-left">
              {sortedPlayers.slice(0, 3).map((p, idx) => (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border ${
                    idx === 0
                      ? 'bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                    <span className="font-racing font-bold text-amber-400">+{p.roundScore} 分</span>
                  </div>
                  <div className="font-racing font-bold text-base text-white">{p.name}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    總積分: <span className="text-amber-400 font-bold">{p.totalScore}</span> 分 · 獲勝 {p.roundsWon} 回合
                  </div>
                </div>
              ))}
            </div>

            {/* Next Round Controller Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={startNextRound}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-racing font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 active:scale-98 transition-all cursor-pointer"
              >
                <span>進入第 {room.currentRound + 1} 回合爭霸 (選手可重新配裝)</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={onExitHost}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>結束全場賽事</span>
              </button>
            </div>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 py-3 px-6 text-center text-xs text-slate-500 relative z-10">
        午後神速物流 · 大螢幕多回合競速爭霸系統 · 每回合獨立加冕冠軍
      </footer>
    </div>
  );
};
