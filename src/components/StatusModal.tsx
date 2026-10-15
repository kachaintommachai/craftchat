import React, { useState, useEffect } from 'react';
import {
  X,
  Smile,
  Sparkles,
  Check,
  Edit3,
  Briefcase,
  Flame,
  Coffee,
  Heart,
  Ban,
  PartyPopper,
  Trash2,
} from 'lucide-react';
import { UserProfile } from '../types';
import { getStickerById, StickerPicker } from './Stickers';

export interface StatusPreset {
  id: string;
  label: string;
  text: string;
  stickerId: string;
  color: string;
  badge: string;
  icon: React.ElementType;
}

export const STATUS_PRESETS: StatusPreset[] = [
  {
    id: 'online',
    label: 'Online / พร้อมคุย',
    text: 'Online พร้อมคุย ทักมาได้เลยครับ',
    stickerId: 'fl_6028690', // Hi!
    color: 'from-emerald-500 to-teal-600',
    badge: '🟢 ออนไลน์',
    icon: Smile,
  },
  {
    id: 'working',
    label: 'กำลังทำงาน',
    text: 'กำลังทำงาน ลุยโปรเจกต์ CraftChat',
    stickerId: 'fl_8819091', // Super!
    color: 'from-blue-500 to-indigo-600',
    badge: '💼 กำลังทำงาน',
    icon: Briefcase,
  },
  {
    id: 'fun',
    label: 'กำลังสนุก / อารมณ์ดี',
    text: 'กำลังสนุก อารมณ์ดี ฮ่าๆ 555',
    stickerId: 'fl_8819089', // Haha! 555
    color: 'from-amber-400 to-orange-500',
    badge: '🎉 กำลังสนุก',
    icon: PartyPopper,
  },
  {
    id: 'busy_fire',
    label: 'งานเดือด / ไฟลุก',
    text: 'งานเดือด ลุยโค้ดเต็มสปีด!',
    stickerId: 'fl_8819078', // Boom!
    color: 'from-red-500 to-rose-600',
    badge: '🔥 งานเดือด',
    icon: Flame,
  },
  {
    id: 'break',
    label: 'พักเบรก / จิบกาแฟ',
    text: 'ขอพักเบรก ดื่มกาแฟสักครู่',
    stickerId: 'fl_7647454', // Happy Chat
    color: 'from-amber-600 to-yellow-700',
    badge: '☕ พักเบรก',
    icon: Coffee,
  },
  {
    id: 'meeting',
    label: 'ติดประชุม / ห้ามรบกวน',
    text: 'ติดประชุม ด่วนโทรหรือส่งไฟล์ได้',
    stickerId: 'fl_8819084', // No!
    color: 'from-purple-500 to-indigo-600',
    badge: '🔴 ติดประชุม',
    icon: Ban,
  },
  {
    id: 'love',
    label: 'มีความสุข / เลิฟๆ',
    text: 'มีความสุข คิดถึงทุกคนครับ ❤️',
    stickerId: 'fl_8819087', // Love You!
    color: 'from-pink-500 to-rose-500',
    badge: '💖 เลิฟๆ',
    icon: Heart,
  },
  {
    id: 'oops',
    label: 'พักผ่อน / ชิลๆ',
    text: 'พักผ่อนชิลๆ ชาร์จพลัง',
    stickerId: 'fl_8819082', // Oops!
    color: 'from-slate-500 to-gray-700',
    badge: '😴 ชิลๆ',
    icon: Sparkles,
  },
];

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onSaveStatus: (statusText: string, statusSticker: string) => void;
}

