import React from 'react';
import { UserSaveData } from '../types/game';
import { X, Volume2, VolumeX, Smartphone, Keyboard, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  saveData: UserSaveData;
  onUpdateSaveData: (data: Partial<UserSaveData>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  saveData,
  onUpdateSaveData,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 shadow-2xl relative my-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
          <h2 className="text-lg font-bold text-white font-racing">遊戲設定 & 操作指南</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Audio Controls */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-200">
              {saveData.soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              <span>遊戲音效 (SFX)</span>
            </div>
            <button
              onClick={() => onUpdateSaveData({ soundEnabled: !saveData.soundEnabled })}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                saveData.soundEnabled ? 'bg-amber-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  saveData.soundEnabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-200">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>手機震動回饋 (Haptics)</span>
            </div>
            <button
              onClick={() => onUpdateSaveData({ hapticsEnabled: !saveData.hapticsEnabled })}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                saveData.hapticsEnabled ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  saveData.hapticsEnabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Keyboard and Touch Guide */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 mb-6 text-xs space-y-2.5">
          <div className="font-bold text-amber-400 font-racing flex items-center gap-1.5">
            <Keyboard className="w-4 h-4" />
            <span>按鍵與觸控指南</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>連續點擊衝刺 (Dash):</span>
            <span className="font-mono-num font-bold text-white">點擊按鈕 / 空白鍵 / ↑</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>車道切換 (Steer):</span>
            <span className="font-mono-num font-bold text-white">A / D 或 ← / →</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>釋放氮氣 (Nitro):</span>
            <span className="font-mono-num font-bold text-white">N 鍵 或 點擊氮氣按鈕</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>暫停遊戲 (Pause):</span>
            <span className="font-mono-num font-bold text-white">ESC 鍵 或 暫停圖標</span>
          </div>
        </div>

        {/* Reset Progress Button */}
        <button
          onClick={() => {
            if (window.confirm('確定要重置所有遊戲數據與小費紀錄嗎？')) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="w-full py-2.5 rounded-xl border border-slate-800 text-xs text-slate-500 hover:text-rose-400 hover:border-rose-900/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>重設全部存檔</span>
        </button>
      </div>
    </div>
  );
};
