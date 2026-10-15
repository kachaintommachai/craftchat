import React, { useState, useRef, useEffect } from 'react';
import { X, Check, Image, Palette, Upload, Sparkles, RotateCcw, Paintbrush } from 'lucide-react';

export interface WallpaperOption {
  id: string;
  name: string;
  type: 'color' | 'gradient' | 'pattern';
  value: string; // CSS background value or color hex
  previewStyle: React.CSSProperties;
}

export const WALLPAPER_PRESETS: WallpaperOption[] = [
  // Classic Solid Colors
  {
    id: 'default_line',
    name: 'ฟ้าคลาสสิก LINE',
    type: 'color',
    value: '#ABC1D1',
    previewStyle: { backgroundColor: '#ABC1D1' },
  },
  {
    id: 'dark_slate',
    name: 'เทาดำมืด (Dark Mode)',
    type: 'color',
    value: '#181B20',
    previewStyle: { backgroundColor: '#181B20' },
  },
  {
    id: 'warm_ivory',
    name: 'ขาวครีมละมุน (Ivory)',
    type: 'color',
    value: '#F7F4EB',
    previewStyle: { backgroundColor: '#F7F4EB' },
  },
  {
    id: 'mint_pastel',
    name: 'เขียวมิ้นต์พาสเทล',
    type: 'color',
    value: '#D8ECE5',
    previewStyle: { backgroundColor: '#D8ECE5' },
  },
  {
    id: 'peach_pink',
    name: 'ชมพูพีชหวานแหวว',
    type: 'color',
    value: '#FCE6E1',
    previewStyle: { backgroundColor: '#FCE6E1' },
  },
  {
    id: 'lavender_mist',
    name: 'ม่วงลาเวนเดอร์',
    type: 'color',
    value: '#EBE8F7',
    previewStyle: { backgroundColor: '#EBE8F7' },
  },
  {
    id: 'midnight_navy',
    name: 'น้ำเงินมิดไนท์',
    type: 'color',
    value: '#16213E',
    previewStyle: { backgroundColor: '#16213E' },
  },
  {
    id: 'forest_green',
    name: 'เขียวฟอเรสต์ลึก',
    type: 'color',
    value: '#132E27',
    previewStyle: { backgroundColor: '#132E27' },
  },

  // Gradients
  {
    id: 'emerald_breeze',
    name: 'สายลมมรกต (Emerald)',
    type: 'gradient',
    value: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)',
    previewStyle: { background: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)' },
  },
  {
    id: 'sunset_horizon',
    name: 'ขอบฟ้าอาทิตย์อัสดง',
    type: 'gradient',
    value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    previewStyle: { background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  },
  {
    id: 'aurora_lights',
    name: 'แสงเหนือออโรร่า',
    type: 'gradient',
    value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    previewStyle: { background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  },
  {
    id: 'cosmic_purple',
    name: 'จักรวาลคอสมิก',
    type: 'gradient',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    previewStyle: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  },
  {
    id: 'dark_cyberpunk',
    name: 'ไซเบอร์พังก์มืด',
    type: 'gradient',
    value: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    previewStyle: { background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
  },
  {
    id: 'ocean_twilight',
    name: 'ทะเลทไวไลท์',
    type: 'gradient',
    value: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)',
    previewStyle: { background: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)' },
  },
];

interface WallpaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBackground?: string;
  onSaveBackground: (bgValue: string) => void;
}

