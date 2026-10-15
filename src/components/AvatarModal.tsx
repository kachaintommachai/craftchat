import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Check, Camera, Trash2, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';
import { Avatar } from './Avatar';

interface PresetAvatar {
  id: string;
  name: string;
  url: string;
  category: 'line' | 'flaticon';
}

const PRESET_AVATARS: PresetAvatar[] = [
  // LINE Official Characters
  { id: 'brown', name: 'บราวน์ (Brown)', url: '/stickers/17840.png', category: 'line' },
  { id: 'cony', name: 'โคนี่ (Cony)', url: '/stickers/17839.png', category: 'line' },
  { id: 'sally', name: 'แซลลี่ (Sally)', url: '/stickers/10855.png', category: 'line' },
  { id: 'choco', name: 'ช็อกโก้ (Choco)', url: '/stickers/10979905.png', category: 'line' },
  { id: 'moon', name: 'มูน (Moon)', url: '/stickers/1988.png', category: 'line' },
  { id: 'james', name: 'เจมส์ (James)', url: '/stickers/1993.png', category: 'line' },
  { id: 'leonard', name: 'ลีโอนาร์ด (Leonard)', url: '/stickers/10551376.png', category: 'line' },
  { id: 'jessica', name: 'เจสสิก้า (Jessica)', url: '/stickers/10551378.png', category: 'line' },

  // Flaticon Message Avatars
  { id: 'cool', name: 'Cool Guy', url: '/stickers/flaticon/8819086.png', category: 'flaticon' },
  { id: 'super', name: 'Super Star', url: '/stickers/flaticon/8819091.png', category: 'flaticon' },
  { id: 'chat_msg', name: 'Chat Messenger', url: '/stickers/flaticon/7648244.png', category: 'flaticon' },
  { id: 'love_msg', name: 'Sweet Heart', url: '/stickers/flaticon/9589371.png', category: 'flaticon' },
];

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: UserProfile | null;
  currentAvatar?: string | null;
  displayName?: string;
  onSaveAvatar: (avatarUrl: string) => void;
}

export const AvatarModal: React.FC<AvatarModalProps> = ({
  isOpen,
  onClose,
  profile,
  currentAvatar,
  displayName,
  onSaveAvatar,
}) => {
  const initialAvatar = currentAvatar !== undefined ? (currentAvatar || '') : (profile?.avatar_url || '');
  const activeName = displayName || profile?.display_name || 'My Computer';
  const [selectedAvatar, setSelectedAvatar] = useState<string>(initialAvatar);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelectedAvatar(initialAvatar);
  }, [initialAvatar, isOpen]);

  if (!isOpen) return null;

  // Handle local image file upload with client-side canvas resizing
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('กรุณาเลือกไฟล์รูปภาพ (JPG, PNG, WebP)');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        // Resize image to max 256x256 to keep storage lightweight
        const maxDimension = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setSelectedAvatar(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSaveAvatar(selectedAvatar);
    onClose();
  };

  const handleClear = () => {
    setSelectedAvatar('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm select-none p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#20242B] w-full max-w-md rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col relative transition-all">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-line-green flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
                เปลี่ยนรูปโปรไฟล์ (Avatar)
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                เลือกรูปภาพจากเครื่อง หรือใช้ตัวละครน่ารักสไตล์ LINE
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

        {/* Live Avatar Preview */}
        <div className="p-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900/40 dark:to-[#20242B] border-b border-gray-100 dark:border-gray-800 flex flex-col items-center">
          <div className="relative group/avatar cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-line-green via-emerald-400 to-teal-400 shadow-xl ring-4 ring-emerald-500/20">
              <Avatar
                name={activeName}
                avatarUrl={selectedAvatar}
                size={88}
                statusSticker={profile?.status_sticker}
                className="w-full h-full"
              />
            </div>
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center text-white transition-opacity backdrop-blur-xs">
              <Upload className="w-6 h-6 animate-bounce" />
            </div>
          </div>

          <h4 className="text-xs font-bold text-gray-800 dark:text-gray-100 mt-3">
            {activeName}
          </h4>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
            {selectedAvatar ? 'รูปภาพโปรไฟล์ที่เลือก' : 'ใช้อักษรย่อประจำตัวเริ่มต้น'}
          </p>

          {/* Action buttons under preview */}
          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 hover:scale-102 active:scale-98"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>อัปโหลดรูปจากเครื่อง</span>
            </button>
            {selectedAvatar && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-600 dark:text-gray-300 hover:text-red-500 text-xs font-semibold transition-colors flex items-center gap-1"
                title="กลับไปใช้อักษรย่อ"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>รีเซ็ต</span>
              </button>
            )}
          </div>

          {uploadError && (
            <p className="text-[11px] text-red-500 font-semibold mt-2">{uploadError}</p>
          )}
        </div>

        {/* Preset Avatars Selection */}
        <div className="p-5 max-h-64 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>เลือกจากตัวละครยอดนิยม (LINE & Flaticon)</span>
            </label>
            <span className="text-[10px] text-gray-400">{PRESET_AVATARS.length} รูปแบบ</span>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {PRESET_AVATARS.map((preset) => {
              const isSelected = selectedAvatar === preset.url;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedAvatar(preset.url)}
                  className={`group relative p-2 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? 'border-line-green bg-emerald-50/80 dark:bg-emerald-950/40 shadow-sm ring-2 ring-line-green scale-105'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300'
                  }`}
                  title={preset.name}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center p-1 bg-white/80 dark:bg-gray-800/80 shadow-xs group-hover:scale-110 transition-transform">
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-contain pointer-events-none select-none"
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300 truncate max-w-full mt-1.5">
                    {preset.name.split(' ')[0]}
                  </span>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-line-green text-white flex items-center justify-center shadow-xs">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
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
            <span>บันทึกรูปโปรไฟล์</span>
          </button>
        </div>
      </div>
    </div>
  );
};