export const StatusModal: React.FC<StatusModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveStatus,
}) => {
  const [statusText, setStatusText] = useState(profile?.status_text || 'Online พร้อมคุย');
  const [selectedStickerId, setSelectedStickerId] = useState(
    profile?.status_sticker || 'fl_6028690'
  );
  const [isStickerPickerOpen, setIsStickerPickerOpen] = useState(false);

  useEffect(() => {
    if (profile) {
      setStatusText(profile.status_text || 'Online พร้อมคุย');
      setSelectedStickerId(profile.status_sticker || 'fl_6028690');
    }
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const currentStickerItem = getStickerById(selectedStickerId);

  const handleApplyPreset = (preset: StatusPreset) => {
    setStatusText(preset.text);
    setSelectedStickerId(preset.stickerId);
  };

  const handleClearStatus = () => {
    setStatusText('');
    setSelectedStickerId('');
  };

  const handleSave = () => {
    onSaveStatus(statusText.trim(), selectedStickerId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm select-none p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#20242B] w-full max-w-md rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col relative transition-all">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-line-green flex items-center justify-center">
              <Smile className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
                แก้ไขสถานะการใช้งานด้วย Sticker
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                แสดงอารมณ์และสถานะของคุณให้เพื่อนในวง LAN รับรู้
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Preview Card */}
        <div className="p-5 pb-3 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900/40 dark:to-[#20242B] border-b border-gray-100 dark:border-gray-800 flex flex-col items-center">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            ตัวอย่างการแสดงผลบน CraftChat Desktop
          </span>

          <div className="w-full bg-white dark:bg-[#282E38] rounded-2xl p-3.5 shadow-md border border-gray-200/80 dark:border-gray-700/80 flex items-center gap-3.5 relative overflow-hidden">
            {/* User Avatar with Sticker Badge */}
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-line-green to-emerald-400 flex items-center justify-center text-white font-extrabold text-lg shadow-md ring-2 ring-white dark:ring-gray-800">
                {profile?.display_name ? profile.display_name.slice(0, 2).toUpperCase() : 'ME'}
              </div>

              {/* Float Sticker Preview */}
              {selectedStickerId && (
                <div
                  onClick={() => setIsStickerPickerOpen(true)}
                  className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-white dark:bg-gray-800 p-0.5 shadow-lg border-2 border-emerald-500 cursor-pointer hover:scale-110 transition-transform flex items-center justify-center"
                  title="คลิกเพื่อเปลี่ยนสติกเกอร์สถานะ"
                >
                  <div className="w-6 h-6 flex items-center justify-center overflow-hidden">
                    {currentStickerItem ? (
                      currentStickerItem.render(24)
                    ) : (
                      <Smile className="w-4 h-4 text-line-green" />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Details & Status Bubble */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                  {profile?.display_name || 'My Computer'}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 font-semibold">
                  ฉัน (Me)
                </span>
              </div>

              {/* Status Speech Bubble */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-[11px] text-gray-700 dark:text-gray-200 border border-gray-200/60 dark:border-gray-700 max-w-full">
                {selectedStickerId && currentStickerItem && (
                  <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                    {currentStickerItem.render(16)}
                  </div>
                )}
                <span className="truncate font-medium">
                  {statusText || 'ไม่มีข้อความสถานะ'}
                </span>
              </div>
            </div>

            {/* Change sticker button hint */}
            <button
              onClick={() => setIsStickerPickerOpen(true)}
              className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-line-green rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all flex-shrink-0"
              title="เปลี่ยนสติกเกอร์"
            >
              <Smile className="w-3 h-3" />
              <span>เปลี่ยนรูป</span>
            </button>
          </div>
        </div>

        {/* Form Body: Presets & Custom Input */}
        <div className="p-5 space-y-4 max-h-80 overflow-y-auto">
          {/* Quick Presets Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>สถานะด่วนยอดนิยม (คลิกเลือกได้ทันที)</span>
              </label>
              <button
                type="button"
                onClick={handleClearStatus}
                className="text-[10px] text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>ล้างสถานะ</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {STATUS_PRESETS.map((preset) => {
                const isSelected =
                  statusText === preset.text && selectedStickerId === preset.stickerId;
                const stickerItem = getStickerById(preset.stickerId);

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'border-line-green bg-emerald-50/80 dark:bg-emerald-950/40 shadow-sm ring-1 ring-line-green'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm flex-shrink-0 p-0.5">
                      {stickerItem ? (
                        stickerItem.render(28)
                      ) : (
                        <Smile className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-800 dark:text-gray-100 truncate">
                          {preset.label}
                        </span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-line-green flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                        {preset.text}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Status Text & Custom Sticker */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-blue-500" />
              <span>กำหนดข้อความสถานะเอง (Custom Status)</span>
            </label>

            <div className="flex items-center gap-2">
              {/* Sticker Selector Button */}
              <button
                type="button"
                onClick={() => setIsStickerPickerOpen(true)}
                className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-gray-200 dark:border-gray-700 hover:border-line-green flex items-center justify-center p-1 transition-all flex-shrink-0 shadow-sm"
                title="เลือกสติกเกอร์จากคลัง"
              >
                {currentStickerItem ? (
                  currentStickerItem.render(28)
                ) : (
                  <Smile className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={statusText}
                onChange={(e) => setStatusText(e.target.value)}
                placeholder="เช่น กำลังออนไลน์, กำลังทำงาน, กำลังสนุก, ประชุมยาว..."
                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:border-line-green transition-colors"
                maxLength={60}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 px-1">
              <span>สามารถคลิกที่ไอคอนรูปสติกเกอร์เพื่อเปลี่ยนได้ทุกเมื่อ</span>
              <span>{statusText.length}/60</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-gray-50/80 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold text-white bg-line-green hover:bg-line-green-hover rounded-xl shadow-md transition-all flex items-center gap-1.5 hover:scale-102 active:scale-98"
          >
            <Check className="w-3.5 h-3.5" />
            <span>บันทึกสถานะ</span>
          </button>
        </div>

        {/* Sticker Picker Sub-Modal for Custom Sticker Selection */}
        {isStickerPickerOpen && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
            <div className="relative w-full max-w-sm flex items-center justify-center">
              <StickerPicker
                isOpen={isStickerPickerOpen}
                className="relative z-50 w-full"
                onClose={() => setIsStickerPickerOpen(false)}
                onSelectSticker={(id) => {
                  setSelectedStickerId(id);
                  setIsStickerPickerOpen(false);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