export const WallpaperModal: React.FC<WallpaperModalProps> = ({
  isOpen,
  onClose,
  currentBackground = '#ABC1D1',
  onSaveBackground,
}) => {
  const [selectedBg, setSelectedBg] = useState<string>(currentBackground || '#ABC1D1');
  const [activeTab, setActiveTab] = useState<'colors' | 'gradients' | 'custom'>('colors');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelectedBg(currentBackground || '#ABC1D1');
  }, [currentBackground, isOpen]);

  if (!isOpen) return null;

  // Handle local background image upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('กรุณาเลือกไฟล์ภาพ (JPG, PNG, WebP)');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        // Optimize image size to max 1280px for wallpaper
        const maxDimension = 1280;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
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
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setSelectedBg(`url("${dataUrl}") center / cover no-repeat`);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleApply = () => {
    onSaveBackground(selectedBg);
    onClose();
  };

  const handleReset = () => {
    setSelectedBg('#ABC1D1');
  };

  // Convert selectedBg to inline CSS style
  const getBackgroundStyle = (val: string): React.CSSProperties => {
    if (val.startsWith('url(')) {
      return { background: val };
    }
    if (val.startsWith('linear-gradient(')) {
      return { background: val };
    }
    return { backgroundColor: val };
  };

  const isCustomImage = selectedBg.startsWith('url(');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm select-none p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#20242B] w-full max-w-lg rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col relative transition-all">
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
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
                เปลี่ยนพื้นหลังห้องแชท (Chat Wallpaper)
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                เลือกสีพื้นคลาสสิก สีเกรเดียนท์ หรืออัปโหลดรูปภาพของคุณเอง
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

        {/* Live Preview Box */}
        <div className="p-4 bg-gray-100/50 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              ตัวอย่างห้องแชทจริง (Live Preview)
            </span>
            <button
              onClick={handleReset}
              className="text-[10px] text-gray-400 hover:text-line-green flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>คืนค่าเริ่มต้น</span>
            </button>
          </div>

          <div
            className="w-full h-36 rounded-2xl p-3 flex flex-col justify-between shadow-inner border border-black/10 transition-all overflow-hidden relative"
            style={getBackgroundStyle(selectedBg)}
          >
            {/* Mock Header overlay */}
            <div className="flex items-center justify-between bg-white/70 dark:bg-gray-900/70 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-bold text-gray-700 dark:text-gray-200 shadow-xs">
              <span>ห้องแชท P2P</span>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono">E2EE Active</span>
            </div>

            {/* Mock Chat Bubbles */}
            <div className="space-y-1.5 text-[11px]">
              {/* Incoming Bubble */}
              <div className="flex items-start gap-1.5">
                <div className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center text-[9px] font-bold text-white shadow-xs">
                  A
                </div>
                <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-3 py-1 rounded-2xl rounded-tl-xs shadow-sm max-w-[70%]">
                  สวัสดีครับ พื้นหลังใหม่สวยมาก! ✨
                </div>
              </div>

              {/* Outgoing Bubble */}
              <div className="flex justify-end">
                <div className="bg-line-chat-bubble text-gray-900 px-3 py-1 rounded-2xl rounded-tr-xs shadow-sm max-w-[70%] font-medium">
                  ใช่เลย สบายตาสุดๆ ครับ 👍
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#20242B] px-4 pt-2 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('colors')}
            className={`pb-2.5 px-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'colors'
                ? 'border-line-green text-line-green font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Paintbrush className="w-3.5 h-3.5" />
            <span>สีคลาสสิก (LINE Colors)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gradients')}
            className={`pb-2.5 px-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'gradients'
                ? 'border-line-green text-line-green font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>เกรเดียนท์ (Gradients)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`pb-2.5 px-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'custom'
                ? 'border-line-green text-line-green font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            <span>อัปโหลดรูปเอง</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-4 max-h-56 overflow-y-auto">
          {activeTab === 'colors' && (
            <div className="grid grid-cols-4 gap-2.5">
              {WALLPAPER_PRESETS.filter((p) => p.type === 'color').map((item) => {
                const isSelected = selectedBg === item.value;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedBg(item.value)}
                    className={`group p-2 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'border-line-green ring-2 ring-line-green shadow-md scale-102 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div
                      className="w-full h-11 rounded-xl shadow-xs border border-black/10 flex items-center justify-center transition-transform group-hover:scale-105"
                      style={item.previewStyle}
                    >
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-white/90 text-line-green shadow-xs flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 truncate max-w-full">
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'gradients' && (
            <div className="grid grid-cols-3 gap-2.5">
              {WALLPAPER_PRESETS.filter((p) => p.type === 'gradient').map((item) => {
                const isSelected = selectedBg === item.value;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedBg(item.value)}
                    className={`group p-2 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'border-line-green ring-2 ring-line-green shadow-md scale-102 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className="w-full h-12 rounded-xl shadow-xs border border-black/10 flex items-center justify-center transition-transform group-hover:scale-105"
                      style={item.previewStyle}
                    >
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-white/90 text-line-green shadow-xs flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 truncate max-w-full">
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-line-green rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50/50 dark:bg-gray-800/40 group"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-line-green flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  คลิกเพื่ออัปโหลดรูปภาพพื้นหลัง
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  รองรับภาพความละเอียดสูง (JPG, PNG, WebP)
                </p>
              </div>

              {isCustomImage && (
                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <Check className="w-4 h-4" />
                  <span>กำลังใช้ภาพพื้นหลังที่คุณอัปโหลด</span>
                </div>
              )}

              {uploadError && (
                <p className="text-[11px] text-red-500 font-semibold mt-2">{uploadError}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-gray-50/80 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1 font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ใช้สี LINE เริ่มต้น</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 text-xs font-bold text-white bg-line-green hover:bg-line-green-hover rounded-xl shadow-md transition-all flex items-center gap-1.5 hover:scale-102 active:scale-98"
            >
              <Check className="w-3.5 h-3.5" />
              <span>บันทึกพื้นหลัง</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
