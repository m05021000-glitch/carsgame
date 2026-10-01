import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameState,
  GameModeId,
  RoadEntity,
  FloatingText,
  GameStats,
  UserSaveData,
  PartItem
} from './types/game';
import {
  GAME_MODES,
  TRUCKS,
  PARTS_CATALOG,
  loadSaveData,
  saveGameData
} from './utils/storage';
import { soundManager } from './utils/audio';
import { TitleScreen } from './components/TitleScreen';
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { VictoryModal } from './components/VictoryModal';
import { GarageModal } from './components/GarageModal';
import { SettingsModal } from './components/SettingsModal';
import { HostScreen } from './components/HostScreen';
import { PlayerMobileScreen } from './components/PlayerMobileScreen';
import { Play, RotateCcw, Home } from 'lucide-react';

export default function App() {
  const [saveData, setSaveData] = useState<UserSaveData>(loadSaveData);
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [selectedMode, setSelectedMode] = useState<GameModeId>('SPRINT');

  // Check URL query parameters for Host or Player role
  const getInitialViewMode = (): 'SOLO' | 'HOST' | 'PLAYER' => {
    if (typeof window === 'undefined') return 'SOLO';
    const params = new URLSearchParams(window.location.search);
    const role = params.get('role');
    const room = params.get('room');
    if (role === 'host') return 'HOST';
    if (role === 'player' || room) return 'PLAYER';
    return 'SOLO';
  };

  const getInitialRoomCode = (): string => {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams(window.location.search);
    return params.get('room') || '';
  };

  const [viewMode, setViewMode] = useState<'SOLO' | 'HOST' | 'PLAYER'>(getInitialViewMode);
  const [initialRoomCode] = useState<string>(getInitialRoomCode);

  // Modals
  const [showGarage, setShowGarage] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Active Vehicle & Upgrades
  const currentTruck = TRUCKS.find((t) => t.id === saveData.selectedTruckId) || TRUCKS[0];

  // In-Game Dynamic States
  const [speed, setSpeed] = useState<number>(30); // km/h
  const [cps, setCps] = useState<number>(0);
  const [nitroGauge, setNitroGauge] = useState<number>(20); // 0 - 100
  const [isNitro, setIsNitro] = useState<boolean>(false);
  const [hasShield, setHasShield] = useState<boolean>(false);
  const [lane, setLane] = useState<number>(1); // 0: Left, 1: Middle, 2: Right
  const [distanceTraveled, setDistanceTraveled] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(35);
  const [screenShake, setScreenShake] = useState<number>(0);
  const [alertness, setAlertness] = useState<number>(30);

  // Collected metrics during this run
  const [tipsEarned, setTipsEarned] = useState<number>(0);
  const [coffeesCollected, setCoffeesCollected] = useState<number>(0);
  const [parcelsDelivered, setParcelsDelivered] = useState<number>(0);
  const [totalClicks, setTotalClicks] = useState<number>(0);
  const [maxSpeedAchieved, setMaxSpeedAchieved] = useState<number>(30);
  const [maxCpsAchieved, setMaxCpsAchieved] = useState<number>(0);

  // Entities & Floating Texts
  const [roadEntities, setRoadEntities] = useState<RoadEntity[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  // Victory / GameOver stats for modal
  const [finalStats, setFinalStats] = useState<GameStats | null>(null);

  // Refs for animation loop & input tracking
  const clickTimestampsRef = useRef<number[]>([]);
  const nitroTimerRef = useRef<number | null>(null);
  const nextEntityDistanceRef = useRef<number>(25);
  const startTimeRef = useRef<number>(0);
  const loopRef = useRef<number | null>(null);

  // Sync sounds setting
  useEffect(() => {
    soundManager.setMuted(!saveData.soundEnabled);
    soundManager.setVolumes(saveData.sfxVolume, saveData.musicVolume);
  }, [saveData.soundEnabled, saveData.sfxVolume, saveData.musicVolume]);

  const updateSave = (patch: Partial<UserSaveData>) => {
    setSaveData((prev) => {
      const updated = { ...prev, ...patch };
      saveGameData(updated);
      return updated;
    });
  };

  // Trigger Haptic feedback if supported & enabled
  const triggerHaptic = (pattern: number | number[]) => {
    if (saveData.hapticsEnabled && typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {}
    }
  };

  // Add floating banner text
  const addFloatingText = (text: string, color: string = '#FEF08A') => {
    const newText: FloatingText = {
      id: Date.now() + Math.random(),
      text,
      color,
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 80,
      y: window.innerHeight * 0.55 + (Math.random() - 0.5) * 40,
      opacity: 1,
      scale: 1
    };
    setFloatingTexts((prev) => [...prev.slice(-6), newText]);
  };

  // Calculate active equipped parts bonuses
  const equippedEngine = PARTS_CATALOG.find((p) => p.id === saveData.equippedParts.engine);
  const equippedNitro = PARTS_CATALOG.find((p) => p.id === saveData.equippedParts.nitro);
  const equippedGear = PARTS_CATALOG.find((p) => p.id === saveData.equippedParts.gear);
  const equippedTires = PARTS_CATALOG.find((p) => p.id === saveData.equippedParts.tires);

  const engineMultiplier = equippedEngine?.bonus.accelMultiplier || 1.0;
  const maxSpeedExtra = equippedEngine?.bonus.maxSpeedBonus || 0;
  const frictionDampening =
    (1 - (equippedEngine?.bonus.frictionReduction || 0)) *
    (1 - (equippedTires?.bonus.frictionReduction || 0));

  const nitroDurationExtra = equippedNitro?.bonus.nitroDurationBonus || 0;
  const nitroMultiplierBonus = equippedNitro?.bonus.nitroMultiplierBonus || 0;
  const nitroChargeMultiplier = equippedNitro?.bonus.nitroChargeRate || 1.0;

  const magnetRadiusSetting = equippedGear?.bonus.magnetRadius || 0;
  const tipMultiplier = equippedGear?.bonus.tipMultiplier || 1.0;
  const hasSlumpShield = equippedGear?.bonus.shieldDrowsy || false;
  const hasKersCoins = equippedTires?.bonus.kersCoins || false;

  const effectiveMaxSpeed = currentTruck.maxSpeed + maxSpeedExtra;

  // ========================================================
  // START GAME INITIALIZER (Solo Mode)
  // ========================================================
  const startGame = () => {
    const modeConfig = GAME_MODES.find((m) => m.id === selectedMode) || GAME_MODES[0];

    setSpeed(35);
    setCps(0);
    setNitroGauge(25);
    setIsNitro(false);
    setHasShield(hasSlumpShield);
    setLane(1);
    setDistanceTraveled(0);
    setTimeRemaining(modeConfig.timeLimit);
    setScreenShake(0);
    setAlertness(30);

    setTipsEarned(0);
    setCoffeesCollected(0);
    setParcelsDelivered(0);
    setTotalClicks(0);
    setMaxSpeedAchieved(35);
    setMaxCpsAchieved(0);

    setRoadEntities([]);
    setFloatingTexts([]);
    nextEntityDistanceRef.current = 30;
    clickTimestampsRef.current = [];
    startTimeRef.current = performance.now();

    setGameState('PLAYING');
    soundManager.startMusic(35);
    addFloatingText('🚀 點擊加速！GO!!', '#34D399');
  };

  // ========================================================
  // DASH TAP MECHANIC (Primary User Action)
  // ========================================================
  const handleDashTap = useCallback(() => {
    if (gameState !== 'PLAYING') return;

    const now = performance.now();
    clickTimestampsRef.current.push(now);
    setTotalClicks((c) => c + 1);

    if (hasKersCoins) {
      setTipsEarned((t) => t + 1);
    }

    clickTimestampsRef.current = clickTimestampsRef.current.filter((t) => now - t <= 1000);
    const currentCps = clickTimestampsRef.current.length;
    setCps(currentCps);
    setMaxCpsAchieved((prev) => Math.max(prev, currentCps));

    const tapGain = currentTruck.baseAcceleration * engineMultiplier * (isNitro ? 1.4 : 1.0);
    const currentMaxSpeed = isNitro
      ? effectiveMaxSpeed * (currentTruck.nitroMultiplier + nitroMultiplierBonus)
      : effectiveMaxSpeed;

    setSpeed((s) => {
      const newSpeed = Math.min(currentMaxSpeed, s + tapGain);
      setMaxSpeedAchieved((m) => Math.max(m, newSpeed));
      return newSpeed;
    });

    setNitroGauge((g) => {
      const baseGain = 2.5 + currentCps * 0.4;
      const gain = isNitro ? 0 : baseGain * nitroChargeMultiplier;
      return Math.min(100, g + gain);
    });

    setAlertness((a) => Math.min(100, a + 0.35));

    const speedRatio = Math.min(1, speed / effectiveMaxSpeed);
    soundManager.playTap(speedRatio);
    triggerHaptic(12);

    if (currentCps > 6) {
      setScreenShake(0.3);
    }
  }, [
    gameState,
    currentTruck,
    engineMultiplier,
    effectiveMaxSpeed,
    isNitro,
    speed,
    nitroMultiplierBonus,
    nitroChargeMultiplier,
    hasKersCoins
  ]);

  // Steering
  const handleLaneChange = useCallback(
    (direction: 'left' | 'right') => {
      if (gameState !== 'PLAYING') return;

      setLane((cur) => {
        let next = cur;
        if (direction === 'left' && cur > 0) next = cur - 1;
        if (direction === 'right' && cur < 2) next = cur + 1;
        if (next !== cur) {
          soundManager.playLaneShift();
          triggerHaptic(18);
        }
        return next;
      });
    },
    [gameState]
  );

  // Nitro Trigger
  const triggerNitro = useCallback(() => {
    if (gameState !== 'PLAYING' || isNitro || nitroGauge < 100) return;

    setIsNitro(true);
    setNitroGauge(0);
    setHasShield(true);
    setScreenShake(0.8);
    soundManager.playTurbo();
    triggerHaptic([30, 40, 60]);
    addFloatingText('⚡ 氮氣超頻啟動!! 200KM/H!!', '#38BDF8');

    const duration = (currentTruck.nitroDuration + nitroDurationExtra) * 1000;
    if (nitroTimerRef.current) clearTimeout(nitroTimerRef.current);
    nitroTimerRef.current = window.setTimeout(() => {
      setIsNitro(false);
      setHasShield(hasSlumpShield);
    }, duration);
  }, [gameState, isNitro, nitroGauge, currentTruck, nitroDurationExtra, hasSlumpShield]);

  // Keyboard shortcut listener (only active in SOLO mode)
  useEffect(() => {
    if (viewMode !== 'SOLO') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Enter') {
        e.preventDefault();
        handleDashTap();
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        handleLaneChange('left');
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        handleLaneChange('right');
      } else if (e.code === 'KeyN') {
        e.preventDefault();
        triggerNitro();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        if (gameState === 'PLAYING') setGameState('PAUSED');
        else if (gameState === 'PAUSED') setGameState('PLAYING');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDashTap, handleLaneChange, triggerNitro, gameState, viewMode]);

  // Main Game Tick Loop (Solo Mode)
  useEffect(() => {
    if (viewMode !== 'SOLO' || gameState !== 'PLAYING') {
      soundManager.stopMusic();
      return;
    }

    const modeConfig = GAME_MODES.find((m) => m.id === selectedMode) || GAME_MODES[0];
    let lastFrameTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastFrameTime) / 1000, 0.1);
      lastFrameTime = now;

      // Friction
      setSpeed((curSpeed) => {
        const frictionRate = isNitro ? 0.2 : currentTruck.friction * frictionDampening;
        const newSpeed = Math.max(25, curSpeed - frictionRate * dt * 25);
        soundManager.updateMusicTempo(newSpeed);
        return newSpeed;
      });

      // Distance
      setDistanceTraveled((curDist) => {
        const speedMs = speed / 3.6;
        const nextDist = curDist + speedMs * dt;

        if (modeConfig.targetDistance > 0 && nextDist >= modeConfig.targetDistance) {
          handleVictory(nextDist);
        }
        return nextDist;
      });

      // Time countdown
      if (modeConfig.timeLimit > 0) {
        setTimeRemaining((t) => {
          const nextTime = Math.max(0, t - dt);
          if (nextTime <= 0) {
            handleGameOver();
          }
          return nextTime;
        });
      }

      // CPS decay
      clickTimestampsRef.current = clickTimestampsRef.current.filter((t) => now - t <= 1000);
      setCps(clickTimestampsRef.current.length);

      // Shake decay
      setScreenShake((s) => Math.max(0, s - dt * 2));

      // Floating text decay
      setFloatingTexts((texts) =>
        texts
          .map((ft) => ({
            ...ft,
            y: ft.y - 45 * dt,
            opacity: ft.opacity - dt * 1.4
          }))
          .filter((ft) => ft.opacity > 0)
      );

      // Road entities spawn
      setRoadEntities((entities) => {
        let updated = [...entities];
        const playerDist = distanceTraveled;

        updated = updated.filter((e) => e.y > playerDist - 15);

        if (playerDist + 140 > nextEntityDistanceRef.current) {
          const spawnDist = nextEntityDistanceRef.current;
          const randomLane = Math.floor(Math.random() * 3);
          const roll = Math.random();

          let type: RoadEntity['type'] = 'COFFEE';
          if (roll < 0.38) {
            type = 'COFFEE';
          } else if (roll < 0.52) {
            type = 'ENERGY_DRINK';
          } else if (roll < 0.72) {
            type = 'PARCEL';
          } else if (roll < 0.84) {
            type = 'BOOST_PAD';
          } else {
            type = 'SLUMP_CLOUD';
          }

          updated.push({
            id: Date.now() + Math.random(),
            type,
            lane: randomLane,
            y: spawnDist,
            xOffset: (Math.random() - 0.5) * 12
          });

          nextEntityDistanceRef.current = spawnDist + 18 + Math.random() * 22;
        }

        // Collision detection
        for (const ent of updated) {
          if (ent.collected) continue;
          const distDiff = ent.y - playerDist;

          const inSameLane = ent.lane === lane;
          const isAttractable = ent.type === 'COFFEE' || ent.type === 'PARCEL';
          const inMagnet =
            isAttractable &&
            (magnetRadiusSetting >= 2 || (magnetRadiusSetting >= 1 && Math.abs(ent.lane - lane) <= 1));

          if (distDiff >= -2 && distDiff <= 4 && (inSameLane || inMagnet)) {
            ent.collected = true;
            handleItemCollect(ent.type);
          }
        }

        return updated;
      });

      loopRef.current = requestAnimationFrame(tick);
    };

    loopRef.current = requestAnimationFrame(tick);
    return () => {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
    };
  }, [
    gameState,
    viewMode,
    selectedMode,
    distanceTraveled,
    speed,
    lane,
    isNitro,
    currentTruck,
    frictionDampening,
    magnetRadiusSetting
  ]);

  // Item Collect Handler
  const handleItemCollect = (type: RoadEntity['type']) => {
    if (type === 'COFFEE') {
      soundManager.playCoffee();
      triggerHaptic(25);
      setCoffeesCollected((c) => c + 1);
      const earned = Math.round(35 * tipMultiplier);
      setTipsEarned((t) => t + earned);
      setSpeed((s) => Math.min(effectiveMaxSpeed, s + 18));
      setNitroGauge((g) => Math.min(100, g + 25 * nitroChargeMultiplier));
      setAlertness((a) => Math.min(100, a + 10));
      addFloatingText(`☕ 雙倍濃縮咖啡! +${earned} 💰!`, '#FBBF24');
    } else if (type === 'ENERGY_DRINK') {
      soundManager.playEnergyDrink();
      triggerHaptic([30, 30, 30]);
      const earned = Math.round(50 * tipMultiplier);
      setTipsEarned((t) => t + earned);
      setNitroGauge(100);
      setAlertness((a) => Math.min(100, a + 15));
      addFloatingText('⚡ 能量滿溢! 氮氣槽 100%!', '#34D399');
    } else if (type === 'PARCEL') {
      soundManager.playParcel();
      triggerHaptic(20);
      setParcelsDelivered((p) => p + 1);
      const earned = Math.round(75 * tipMultiplier);
      setTipsEarned((t) => t + earned);
      addFloatingText(`📦 加急快件送達! +${earned} 小費!`, '#F59E0B');
    } else if (type === 'BOOST_PAD') {
      soundManager.playSpeedPad();
      triggerHaptic([20, 40]);
      setSpeed((s) => Math.min(effectiveMaxSpeed * 1.25, s + 35));
      setScreenShake(0.5);
      addFloatingText('🟡 地面加速帶! WARP SPEED!', '#FDE047');
    } else if (type === 'SLUMP_CLOUD') {
      if (isNitro || hasShield || hasSlumpShield) {
        soundManager.playParcel();
        triggerHaptic(40);
        const earned = Math.round(40 * tipMultiplier);
        setTipsEarned((t) => t + earned);
        addFloatingText('💥 裝甲震碎瞌睡蟲!! COMBO!', '#38BDF8');
      } else {
        soundManager.playObstacle();
        triggerHaptic([40, 60, 40]);
        setScreenShake(0.6);
        setSpeed((s) => Math.max(25, s - 30));
        setAlertness((a) => Math.max(10, a - 8));
        addFloatingText('🥱 哈欠瞌睡蟲阻礙! 減速!', '#F87171');
      }
    }
  };

  // Solo Victory
  const handleVictory = (finalDist: number) => {
    soundManager.stopMusic();
    soundManager.playVictory();
    triggerHaptic([50, 50, 100, 100]);

    const elapsedSeconds = Math.max(1, (performance.now() - startTimeRef.current) / 1000);
    const avgCps = totalClicks / elapsedSeconds;
    const calculatedAlertness = Math.min(100, Math.round(50 + maxCpsAchieved * 4 + coffeesCollected * 5));

    let alertnessTitle = '🌟 精神飽滿 · 效率破表！';
    let wakeUpFeedback = '大腦皮質多巴胺完全就緒！午後的程式碼與專案報告立刻手到擒來！';

    if (calculatedAlertness >= 90) {
      alertnessTitle = '🔥 靈魂超頻 · 量子光速打工人！';
      wakeUpFeedback = '你以驚人的手速徹底擊碎了午後瞌睡蟲，精神狀態宛如剛喝了十杯義式濃縮！';
    } else if (calculatedAlertness < 70) {
      alertnessTitle = '☕ 漸入佳境 · 瞌睡漸退！';
      wakeUpFeedback = '身體已經重新熱機完成，建議多喝一口冰水，準備開啟下午的好心情！';
    }

    const bonusTips = Math.round(150 * tipMultiplier);
    const stats: GameStats = {
      mode: selectedMode,
      completionTime: elapsedSeconds,
      totalClicks,
      maxCPS: maxCpsAchieved,
      averageCPS: avgCps,
      maxSpeed: maxSpeedAchieved,
      distanceCovered: finalDist,
      coffeesCollected,
      parcelsDelivered,
      obstaclesDodgedOrSmashed: 0,
      tipsEarned: tipsEarned + bonusTips,
      alertnessScore: calculatedAlertness,
      alertnessTitle,
      wakeUpFeedback
    };

    setFinalStats(stats);
    setGameState('VICTORY');

    updateSave({
      tips: saveData.tips + stats.tipsEarned,
      highScores: {
        ...saveData.highScores,
        highestCPS: Math.max(saveData.highScores.highestCPS || 0, maxCpsAchieved),
        highestSpeed: Math.max(saveData.highScores.highestSpeed || 0, maxSpeedAchieved)
      }
    });
  };

  // Solo GameOver
  const handleGameOver = () => {
    soundManager.stopMusic();
    soundManager.playObstacle();

    const elapsedSeconds = Math.max(1, (performance.now() - startTimeRef.current) / 1000);
    const stats: GameStats = {
      mode: selectedMode,
      completionTime: elapsedSeconds,
      totalClicks,
      maxCPS: maxCpsAchieved,
      averageCPS: totalClicks / elapsedSeconds,
      maxSpeed: maxSpeedAchieved,
      distanceCovered: distanceTraveled,
      coffeesCollected,
      parcelsDelivered,
      obstaclesDodgedOrSmashed: 0,
      tipsEarned,
      alertnessScore: 65,
      alertnessTitle: '⏰ 午休時間到！差一點點！',
      wakeUpFeedback: '雖然沒有在最後一秒前抵達終點，但手指與大腦已經徹底甦醒了！再來一局肯定能過關！'
    };

    setFinalStats(stats);
    setGameState('GAMEOVER');
    updateSave({ tips: saveData.tips + tipsEarned });
  };

  // Garage Actions
  const handleSelectTruck = (truckId: string) => {
    updateSave({ selectedTruckId: truckId });
  };

  const handleBuyTruck = (truckId: string, price: number) => {
    if (saveData.tips >= price) {
      updateSave({
        tips: saveData.tips - price,
        unlockedTrucks: [...saveData.unlockedTrucks, truckId],
        selectedTruckId: truckId
      });
      soundManager.playParcel();
    }
  };

  const handleBuyAndEquipPart = (part: PartItem) => {
    if (saveData.tips >= part.price && !saveData.unlockedParts.includes(part.id)) {
      const slotKey =
        part.category === 'ENGINE'
          ? 'engine'
          : part.category === 'NITRO'
          ? 'nitro'
          : part.category === 'GEAR'
          ? 'gear'
          : 'tires';

      updateSave({
        tips: saveData.tips - part.price,
        unlockedParts: [...saveData.unlockedParts, part.id],
        equippedParts: {
          ...saveData.equippedParts,
          [slotKey]: part.id
        }
      });
      soundManager.playParcel();
      addFloatingText(`✨ 裝配成功: ${part.name}!`, '#38BDF8');
    }
  };

  const handleEquipPart = (part: PartItem) => {
    const slotKey =
      part.category === 'ENGINE'
        ? 'engine'
        : part.category === 'NITRO'
        ? 'nitro'
        : part.category === 'GEAR'
        ? 'gear'
        : 'tires';

    updateSave({
      equippedParts: {
        ...saveData.equippedParts,
        [slotKey]: part.id
      }
    });
    soundManager.playTap(0.5);
    addFloatingText(`✓ 已裝配: ${part.name}`, '#34D399');
  };

  const modeConfig = GAME_MODES.find((m) => m.id === selectedMode) || GAME_MODES[0];

  // ========================================================
  // ROUTE 1: HOST / BIG SCREEN VIEW
  // ========================================================
  if (viewMode === 'HOST') {
    return <HostScreen onExitHost={() => setViewMode('SOLO')} />;
  }

  // ========================================================
  // ROUTE 2: PLAYER MOBILE SCREEN VIEW
  // ========================================================
  if (viewMode === 'PLAYER') {
    return (
      <PlayerMobileScreen
        initialRoomCode={initialRoomCode}
        onExitPlayer={() => setViewMode('SOLO')}
      />
    );
  }

  // ========================================================
  // ROUTE 3: SOLO / PRACTICE TITLE & GAME VIEW
  // ========================================================
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* 1. TITLE SCREEN */}
      {gameState === 'TITLE' && (
        <TitleScreen
          selectedMode={selectedMode}
          selectedTruck={currentTruck}
          saveData={saveData}
          onSelectMode={setSelectedMode}
          onStartGame={startGame}
          onOpenGarage={() => setShowGarage(true)}
          onOpenHost={() => setViewMode('HOST')}
          onOpenPlayer={() => setViewMode('PLAYER')}
          onToggleSound={() => updateSave({ soundEnabled: !saveData.soundEnabled })}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {/* 2. PLAYING / PAUSED VIEW */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
        <div
          className="relative w-full h-full cursor-pointer select-none"
          onClick={handleDashTap}
        >
          {/* Main 2D World Canvas */}
          <GameCanvas
            truck={currentTruck}
            speed={speed}
            isNitro={isNitro}
            hasShield={hasShield || hasSlumpShield}
            lane={lane}
            roadEntities={roadEntities}
            floatingTexts={floatingTexts}
            distanceTraveled={distanceTraveled}
            targetDistance={modeConfig.targetDistance}
            magnetActive={magnetRadiusSetting >= 1}
            screenShake={screenShake}
          />

          {/* HUD Overlay with Tapping Pedal & Steering */}
          <GameHUD
            truck={currentTruck}
            speed={speed}
            maxSpeed={effectiveMaxSpeed * (isNitro ? currentTruck.nitroMultiplier + nitroMultiplierBonus : 1.0)}
            cps={cps}
            nitroGauge={nitroGauge}
            isNitro={isNitro}
            distanceTraveled={distanceTraveled}
            targetDistance={modeConfig.targetDistance}
            timeRemaining={timeRemaining}
            alertness={alertness}
            tipsEarned={tipsEarned}
            coffeesCollected={coffeesCollected}
            onDashTap={(e) => {
              e?.stopPropagation();
              handleDashTap();
            }}
            onLaneChange={(dir) => handleLaneChange(dir)}
            onTriggerNitro={triggerNitro}
            onPause={() => setGameState('PAUSED')}
          />

          {/* PAUSED MODAL */}
          {gameState === 'PAUSED' && (
            <div
              className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl">
                <div className="text-3xl mb-2">☕</div>
                <h3 className="text-2xl font-bold text-white font-racing">遊戲已暫停</h3>
                <p className="text-xs text-slate-400 mt-1 mb-6">稍微深呼吸，準備好繼續提神狂飆了嗎？</p>

                <div className="space-y-3">
                  <button
                    onClick={() => setGameState('PLAYING')}
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-racing font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md shadow-amber-500/20"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>繼續配送</span>
                  </button>

                  <button
                    onClick={startGame}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>重開本局</span>
                  </button>

                  <button
                    onClick={() => setGameState('TITLE')}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Home className="w-4 h-4" />
                    <span>返回首頁</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. VICTORY / GAMEOVER REPORT MODAL */}
      {(gameState === 'VICTORY' || gameState === 'GAMEOVER') && finalStats && (
        <VictoryModal
          stats={finalStats}
          isVictory={gameState === 'VICTORY'}
          onPlayAgain={startGame}
          onBackToTitle={() => setGameState('TITLE')}
          onOpenGarage={() => {
            setGameState('TITLE');
            setShowGarage(true);
          }}
        />
      )}

      {/* 4. CUSTOM PARTS & TRUCK GARAGE MODAL */}
      {showGarage && (
        <GarageModal
          saveData={saveData}
          onSelectTruck={handleSelectTruck}
          onBuyTruck={handleBuyTruck}
          onBuyAndEquipPart={handleBuyAndEquipPart}
          onEquipPart={handleEquipPart}
          onClose={() => setShowGarage(false)}
        />
      )}

      {/* 5. SETTINGS MODAL */}
      {showSettings && (
        <SettingsModal
          saveData={saveData}
          onUpdateSaveData={updateSave}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
