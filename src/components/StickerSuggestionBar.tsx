import React from 'react';
import { Sparkles, X } from 'lucide-react';
import { StickerItem } from './Stickers';

interface StickerSuggestionBarProps {
  suggestions: StickerItem[];
  keyword: string;
  onSelectSticker: (stickerId: string) => void;
  onDismiss: () => void;
}

export const StickerSuggestionBar: React.FC<StickerSuggestionBarProps> = ({
  suggestions,
  keyword,
  onSelectSticker,
  onDismiss,
}) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="absolute bottom-[86px] left-3 right-3 z-30 bg-white/95 dark:bg-[#20242B]/95 backdrop-blur-md border border-emerald-500/30 dark:border-emerald-500/20 rounded-2xl shadow-xl p-2.5 animate-in slide-in-from-bottom-2 duration-150 select-none">
      {/* Header Indicator */}
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-gray-100 dark:border-gray-800 text-[11px]">
        <div className="flex items-center gap-1.5 font-bold text-gray-700 dark:text-gray-200">
          <Sparkles className="w-3.5 h-3.5 text-line-green animate-pulse" />
          <span>สติกเกอร์ที่แนะนำสำหรับ:</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-line-green font-bold text-[10px]">
            "{keyword}"
          </span>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-md transition-colors"
          title="ซ่อนคำแนะนำสติกเกอร์"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Suggested Sticker Thumbnails Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {suggestions.map((sticker) => (
          <button
            key={sticker.id}
            onClick={() => onSelectSticker(sticker.id)}
            className="group flex-shrink-0 flex flex-col items-center justify-center p-1.5 rounded-xl bg-gray-50 dark:bg-gray-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-transparent hover:border-line-green transition-all transform hover:scale-110 active:scale-95 shadow-sm"
            title={`คลิกเพื่อส่งสติกเกอร์: ${sticker.name}`}
          >
            <div className="w-14 h-14 flex items-center justify-center">
              {sticker.render(56)}
            </div>
            <span className="text-[9px] text-gray-500 dark:text-gray-400 truncate max-w-[64px] mt-0.5 opacity-90 group-hover:text-line-green">
              {sticker.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
