import React from 'react';
import { X, Check, Palette, Sparkles, Moon, Sun } from 'lucide-react';
import { ThemeId, ThemePreset } from '../types';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'royal-red-gold',
    name: 'ขาว-แดง-ทอง-ดำ (Royal Crimson & Gold)',
    description: 'ธีมหลักสง่างาม: สีแดงชาดหลวง ประกายทองคำ ตัดกับสีขาวสะอาดและสีดำสนิท',
    primaryColor: '#DC2626',
    goldColor: '#D4AF37',
    bgColor: '#FFFFFF',
    sidebarColor: '#0F1115',
  },
  {
    id: 'imperial-gold',
    name: 'ดำ-ทอง จักรพรรดิ (Imperial Obsidian Gold)',
    description: 'ธีมทองคำหรูหรา: ประกายทองคำแท้ตัดกับพื้นผิวสีดำเงาและไอวอรี่ขาว',
    primaryColor: '#D4AF37',
    goldColor: '#F59E0B',
    bgColor: '#FDFBF7',
    sidebarColor: '#0A0A0C',
  },
  {
    id: 'crimson-dark',
    name: 'ทับทิมรัตติกาล (Crimson Rose & Gold)',
    description: 'ธีมแดงทับทิม: แดงกุหลาบลุ่มลึก ขาวนวล ตัดเส้นขอบด้วยทองคำอบอุ่น',
    primaryColor: '#E11D48',
    goldColor: '#F59E0B',
    bgColor: '#FFF1F2',
    sidebarColor: '#140C0E',
  },
  {
    id: 'midnight-gold',
    name: 'มิดไนท์แอมเบอร์ (Midnight Amber Gold)',
    description: 'ธีมสีอำพันทอง: สีทองสุกปลั่งตัดกับสีดำมิดไนท์ เหมาะสำหรับสาย Dark Mode',
    primaryColor: '#EAB308',
    goldColor: '#FACC15',
    bgColor: '#FAFAFA',
    sidebarColor: '#09090B',
  },
  {
    id: 'classic-green',
    name: 'เขียวคลาสสิก LINE (Classic LINE Green)',
    description: 'ธีมดั้งเดิม: สีเขียวสดใส LINE PC คู่กับสีขาวและเทาดำ',
    primaryColor: '#06C755',
    goldColor: '#EAB308',
    bgColor: '#FFFFFF',
    sidebarColor: '#1E232A',
  },
];

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  darkMode,
  onToggleDarkMode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm select-none p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#1E232A] w-full max-w-lg rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-red-600 via-line-green to-amber-500 text-white shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2 leading-tight">
                <span>ปรับแต่งธีมและสีสัน</span>
                <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-mono">Themes</span>
              </h3>
              <p className="text-[11px] text-white/85">เลือกโทนสีโปรดของคุณ (ขาว แดง ทอง ดำ และคลาสสิก)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Dark / Light Mode Switch */}
          <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${darkMode ? 'bg-amber-400/20 text-amber-400' : 'bg-gray-200 text-gray-700'}`}>
                {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-500" />}
              </div>
              <div>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-100 block">
                  โหมดการแสดงผล ({darkMode ? 'Dark Mode' : 'Light Mode'})
                </span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  {darkMode ? 'โทนสีมืด สบายตาในที่แสงน้อย' : 'โทนสว่าง ชัดเจน คมชัด'}
                </span>
              </div>
            </div>
            <button
              onClick={onToggleDarkMode}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs ${
                darkMode
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span>{darkMode ? 'เปิดใช้งานอยู่' : 'เปลี่ยนเป็น Dark'}</span>
            </button>
          </div>

          {/* Theme Presets List */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-line-gold" />
              <span>เลือกชุดสีธีมหลัก (Theme Palette)</span>
            </label>

            <div className="space-y-2.5">
              {THEME_PRESETS.map((preset) => {
                const isSelected = currentTheme === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => onSelectTheme(preset.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'border-line-green ring-2 ring-line-green/30 bg-red-50/40 dark:bg-red-950/20 shadow-sm'
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Color Palette Preview Swatches */}
                      <div className="flex items-center -space-x-1.5 flex-shrink-0">
                        <div
                          className="w-7 h-7 rounded-full shadow-md border-2 border-white dark:border-gray-900"
                          style={{ backgroundColor: preset.primaryColor }}
                          title="Primary Accent"
                        />
                        <div
                          className="w-7 h-7 rounded-full shadow-md border-2 border-white dark:border-gray-900"
                          style={{ backgroundColor: preset.goldColor }}
                          title="Gold Accent"
                        />
                        <div
                          className="w-7 h-7 rounded-full shadow-md border-2 border-white dark:border-gray-900"
                          style={{ backgroundColor: preset.sidebarColor }}
                          title="Black / Dark Surface"
                        />
                        <div
                          className="w-7 h-7 rounded-full shadow-md border-2 border-white dark:border-gray-900 border-dashed"
                          style={{ backgroundColor: preset.bgColor }}
                          title="White / Background"
                        />
                      </div>

                      {/* Theme Name & Description */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-800 dark:text-gray-100 block truncate">
                            {preset.name}
                          </span>
                          {preset.id === 'royal-red-gold' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 font-bold">
                              ธีมหลัก
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 block line-clamp-1 mt-0.5">
                          {preset.description}
                        </span>
                      </div>
                    </div>

                    {/* Radio Check Indicator */}
                    <div className="flex-shrink-0 ml-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-line-green text-white shadow-xs'
                            : 'border border-gray-300 dark:border-gray-600 text-transparent group-hover:border-gray-400'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-line-green hover:bg-line-green-hover text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  );
};
