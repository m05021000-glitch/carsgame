import React, { useState } from 'react';
import { TruckConfig, UserSaveData, PartCategory, PartItem } from '../types/game';
import { TRUCKS, PARTS_CATALOG } from '../utils/storage';
import { TruckSvg } from './TruckSvg';
import { X, Wrench, Check, Lock, Sparkles, Shield, Magnet, Zap, Flame, Compass, Disc } from 'lucide-react';

interface GarageModalProps {
  saveData: UserSaveData;
  onSelectTruck: (truckId: string) => void;
  onBuyTruck: (truckId: string, price: number) => void;
  onBuyAndEquipPart: (part: PartItem) => void;
  onEquipPart: (part: PartItem) => void;
  onClose: () => void;
}

export const GarageModal: React.FC<GarageModalProps> = ({
  saveData,
  onSelectTruck,
  onBuyTruck,
  onBuyAndEquipPart,
  onEquipPart,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'PARTS' | 'TRUCKS'>('PARTS');
  const [selectedCategory, setSelectedCategory] = useState<PartCategory>('ENGINE');
  const [previewTruckId, setPreviewTruckId] = useState<string>(saveData.selectedTruckId);

  const previewTruck = TRUCKS.find((t) => t.id === previewTruckId) || TRUCKS[0];
  const isTruckUnlocked = saveData.unlockedTrucks.includes(previewTruck.id);
  const isTruckSelected = saveData.selectedTruckId === previewTruck.id;

  const equipped = saveData.equippedParts;

  // Filter parts by category
  const categoryParts = PARTS_CATALOG.filter((p) => p.category === selectedCategory);

  const getCategoryIcon = (cat: PartCategory) => {
    switch (cat) {
      case 'ENGINE':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'NITRO':
        return <Flame className="w-4 h-4 text-cyan-400" />;
      case 'GEAR':
        return <Compass className="w-4 h-4 text-emerald-400" />;
      case 'TIRES':
        return <Disc className="w-4 h-4 text-rose-400" />;
    }
  };

  const getCategoryName = (cat: PartCategory) => {
    switch (cat) {
      case 'ENGINE':
        return '動力核心';
      case 'NITRO':
        return '氮氣系統';
      case 'GEAR':
        return '智慧配備';
      case 'TIRES':
        return '底盤車胎';
    }
  };

  const getEquippedPartForCategory = (cat: PartCategory): PartItem | undefined => {
    let partId = '';
    if (cat === 'ENGINE') partId = equipped.engine;
    else if (cat === 'NITRO') partId = equipped.nitro;
    else if (cat === 'GEAR') partId = equipped.gear;
    else if (cat === 'TIRES') partId = equipped.tires;
    return PARTS_CATALOG.find((p) => p.id === partId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 md:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-3xl w-full p-5 md:p-7 shadow-2xl relative my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white font-racing">自由零件改裝工坊</h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                  新人自由配裝
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">所有零件隨心自由搭配 · 打造專屬午後神速物流車</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-400 font-mono-num font-bold shadow-inner">
              <span>💰</span>
              <span>{saveData.tips}</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Newbie Grant Banner */}
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 rounded-2xl p-3 mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🎁</span>
            <div className="text-xs">
              <span className="font-bold text-amber-300">新人開工津貼 1,500 💰 專款已入帳！</span>
              <span className="text-slate-400 block md:inline md:ml-1.5">
                可自由選購雙渦輪、超頻氮氣、全車道咖啡磁鐵或發電輪！
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs font-mono-num font-extrabold text-amber-400 bg-amber-500/20 border border-amber-500/40 rounded-lg px-2.5 py-1">
              現有餘額: {saveData.tips} 💰
            </span>
          </div>
        </div>

        {/* Primary Tabs: Custom Parts vs Truck Chassis */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl mb-4 border border-slate-800">
          <button
            onClick={() => setActiveTab('PARTS')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'PARTS' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>自選配件槽 (4 大零件系統)</span>
          </button>
          <button
            onClick={() => setActiveTab('TRUCKS')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'TRUCKS' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>車型展示間 (4 款物流座駕)</span>
          </button>
        </div>

        {activeTab === 'PARTS' ? (
          <div>
            {/* Current Loadout Slots Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {(['ENGINE', 'NITRO', 'GEAR', 'TIRES'] as PartCategory[]).map((cat) => {
                const current = getEquippedPartForCategory(cat);
                const isCatActive = selectedCategory === cat;

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                      isCatActive
                        ? 'border-amber-500 bg-amber-500/10 shadow-md shadow-amber-500/10'
                        : 'border-slate-800 bg-slate-950/40 hover:bg-slate-950'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-400 font-semibold">{getCategoryName(cat)}</span>
                      {getCategoryIcon(cat)}
                    </div>
                    <div className="font-bold text-xs text-white truncate font-racing">
                      {current ? current.name : '未裝備'}
                    </div>
                    <div className="text-[10px] text-amber-400/90 truncate mt-0.5">
                      {current?.subtitle || '原廠'}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Category Parts List */}
            <div className="border border-slate-800/80 rounded-2xl bg-slate-950/50 p-3 mb-2">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  {getCategoryIcon(selectedCategory)}
                  <span>可配置配件：{getCategoryName(selectedCategory)}</span>
                </div>
                <div className="text-[11px] text-slate-500">點擊即可自由配裝或購買</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {categoryParts.map((part) => {
                  const isUnlocked = saveData.unlockedParts.includes(part.id);
                  const isCurrentEquipped =
                    (part.category === 'ENGINE' && equipped.engine === part.id) ||
                    (part.category === 'NITRO' && equipped.nitro === part.id) ||
                    (part.category === 'GEAR' && equipped.gear === part.id) ||
                    (part.category === 'TIRES' && equipped.tires === part.id);

                  const canAfford = saveData.tips >= part.price;

                  return (
                    <div
                      key={part.id}
                      className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                        isCurrentEquipped
                          ? 'border-emerald-500/80 bg-emerald-950/20'
                          : isUnlocked
                          ? 'border-slate-700 bg-slate-900/60'
                          : 'border-slate-800/70 bg-slate-950/70'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-base">{part.icon}</span>
                          {isCurrentEquipped ? (
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

                        <div className="font-bold text-sm text-white font-racing">{part.name}</div>
                        <div className="text-[11px] text-amber-400/90 font-medium mt-0.5">
                          {part.subtitle}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {part.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/60">
                        {isCurrentEquipped ? (
                          <div className="text-center text-[11px] text-emerald-400 font-bold font-racing py-1">
                            當前已生效
                          </div>
                        ) : isUnlocked ? (
                          <button
                            onClick={() => onEquipPart(part)}
                            className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold font-racing flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>裝備此配件</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onBuyAndEquipPart(part)}
                            disabled={!canAfford}
                            className={`w-full py-1.5 rounded-lg text-xs font-bold font-racing flex items-center justify-center gap-1.5 transition-all ${
                              canAfford
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-md shadow-amber-500/20 active:scale-98'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>購買並裝備 ({part.price} 💰)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================
             TRUCKS TAB
             ======================================================== */
          <div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 mb-4 flex flex-col md:flex-row items-center gap-5">
              <div className="w-44 h-24 flex items-center justify-center p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                <TruckSvg truckId={previewTruck.id} isNitro={false} speed={120} className="w-full h-full" />
              </div>

              <div className="flex-1 w-full text-left">
                <div className="text-xs text-amber-400 font-semibold">{previewTruck.subtitle}</div>
                <div className="text-lg font-bold text-white font-racing">{previewTruck.name}</div>
                <p className="text-xs text-slate-400 mt-1">{previewTruck.description}</p>

                <div className="grid grid-cols-2 gap-2 mt-2 text-[11px]">
                  <div>
                    <span className="text-slate-400">起步推力: </span>
                    <span className="text-amber-400 font-mono-num font-bold">{previewTruck.baseAcceleration}x</span>
                  </div>
                  <div>
                    <span className="text-slate-400">最高極速: </span>
                    <span className="text-cyan-400 font-mono-num font-bold">{previewTruck.maxSpeed} km/h</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {TRUCKS.map((t) => {
                const unlocked = saveData.unlockedTrucks.includes(t.id);
                const isCurrent = t.id === previewTruckId;
                const isSelectedCar = t.id === saveData.selectedTruckId;

                return (
                  <button
                    key={t.id}
                    onClick={() => setPreviewTruckId(t.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                      isCurrent
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-slate-800 bg-slate-950/40 hover:bg-slate-950'
                    }`}
                  >
                    <div className="w-full h-12 flex items-center justify-center mb-1">
                      <TruckSvg truckId={t.id} isNitro={false} speed={40} className="w-full h-full" />
                    </div>
                    <div className="font-bold text-xs text-white truncate font-racing">{t.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {isSelectedCar ? (
                        <span className="text-amber-400 font-bold">出戰中</span>
                      ) : unlocked ? (
                        <span className="text-emerald-400 font-medium">已解鎖</span>
                      ) : (
                        <span className="text-slate-400">💰 {t.price}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div>
              {isTruckSelected ? (
                <button
                  disabled
                  className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold font-racing flex items-center justify-center gap-1.5 cursor-default"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>目前正在駕駛此車型</span>
                </button>
              ) : isTruckUnlocked ? (
                <button
                  onClick={() => onSelectTruck(previewTruck.id)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold font-racing flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>選擇此車型出戰</span>
                </button>
              ) : (
                <button
                  onClick={() => onBuyTruck(previewTruck.id, previewTruck.price)}
                  disabled={saveData.tips < previewTruck.price}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold font-racing flex items-center justify-center gap-1.5 transition-all ${
                    saveData.tips >= previewTruck.price
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer active:scale-98 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>解鎖此車型 (需 {previewTruck.price} 💰 小費)</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
